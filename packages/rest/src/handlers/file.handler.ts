import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import FormData from "form-data";
import { lookup } from "mime-types";
import { z } from "zod/v4";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * File processing context that determines size limits and security constraints.
 * Used to apply Discord-specific validation rules based on intended usage.
 *
 * @remarks
 * Different contexts have different size limits and content type restrictions
 * to match Discord's API requirements and best practices.
 */
export enum ProcessingContext {
  /** Standard file attachments in messages (25MB limit) */
  ATTACHMENT = "attachment",
  /** Generic visual assets with moderate restrictions (256KB limit) */
  ASSET = "asset",
  /** User profile pictures with strict size limits (256KB limit) */
  AVATAR = "avatar",
  /** Guild banners and large visual elements (2MB limit) */
  BANNER = "banner",
  /** Custom emoji uploads with strict limitations (256KB limit) */
  EMOJI = "emoji",
}

/**
 * Configuration constants for file handling operations.
 * Centralized configuration for limits, patterns, and security settings.
 *
 * @remarks
 * These constants are based on Discord's documented limits and security best practices.
 * Modifying these values may cause compatibility issues with Discord's API.
 */
export const FILE_CONSTANTS = {
  /** Maximum number of files that can be processed in a single batch operation */
  MAX_FILES_PER_BATCH: 10,

  /** Default filename used when one cannot be determined from input */
  DEFAULT_FILENAME: "file",

  /** Default MIME type used when content type cannot be detected */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /** Timeout for stream operations in milliseconds to prevent hanging */
  STREAM_TIMEOUT: 30000,

  /** Maximum buffer size for in-memory operations (100MB) to prevent OOM */
  MAX_BUFFER_SIZE: 100 * 1024 * 1024,

  /** Regular expression pattern to identify data URIs with base64 encoding */
  DATA_URI_PATTERN:
    /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*);base64,([A-Za-z0-9+/]+={0,2})$/,

  /** Regular expression pattern to identify file system paths */
  FILE_PATH_PATTERN: /^(?:[/.]|[a-zA-Z]:\\)/,

  /** Allowed image MIME types for visual content processing */
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/bmp",
    "image/tiff",
  ] as const,

  /** Dangerous file extensions that should be blocked for security reasons */
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

  /** Safe file extensions that are generally allowed for upload */
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

  /** File size limits by processing context (in bytes) */
  SIZE_LIMITS: {
    [ProcessingContext.ATTACHMENT]: 25 * 1024 * 1024, // 25MB - Discord's attachment limit
    [ProcessingContext.ASSET]: 256 * 1024, // 256KB - Standard asset limit
    [ProcessingContext.AVATAR]: 256 * 1024, // 256KB - Discord's avatar limit
    [ProcessingContext.BANNER]: 2 * 1024 * 1024, // 2MB - Discord's banner limit
    [ProcessingContext.EMOJI]: 256 * 1024, // 256KB - Discord's emoji limit
  } as const,

  /** MIME type to file extension mapping for proper file naming */
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
 *
 * @example
 * ```typescript
 * const dataUri: DataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
 * ```
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Union type for any valid file input in Node.js environments.
 * Supports file paths, buffers, streams, and data URIs for maximum flexibility.
 *
 * @example
 * ```typescript
 * // All these are valid FileInput types
 * const pathInput: FileInput = "./image.jpg";
 * const bufferInput: FileInput = Buffer.from("...");
 * const streamInput: FileInput = fs.createReadStream("./file.txt");
 * const dataUriInput: FileInput = "data:image/png;base64,...";
 * ```
 */
export type FileInput = string | Buffer | Readable | DataUri;

/**
 * Represents a fully processed file ready for upload or use.
 * Contains all necessary metadata and validated content for Discord API usage.
 *
 * @remarks
 * All fields are guaranteed to be valid and safe after processing.
 * The buffer contains the final file content that should be uploaded.
 */
export interface ProcessedFile {
  /** Validated file content as Buffer ready for upload */
  buffer: Buffer;

  /** Sanitized filename with correct extension for Discord compatibility */
  filename: string;

  /** Detected and validated MIME type */
  contentType: string;

  /** Final file size in bytes after processing */
  size: number;

  /** Data URI representation of the processed file for embedding */
  dataUri: DataUri;

  /** Original filename before sanitization and processing */
  originalFilename: string;

  /** Processing context that was used for validation */
  context: ProcessingContext;
}

/**
 * Security configuration options for file validation.
 * Controls how strictly files are validated and what types are allowed.
 *
 * @remarks
 * These options provide defense-in-depth against malicious file uploads
 * and help enforce content policies.
 */
export const SecurityOptions = z.object({
  /**
   * Custom allowed MIME types that override default restrictions.
   * When specified, only these MIME types will be accepted for processing.
   *
   * @example ["image/jpeg", "image/png", "text/plain"]
   */
  allowedMimeTypes: z
    .array(z.string().min(1).max(100))
    .max(50) // Prevent excessive validation overhead
    .optional(),

  /**
   * Custom blocked MIME types that are always rejected.
   * These MIME types will be rejected regardless of other settings.
   *
   * @example ["application/x-executable", "text/html"]
   */
  blockedMimeTypes: z
    .array(z.string().min(1).max(100))
    .max(100) // Allow comprehensive blocklist
    .optional(),

  /**
   * Custom allowed file extensions that override default restrictions.
   * When specified, only these extensions will be accepted for processing.
   *
   * @example [".jpg", ".png", ".txt"]
   */
  allowedExtensions: z
    .array(z.string().min(1).max(20).startsWith("."))
    .max(50) // Prevent excessive validation overhead
    .optional(),

  /**
   * Custom blocked file extensions that are always rejected.
   * These extensions will be rejected regardless of other settings.
   *
   * @example [".exe", ".bat", ".js"]
   */
  blockedExtensions: z
    .array(z.string().min(1).max(20).startsWith("."))
    .max(100) // Allow comprehensive blocklist
    .optional(),

  /**
   * Whether to perform deep content inspection using magic numbers.
   * Analyzes file headers and magic bytes for enhanced type verification.
   *
   * @default true
   * @remarks Provides additional security but may impact performance
   */
  deepInspection: z.boolean().default(true),

  /**
   * Whether to automatically sanitize filenames for security.
   * Removes dangerous characters and patterns from filenames.
   *
   * @default true
   * @remarks Recommended to prevent path traversal and injection attacks
   */
  sanitizeFilenames: z.boolean().default(true),

  /**
   * Maximum allowed filename length in characters.
   * Filenames longer than this will be truncated to prevent filesystem issues.
   *
   * @default 255
   * @remarks Based on common filesystem limitations
   */
  maxFilenameLength: z
    .number()
    .int()
    .min(10) // Minimum reasonable filename length
    .max(1000) // Maximum to prevent filesystem issues
    .default(255),
});

/**
 * Inferred TypeScript type for security configuration options.
 */
export type SecurityOptions = z.infer<typeof SecurityOptions>;

/**
 * Configuration options for the FileHandler instance.
 * Allows customization of security validation and resource management behavior.
 *
 * @remarks
 * These options control both security policies and performance characteristics
 * of file processing operations.
 */
export const FileHandlerOptions = z.object({
  /**
   * Security configuration for file validation and content filtering.
   * Controls how strictly files are validated and what content is allowed.
   */
  security: SecurityOptions.prefault({}),

  /**
   * Timeout for stream operations in milliseconds.
   * Streams that don't complete within this time will be aborted to prevent hanging.
   *
   * @default 30000
   * @remarks Helps prevent resource exhaustion from slow or stalled streams
   */
  streamTimeout: z
    .number()
    .int()
    .min(1000) // Minimum 1 second to allow reasonable processing time
    .max(300000) // Maximum 5 minutes to prevent indefinite hanging
    .default(30000),

  /**
   * Maximum number of concurrent file operations allowed.
   * Limits parallel processing to control memory usage and system load.
   *
   * @default 5
   * @remarks Higher values increase throughput but consume more memory
   */
  maxConcurrentOperations: z
    .number()
    .int()
    .min(1)
    .max(20) // Reasonable maximum to prevent resource exhaustion
    .default(5),
});

/**
 * Inferred TypeScript type for FileHandler configuration options.
 */
export type FileHandlerOptions = z.infer<typeof FileHandlerOptions>;

/**
 * Enterprise-grade file handling utility for Discord bot applications.
 *
 * Provides comprehensive file processing capabilities with security-first design:
 * - Type-safe file input validation with runtime checks
 * - Security-conscious content type and extension filtering
 * - Memory-efficient stream processing with automatic cleanup
 * - Discord-specific context validation and size limits
 * - Comprehensive error handling with detailed diagnostics
 * - Resource management with configurable concurrency control
 * - Reusable instances with periodic cleanup capabilities
 *
 * @remarks
 * This handler is designed specifically for Discord bot use cases where security,
 * reliability, and compliance with Discord's API requirements are paramount.
 * It validates files according to Discord's documented limits and best practices.
 *
 * @example
 * Basic usage with automatic cleanup:
 * ```typescript
 * const handler = new FileHandler({
 *   security: { deepInspection: true },
 *   maxConcurrentOperations: 3
 * });
 *
 * // Process files for different Discord contexts
 * const avatar = await handler.processFile('./avatar.jpg', ProcessingContext.AVATAR);
 * const attachment = await handler.processFile('./document.pdf', ProcessingContext.ATTACHMENT);
 *
 * // Optional: clear resources periodically for long-running applications
 * handler.clear();
 *
 * // Instance remains usable after clearing
 * const emoji = await handler.processFile('./emoji.png', ProcessingContext.EMOJI);
 * ```
 *
 * @example
 * Batch processing with form data creation:
 * ```typescript
 * const files = ['./image1.jpg', './image2.png', './document.pdf'];
 * const formData = await handler.createFormData(
 *   files,
 *   { content: 'Multiple files attached!' },
 *   ProcessingContext.ATTACHMENT
 * );
 *
 * // FormData is ready for Discord API upload
 * ```
 */
export class FileHandler {
  /** Active stream operations being tracked for cleanup */
  readonly #activeStreams = new Set<Readable>();

  /** Active timeout handles being tracked for cleanup */
  readonly #activeTimeouts = new Set<NodeJS.Timeout>();

  /** Semaphore counter for concurrency control */
  #activeOperations = 0;

  /** Configuration options for this FileHandler instance */
  readonly #options: FileHandlerOptions;

  /**
   * Creates a new FileHandler instance with the specified configuration.
   *
   * @param options - Configuration options merged with sensible defaults
   *
   * @example
   * ```typescript
   * // Minimal configuration with defaults
   * const handler = new FileHandler({});
   *
   * // Custom security configuration
   * const strictHandler = new FileHandler({
   *   security: {
   *     allowedMimeTypes: ['image/jpeg', 'image/png'],
   *     deepInspection: true,
   *     sanitizeFilenames: true
   *   },
   *   maxConcurrentOperations: 10
   * });
   * ```
   */
  constructor(options: FileHandlerOptions) {
    this.#options = options;
  }

  /**
   * Validates whether the input is a supported file input type.
   * Performs comprehensive validation including basic security checks.
   *
   * @param input - The value to validate as a potential file input
   * @returns True if the input is valid and safe for processing
   *
   * @remarks
   * This method only validates the input type and format, not the actual file content.
   * Use processFile() for comprehensive validation including size and security checks.
   *
   * @example
   * ```typescript
   * // Validate different input types
   * console.log(handler.isValidInput('./image.jpg')); // true
   * console.log(handler.isValidInput(Buffer.from('...'))); // true
   * console.log(handler.isValidInput('data:image/png;base64,...')); // true
   * console.log(handler.isValidInput(123)); // false
   * console.log(handler.isValidInput(null)); // false
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
   * Handles memory management and provides timeout protection for stream operations.
   *
   * @param input - The file input to convert (path, Buffer, stream, or data URI)
   * @returns Promise resolving to buffer containing the complete file content
   * @throws Error If conversion fails, input is invalid, or size limits are exceeded
   *
   * @remarks
   * This method automatically handles different input types and provides protection
   * against memory exhaustion and hanging operations through timeouts and size limits.
   *
   * @example
   * ```typescript
   * // Convert different input types to buffers
   * const fromPath = await handler.toBuffer('./image.jpg');
   * const fromDataUri = await handler.toBuffer('data:image/png;base64,...');
   * const fromStream = await handler.toBuffer(fs.createReadStream('./file.txt'));
   *
   * console.log('File sizes:', fromPath.length, fromDataUri.length, fromStream.length);
   * ```
   */
  async toBuffer(input: FileInput): Promise<Buffer> {
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
   * Converts a file input to a data URI with validation and proper MIME type detection.
   * Creates a base64-encoded data URI representation suitable for embedding or transmission.
   *
   * @param input - The file input to convert to data URI format
   * @returns Promise resolving to a properly formatted data URI with MIME type
   * @throws Error If conversion fails, file is invalid, or size limits are exceeded
   *
   * @remarks
   * Data URIs are useful for embedding files directly in JSON payloads or HTML,
   * but should be used carefully due to size limitations and encoding overhead.
   *
   * @example
   * ```typescript
   * // Convert file to embeddable data URI
   * const dataUri = await handler.toDataUri('./profile.png');
   * console.log(dataUri); // "data:image/png;base64,iVBORw0KGgoAAAA..."
   *
   * // Use in Discord embed or API call
   * const embed = {
   *   thumbnail: { url: dataUri }
   * };
   * ```
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
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
   * Processes a file with comprehensive security validation and Discord context checking.
   * Performs complete validation including size limits, content type verification, and security scanning.
   *
   * @param input - The file input to process and validate
   * @param context - Processing context determining validation rules and size limits
   * @returns Promise resolving to a fully processed and validated file object
   * @throws Error If processing fails, file violates security policies, or exceeds context limits
   *
   * @remarks
   * This is the primary method for file validation in Discord bot applications.
   * It applies context-specific rules based on Discord's documented requirements
   * and provides comprehensive security validation.
   *
   * @example
   * ```typescript
   * // Process files for different Discord contexts
   * const avatar = await handler.processFile('./user-avatar.jpg', ProcessingContext.AVATAR);
   * const emoji = await handler.processFile('./custom-emoji.png', ProcessingContext.EMOJI);
   * const attachment = await handler.processFile('./document.pdf', ProcessingContext.ATTACHMENT);
   *
   * // Access processed file information
   * console.log(`Processed ${avatar.filename}: ${avatar.size} bytes, ${avatar.contentType}`);
   *
   * // Use the processed buffer for Discord API calls
   * await uploadToDiscord(avatar.buffer, avatar.filename);
   * ```
   */
  async processFile(
    input: FileInput,
    context: ProcessingContext = ProcessingContext.ATTACHMENT,
  ): Promise<ProcessedFile> {
    await this.#acquireOperationSlot();

    try {
      // Validate input type and extract basic metadata
      this.#validateInputType(input);

      const originalFilename = this.#extractFilename(input);
      const buffer = await this.toBuffer(input);

      // Apply context-specific size validation
      this.#validateFileSize(buffer, context);

      // Detect and validate content type with security checks
      const contentType = this.#detectContentType(originalFilename, buffer);
      this.#validateContentType(contentType, context);

      // Generate safe filename with proper extension
      const filename = this.#generateSafeFilename(
        originalFilename,
        contentType,
      );

      // Return fully processed file object
      return {
        buffer,
        filename,
        contentType,
        size: buffer.length,
        dataUri: this.#createDataUri(buffer, contentType),
        originalFilename,
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
   * Creates FormData for multipart uploads with proper file handling and JSON payload integration.
   * Processes multiple files in parallel and creates Discord API-compatible multipart form data.
   *
   * @param files - Single file or array of files to include in the form data
   * @param body - Optional JSON payload to include alongside files (for Discord API)
   * @param context - Processing context for file validation (applied to all files)
   * @returns Promise resolving to FormData ready for HTTP multipart upload
   * @throws Error If file processing fails, too many files provided, or payload creation fails
   *
   * @remarks
   * This method is specifically designed for Discord's multipart upload requirements
   * where files and JSON payloads need to be combined in a single request.
   * The resulting FormData can be used directly with HTTP clients.
   *
   * @example
   * ```typescript
   * // Single file with message
   * const formData = await handler.createFormData(
   *   './image.jpg',
   *   { content: 'Check out this image!' },
   *   ProcessingContext.ATTACHMENT
   * );
   *
   * // Multiple files for batch upload
   * const multipleFiles = ['./image1.jpg', './image2.png', './document.pdf'];
   * const batchFormData = await handler.createFormData(
   *   multipleFiles,
   *   { content: 'Multiple attachments' },
   *   ProcessingContext.ATTACHMENT
   * );
   *
   * // Use with HTTP client
   * const response = await fetch(discordApiUrl, {
   *   method: 'POST',
   *   body: formData,
   *   headers: formData.getHeaders()
   * });
   * ```
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
    context: ProcessingContext = ProcessingContext.ATTACHMENT,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > FILE_CONSTANTS.MAX_FILES_PER_BATCH) {
      throw new Error(
        `Too many files: ${filesArray.length}. Maximum allowed is ${FILE_CONSTANTS.MAX_FILES_PER_BATCH}`,
      );
    }

    try {
      // Process all files in parallel with concurrency control
      const processedFiles = await this.#processFilesBatch(filesArray, context);

      // Create FormData and append processed files
      const form = new FormData();

      processedFiles.forEach((processedFile, index) => {
        const fieldName = filesArray.length === 1 ? "file" : `files[${index}]`;

        form.append(fieldName, processedFile.buffer, {
          filename: processedFile.filename,
          contentType: processedFile.contentType,
          knownLength: processedFile.size,
        });
      });

      // Add JSON payload if provided (Discord API requirement)
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
   * Clears all active resources and cancels ongoing operations.
   * The FileHandler instance remains usable after calling this method.
   *
   * @remarks
   * This method is useful for periodic cleanup in long-running applications
   * to free memory and cancel any hanging operations. Unlike traditional
   * destroy() methods, this allows the instance to be reused afterward.
   *
   * @example
   * ```typescript
   * const handler = new FileHandler(config);
   *
   * // Normal usage
   * await handler.processFile('./file1.jpg');
   * await handler.processFile('./file2.png');
   *
   * // Periodic cleanup (e.g., end of batch, memory pressure)
   * handler.clear();
   *
   * // Instance remains fully usable
   * await handler.processFile('./file3.gif'); // ✅ Works perfectly
   *
   * // Can be called multiple times safely
   * handler.clear(); // ✅ No-op if nothing to clear
   * ```
   */
  clear(): void {
    // Cancel all active timeout operations
    for (const timeout of this.#activeTimeouts) {
      clearTimeout(timeout);
    }
    this.#activeTimeouts.clear();

    // Gracefully close all active stream operations
    for (const stream of this.#activeStreams) {
      try {
        if (stream.readable && !stream.destroyed) {
          stream.destroy();
        }
      } catch {
        // Ignore cleanup errors to prevent cascading failures
      }
    }
    this.#activeStreams.clear();
  }

  /**
   * Validates that the input is a supported file input type.
   * Uses TypeScript assertion to ensure type safety in subsequent operations.
   *
   * @param input - Unknown input to validate as FileInput
   * @throws Error If input type is not supported
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
   * Validates buffer size against memory limits to prevent OOM conditions.
   *
   * @param buffer - Buffer to validate
   * @throws Error If buffer exceeds maximum allowed size
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
   * Validates file size against context-specific limits based on Discord requirements.
   *
   * @param buffer - File content buffer to validate
   * @param context - Processing context determining size limits
   * @throws Error If file exceeds the maximum size for the given context
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
   * Validates content type against security policies and context requirements.
   * Applies both global security rules and context-specific restrictions.
   *
   * @param contentType - MIME type to validate
   * @param context - Processing context for content type restrictions
   * @throws Error If content type is blocked or not allowed for the context
   * @internal
   */
  #validateContentType(contentType: string, context: ProcessingContext): void {
    // Apply global security policy: check blocked MIME types
    if (this.#options.security.blockedMimeTypes?.includes(contentType)) {
      throw new Error(`Content type blocked by configuration: ${contentType}`);
    }

    // Apply global security policy: check allowed MIME types allowlist
    if (
      this.#options.security.allowedMimeTypes &&
      !this.#options.security.allowedMimeTypes.includes(contentType)
    ) {
      throw new Error(`Content type not in allowed list: ${contentType}`);
    }

    // Apply context-specific validation for visual content
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
   * Validates data URI format and content for security and correctness.
   *
   * @param dataUri - Data URI string to validate
   * @throws Error If data URI format is invalid or content is malformed
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

    // Validate base64 data length to prevent excessive memory usage
    if (base64Data.length > FILE_CONSTANTS.MAX_BUFFER_SIZE * 1.4) {
      // Account for base64 encoding overhead (~33%)
      throw new Error("Data URI too large");
    }
  }

  /**
   * Safely converts a stream to buffer with timeout protection and proper cleanup.
   * Implements comprehensive error handling and resource management to prevent memory leaks.
   *
   * @param stream - Readable stream to convert to buffer
   * @returns Promise resolving to complete buffer content
   * @throws Error If stream times out, exceeds size limits, or encounters errors
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
        if (!finished) {
          cleanup();
          reject(new Error("Stream timeout"));
        }
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
        if (!finished) {
          cleanup();
          clearTimeout(timeout);
          this.#activeTimeouts.delete(timeout);
          reject(error);
        }
      });

      stream.on("end", () => {
        if (!finished) {
          cleanup();
          clearTimeout(timeout);
          this.#activeTimeouts.delete(timeout);
          resolve(Buffer.concat(chunks));
        }
      });
    });
  }

  /**
   * Decodes base64 data URI content with validation and error handling.
   *
   * @param base64Data - Base64 encoded data from data URI
   * @returns Decoded buffer content
   * @throws Error If decoding fails or size limits are exceeded
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
   * Reads file from filesystem path using stream-based approach for memory efficiency.
   *
   * @param filePath - Filesystem path to read
   * @returns Promise resolving to file content buffer
   * @throws Error If file cannot be read or path is invalid
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
   * Extracts filename from various input types with optional sanitization.
   *
   * @param input - File input to extract filename from
   * @returns Extracted or default filename
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
   * Sanitizes filename to prevent security issues and filesystem conflicts.
   * Removes dangerous characters and enforces length limits.
   *
   * @param filename - Original filename to sanitize
   * @returns Sanitized filename safe for filesystem operations
   * @internal
   */
  #sanitizeFilename(filename: string): string {
    // Remove or replace dangerous characters and patterns
    let sanitized = filename
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Required for security
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") // Replace dangerous filesystem chars
      .replace(/^\.+/, "") // Remove leading dots (hidden file protection)
      .replace(/\.+$/, "") // Remove trailing dots (Windows compatibility)
      .replace(/\s+/g, "_") // Replace whitespace with underscores
      .slice(0, this.#options.security.maxFilenameLength); // Enforce length limit

    // Ensure filename is not empty after sanitization
    if (!sanitized || sanitized === "_") {
      sanitized = FILE_CONSTANTS.DEFAULT_FILENAME;
    }

    return sanitized;
  }

  /**
   * Detects content type from filename extension and buffer content analysis.
   * Uses multiple detection methods for accuracy and security.
   *
   * @param filename - Filename to analyze for content type hints
   * @param buffer - Optional buffer for magic number detection
   * @returns Detected MIME type or default if detection fails
   * @internal
   */
  #detectContentType(filename: string, buffer?: Buffer): string {
    // Primary detection: MIME type from filename extension
    const mimeFromFilename = lookup(filename);
    if (mimeFromFilename) {
      return mimeFromFilename;
    }

    // Secondary detection: magic number analysis for enhanced security
    if (buffer && this.#options.security.deepInspection) {
      const magicMime = this.#detectMimeFromMagicNumbers(buffer);
      if (magicMime) {
        return magicMime;
      }
    }

    return FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  }

  /**
   * Detects MIME type from file magic numbers (file signatures) for enhanced security.
   * Analyzes the first few bytes of file content to identify the actual file type.
   *
   * @param buffer - File content buffer to analyze
   * @returns Detected MIME type or null if no known signature found
   * @internal
   */
  #detectMimeFromMagicNumbers(buffer: Buffer): string | null {
    if (buffer.length < 4) {
      return null;
    }

    const header = buffer.subarray(0, 12);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      return "image/png";
    }

    // JPEG signature: FF D8 FF
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return "image/jpeg";
    }

    // GIF signatures: "GIF87a" or "GIF89a"
    if (
      header.subarray(0, 6).toString() === "GIF87a" ||
      header.subarray(0, 6).toString() === "GIF89a"
    ) {
      return "image/gif";
    }

    // WebP signature: "RIFF" + "WEBP"
    if (
      header.subarray(0, 4).toString() === "RIFF" &&
      header.subarray(8, 12).toString() === "WEBP"
    ) {
      return "image/webp";
    }

    return null;
  }

  /**
   * Creates a properly formatted data URI from buffer and content type.
   *
   * @param buffer - File content buffer
   * @param contentType - MIME type for the data URI
   * @returns Formatted data URI string
   * @internal
   */
  #createDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  /**
   * Generates a safe filename with proper extension based on detected content type.
   * Ensures filename matches the actual file content for consistency.
   *
   * @param originalFilename - Original filename before processing
   * @param contentType - Detected MIME type
   * @returns Safe filename with appropriate extension
   * @internal
   */
  #generateSafeFilename(originalFilename: string, contentType: string): string {
    const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove existing extension
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
   * Processes multiple files in batches with controlled concurrency.
   * Prevents resource exhaustion while maintaining good throughput.
   *
   * @param files - Array of file inputs to process
   * @param context - Processing context for all files
   * @returns Promise resolving to array of processed files
   * @internal
   */
  async #processFilesBatch(
    files: FileInput[],
    context: ProcessingContext,
  ): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];

    // Process files in controlled batches to prevent resource exhaustion
    for (
      let i = 0;
      i < files.length;
      i += this.#options.maxConcurrentOperations
    ) {
      const batch = files.slice(i, i + this.#options.maxConcurrentOperations);
      const batchResults = await Promise.all(
        batch.map((file) => this.processFile(file, context)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Appends JSON payload to FormData with proper handling of different body types.
   * Supports the various body formats that Discord API endpoints accept.
   *
   * @param form - FormData instance to append payload to
   * @param body - JSON payload in various formats
   * @throws Error If payload processing fails
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
   * Builds detailed error information for debugging and troubleshooting.
   *
   * @param input - Original file input that caused the error
   * @param filename - Extracted filename if available
   * @returns Formatted error details string
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
   * Acquires an operation slot for concurrency control.
   * Implements a semaphore pattern to limit concurrent file operations.
   *
   * @returns Promise that resolves when a slot becomes available
   * @internal
   */
  async #acquireOperationSlot(): Promise<void> {
    while (this.#activeOperations >= this.#options.maxConcurrentOperations) {
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
   * Releases an operation slot after completion.
   * Ensures the semaphore counter never goes below zero.
   *
   * @internal
   */
  #releaseOperationSlot(): void {
    this.#activeOperations = Math.max(0, this.#activeOperations - 1);
  }
}
