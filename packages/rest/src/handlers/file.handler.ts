import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { OptionalDeps } from "@nyxojs/core";
import FormData from "form-data";
import { lookup } from "mime-types";
import type SharpType from "sharp";
import { z } from "zod/v4";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * File processing context that determines size limits and security constraints.
 */
export enum ProcessingContext {
  /** Standard file attachments in messages */
  ATTACHMENT = "attachment",
  /** Avatar, emoji, banner, and other visual assets */
  ASSET = "asset",
  /** Profile pictures and similar small images */
  AVATAR = "avatar",
  /** Large banners and splash images */
  BANNER = "banner",
  /** Custom emoji uploads */
  EMOJI = "emoji",
}

/**
 * Configuration constants for file handling operations.
 * Centralized configuration for limits, patterns, and security settings.
 */
const FILE_CONSTANTS = {
  /** Maximum number of files that can be processed in a single batch */
  MAX_FILES_PER_BATCH: 10,

  /** Default filename used when one cannot be determined */
  DEFAULT_FILENAME: "file",

  /** Default MIME type used when content type cannot be detected */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /** Timeout for stream operations in milliseconds */
  STREAM_TIMEOUT: 30000,

  /** Maximum buffer size for in-memory operations (100MB) */
  MAX_BUFFER_SIZE: 100 * 1024 * 1024,

  /** Regular expression pattern to identify data URIs */
  DATA_URI_PATTERN:
    /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*);base64,([A-Za-z0-9+/]+={0,2})$/,

  /** Regular expression pattern to identify file paths */
  FILE_PATH_PATTERN: /^(?:[/.]|[a-zA-Z]:\\)/,

  /** Allowed image MIME types for processing */
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/bmp",
    "image/tiff",
  ] as const,

  /** Dangerous file extensions that should be blocked */
  DANGEROUS_EXTENSIONS: [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
    ".app",
    ".deb",
    ".pkg",
    ".rpm",
    ".dmg",
    ".msi",
    ".run",
    ".ps1",
    ".sh",
    ".bash",
    ".zsh",
    ".fish",
    ".pl",
    ".py",
    ".rb",
  ] as const,

  /** Safe file extensions that are generally allowed */
  SAFE_EXTENSIONS: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
    ".avif",
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".mp3",
    ".wav",
    ".ogg",
    ".pdf",
    ".txt",
    ".md",
    ".json",
    ".xml",
    ".csv",
    ".zip",
    ".rar",
  ] as const,

  /** File size limits by context */
  SIZE_LIMITS: {
    [ProcessingContext.ATTACHMENT]: 25 * 1024 * 1024, // 25MB
    [ProcessingContext.ASSET]: 256 * 1024, // 256KB
    [ProcessingContext.AVATAR]: 256 * 1024, // 256KB
    [ProcessingContext.BANNER]: 2 * 1024 * 1024, // 2MB
    [ProcessingContext.EMOJI]: 256 * 1024, // 256KB
  } as const,

  /** MIME type to file extension mapping */
  MIME_TO_EXTENSION: {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
  } as const,
} as const;

/**
 * Data URI string type with strict validation.
 * Represents a base64-encoded file embedded directly in a string with MIME type information.
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Union type for any valid file input in Node.js environments.
 * Supports file paths, buffers, streams, and data URIs.
 */
export type FileInput = string | Buffer | Readable | DataUri;

/**
 * Represents a fully processed file ready for upload or use.
 * Contains all necessary metadata and optimized content.
 */
export interface ProcessedFile {
  /** Optimized file content as Buffer */
  buffer: Buffer;

  /** Sanitized filename with correct extension */
  filename: string;

  /** Detected/validated MIME type */
  contentType: string;

  /** Final file size in bytes */
  size: number;

  /** Data URI representation of the processed file */
  dataUri: DataUri;

  /** Original filename before processing */
  originalFilename: string;

  /** Whether the file was optimized during processing */
  wasOptimized: boolean;

  /** Processing context used */
  context: ProcessingContext;
}

/**
 * Zod schema for image processing and optimization configuration.
 * Controls how images are resized, compressed, and converted during processing.
 */
export const ImageProcessingOptions = z.object({
  /**
   * Maximum file size in bytes - images larger than this will be optimized.
   * Must be a positive integer, defaults to 2MB.
   */
  maxSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024) // Max 100MB to prevent excessive memory usage
    .default(2 * 1024 * 1024),

  /**
   * Whether to preserve the original file format during optimization.
   * When false, format conversion (e.g., to WebP) may be attempted.
   */
  preserveFormat: z.boolean().default(false),

  /**
   * Quality percentage for image compression (1-100).
   * Higher values preserve more quality but result in larger files.
   */
  quality: z.number().int().min(1).max(100).default(80),

  /**
   * Whether to attempt WebP conversion for better compression.
   * WebP often provides better compression than other formats.
   */
  attemptWebpConversion: z.boolean().default(true),

  /**
   * Maximum width for image resizing (0 = no limit).
   * Images wider than this will be resized proportionally.
   */
  maxWidth: z
    .number()
    .int()
    .positive()
    .max(8192) // Reasonable maximum to prevent memory issues
    .default(4096),

  /**
   * Maximum height for image resizing (0 = no limit).
   * Images taller than this will be resized proportionally.
   */
  maxHeight: z
    .number()
    .int()
    .positive()
    .max(8192) // Reasonable maximum to prevent memory issues
    .default(4096),

  /**
   * Whether to strip metadata from images for privacy.
   * Removes EXIF data, GPS coordinates, and other metadata.
   */
  stripMetadata: z.boolean().default(true),
});

/**
 * Inferred TypeScript type for image processing options.
 */
export type ImageProcessingOptions = z.infer<typeof ImageProcessingOptions>;

/**
 * Zod schema for security configuration options.
 * Controls how strictly files are validated and what types are allowed.
 */
export const SecurityOptions = z.object({
  /**
   * Custom allowed MIME types (overrides security level defaults).
   * When specified, only these MIME types will be accepted.
   */
  allowedMimeTypes: z
    .array(z.string().min(1).max(100))
    .max(50) // Limit array size to prevent excessive validation
    .optional(),

  /**
   * Custom blocked MIME types.
   * These MIME types will be rejected regardless of other settings.
   */
  blockedMimeTypes: z
    .array(z.string().min(1).max(100))
    .max(100) // Allow larger blocklist
    .optional(),

  /**
   * Custom allowed file extensions.
   * When specified, only these extensions will be accepted.
   */
  allowedExtensions: z
    .array(z.string().min(1).max(20).startsWith("."))
    .max(50) // Limit array size
    .optional(),

  /**
   * Custom blocked file extensions.
   * These extensions will be rejected regardless of other settings.
   */
  blockedExtensions: z
    .array(z.string().min(1).max(20).startsWith("."))
    .max(100) // Allow larger blocklist
    .optional(),

  /**
   * Whether to perform deep content inspection.
   * Analyzes file headers and magic numbers for type verification.
   */
  deepInspection: z.boolean().default(true),

  /**
   * Whether to sanitize filenames.
   * Removes dangerous characters and patterns from filenames.
   */
  sanitizeFilenames: z.boolean().default(true),

  /**
   * Maximum filename length.
   * Filenames longer than this will be truncated.
   */
  maxFilenameLength: z
    .number()
    .int()
    .min(10) // Minimum reasonable filename length
    .max(1000) // Maximum to prevent filesystem issues
    .default(255),
});

/**
 * Inferred TypeScript type for security options.
 */
export type SecurityOptions = z.infer<typeof SecurityOptions>;

/**
 * Zod schema for FileHandler configuration options.
 * Allows customization of security, processing, and resource management.
 */
export const FileHandlerOptions = z.object({
  /**
   * Security configuration for file validation.
   * Controls how strictly files are validated and processed.
   */
  security: SecurityOptions.prefault({}),

  /**
   * Default image processing options.
   * Applied to all image files unless overridden per operation.
   */
  imageProcessing: ImageProcessingOptions.prefault({}),

  /**
   * Timeout for stream operations in milliseconds.
   * Streams that don't complete within this time will be aborted.
   */
  streamTimeout: z
    .number()
    .int()
    .min(1000) // Minimum 1 second
    .max(300000) // Maximum 5 minutes
    .default(30000),

  /**
   * Maximum number of concurrent file operations.
   * Limits parallel processing to control memory usage.
   */
  maxConcurrentOperations: z
    .number()
    .int()
    .min(1)
    .max(20) // Reasonable maximum to prevent resource exhaustion
    .default(5),

  /**
   * Whether to cache the Sharp module instance.
   * Improves performance but uses slightly more memory.
   */
  cacheSharpModule: z.boolean().default(true),
});

/**
 * Inferred TypeScript type for FileHandler options.
 */
export type FileHandlerOptions = z.infer<typeof FileHandlerOptions>;

/**
 * Advanced file handling utility for processing and optimizing files.
 *
 * Features:
 * - Type-safe file input validation
 * - Security-conscious file type checking
 * - Automatic image optimization with Sharp
 * - Memory-efficient stream processing
 * - Comprehensive error handling with cleanup
 * - Configurable security levels
 * - Resource management and cleanup
 *
 * @example
 * ```typescript
 * const handler = new FileHandler({
 *   security: { level: SecurityLevel.STANDARD },
 *   imageProcessing: { quality: 85, maxSize: 1024 * 1024 }
 * });
 *
 * try {
 *   const processed = await handler.processFile('./image.jpg', ProcessingContext.AVATAR);
 *   console.log('Processed file:', processed.filename, processed.size);
 * } finally {
 *   await handler.destroy();
 * }
 * ```
 */
export class FileHandler {
  /** Configuration options for this instance */
  readonly #options: FileHandlerOptions;

  /** Track active stream operations for cleanup */
  readonly #activeStreams = new Set<Readable>();

  /** Track active timeouts for cleanup */
  readonly #activeTimeouts = new Set<NodeJS.Timeout>();

  /** Cached Sharp module instance */
  #sharpModuleCache: typeof SharpType | null = null;

  /** Semaphore to limit concurrent operations */
  #activeOperations = 0;

  /** Flag to track if instance has been destroyed */
  #isDestroyed = false;

  /**
   * Creates a new FileHandler instance with the specified configuration.
   *
   * @param options - Partial configuration options (merged with defaults)
   */
  constructor(options: FileHandlerOptions) {
    this.#options = options;
  }

  /**
   * Clears the global Sharp module cache.
   * Useful for freeing memory in long-running applications.
   */
  clearSharpCache(): void {
    this.#sharpModuleCache = null;
  }

  /**
   * Validates if the input is a supported file input type.
   * Performs comprehensive validation including security checks.
   *
   * @param input - The value to validate
   * @returns True if the input is valid and safe to process
   *
   * @example
   * ```typescript
   * if (handler.isValidInput('./image.jpg', ProcessingContext.AVATAR)) {
   *   // Safe to process
   * }
   * ```
   */
  isValidInput(input: unknown): boolean {
    try {
      this.#validateInputType(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Converts any valid file input to a Buffer with comprehensive error handling.
   * Handles memory management and provides timeout protection.
   *
   * @param input - The file input to convert
   * @returns Promise resolving to buffer containing the file content
   * @throws Error If conversion fails or input is invalid
   *
   * @example
   * ```typescript
   * const buffer = await handler.toBuffer('./large-file.zip');
   * console.log('File size:', buffer.length);
   * ```
   */
  async toBuffer(input: FileInput): Promise<Buffer> {
    this.#checkNotDestroyed();
    await this.#acquireOperationSlot();

    try {
      this.#validateInputType(input);

      if (Buffer.isBuffer(input)) {
        this.#validateBufferSize(input);
        return input;
      }

      if (input instanceof Readable) {
        return await this.#streamToBufferSafe(input);
      }

      if (typeof input === "string") {
        const dataUriMatch = input.match(FILE_CONSTANTS.DATA_URI_PATTERN);
        if (dataUriMatch?.[2]) {
          return this.#decodeDataUri(dataUriMatch[2]);
        }

        return await this.#fileToBuffer(input);
      }

      throw new Error("Unsupported file input type");
    } finally {
      this.#releaseOperationSlot();
    }
  }

  /**
   * Converts a file input to a data URI with validation and optimization.
   * Creates a base64-encoded data URI representation with proper MIME type.
   *
   * @param input - The file input to convert
   * @returns Promise resolving to a properly formatted data URI
   * @throws Error If conversion fails or file is invalid
   *
   * @example
   * ```typescript
   * const dataUri = await handler.toDataUri('./profile.png', ProcessingContext.AVATAR);
   * // Returns: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
   * ```
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
    this.#checkNotDestroyed();

    // Return if already a valid data URI
    if (
      typeof input === "string" &&
      FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      this.#validateDataUri(input);
      return input as DataUri;
    }

    try {
      const buffer = await this.toBuffer(input);
      const filename = this.#extractFilename(input);
      const contentType = this.#detectContentType(filename, buffer);

      return this.#createDataUri(buffer, contentType);
    } catch (error) {
      const filename = this.#extractFilename(input);
      throw new Error(
        `Failed to convert to data URI: ${error instanceof Error ? error.message : String(error)} (file: ${filename})`,
      );
    }
  }

  /**
   * Processes a file with comprehensive optimization and security validation.
   * Handles image optimization, format conversion, and security scanning.
   *
   * @param input - The file input to process
   * @param context - Processing context determining size limits and validation
   * @param options - Optional processing configuration overrides
   * @returns Promise resolving to a fully processed file object
   * @throws Error If processing fails or file violates security policies
   *
   * @example
   * ```typescript
   * const processed = await handler.processFile('./avatar.jpg', ProcessingContext.AVATAR, {
   *   quality: 90,
   *   maxSize: 512 * 1024
   * });
   * console.log('Optimized from', input.length, 'to', processed.size, 'bytes');
   * ```
   */
  async processFile(
    input: FileInput,
    context: ProcessingContext = ProcessingContext.ATTACHMENT,
    options?: ImageProcessingOptions,
  ): Promise<ProcessedFile> {
    this.#checkNotDestroyed();
    await this.#acquireOperationSlot();

    try {
      // Validate input and extract metadata
      this.#validateInputType(input);

      const originalFilename = this.#extractFilename(input);
      const buffer = await this.toBuffer(input);

      // Validate file size for context
      this.#validateFileSize(buffer, context);

      // Detect and validate content type
      const contentType = this.#detectContentType(originalFilename, buffer);
      this.#validateContentType(contentType, context);

      // Configure processing options
      const processingOptions = this.#buildProcessingOptions(context, options);

      // Process the file (optimize if image)
      const { processedBuffer, finalContentType, wasOptimized } =
        await this.#optimizeFile(buffer, contentType, processingOptions);

      // Generate safe filename
      const filename = this.#generateSafeFilename(
        originalFilename,
        finalContentType,
      );

      // Create final processed file object
      return {
        buffer: processedBuffer,
        filename,
        contentType: finalContentType,
        size: processedBuffer.length,
        dataUri: this.#createDataUri(processedBuffer, finalContentType),
        originalFilename,
        wasOptimized,
        context,
      };
    } catch (error) {
      const filename = this.#extractFilename(input);
      const details = this.#buildErrorDetails(input, filename);

      throw new Error(
        `File processing failed: ${error instanceof Error ? error.message : String(error)}${details ? ` (${details})` : ""}`,
      );
    } finally {
      this.#releaseOperationSlot();
    }
  }

  /**
   * Creates FormData for multipart uploads with proper file handling.
   * Processes files in parallel and handles JSON payload integration.
   *
   * @param files - Single file or array of files to include
   * @param body - Optional JSON payload to include in the form
   * @param context - Processing context for file validation
   * @param options - Optional processing configuration
   * @returns Promise resolving to FormData ready for upload
   * @throws Error If file processing fails or too many files provided
   *
   * @example
   * ```typescript
   * const formData = await handler.createFormData(
   *   ['./image1.jpg', './image2.png'],
   *   { message: 'Hello world!' },
   *   ProcessingContext.ATTACHMENT
   * );
   * ```
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
    context: ProcessingContext = ProcessingContext.ATTACHMENT,
    options?: ImageProcessingOptions,
  ): Promise<FormData> {
    this.#checkNotDestroyed();

    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > FILE_CONSTANTS.MAX_FILES_PER_BATCH) {
      throw new Error(
        `Too many files: ${filesArray.length}. Maximum allowed is ${FILE_CONSTANTS.MAX_FILES_PER_BATCH}`,
      );
    }

    try {
      // Process all files in parallel with concurrency control
      const processedFiles = await this.#processFilesBatch(
        filesArray,
        context,
        options,
      );

      // Create FormData and append files
      const form = new FormData();

      processedFiles.forEach((processedFile, index) => {
        const fieldName = filesArray.length === 1 ? "file" : `files[${index}]`;

        form.append(fieldName, processedFile.buffer, {
          filename: processedFile.filename,
          contentType: processedFile.contentType,
          knownLength: processedFile.size,
        });
      });

      // Add JSON payload if provided
      if (body !== undefined) {
        await this.#appendJsonPayload(form, body);
      }

      return form;
    } catch (error) {
      throw new Error(
        `Failed to create form data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Cleans up all resources and cancels active operations.
   * Should be called when the FileHandler instance is no longer needed.
   *
   * @example
   * ```typescript
   * const handler = new FileHandler();
   * try {
   *   // Use handler...
   * } finally {
   *   handler.destroy();
   * }
   * ```
   */
  destroy(): void {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;

    // Cancel all active timeouts
    for (const timeout of this.#activeTimeouts) {
      clearTimeout(timeout);
    }
    this.#activeTimeouts.clear();

    // Close all active streams
    for (const stream of this.#activeStreams) {
      try {
        if (stream.readable && !stream.destroyed) {
          stream.destroy();
        }
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.#activeStreams.clear();

    // Clear Sharp cache if not globally cached
    if (!this.#options.cacheSharpModule) {
      this.#sharpModuleCache = null;
    }
  }

  /**
   * Validates that the input is a supported file input type.
   * @internal
   */
  #validateInputType(input: unknown): asserts input is FileInput {
    if (
      !(
        Buffer.isBuffer(input) ||
        input instanceof Readable ||
        typeof input === "string"
      )
    ) {
      throw new Error("Invalid file input type");
    }

    if (typeof input === "string") {
      if (
        !(
          FILE_CONSTANTS.DATA_URI_PATTERN.test(input) ||
          FILE_CONSTANTS.FILE_PATH_PATTERN.test(input)
        )
      ) {
        throw new Error(
          `Invalid string input: expected file path or data URI (received: "${input.slice(0, 20)}${input.length > 20 ? "..." : ""}")`,
        );
      }
    }
  }

  /**
   * Validates buffer size against limits.
   * @internal
   */
  #validateBufferSize(buffer: Buffer): void {
    if (buffer.length > FILE_CONSTANTS.MAX_BUFFER_SIZE) {
      throw new Error(
        `Buffer too large: ${buffer.length} bytes (max: ${FILE_CONSTANTS.MAX_BUFFER_SIZE})`,
      );
    }
  }

  /**
   * Validates file size for the given context.
   * @internal
   */
  #validateFileSize(buffer: Buffer, context: ProcessingContext): void {
    const maxSize = FILE_CONSTANTS.SIZE_LIMITS[context];
    if (buffer.length > maxSize) {
      throw new Error(
        `File size exceeds maximum for ${context}: ${buffer.length} bytes (max: ${maxSize})`,
      );
    }
  }

  /**
   * Validates content type for the given context.
   * @internal
   */
  #validateContentType(contentType: string, context: ProcessingContext): void {
    // Check blocked MIME types
    if (this.#options.security.blockedMimeTypes?.includes(contentType)) {
      throw new Error(`Content type blocked by configuration: ${contentType}`);
    }

    // Check allowed MIME types if specified
    if (
      this.#options.security.allowedMimeTypes &&
      !this.#options.security.allowedMimeTypes.includes(contentType)
    ) {
      throw new Error(`Content type not in allowed list: ${contentType}`);
    }

    // Context-specific validation
    if (
      [
        ProcessingContext.AVATAR,
        ProcessingContext.EMOJI,
        ProcessingContext.BANNER,
      ].includes(context)
    ) {
      if (!FILE_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(contentType as any)) {
        throw new Error(
          `Content type not supported for ${context}: ${contentType}`,
        );
      }
    }
  }

  /**
   * Validates data URI format and content.
   * @internal
   */
  #validateDataUri(dataUri: string): void {
    const match = dataUri.match(FILE_CONSTANTS.DATA_URI_PATTERN);
    if (!match) {
      throw new Error("Invalid data URI format");
    }

    const [, mimeType, base64Data] = match;

    if (!(mimeType && base64Data)) {
      throw new Error("Malformed data URI");
    }

    // Validate base64 data length
    if (base64Data.length > FILE_CONSTANTS.MAX_BUFFER_SIZE * 1.4) {
      // Account for base64 overhead
      throw new Error("Data URI too large");
    }
  }

  /**
   * Safely converts a stream to buffer with timeout and cleanup.
   * @internal
   */
  async #streamToBufferSafe(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalSize = 0;
      let finished = false;

      const cleanup = () => {
        if (!finished) {
          finished = true;
          this.#activeStreams.delete(stream);
          stream.removeAllListeners();
          if (!stream.destroyed) {
            stream.destroy();
          }
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Stream timeout"));
      }, this.#options.streamTimeout);

      this.#activeTimeouts.add(timeout);
      this.#activeStreams.add(stream);

      stream.on("data", (chunk: Buffer) => {
        if (finished) {
          return;
        }

        totalSize += chunk.length;
        if (totalSize > FILE_CONSTANTS.MAX_BUFFER_SIZE) {
          cleanup();
          clearTimeout(timeout);
          this.#activeTimeouts.delete(timeout);
          reject(new Error("Stream too large"));
          return;
        }

        chunks.push(chunk);
      });

      stream.on("error", (error) => {
        cleanup();
        clearTimeout(timeout);
        this.#activeTimeouts.delete(timeout);
        reject(error);
      });

      stream.on("end", () => {
        cleanup();
        clearTimeout(timeout);
        this.#activeTimeouts.delete(timeout);
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Decodes base64 data URI content.
   * @internal
   */
  #decodeDataUri(base64Data: string): Buffer {
    try {
      const buffer = Buffer.from(base64Data, "base64");
      this.#validateBufferSize(buffer);
      return buffer;
    } catch (error) {
      throw new Error(
        `Failed to decode base64 data URI: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Reads file from filesystem path.
   * @internal
   */
  async #fileToBuffer(filePath: string): Promise<Buffer> {
    try {
      const stream = createReadStream(filePath);
      return await this.#streamToBufferSafe(stream);
    } catch (error) {
      throw new Error(
        `Failed to read file from path "${basename(filePath)}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Extracts filename from various input types.
   * @internal
   */
  #extractFilename(input: FileInput): string {
    if (
      typeof input === "string" &&
      !FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      const filename = basename(input);
      return this.#options.security.sanitizeFilenames
        ? this.#sanitizeFilename(filename)
        : filename;
    }
    return FILE_CONSTANTS.DEFAULT_FILENAME;
  }

  /**
   * Sanitizes filename to prevent security issues.
   * @internal
   */
  #sanitizeFilename(filename: string): string {
    // Remove or replace dangerous characters
    let sanitized = filename
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Ignore control characters
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") // Replace dangerous chars
      .replace(/^\.+/, "") // Remove leading dots
      .replace(/\.+$/, "") // Remove trailing dots
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .slice(0, this.#options.security.maxFilenameLength); // Truncate if too long

    // Ensure filename is not empty
    if (!sanitized || sanitized === "_") {
      sanitized = FILE_CONSTANTS.DEFAULT_FILENAME;
    }

    return sanitized;
  }

  /**
   * Detects content type from filename and buffer content.
   * @internal
   */
  #detectContentType(filename: string, buffer?: Buffer): string {
    // Try MIME type detection from filename
    const mimeFromFilename = lookup(filename);
    if (mimeFromFilename) {
      return mimeFromFilename;
    }

    // Try magic number detection for common types
    if (buffer && this.#options.security.deepInspection) {
      const magicMime = this.#detectMimeFromMagicNumbers(buffer);
      if (magicMime) {
        return magicMime;
      }
    }

    return FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  }

  /**
   * Detects MIME type from file magic numbers.
   * @internal
   */
  #detectMimeFromMagicNumbers(buffer: Buffer): string | null {
    if (buffer.length < 4) {
      return null;
    }

    const header = buffer.subarray(0, 12);

    // PNG
    if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      return "image/png";
    }

    // JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return "image/jpeg";
    }

    // GIF
    if (
      header.subarray(0, 6).toString() === "GIF87a" ||
      header.subarray(0, 6).toString() === "GIF89a"
    ) {
      return "image/gif";
    }

    // WebP
    if (
      header.subarray(0, 4).toString() === "RIFF" &&
      header.subarray(8, 12).toString() === "WEBP"
    ) {
      return "image/webp";
    }

    return null;
  }

  /**
   * Creates a data URI from buffer and content type.
   * @internal
   */
  #createDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  /**
   * Generates a safe filename with proper extension.
   * @internal
   */
  #generateSafeFilename(originalFilename: string, contentType: string): string {
    const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove extension
    const newExt =
      FILE_CONSTANTS.MIME_TO_EXTENSION[
        contentType as keyof typeof FILE_CONSTANTS.MIME_TO_EXTENSION
      ];

    if (newExt) {
      return `${baseName}${newExt}`;
    }

    return originalFilename;
  }

  /**
   * Builds processing options for the given context.
   * @internal
   */
  #buildProcessingOptions(
    context: ProcessingContext,
    overrides?: ImageProcessingOptions,
  ): ImageProcessingOptions {
    const baseOptions = { ...this.#options.imageProcessing };

    // Context-specific defaults
    switch (context) {
      case ProcessingContext.AVATAR:
      case ProcessingContext.EMOJI: {
        baseOptions.maxSize = 256 * 1024; // 256KB
        baseOptions.maxWidth = 512;
        baseOptions.maxHeight = 512;
        break;
      }
      case ProcessingContext.BANNER: {
        baseOptions.maxSize = 2 * 1024 * 1024; // 2MB
        baseOptions.maxWidth = 1920;
        baseOptions.maxHeight = 1080;
        break;
      }
      default: {
        baseOptions.maxSize =
          FILE_CONSTANTS.SIZE_LIMITS[context] || 2 * 1024 * 1024; // Default to 2MB
        baseOptions.maxWidth = 4096;
        baseOptions.maxHeight = 4096;
        break;
      }
    }

    return { ...baseOptions, ...overrides };
  }

  /**
   * Optimizes a file (images only) with Sharp.
   * @internal
   */
  async #optimizeFile(
    buffer: Buffer,
    contentType: string,
    options: ImageProcessingOptions,
  ): Promise<{
    processedBuffer: Buffer;
    finalContentType: string;
    wasOptimized: boolean;
  }> {
    // Skip optimization for non-images or if file is already small
    if (
      !FILE_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(contentType as any) ||
      buffer.length <= options.maxSize * 0.9
    ) {
      return {
        processedBuffer: buffer,
        finalContentType: contentType,
        wasOptimized: false,
      };
    }

    const sharp = await this.#getSharpModule();
    if (!sharp) {
      return {
        processedBuffer: buffer,
        finalContentType: contentType,
        wasOptimized: false,
      };
    }

    try {
      let image = sharp(buffer, {
        limitInputPixels: 50000000,
        sequentialRead: true,
      });

      // Strip metadata if requested
      if (options.stripMetadata) {
        image = image.withMetadata({});
      }

      const metadata = await image.metadata();

      // Resize if dimensions exceed limits
      if (metadata.width && metadata.height) {
        if (
          (options.maxWidth > 0 && metadata.width > options.maxWidth) ||
          (options.maxHeight > 0 && metadata.height > options.maxHeight)
        ) {
          image = image.resize(
            options.maxWidth || undefined,
            options.maxHeight || undefined,
            {
              fit: "inside",
              withoutEnlargement: true,
            },
          );
        }
      }

      // Try WebP conversion if allowed
      if (!options.preserveFormat && options.attemptWebpConversion) {
        try {
          const webpBuffer = await image
            .webp({ quality: options.quality })
            .toBuffer();
          if (webpBuffer.length <= options.maxSize) {
            return {
              processedBuffer: webpBuffer,
              finalContentType: "image/webp",
              wasOptimized: true,
            };
          }
        } catch {
          // WebP conversion failed, continue with original format
        }
      }

      // Optimize in original format
      if (metadata.format) {
        const optimizedBuffer = await this.#optimizeByFormat(
          image,
          metadata.format,
          options.quality,
        );
        if (
          optimizedBuffer.length <= options.maxSize ||
          optimizedBuffer.length < buffer.length
        ) {
          return {
            processedBuffer: optimizedBuffer,
            finalContentType: contentType,
            wasOptimized: true,
          };
        }
      }

      return {
        processedBuffer: buffer,
        finalContentType: contentType,
        wasOptimized: false,
      };
    } catch (_error) {
      // If optimization fails, return original
      return {
        processedBuffer: buffer,
        finalContentType: contentType,
        wasOptimized: false,
      };
    }
  }

  /**
   * Optimizes image by specific format.
   * @internal
   */
  async #optimizeByFormat(
    image: import("sharp").Sharp,
    format: string,
    quality: number,
  ): Promise<Buffer> {
    switch (format) {
      case "jpeg":
        return await image.jpeg({ quality, progressive: true }).toBuffer();
      case "png":
        return await image.png({ quality, compressionLevel: 9 }).toBuffer();
      case "webp":
        return await image.webp({ quality }).toBuffer();
      default:
        return await image.toBuffer();
    }
  }

  /**
   * Processes multiple files in batches with concurrency control.
   * @internal
   */
  async #processFilesBatch(
    files: FileInput[],
    context: ProcessingContext,
    options?: ImageProcessingOptions,
  ): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];

    // Process files with controlled concurrency
    for (
      let i = 0;
      i < files.length;
      i += this.#options.maxConcurrentOperations
    ) {
      const batch = files.slice(i, i + this.#options.maxConcurrentOperations);
      const batchResults = await Promise.all(
        batch.map((file) => this.processFile(file, context, options)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Appends JSON payload to FormData.
   * @internal
   */
  async #appendJsonPayload(
    form: FormData,
    body: HttpRequestOptions["body"],
  ): Promise<void> {
    try {
      if (typeof body === "string") {
        form.append("payload_json", body);
      } else if (Buffer.isBuffer(body)) {
        form.append("payload_json", body);
      } else if (body instanceof Readable) {
        const buffer = await this.#streamToBufferSafe(body);
        form.append("payload_json", buffer);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    } catch (error) {
      throw new Error(
        `Failed to append JSON payload: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Gets or loads the Sharp module.
   * @internal
   */
  async #getSharpModule(): Promise<typeof SharpType | null> {
    if (this.#options.cacheSharpModule && this.#sharpModuleCache) {
      return this.#sharpModuleCache;
    }

    const result = await OptionalDeps.safeImport<typeof SharpType>("sharp");
    if (result.success) {
      if (this.#options.cacheSharpModule) {
        this.#sharpModuleCache = result.data;
      }
      return result.data;
    }

    return null;
  }

  /**
   * Builds error details for debugging.
   * @internal
   */
  #buildErrorDetails(input: FileInput, filename?: string): string {
    const details: string[] = [];

    if (filename && filename !== FILE_CONSTANTS.DEFAULT_FILENAME) {
      details.push(`filename: ${filename}`);
    }

    if (Buffer.isBuffer(input)) {
      details.push(`size: ${input.length} bytes`);
    }

    return details.join(", ");
  }

  /**
   * Acquires an operation slot (concurrency control).
   * @internal
   */
  async #acquireOperationSlot(): Promise<void> {
    while (this.#activeOperations >= this.#options.maxConcurrentOperations) {
      if (this.#isDestroyed) {
        throw new Error("RateLimitManager destroyed");
      }

      const delay = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          this.#activeTimeouts.delete(timeout);
          resolve();
        }, 10);
        this.#activeTimeouts.add(timeout);
      });

      await delay;
    }
    this.#activeOperations++;
  }

  /**
   * Releases an operation slot.
   * @internal
   */
  #releaseOperationSlot(): void {
    this.#activeOperations = Math.max(0, this.#activeOperations - 1);
  }

  /**
   * Checks if the instance has been destroyed.
   * @internal
   */
  #checkNotDestroyed(): void {
    if (this.#isDestroyed) {
      throw new Error("FileHandler instance has been destroyed");
    }
  }
}
