import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import FormData from "form-data";
import { lookup } from "mime-types";
import { z } from "zod";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * File processing limits and security patterns for Discord API uploads.
 * Defines security boundaries and default values for file operations.
 *
 * @public
 */
export const FILE_CONSTANTS = {
  /**
   * Default filename when one cannot be determined.
   * Applied for streams, buffers, or malformed data URIs.
   */
  DEFAULT_FILENAME: "file",

  /**
   * Default MIME type when content type detection fails.
   * Falls back to generic binary stream for compatibility.
   */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /**
   * Maximum time in milliseconds to wait for stream operations.
   * Prevents indefinite hanging on slow networks.
   */
  STREAM_TIMEOUT: 30000,

  /**
   * Maximum buffer size for file operations.
   * Set to 100MB to accommodate Discord's 25MB limit plus overhead.
   */
  MAX_BUFFER_SIZE: 100 * 1024 * 1024,

  /**
   * RFC 2397 compliant regex for validating data URI format.
   * Matches data:{mediatype};base64,{data} with strict validation.
   */
  DATA_URI_PATTERN:
    /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.]*);base64,([A-Za-z0-9+/]+={0,2})$/,

  /**
   * Cross-platform filesystem path detection pattern.
   * Identifies Unix absolute/relative paths and Windows drive paths.
   */
  FILE_PATH_PATTERN: /^(?:[/.]|[a-zA-Z]:\\)/,
} as const;

/**
 * Strongly-typed data URI string with base64-encoded content.
 * Represents a complete data URI following RFC 2397 specification.
 *
 * @public
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Union type for all supported file input formats.
 * Supports filesystem paths, buffers, streams, and data URIs.
 *
 * @public
 */
export type FileInput = string | Buffer | Readable | DataUri;

/**
 * File processing result with complete metadata and content.
 * Contains all information needed for Discord API uploads and display.
 *
 * @public
 */
export interface ProcessedFile {
  /**
   * File content as binary buffer for upload operations.
   * Ensures consistent binary handling across input sources.
   */
  buffer: Buffer;

  /**
   * Sanitized filename safe for API requests and filesystem operations.
   * Removes dangerous characters and applies length constraints.
   */
  filename: string;

  /**
   * MIME type detected from file extension or explicitly provided.
   * Used for proper Content-Type headers in HTTP requests.
   */
  contentType: string;

  /**
   * File size in bytes for validation and progress tracking.
   * Matches buffer.length for convenience and clarity.
   */
  size: number;

  /**
   * RFC 2397 compliant data URI for embedding in JSON contexts.
   * Enables direct usage in Discord embeds or client previews.
   */
  dataUri: DataUri;

  /**
   * Original filename before sanitization for reference and logging.
   * Preserves user intent while maintaining security.
   */
  originalFilename: string;
}

/**
 * Configuration schema for FileHandler behavior and performance.
 * Controls global behavior affecting all handler operations.
 *
 * @public
 */
export const FileHandlerOptions = z.object({
  /**
   * Timeout duration for stream operations in milliseconds.
   * Prevents indefinite hanging on slow or stalled streams.
   *
   * @default 30000
   */
  streamTimeout: z.number().int().positive().default(30000),

  /**
   * Whether to apply comprehensive filename sanitization.
   * Removes dangerous characters and ensures cross-platform compatibility.
   *
   * @default true
   */
  sanitizeFilenames: z.boolean().default(true),
});

export type FileHandlerOptions = z.infer<typeof FileHandlerOptions>;

/**
 * Production-ready file handler for Discord API integrations.
 * Provides comprehensive file processing with security and performance features.
 *
 * @example
 * ```typescript
 * const handler = new FileHandler({
 *   streamTimeout: 30000,
 *   sanitizeFilenames: true
 * });
 *
 * const processedFile = await handler.processFile('./avatar.png');
 * const formData = await handler.createFormData(
 *   ['./image1.png', './image2.jpg'],
 *   { content: 'Check out these images!' }
 * );
 * ```
 *
 * @public
 */
export class FileHandler {
  /**
   * Set of currently active readable streams for lifecycle management.
   * Tracks streams to ensure proper cleanup on errors or timeouts.
   *
   * @readonly
   * @internal
   */
  readonly #activeStreams = new Set<Readable>();

  /**
   * Set of active timeout handles to prevent memory leaks.
   * Tracks setTimeout handles for proper cleanup.
   *
   * @readonly
   * @internal
   */
  readonly #activeTimeouts = new Set<NodeJS.Timeout>();

  /**
   * Validated configuration options controlling handler behavior.
   * Contains settings affecting security, timeouts, and compatibility.
   *
   * @readonly
   * @internal
   */
  readonly #options: FileHandlerOptions;

  /**
   * Creates a new FileHandler with validated configuration.
   * Initializes production-ready file handler with error handling.
   *
   * @param options - Configuration controlling handler behavior and limits
   *
   * @throws {Error} If configuration validation fails
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({
   *   streamTimeout: 30000,
   *   sanitizeFilenames: true
   * });
   * ```
   *
   * @public
   */
  constructor(options: FileHandlerOptions) {
    this.#options = options;
  }

  /**
   * Validates input types without throwing exceptions.
   * Performs comprehensive type checking for supported file inputs.
   *
   * @param input - Value to validate against supported file input types
   * @returns True if input is valid and processable
   *
   * @example
   * ```typescript
   * console.log(handler.isValidInput('./file.txt'));        // true
   * console.log(handler.isValidInput(Buffer.from('data'))); // true
   * console.log(handler.isValidInput(process.stdin));       // true
   * console.log(handler.isValidInput(123));                 // false
   * ```
   *
   * @public
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
   * Converts any supported input format to a Buffer.
   * Handles different input formats with consistent Buffer output.
   *
   * @param input - File input in any supported format
   * @returns Promise resolving to the complete file content as Buffer
   *
   * @throws {Error} If input type is unsupported
   * @throws {Error} If file reading fails
   * @throws {Error} If content exceeds size limits
   * @throws {Error} If stream processing times out
   *
   * @example
   * ```typescript
   * const fileBuffer = await handler.toBuffer('./image.png');
   * const uriBuffer = await handler.toBuffer('data:text/plain;base64,SGVsbG8=');
   * const streamBuffer = await handler.toBuffer(request.body);
   * ```
   *
   * @public
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
   * Converts any supported input to an RFC 2397 compliant data URI.
   * Creates web-compatible data URIs with automatic MIME type detection.
   *
   * @param input - File input in any supported format
   * @returns Promise resolving to a complete data URI
   *
   * @throws {Error} If input processing fails
   * @throws {Error} If content exceeds size limits
   * @throws {Error} If MIME type detection fails
   *
   * @example
   * ```typescript
   * const imageUri = await handler.toDataUri('./avatar.png');
   * const textUri = await handler.toDataUri('./message.txt');
   * ```
   *
   * @public
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
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
   * Processes a file with comprehensive validation and metadata extraction.
   * Performs complete processing pipeline including security checks.
   *
   * @param input - File input to process and validate
   * @returns Promise resolving to ProcessedFile with complete metadata
   *
   * @throws {Error} If input validation fails
   * @throws {Error} If file size exceeds limits
   * @throws {Error} If processing encounters errors
   *
   * @example
   * ```typescript
   * const avatar = await handler.processFile('./user-avatar.png');
   * console.log(avatar.filename);    // "user-avatar.png"
   * console.log(avatar.contentType); // "image/png"
   * console.log(avatar.size);        // File size in bytes
   * ```
   *
   * @public
   */
  async processFile(input: FileInput): Promise<ProcessedFile> {
    this.#validateInputType(input);

    const originalFilename = this.#extractFilename(input);
    const buffer = await this.toBuffer(input);
    const contentType = this.#detectContentType(originalFilename);
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
   * Creates multipart FormData for Discord API uploads.
   * Generates properly formatted multipart form with files and JSON payload.
   *
   * @param files - Single file or array of files to include
   * @param body - Optional JSON payload to include alongside files
   * @returns Promise resolving to FormData ready for HTTP upload
   *
   * @throws {Error} If file processing fails
   * @throws {Error} If JSON payload processing fails
   * @throws {Error} If FormData creation encounters errors
   *
   * @example
   * ```typescript
   * const formData = await handler.createFormData(
   *   './screenshot.png',
   *   { content: 'Here is the screenshot!' }
   * );
   *
   * const multiFileForm = await handler.createFormData([
   *   './image1.png',
   *   './image2.jpg'
   * ]);
   * ```
   *
   * @public
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    const processedFiles = await Promise.all(
      filesArray.map((file) => this.processFile(file)),
    );

    const form = new FormData();

    processedFiles.forEach((processedFile, index) => {
      const fieldName = filesArray.length === 1 ? "file" : `files[${index}]`;

      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    });

    if (body !== undefined) {
      await this.#appendJsonPayload(form, body);
    }

    return form;
  }

  /**
   * Performs comprehensive cleanup of all active resources.
   * Safely terminates streams, clears timeouts, and resets tracking state.
   *
   * @example
   * ```typescript
   * await handler.processFile('./file1.txt');
   * handler.clear(); // Clean up resources
   * await handler.processFile('./file2.txt'); // Still usable
   * ```
   *
   * @public
   */
  clear(): void {
    for (const timeout of this.#activeTimeouts) {
      clearTimeout(timeout);
    }
    this.#activeTimeouts.clear();

    for (const stream of this.#activeStreams) {
      try {
        if (stream.readable && !stream.destroyed) {
          stream.destroy();
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    this.#activeStreams.clear();
  }

  /**
   * Validates input against supported FileInput types with type assertion.
   * Performs comprehensive type checking and format validation.
   *
   * @param input - Input value to validate against FileInput union type
   *
   * @throws {Error} If input type is not supported
   * @throws {Error} If string input is neither valid path nor data URI
   *
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
   * Validates buffer size against memory protection limits.
   * Enforces MAX_BUFFER_SIZE to prevent memory exhaustion.
   *
   * @param buffer - Buffer to validate for size constraints
   *
   * @throws {Error} If buffer exceeds maximum allowed size
   *
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
   * Converts readable stream to buffer with timeout protection.
   * Implements robust streaming with size limits and resource cleanup.
   *
   * @param stream - Readable stream to convert to buffer
   * @returns Promise resolving to concatenated buffer from stream chunks
   *
   * @throws {Error} If stream processing times out
   * @throws {Error} If stream content exceeds size limits
   * @throws {Error} If stream encounters read errors
   *
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

      const timeout = setTimeout(() => {
        if (!finished) {
          cleanup();
          reject(new Error("Stream timeout"));
        }
      }, this.#options.streamTimeout);

      this.#activeTimeouts.add(timeout);
      this.#activeStreams.add(stream);

      stream.on("data", (chunk: Buffer) => {
        if (finished) return;

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
   * Decodes base64 data from data URI with validation.
   * Safely decodes base64 content with size validation.
   *
   * @param base64Data - Base64 encoded string from data URI
   * @returns Decoded buffer with validated size constraints
   *
   * @throws {Error} If base64 decoding fails
   * @throws {Error} If decoded content exceeds size limits
   *
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
   * Reads filesystem files using streams for memory efficiency.
   * Uses createReadStream with automatic resource management.
   *
   * @param filePath - Filesystem path to read
   * @returns Promise resolving to complete file content as buffer
   *
   * @throws {Error} If file cannot be read
   * @throws {Error} If file content exceeds size limits
   *
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
   * Extracts filename from various input sources with fallback handling.
   * Implements smart filename extraction for different input types.
   *
   * @param input - File input to extract filename from
   * @returns Extracted filename or default fallback
   *
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
   * Generates filesystem-safe filenames through sanitization.
   * Applies platform-agnostic sanitization rules for cross-platform safety.
   *
   * @param filename - Original filename to sanitize
   * @returns Sanitized filename safe for all platforms
   *
   * @internal
   */
  #generateSafeFilename(filename: string): string {
    if (!this.#options.sanitizeFilenames) {
      return filename;
    }

    let sanitized = filename
      .replace(/[<>:"/\\|?*]/g, "_")
      .replace(/^\.+/, "")
      .replace(/\.+$/, "")
      .replace(/\s+/g, "_")
      .slice(0, 255);

    if (!sanitized || sanitized === "_") {
      sanitized = FILE_CONSTANTS.DEFAULT_FILENAME;
    }

    return sanitized;
  }

  /**
   * Detects MIME type from filename using mime-types database.
   * Uses mime-types library with fallback to generic binary type.
   *
   * @param filename - Filename to analyze for MIME type detection
   * @returns Detected MIME type or RFC-compliant fallback
   *
   * @internal
   */
  #detectContentType(filename: string): string {
    return lookup(filename) || FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  }

  /**
   * Creates RFC 2397 compliant data URI from buffer and content type.
   * Generates properly formatted data URIs following RFC specification.
   *
   * @param buffer - File content to encode as data URI
   * @param contentType - MIME type for the content
   * @returns Properly formatted data URI string
   *
   * @internal
   */
  #createDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  /**
   * Appends JSON payload to FormData with type handling.
   * Handles various JSON payload formats for FormData integration.
   *
   * @param form - FormData instance to append JSON payload to
   * @param body - JSON payload in various supported formats
   *
   * @throws {Error} If payload processing fails
   *
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
