import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import FormData from "form-data";
import { lookup } from "mime-types";
import { z } from "zod/v4";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * File processing limits and patterns for safe file handling operations.
 * These constants define security boundaries and format recognition patterns
 * to prevent memory exhaustion and ensure proper file processing.
 */
export const FILE_CONSTANTS = {
  /** Default filename when one cannot be determined from input */
  DEFAULT_FILENAME: "file",

  /** Default MIME type when content type detection fails */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /** Maximum time in milliseconds to wait for stream operations before timeout */
  STREAM_TIMEOUT: 30000,

  /** Maximum buffer size for file operations (100MB) to prevent memory exhaustion */
  MAX_BUFFER_SIZE: 100 * 1024 * 1024,

  /** Regular expression pattern to identify and validate data URI format */
  DATA_URI_PATTERN:
    /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*);base64,([A-Za-z0-9+/]+={0,2})$/,

  /** Regular expression pattern to identify file system paths on various operating systems */
  FILE_PATH_PATTERN: /^(?:[/.]|[a-zA-Z]:\\)/,
} as const;

/**
 * Type representing a data URI string containing base64-encoded file content.
 * Format: data:{mimeType};base64,{base64Content}
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Union type for all supported file input formats.
 * Supports file system paths, in-memory buffers, readable streams, and data URIs.
 */
export type FileInput = string | Buffer | Readable | DataUri;

/**
 * Interface representing a fully processed and validated file ready for upload.
 * Contains all necessary metadata and content for API operations.
 */
export interface ProcessedFile {
  /** File content as a Buffer for reliable binary data handling */
  buffer: Buffer;

  /** Sanitized filename safe for use in API requests and file systems */
  filename: string;

  /** Detected or specified MIME type for proper content handling */
  contentType: string;

  /** File size in bytes for validation and API requirements */
  size: number;

  /** Data URI representation for embedding in JSON or web contexts */
  dataUri: DataUri;

  /** Original filename before sanitization for reference */
  originalFilename: string;
}

/**
 * Configuration schema for file processing operations.
 * Provides optional validation constraints without complex security layers.
 */
export const ProcessOptions = z.object({
  /**
   * Maximum allowed file size in bytes.
   * When specified, files exceeding this size will be rejected.
   * If not specified, uses the global MAX_BUFFER_SIZE limit.
   */
  maxSize: z.number().int().positive().optional(),

  /**
   * Array of allowed MIME types for content validation.
   * When specified, only files matching these types will be accepted.
   * Useful for restricting uploads to specific file categories.
   */
  allowedTypes: z.array(z.string()).optional(),
});

export type ProcessOptions = z.infer<typeof ProcessOptions>;

/**
 * Configuration schema for FileHandler instance behavior.
 * Controls internal operation parameters and safety features.
 */
export const FileHandlerOptions = z.object({
  /**
   * Timeout duration for stream operations in milliseconds.
   * Prevents hanging operations on slow or unresponsive streams.
   * @default 30000
   */
  streamTimeout: z.number().int().positive().default(30000),

  /**
   * Whether to apply filename sanitization for file system safety.
   * Removes dangerous characters and ensures valid filenames.
   * @default true
   */
  sanitizeFilenames: z.boolean().default(true),
});

export type FileHandlerOptions = z.infer<typeof FileHandlerOptions>;

/**
 * Efficient and type-safe file handler designed for Discord API uploads.
 *
 * Provides essential file processing capabilities with memory efficiency:
 * - Handles multiple input formats (paths, buffers, streams, data URIs)
 * - Memory-efficient stream processing with timeout protection
 * - Automatic MIME type detection and filename sanitization
 * - FormData creation for multipart/form-data uploads
 * - Resource cleanup for long-running applications
 *
 * The handler prioritizes simplicity and reliability over advanced features,
 * making it suitable for bot applications and API integrations.
 */
export class FileHandler {
  /** Set of currently active streams for proper cleanup and resource management */
  readonly #activeStreams = new Set<Readable>();

  /** Set of active timeout handles to prevent memory leaks */
  readonly #activeTimeouts = new Set<NodeJS.Timeout>();

  /** Validated configuration options for this handler instance */
  readonly #options: FileHandlerOptions;

  /**
   * Creates a new FileHandler instance with specified configuration.
   *
   * @param options Configuration options for stream timeouts and filename handling
   */
  constructor(options: FileHandlerOptions) {
    this.#options = options;
  }

  /**
   * Validates whether the provided input is a supported file input type.
   * Performs type checking without throwing errors for safe validation.
   *
   * @param input Value to validate against supported file input types
   * @returns True if input is valid and can be processed by this handler
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
   * Converts any supported file input format to a Buffer.
   * Handles different input types with appropriate processing methods.
   *
   * @param input File input in any supported format (path, buffer, stream, data URI)
   * @returns Promise resolving to the file content as a Buffer
   * @throws Error if input type is unsupported or conversion fails
   */
  async toBuffer(input: FileInput): Promise<Buffer> {
    this.#validateInputType(input);

    if (Buffer.isBuffer(input)) {
      this.#validateBufferSize(input);
      return input;
    }

    if (input instanceof Readable) {
      return await this.#streamToBuffer(input);
    }

    if (typeof input === "string") {
      const dataUriMatch = input.match(FILE_CONSTANTS.DATA_URI_PATTERN);
      if (dataUriMatch?.[2]) {
        return this.#decodeDataUri(dataUriMatch[2]);
      }

      return await this.#fileToBuffer(input);
    }

    throw new Error("Unsupported file input type");
  }

  /**
   * Converts any supported file input format to a data URI string.
   * Useful for embedding files in JSON payloads or web contexts.
   *
   * @param input File input in any supported format
   * @returns Promise resolving to a data URI with detected MIME type
   * @throws Error if input cannot be processed or encoded
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
    // Return if already a valid data URI to avoid unnecessary processing
    if (
      typeof input === "string" &&
      FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      return input as DataUri;
    }

    const buffer = await this.toBuffer(input);
    const filename = this.#extractFilename(input);
    const contentType = this.#detectContentType(filename);

    return this.#createDataUri(buffer, contentType);
  }

  /**
   * Processes a file input with comprehensive validation and metadata extraction.
   * Performs size validation, content type detection, and filename sanitization.
   *
   * @param input File input to process and validate
   * @param options Processing constraints including size limits and allowed types
   * @returns Promise resolving to a ProcessedFile with complete metadata
   * @throws Error if validation fails or processing encounters issues
   */
  async processFile(
    input: FileInput,
    options: ProcessOptions = {},
  ): Promise<ProcessedFile> {
    // Validate options schema before processing
    const validatedOptions = ProcessOptions.parse(options);

    this.#validateInputType(input);

    const originalFilename = this.#extractFilename(input);
    const buffer = await this.toBuffer(input);

    // Validate file size against specified limits
    if (validatedOptions.maxSize && buffer.length > validatedOptions.maxSize) {
      throw new Error(
        `File size exceeds maximum: ${buffer.length} bytes (max: ${validatedOptions.maxSize})`,
      );
    }

    // Detect content type based on filename extension
    const contentType = this.#detectContentType(originalFilename);

    // Validate content type against allowed types list
    if (
      validatedOptions.allowedTypes &&
      !validatedOptions.allowedTypes.includes(contentType)
    ) {
      throw new Error(`Content type not allowed: ${contentType}`);
    }

    // Generate safe filename for file system and API compatibility
    const filename = this.#generateSafeFilename(originalFilename);

    return {
      buffer,
      filename,
      contentType,
      size: buffer.length,
      dataUri: this.#createDataUri(buffer, contentType),
      originalFilename,
    };
  }

  /**
   * Creates a FormData object for multipart uploads with optional JSON payload.
   * Handles single files or arrays of files with automatic field naming.
   *
   * @param files Single file or array of files to include in the form
   * @param body Optional JSON payload to include alongside files
   * @param options Processing options applied to all files
   * @returns Promise resolving to FormData ready for HTTP upload
   * @throws Error if file processing or FormData creation fails
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
    options: ProcessOptions = {},
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    // Process all files concurrently for better performance
    const processedFiles = await Promise.all(
      filesArray.map((file) => this.processFile(file, options)),
    );

    // Create FormData with proper multipart structure
    const form = new FormData();

    // Add files with appropriate field names for API compatibility
    processedFiles.forEach((processedFile, index) => {
      const fieldName = filesArray.length === 1 ? "file" : `files[${index}]`;

      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    });

    // Add JSON payload if provided for combined upload requests
    if (body !== undefined) {
      await this.#appendJsonPayload(form, body);
    }

    return form;
  }

  /**
   * Clears all active resources including streams and timeouts.
   * Safe to call multiple times. The instance remains usable after cleanup.
   */
  clear(): void {
    // Clear all active timeouts to prevent memory leaks
    for (const timeout of this.#activeTimeouts) {
      clearTimeout(timeout);
    }
    this.#activeTimeouts.clear();

    // Safely close all active streams
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
   * Validates that input matches one of the supported FileInput types.
   * Uses type assertion to provide compile-time type safety.
   *
   * @param input Input value to validate
   * @throws Error if input type is not supported
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
        throw new Error("Invalid string input: expected file path or data URI");
      }
    }
  }

  /**
   * Validates buffer size against the maximum allowed limit.
   * Prevents memory exhaustion from oversized buffers.
   *
   * @param buffer Buffer to validate
   * @throws Error if buffer exceeds maximum size limit
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
   * Converts a readable stream to a buffer with timeout and size protection.
   * Implements proper resource cleanup and error handling for stream operations.
   *
   * @param stream Readable stream to convert
   * @returns Promise resolving to concatenated buffer from stream chunks
   * @throws Error if stream times out, exceeds size limit, or encounters errors
   * @internal
   */
  async #streamToBuffer(stream: Readable): Promise<Buffer> {
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

      // Set timeout to prevent hanging on slow or stalled streams
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
   * Decodes base64 content from a data URI with size validation.
   * Provides error context for debugging failed decode operations.
   *
   * @param base64Data Base64 encoded string from data URI
   * @returns Decoded buffer with validated size
   * @throws Error if base64 decoding fails or result is too large
   * @internal
   */
  #decodeDataUri(base64Data: string): Buffer {
    try {
      const buffer = Buffer.from(base64Data, "base64");
      this.#validateBufferSize(buffer);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to decode base64 data URI: ${error}`);
    }
  }

  /**
   * Reads a file from the filesystem using streams for memory efficiency.
   * Provides enhanced error messages with filename context for debugging.
   *
   * @param filePath File system path to read
   * @returns Promise resolving to file content as buffer
   * @throws Error if file cannot be read or path is invalid
   * @internal
   */
  async #fileToBuffer(filePath: string): Promise<Buffer> {
    try {
      const stream = createReadStream(filePath);
      return await this.#streamToBuffer(stream);
    } catch (error) {
      throw new Error(`Failed to read file "${basename(filePath)}": ${error}`);
    }
  }

  /**
   * Extracts filename from various input types with fallback handling.
   * Returns basename for file paths and default name for other input types.
   *
   * @param input File input to extract filename from
   * @returns Extracted filename or default if unavailable
   * @internal
   */
  #extractFilename(input: FileInput): string {
    if (
      typeof input === "string" &&
      !FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      return basename(input);
    }
    return FILE_CONSTANTS.DEFAULT_FILENAME;
  }

  /**
   * Generates a filesystem-safe filename through sanitization.
   * Removes dangerous characters and ensures valid filename constraints.
   *
   * @param filename Original filename to sanitize
   * @returns Sanitized filename safe for filesystem and API use
   * @internal
   */
  #generateSafeFilename(filename: string): string {
    if (!this.#options.sanitizeFilenames) {
      return filename;
    }

    // Apply comprehensive sanitization rules
    let sanitized = filename
      .replace(/[<>:"/\\|?*]/g, "_") // Replace filesystem-dangerous characters
      .replace(/^\.+/, "") // Remove leading dots (hidden files)
      .replace(/\.+$/, "") // Remove trailing dots (Windows issues)
      .replace(/\s+/g, "_") // Replace whitespace sequences
      .slice(0, 255); // Limit to maximum filename length

    // Ensure we have a valid non-empty filename
    if (!sanitized || sanitized === "_") {
      sanitized = FILE_CONSTANTS.DEFAULT_FILENAME;
    }

    return sanitized;
  }

  /**
   * Detects MIME type from filename extension using mime-types library.
   * Falls back to generic binary type when detection fails.
   *
   * @param filename Filename to analyze for content type
   * @returns Detected MIME type or default binary type
   * @internal
   */
  #detectContentType(filename: string): string {
    return lookup(filename) || FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  }

  /**
   * Creates a properly formatted data URI from buffer and content type.
   * Follows RFC 2397 specification for data URI format.
   *
   * @param buffer File content to encode
   * @param contentType MIME type for the content
   * @returns Formatted data URI string
   * @internal
   */
  #createDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  /**
   * Appends JSON payload to FormData with proper content handling.
   * Handles various payload types including streams and buffers.
   *
   * @param form FormData instance to append to
   * @param body JSON payload in various supported formats
   * @throws Error if payload processing or appending fails
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
        const buffer = await this.#streamToBuffer(body);
        form.append("payload_json", buffer);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    } catch (error) {
      throw new Error(`Failed to append JSON payload: ${error}`);
    }
  }
}
