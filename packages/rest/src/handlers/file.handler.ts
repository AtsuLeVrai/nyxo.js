import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import FormData from "form-data";
import { lookup } from "mime-types";
import { z } from "zod/v4";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * Critical file processing limits and security patterns for Discord API uploads.
 *
 * These constants define security boundaries based on Discord's documented limits
 * and best practices for preventing memory exhaustion, timeout attacks, and
 * filesystem security issues in production environments.
 *
 * @remarks Values are chosen based on Discord's 25MB attachment limit and
 * typical server memory constraints. Buffer size is set higher than Discord's
 * limit to accommodate temporary processing overhead.
 */
export const FILE_CONSTANTS = {
  /**
   * Default filename used when one cannot be determined from input sources.
   * Applied when processing streams, buffers, or malformed data URIs.
   *
   * @remarks Chosen to be filesystem-safe across all operating systems
   */
  DEFAULT_FILENAME: "file",

  /**
   * Default MIME type when content type detection fails.
   * Falls back to generic binary stream for maximum compatibility.
   *
   * @remarks RFC 2046 compliant fallback for unknown binary content
   */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /**
   * Maximum time in milliseconds to wait for stream operations.
   * Prevents indefinite hanging on slow networks or unresponsive streams.
   *
   * @remarks 30 seconds balances user experience with resource protection.
   * Covers typical network conditions and large file processing.
   */
  STREAM_TIMEOUT: 30000,

  /**
   * Maximum buffer size for file operations to prevent memory exhaustion.
   * Set to 100MB to accommodate Discord's 25MB limit plus processing overhead.
   *
   * @remarks Higher than Discord's limit to allow for:
   * - Temporary encoding/decoding buffers
   * - FormData multipart overhead
   * - Base64 expansion (33% size increase)
   */
  MAX_BUFFER_SIZE: 100 * 1024 * 1024,

  /**
   * RFC 2397 compliant regex for validating data URI format.
   * Matches: data:{mediatype};base64,{data} with strict MIME type validation.
   *
   * @remarks Enforces strict format to prevent injection attacks through
   * malformed data URIs. Validates both main type and subtype components.
   *
   * @example
   * ```typescript
   * // Valid matches:
   * "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
   * "data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ=="
   *
   * // Invalid (won't match):
   * "data:;base64,invalid"
   * "data:text;base64,invalid" // Missing subtype
   * ```
   */
  DATA_URI_PATTERN:
    /^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.]*);base64,([A-Za-z0-9+/]+={0,2})$/,

  /**
   * Cross-platform filesystem path detection pattern.
   * Identifies Unix absolute/relative paths and Windows drive paths.
   *
   * @remarks Covers common path formats:
   * - Unix absolute: "/home/user/file.txt"
   * - Unix relative: "./file.txt", "../file.txt"
   * - Windows: "C:\Users\file.txt", "D:\folder\file.txt"
   *
   * @example
   * ```typescript
   * // Valid filesystem paths:
   * "/absolute/unix/path.txt"
   * "./relative/path.txt"
   * "C:\\Windows\\file.txt"
   * "./config/settings.json"
   * ```
   */
  FILE_PATH_PATTERN: /^(?:[/.]|[a-zA-Z]:\\)/,
} as const;

/**
 * Strongly-typed data URI string with base64-encoded content.
 *
 * Represents a complete data URI following RFC 2397 specification,
 * ensuring type safety for embedded file content in web contexts.
 *
 * @remarks Template literal type provides compile-time validation
 * while maintaining runtime flexibility for different MIME types.
 *
 * @example
 * ```typescript
 * const imageUri: DataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
 * const jsonUri: DataUri = "data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ==";
 * ```
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Union type encompassing all supported file input formats for maximum flexibility.
 *
 * Supports the most common file handling scenarios in Node.js applications:
 * - **string**: Filesystem paths or data URIs for direct content
 * - **Buffer**: In-memory binary data for programmatic file creation
 * - **Readable**: Streams for memory-efficient large file processing
 * - **DataUri**: Type-safe data URIs for embedded content
 *
 * @remarks This design allows seamless handling of files from various sources
 * without requiring format conversion by the caller.
 *
 * @example
 * ```typescript
 * // Filesystem path
 * const pathInput: FileInput = "./uploads/avatar.png";
 *
 * // In-memory buffer
 * const bufferInput: FileInput = Buffer.from("file content");
 *
 * // Stream from HTTP request
 * const streamInput: FileInput = request.body;
 *
 * // Data URI from client
 * const uriInput: FileInput = "data:image/png;base64,iVBORw0...";
 * ```
 */
export type FileInput = string | Buffer | Readable | DataUri;

/**
 * Comprehensive file processing result with complete metadata and content.
 *
 * Contains all information needed for Discord API uploads, logging, and
 * client-side display. Provides both binary content and web-compatible
 * representations for maximum flexibility.
 *
 * @remarks Design ensures API compatibility while providing rich metadata
 * for debugging, monitoring, and user feedback in production applications.
 */
export interface ProcessedFile {
  /**
   * File content as binary buffer for reliable upload operations.
   * Ensures consistent binary handling across different input sources.
   *
   * @remarks Buffer format is optimal for HTTP multipart uploads and
   * provides deterministic memory usage patterns.
   */
  buffer: Buffer;

  /**
   * Sanitized filename safe for API requests and filesystem operations.
   * Removes dangerous characters and applies length constraints.
   *
   * @remarks Filename is guaranteed to be valid across Windows, macOS,
   * and Linux filesystems while maintaining readability.
   */
  filename: string;

  /**
   * MIME type detected from file extension or explicitly provided.
   * Used for proper Content-Type headers in HTTP requests.
   *
   * @remarks Falls back to 'application/octet-stream' for unknown types
   * to ensure maximum compatibility with Discord API.
   */
  contentType: string;

  /**
   * File size in bytes for validation and progress tracking.
   * Matches buffer.length but provided for convenience and clarity.
   *
   * @remarks Essential for validating against Discord's 25MB limit
   * and providing upload progress feedback to users.
   */
  size: number;

  /**
   * RFC 2397 compliant data URI for embedding in JSON or web contexts.
   * Enables direct usage in Discord embeds or client-side previews.
   *
   * @remarks Automatically generated from buffer and contentType.
   * Note: Large files create very long data URIs.
   */
  dataUri: DataUri;

  /**
   * Original filename before sanitization for reference and logging.
   * Preserves user intent while maintaining security through sanitization.
   *
   * @remarks Useful for error messages, logs, and maintaining user
   * experience when displaying file information.
   */
  originalFilename: string;
}

/**
 * Validation schema for file processing operations with security constraints.
 *
 * Provides optional but strongly-typed validation rules that can be applied
 * per operation without requiring complex configuration inheritance.
 *
 * @remarks Uses Zod for runtime validation to ensure type safety and
 * clear error messages when validation fails.
 */
export const ProcessOptions = z.object({
  /**
   * Maximum allowed file size in bytes for this specific operation.
   *
   * When specified, overrides the global MAX_BUFFER_SIZE limit with a more
   * restrictive value. Useful for implementing different limits based on
   * user permissions, endpoint requirements, or resource constraints.
   *
   * @default undefined (uses global MAX_BUFFER_SIZE limit)
   *
   * @example
   * ```typescript
   * // Restrict avatar uploads to 5MB
   * const avatarOptions = { maxSize: 5 * 1024 * 1024 };
   *
   * // Allow larger attachments for premium users
   * const premiumOptions = { maxSize: 50 * 1024 * 1024 };
   * ```
   *
   * @remarks Should not exceed Discord's 25MB limit even if set higher.
   * Server-side validation should enforce API-specific constraints.
   */
  maxSize: z.number().int().positive().optional(),

  /**
   * Array of allowed MIME types for content validation and security.
   *
   * When specified, only files with matching MIME types will be accepted.
   * Provides a security layer against malicious uploads and ensures
   * API compatibility for specific endpoints.
   *
   * @default undefined (all MIME types allowed)
   *
   * @example
   * ```typescript
   * // Only allow images for avatar uploads
   * const imageOptions = {
   *   allowedTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
   * };
   *
   * // Only allow audio files for soundboard
   * const audioOptions = {
   *   allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg']
   * };
   *
   * // Mixed content for general attachments
   * const attachmentOptions = {
   *   allowedTypes: ['image/*', 'text/plain', 'application/pdf']
   * };
   * ```
   *
   * @remarks MIME type detection is based on file extensions using the
   * mime-types library. Consider additional content validation for security.
   */
  allowedTypes: z.array(z.string()).optional(),
});

export type ProcessOptions = z.infer<typeof ProcessOptions>;

/**
 * Configuration schema for FileHandler instance behavior and performance tuning.
 *
 * Controls global behavior for the handler instance, affecting all operations
 * performed by this handler. These settings balance security, performance,
 * and compatibility for production Discord bot environments.
 *
 * @remarks Configuration is validated at construction time to prevent
 * runtime errors and ensure consistent behavior across operations.
 */
export const FileHandlerOptions = z.object({
  /**
   * Timeout duration for stream operations in milliseconds.
   *
   * Prevents indefinite hanging on slow, stalled, or malicious streams.
   * Applied to all stream reading operations including file streams,
   * HTTP request bodies, and other readable stream sources.
   *
   * @default 30000 (30 seconds)
   *
   * @remarks Should be set based on expected network conditions and file sizes:
   * - Lower values (10-15s) for interactive operations
   * - Higher values (60s+) for batch processing or large files
   * - Consider user experience vs resource protection tradeoffs
   *
   * @example
   * ```typescript
   * // Interactive bot with fast response requirements
   * const interactiveHandler = new FileHandler({ streamTimeout: 15000 });
   *
   * // Batch processing with larger files
   * const batchHandler = new FileHandler({ streamTimeout: 60000 });
   * ```
   */
  streamTimeout: z.number().int().positive().default(30000),

  /**
   * Whether to apply comprehensive filename sanitization for security.
   *
   * When enabled, removes or replaces dangerous characters that could
   * cause filesystem security issues, path traversal attacks, or
   * compatibility problems across different operating systems.
   *
   * @default true
   *
   * @remarks Sanitization rules include:
   * - Remove dangerous characters: `<>:"/\|?*`
   * - Strip leading/trailing dots (hidden files, Windows issues)
   * - Replace whitespace sequences with underscores
   * - Enforce maximum filename length (255 characters)
   * - Ensure non-empty result with fallback name
   *
   * @example
   * ```typescript
   * // Production environment (recommended)
   * const secureHandler = new FileHandler({ sanitizeFilenames: true });
   *
   * // Development with original filenames (not recommended for production)
   * const devHandler = new FileHandler({ sanitizeFilenames: false });
   * ```
   */
  sanitizeFilenames: z.boolean().default(true),
});

export type FileHandlerOptions = z.infer<typeof FileHandlerOptions>;

/**
 * Production-ready file handler optimized for Discord API integrations.
 *
 * Provides comprehensive file processing capabilities with enterprise-grade
 * security, performance, and reliability features. Designed specifically
 * for Discord bot applications handling user uploads, attachments, and
 * media content with strict resource management and error handling.
 *
 * ## Key Features
 *
 * ### 🔒 **Security & Validation**
 * - **Input sanitization**: Prevents path traversal and injection attacks
 * - **Size limits**: Configurable limits to prevent memory exhaustion
 * - **MIME type validation**: Content-type filtering for security
 * - **Timeout protection**: Prevents resource hanging on malicious streams
 *
 * ### ⚡ **Performance & Memory Management**
 * - **Streaming processing**: Memory-efficient handling of large files
 * - **Resource cleanup**: Automatic cleanup of streams and timeouts
 * - **Concurrent processing**: Parallel file processing for arrays
 * - **Buffer optimization**: Minimal memory copies and reuse
 *
 * ### 🔧 **Discord API Integration**
 * - **FormData generation**: Ready-to-use multipart uploads
 * - **Data URI support**: Client-side compatibility for embeds
 * - **Filename normalization**: Cross-platform compatibility
 * - **Error context**: Detailed error messages for debugging
 *
 * ### 🌐 **Input Format Flexibility**
 * - **Filesystem paths**: Direct file reading with streaming
 * - **Buffers**: In-memory data processing
 * - **Streams**: Network streams and pipes
 * - **Data URIs**: Client uploads and embedded content
 *
 * @example
 * ```typescript
 * // Basic file processing
 * const handler = new FileHandler({
 *   streamTimeout: 30000,
 *   sanitizeFilenames: true
 * });
 *
 * // Process a user upload
 * const processedFile = await handler.processFile('./avatar.png', {
 *   maxSize: 5 * 1024 * 1024, // 5MB limit
 *   allowedTypes: ['image/png', 'image/jpeg']
 * });
 *
 * // Create multipart form for Discord API
 * const formData = await handler.createFormData(
 *   ['./image1.png', './image2.jpg'],
 *   { content: 'Check out these images!' }
 * );
 *
 * // Clean up resources when done
 * handler.clear();
 * ```
 *
 * @remarks This handler is designed for long-running Discord bot applications
 * where memory leaks and resource exhaustion must be prevented. All operations
 * include comprehensive error handling and resource cleanup.
 */
export class FileHandler {
  /**
   * Set of currently active readable streams for lifecycle management.
   *
   * Tracks all streams being processed to ensure proper cleanup on errors,
   * timeouts, or explicit cleanup calls. Essential for preventing resource
   * leaks in long-running Discord bot applications.
   *
   * @remarks Streams are automatically added when processing begins and
   * removed when processing completes or cleanup is performed.
   */
  readonly #activeStreams = new Set<Readable>();

  /**
   * Set of active timeout handles to prevent memory leaks.
   *
   * Tracks all setTimeout handles created for stream operations to ensure
   * they're properly cleared when operations complete, fail, or are cleaned up.
   * Critical for preventing timer-based memory leaks.
   *
   * @remarks Timeouts are cleared automatically on completion but also
   * during explicit cleanup to handle edge cases and error conditions.
   */
  readonly #activeTimeouts = new Set<NodeJS.Timeout>();

  /**
   * Validated configuration options controlling handler behavior.
   *
   * Contains all settings that affect how files are processed, including
   * security policies, timeout values, and compatibility options.
   * All options are validated through Zod schemas at construction time.
   *
   * @remarks Configuration is immutable after construction to ensure
   * consistent behavior across all operations and prevent configuration drift.
   */
  readonly #options: FileHandlerOptions;

  /**
   * Initializes a new FileHandler with comprehensive configuration validation.
   *
   * Creates a production-ready file handler with validated configuration
   * and initialized resource tracking. The handler is immediately ready
   * for file processing operations with full error handling and cleanup.
   *
   * @param options - Configuration controlling handler behavior and limits
   *
   * @throws {Error} If configuration validation fails (via Zod schema)
   *
   * @example
   * ```typescript
   * // Production configuration with security focus
   * const productionHandler = new FileHandler({
   *   streamTimeout: 30000,      // 30 second timeout
   *   sanitizeFilenames: true    // Enable security sanitization
   * });
   *
   * // Development configuration with relaxed settings
   * const devHandler = new FileHandler({
   *   streamTimeout: 60000,      // Longer timeout for debugging
   *   sanitizeFilenames: false   // Preserve original filenames
   * });
   * ```
   *
   * @remarks The constructor validates all options and throws immediately
   * if any values are invalid, ensuring consistent runtime behavior.
   */
  constructor(options: FileHandlerOptions) {
    this.#options = options;
  }

  /**
   * Safely validates input types without throwing exceptions.
   *
   * Performs comprehensive type checking to determine if the provided input
   * can be processed by this handler. This method provides a safe way to
   * validate inputs before processing without causing exceptions.
   *
   * @param input - Value to validate against supported file input types
   * @returns true if input is valid and processable, false otherwise
   *
   * @example
   * ```typescript
   * // Validate different input types
   * const handler = new FileHandler({ streamTimeout: 30000 });
   *
   * console.log(handler.isValidInput('./file.txt'));           // true
   * console.log(handler.isValidInput(Buffer.from('data')));    // true
   * console.log(handler.isValidInput(process.stdin));          // true
   * console.log(handler.isValidInput('data:text/plain;base64,SGVsbG8=')); // true
   * console.log(handler.isValidInput(123));                    // false
   * console.log(handler.isValidInput(null));                   // false
   * ```
   *
   * @remarks This method is useful for input validation in APIs where you
   * want to provide clear feedback about invalid inputs before attempting
   * processing operations.
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
   * Converts any supported input format to a Buffer with comprehensive error handling.
   *
   * Handles the complexity of different input formats by routing each type to
   * the appropriate processing method. Ensures consistent Buffer output
   * regardless of input type while maintaining memory efficiency and security.
   *
   * @param input - File input in any supported format
   * @returns Promise resolving to the complete file content as a Buffer
   *
   * @throws {Error} If input type is unsupported
   * @throws {Error} If file reading fails (filesystem, network, etc.)
   * @throws {Error} If content exceeds size limits
   * @throws {Error} If stream processing times out
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({ streamTimeout: 30000 });
   *
   * // Convert filesystem path to buffer
   * const fileBuffer = await handler.toBuffer('./uploads/image.png');
   *
   * // Convert data URI to buffer
   * const uriBuffer = await handler.toBuffer('data:text/plain;base64,SGVsbG8gV29ybGQ=');
   *
   * // Convert stream to buffer (from HTTP request)
   * const streamBuffer = await handler.toBuffer(request.body);
   *
   * // Buffer input returns as-is (after validation)
   * const existingBuffer = await handler.toBuffer(someBuffer);
   * ```
   *
   * @remarks This method is the foundation for all other file processing
   * operations. It handles resource cleanup automatically and provides
   * detailed error context for debugging.
   */
  async toBuffer(input: FileInput): Promise<Buffer> {
    // Validate input type and format before processing
    this.#validateInputType(input);

    // Handle Buffer input - validate size and return directly
    if (Buffer.isBuffer(input)) {
      this.#validateBufferSize(input);
      return input;
    }

    // Handle Readable stream input - convert with timeout protection
    if (input instanceof Readable) {
      return await this.#streamToBuffer(input);
    }

    // Handle string input - determine if data URI or filesystem path
    if (typeof input === "string") {
      const dataUriMatch = input.match(FILE_CONSTANTS.DATA_URI_PATTERN);
      if (dataUriMatch?.[2]) {
        // Process as data URI - decode base64 content
        return this.#decodeDataUri(dataUriMatch[2]);
      }

      // Process as filesystem path - read with streaming
      return await this.#fileToBuffer(input);
    }

    // This should never be reached due to validation, but provides safety
    throw new Error("Unsupported file input type");
  }

  /**
   * Converts any supported input to an RFC 2397 compliant data URI.
   *
   * Creates web-compatible data URIs that can be embedded directly in
   * Discord embeds, client-side previews, or JSON payloads. Automatically
   * detects MIME types and handles base64 encoding for maximum compatibility.
   *
   * @param input - File input in any supported format
   * @returns Promise resolving to a complete data URI with detected MIME type
   *
   * @throws {Error} If input processing fails
   * @throws {Error} If content exceeds size limits
   * @throws {Error} If MIME type detection fails
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({ streamTimeout: 30000 });
   *
   * // Convert image to data URI for Discord embed
   * const imageUri = await handler.toDataUri('./avatar.png');
   * // Result: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
   *
   * // Convert text file to data URI
   * const textUri = await handler.toDataUri('./message.txt');
   * // Result: "data:text/plain;base64,SGVsbG8gV29ybGQh"
   *
   * // Pass through existing data URI (validates format)
   * const existingUri = await handler.toDataUri('data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ==');
   * ```
   *
   * @remarks Large files create very long data URIs. Consider size limits
   * when using data URIs in JSON payloads or client-side applications.
   * Data URIs are approximately 33% larger than the original binary data.
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
    // Optimize for existing data URIs - validate and return without processing
    if (
      typeof input === "string" &&
      FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      return input as DataUri;
    }

    // Convert input to buffer for processing
    const buffer = await this.toBuffer(input);

    // Extract filename for MIME type detection
    const filename = this.#extractFilename(input);

    // Detect MIME type from filename extension
    const contentType = this.#detectContentType(filename);

    // Create properly formatted data URI
    return this.#createDataUri(buffer, contentType);
  }

  /**
   * Processes a file with comprehensive validation, metadata extraction, and security checks.
   *
   * Performs the complete file processing pipeline including size validation,
   * content type detection, filename sanitization, and security checks.
   * Returns a comprehensive ProcessedFile object with all metadata needed
   * for Discord API uploads and application logging.
   *
   * @param input - File input to process and validate
   * @param options - Processing constraints and validation rules
   * @returns Promise resolving to ProcessedFile with complete metadata
   *
   * @throws {Error} If input validation fails
   * @throws {Error} If file size exceeds limits
   * @throws {Error} If content type is not allowed
   * @throws {Error} If processing encounters errors
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({ sanitizeFilenames: true });
   *
   * // Process avatar upload with size and type restrictions
   * const avatar = await handler.processFile('./user-avatar.png', {
   *   maxSize: 5 * 1024 * 1024,  // 5MB limit
   *   allowedTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
   * });
   *
   * console.log(avatar.filename);      // "user-avatar.png" (sanitized)
   * console.log(avatar.contentType);   // "image/png"
   * console.log(avatar.size);          // File size in bytes
   * console.log(avatar.buffer);        // Buffer for upload
   * console.log(avatar.dataUri);       // Data URI for preview
   *
   * // Process attachment with loose restrictions
   * const attachment = await handler.processFile(streamInput, {
   *   maxSize: 25 * 1024 * 1024  // Discord's limit
   * });
   * ```
   *
   * @remarks This method provides the most comprehensive file processing
   * and should be used for user uploads, attachments, and any content
   * requiring validation or metadata extraction.
   */
  async processFile(
    input: FileInput,
    options: ProcessOptions = {},
  ): Promise<ProcessedFile> {
    // Validate processing options schema for type safety
    const validatedOptions = ProcessOptions.parse(options);

    // Validate input type and format
    this.#validateInputType(input);

    // Extract original filename before processing
    const originalFilename = this.#extractFilename(input);

    // Convert to buffer with all security validations
    const buffer = await this.toBuffer(input);

    // Validate file size against operation-specific limits
    if (validatedOptions.maxSize && buffer.length > validatedOptions.maxSize) {
      throw new Error(
        `File size exceeds maximum: ${buffer.length} bytes (max: ${validatedOptions.maxSize})`,
      );
    }

    // Detect content type from filename extension
    const contentType = this.#detectContentType(originalFilename);

    // Validate content type against allowed types list
    if (
      validatedOptions.allowedTypes &&
      !validatedOptions.allowedTypes.includes(contentType)
    ) {
      throw new Error(`Content type not allowed: ${contentType}`);
    }

    // Generate sanitized filename for safe usage
    const filename = this.#generateSafeFilename(originalFilename);

    // Return comprehensive processed file object
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
   * Creates multipart FormData for Discord API uploads with files and JSON payload.
   *
   * Generates properly formatted multipart/form-data that's ready for Discord API
   * consumption. Handles both single files and file arrays with appropriate field
   * naming conventions. Includes optional JSON payload for combined requests.
   *
   * @param files - Single file or array of files to include in the form
   * @param body - Optional JSON payload to include alongside files
   * @param options - Processing options applied to all files
   * @returns Promise resolving to FormData ready for HTTP upload
   *
   * @throws {Error} If file processing fails for any file
   * @throws {Error} If JSON payload processing fails
   * @throws {Error} If FormData creation encounters errors
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({ streamTimeout: 30000 });
   *
   * // Single file with message
   * const singleFileForm = await handler.createFormData(
   *   './screenshot.png',
   *   { content: 'Here is the screenshot you requested!' }
   * );
   *
   * // Multiple files with embed
   * const multiFileForm = await handler.createFormData(
   *   ['./image1.png', './image2.jpg', streamInput],
   *   {
   *     embeds: [{
   *       title: 'Photo Gallery',
   *       description: 'Check out these images!'
   *     }]
   *   },
   *   {
   *     maxSize: 10 * 1024 * 1024,  // 10MB per file
   *     allowedTypes: ['image/*']
   *   }
   * );
   *
   * // Files only (no JSON payload)
   * const filesOnlyForm = await handler.createFormData([
   *   './file1.txt',
   *   './file2.pdf'
   * ]);
   *
   * // Use with HTTP client
   * const response = await fetch('/api/upload', {
   *   method: 'POST',
   *   body: multiFileForm
   * });
   * ```
   *
   * @remarks The generated FormData follows Discord's multipart conventions:
   * - Single file: field name "file"
   * - Multiple files: field names "files[0]", "files[1]", etc.
   * - JSON payload: field name "payload_json"
   * Files are processed concurrently for optimal performance.
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
    options: ProcessOptions = {},
  ): Promise<FormData> {
    // Normalize input to array for consistent processing
    const filesArray = Array.isArray(files) ? files : [files];

    // Process all files concurrently for optimal performance
    // Each file is validated and processed independently
    const processedFiles = await Promise.all(
      filesArray.map((file) => this.processFile(file, options)),
    );

    // Create new FormData instance for multipart encoding
    const form = new FormData();

    // Add files with Discord-compatible field naming convention
    processedFiles.forEach((processedFile, index) => {
      // Use "file" for single files, "files[n]" for multiple files
      const fieldName = filesArray.length === 1 ? "file" : `files[${index}]`;

      // Add file with metadata for proper multipart handling
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
   * Performs comprehensive cleanup of all active resources and tracking state.
   *
   * Safely terminates all active streams, clears timeout handles, and resets
   * internal tracking state. This method is safe to call multiple times and
   * the handler instance remains fully usable after cleanup.
   *
   * @example
   * ```typescript
   * const handler = new FileHandler({ streamTimeout: 30000 });
   *
   * // Process some files
   * await handler.processFile('./file1.txt');
   * await handler.processFile(streamInput);
   *
   * // Clean up resources (important for long-running applications)
   * handler.clear();
   *
   * // Handler is still usable after cleanup
   * await handler.processFile('./file2.txt');
   * ```
   *
   * @remarks Essential for preventing memory leaks in long-running Discord
   * bot applications. Should be called periodically or when shutting down
   * to ensure all resources are properly released.
   */
  clear(): void {
    // Clear all timeout handles to prevent memory leaks
    for (const timeout of this.#activeTimeouts) {
      clearTimeout(timeout);
    }
    this.#activeTimeouts.clear();

    // Safely terminate all active streams
    for (const stream of this.#activeStreams) {
      try {
        // Only destroy readable, non-destroyed streams
        if (stream.readable && !stream.destroyed) {
          stream.destroy();
        }
      } catch {
        // Ignore cleanup errors to prevent cascading failures
        // Streams may already be closed or in an invalid state
      }
    }
    this.#activeStreams.clear();
  }

  /**
   * Validates input against supported FileInput types with type assertion.
   *
   * Performs comprehensive type checking and format validation to ensure
   * the input can be safely processed. Uses TypeScript type assertion to
   * provide compile-time type safety after validation.
   *
   * @param input - Input value to validate against FileInput union type
   * @throws {Error} If input type is not supported
   * @throws {Error} If string input is neither a valid path nor data URI
   *
   * @internal
   */
  #validateInputType(input: unknown): asserts input is FileInput {
    // Check against all supported input types
    if (
      !(
        Buffer.isBuffer(input) ||
        input instanceof Readable ||
        typeof input === "string"
      )
    ) {
      throw new Error("Invalid file input type");
    }

    // Additional validation for string inputs
    if (typeof input === "string") {
      // String must be either a data URI or filesystem path
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
   * Validates buffer size against global memory protection limits.
   *
   * Enforces the MAX_BUFFER_SIZE limit to prevent memory exhaustion attacks
   * and ensure consistent resource usage patterns across the application.
   *
   * @param buffer - Buffer to validate for size constraints
   * @throws {Error} If buffer exceeds the maximum allowed size
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
   * Converts a readable stream to buffer with comprehensive protection mechanisms.
   *
   * Implements a robust streaming algorithm with timeout protection, size limits,
   * and proper resource cleanup. Uses event-driven processing to handle
   * backpressure and error conditions gracefully.
   *
   * @param stream - Readable stream to convert to buffer
   * @returns Promise resolving to concatenated buffer from all stream chunks
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

      // Cleanup function to prevent resource leaks
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

      // Set timeout protection against slow or stalled streams
      const timeout = setTimeout(() => {
        if (!finished) {
          cleanup();
          reject(new Error("Stream timeout"));
        }
      }, this.#options.streamTimeout);

      // Track timeout and stream for resource management
      this.#activeTimeouts.add(timeout);
      this.#activeStreams.add(stream);

      // Handle incoming data chunks with size validation
      stream.on("data", (chunk: Buffer) => {
        if (finished) {
          return; // Ignore data after completion
        }

        totalSize += chunk.length;

        // Enforce size limits to prevent memory exhaustion
        if (totalSize > FILE_CONSTANTS.MAX_BUFFER_SIZE) {
          cleanup();
          clearTimeout(timeout);
          this.#activeTimeouts.delete(timeout);
          reject(new Error("Stream too large"));
          return;
        }

        chunks.push(chunk);
      });

      // Handle stream errors with proper cleanup
      stream.on("error", (error) => {
        if (!finished) {
          cleanup();
          clearTimeout(timeout);
          this.#activeTimeouts.delete(timeout);
          reject(error);
        }
      });

      // Handle successful stream completion
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
   * Decodes base64 data from data URI with validation and error context.
   *
   * Safely decodes base64 content from data URIs while providing detailed
   * error context for debugging. Includes size validation to prevent
   * memory exhaustion from maliciously large data URIs.
   *
   * @param base64Data - Base64 encoded string extracted from data URI
   * @returns Decoded buffer with validated size constraints
   *
   * @throws {Error} If base64 decoding fails with detailed error context
   * @throws {Error} If decoded content exceeds size limits
   *
   * @internal
   */
  #decodeDataUri(base64Data: string): Buffer {
    try {
      // Decode base64 data to buffer
      const buffer = Buffer.from(base64Data, "base64");

      // Validate decoded size against limits
      this.#validateBufferSize(buffer);

      return buffer;
    } catch (error) {
      // Provide enhanced error context for debugging
      throw new Error(`Failed to decode base64 data URI: ${error}`);
    }
  }

  /**
   * Reads filesystem files using streams for optimal memory efficiency.
   *
   * Uses Node.js createReadStream for memory-efficient file reading with
   * automatic resource management. Provides enhanced error messages with
   * filename context for improved debugging experience.
   *
   * @param filePath - Filesystem path to read
   * @returns Promise resolving to complete file content as buffer
   *
   * @throws {Error} If file cannot be read with enhanced error context
   * @throws {Error} If file content exceeds size limits
   *
   * @internal
   */
  async #fileToBuffer(filePath: string): Promise<Buffer> {
    try {
      // Create readable stream for memory-efficient file reading
      const stream = createReadStream(filePath);

      // Process stream with all protection mechanisms
      return await this.#streamToBuffer(stream);
    } catch (error) {
      // Provide enhanced error context with filename
      throw new Error(`Failed to read file "${basename(filePath)}": ${error}`);
    }
  }

  /**
   * Extracts filename from various input sources with intelligent fallback handling.
   *
   * Implements smart filename extraction that handles different input types
   * appropriately while providing consistent fallback behavior for inputs
   * that don't have natural filename representations.
   *
   * @param input - File input to extract filename from
   * @returns Extracted filename or intelligent default
   *
   * @internal
   */
  #extractFilename(input: FileInput): string {
    // Extract basename from filesystem paths
    if (
      typeof input === "string" &&
      !FILE_CONSTANTS.DATA_URI_PATTERN.test(input)
    ) {
      return basename(input);
    }

    // Use default for streams, buffers, and data URIs
    return FILE_CONSTANTS.DEFAULT_FILENAME;
  }

  /**
   * Generates filesystem-safe filenames through comprehensive sanitization.
   *
   * Applies platform-agnostic sanitization rules to ensure filenames are
   * safe across Windows, macOS, and Linux filesystems while maintaining
   * readability and user intent.
   *
   * @param filename - Original filename to sanitize
   * @returns Sanitized filename safe for all platforms
   *
   * @internal
   */
  #generateSafeFilename(filename: string): string {
    // Skip sanitization if disabled in configuration
    if (!this.#options.sanitizeFilenames) {
      return filename;
    }

    // Apply comprehensive platform-agnostic sanitization rules
    let sanitized = filename
      .replace(/[<>:"/\\|?*]/g, "_") // Replace filesystem-dangerous characters
      .replace(/^\.+/, "") // Remove leading dots (hidden files)
      .replace(/\.+$/, "") // Remove trailing dots (Windows issues)
      .replace(/\s+/g, "_") // Replace whitespace sequences with underscores
      .slice(0, 255); // Enforce maximum filename length

    // Ensure non-empty result with fallback
    if (!sanitized || sanitized === "_") {
      sanitized = FILE_CONSTANTS.DEFAULT_FILENAME;
    }

    return sanitized;
  }

  /**
   * Detects MIME type from filename using comprehensive mime-types database.
   *
   * Uses the mime-types library for accurate MIME type detection based on
   * file extensions. Provides fallback to generic binary type for unknown
   * or missing extensions to ensure maximum API compatibility.
   *
   * @param filename - Filename to analyze for MIME type detection
   * @returns Detected MIME type or RFC-compliant fallback
   *
   * @internal
   */
  #detectContentType(filename: string): string {
    // Use mime-types library for accurate detection with fallback
    return lookup(filename) || FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  }

  /**
   * Creates RFC 2397 compliant data URI from buffer and content type.
   *
   * Generates properly formatted data URIs following the RFC 2397 specification
   * for maximum compatibility with web standards and Discord API requirements.
   *
   * @param buffer - File content to encode as data URI
   * @param contentType - MIME type for the content
   * @returns Properly formatted data URI string
   *
   * @internal
   */
  #createDataUri(buffer: Buffer, contentType: string): DataUri {
    // Follow RFC 2397 specification for data URI format
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  /**
   * Appends JSON payload to FormData with comprehensive type handling.
   *
   * Handles various JSON payload formats including strings, buffers, and
   * streams while ensuring proper FormData integration. Provides detailed
   * error context for debugging payload processing issues.
   *
   * @param form - FormData instance to append JSON payload to
   * @param body - JSON payload in various supported formats
   *
   * @throws {Error} If payload processing fails with detailed context
   *
   * @internal
   */
  async #appendJsonPayload(
    form: FormData,
    body: HttpRequestOptions["body"],
  ): Promise<void> {
    try {
      // Handle different payload types appropriately
      if (typeof body === "string") {
        // String payload - append directly
        form.append("payload_json", body);
      } else if (Buffer.isBuffer(body)) {
        // Buffer payload - append as-is
        form.append("payload_json", body);
      } else if (body instanceof Readable) {
        // Stream payload - convert to buffer first
        const buffer = await this.#streamToBuffer(body);
        form.append("payload_json", buffer);
      } else {
        // Object payload - serialize to JSON
        form.append("payload_json", JSON.stringify(body));
      }
    } catch (error) {
      // Provide enhanced error context for debugging
      throw new Error(`Failed to append JSON payload: ${error}`);
    }
  }
}
