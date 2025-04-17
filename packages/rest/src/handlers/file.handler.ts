import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { OptionalDeps } from "@nyxjs/core";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import type SharpType from "sharp";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * Constants for file handling operations.
 * Defines limits, patterns, and configuration values used throughout the file handler.
 */
const FILE_CONSTANTS = {
  /** Maximum number of files that can be uploaded in a single request */
  MAX_FILES: 10,

  /** Default filename used when one cannot be determined */
  DEFAULT_FILENAME: "file",

  /** Default MIME type used when content type cannot be detected */
  DEFAULT_CONTENT_TYPE: "application/octet-stream",

  /** Regular expression pattern to identify data URIs */
  DATA_URI_PATTERN: /^data:(.+);base64,(.+)$/,

  /** Regular expression pattern to identify file paths */
  FILE_PATH_PATTERN: /^[/.]|^[a-zA-Z]:\\/,

  /** List of image MIME types that can be processed and optimized */
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],

  /** Maximum size for general attachment files (10MB) */
  ATTACHMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB

  /** Maximum size for asset files like avatars, emoji, etc. (256KB) */
  ASSET_MAX_SIZE: 256 * 1024, // 256KB

  /** Mapping of MIME types to appropriate file extensions */
  FILE_EXTENSIONS: {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
  } as const,
};

/**
 * Data URI string type.
 * Represents a base64-encoded file embedded directly in a string with MIME type information.
 * Format: `data:mimeType;base64,encodedData`
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Represents any valid file input type.
 * Can be a file path, buffer, stream, File/Blob object (in browser environments), or data URI.
 */
export type FileInput = string | Buffer | Readable | File | Blob | DataUri;

/**
 * Options for image processing and optimization.
 * Controls how images are resized, compressed, and converted.
 */
export interface ImageProcessingOptions {
  /**
   * Maximum file size in bytes.
   * Images larger than this will be optimized.
   */
  maxSize: number;

  /**
   * Whether to preserve the original file format.
   * If false, format conversion (e.g., to WebP) may be attempted.
   */
  preserveFormat: boolean;

  /**
   * Quality percentage for image compression (1-100).
   * Higher values preserve more quality but result in larger files.
   */
  quality: number;

  /**
   * Whether to try converting to WebP format.
   * WebP often provides better compression than other formats.
   */
  attemptWebpConversion: boolean;
}

/**
 * Represents a processed file ready for upload.
 * Contains all necessary metadata and content for API submission.
 */
export interface ProcessedFile {
  /**
   * File content as Buffer.
   * The possibly optimized binary content of the file.
   */
  buffer: Buffer;

  /**
   * Filename with correct extension.
   * Updated to match the actual content type if needed.
   */
  filename: string;

  /**
   * Content MIME type.
   * Detected or derived from the file content or name.
   */
  contentType: string;

  /**
   * Size in bytes.
   * The length of the buffer after any processing.
   */
  size: number;

  /**
   * Data URI representation.
   * The file encoded as a data URI string.
   */
  dataUri: DataUri;
}

// Cache for Sharp module to avoid repeated imports
let sharpModule: typeof SharpType | null = null;

/**
 * Checks if input is a File or Blob (browser API).
 * Used to identify browser-specific file objects.
 *
 * @param input - The value to check
 * @returns True if the input is a File or Blob object
 * @private
 */
function isFileOrBlob(input: unknown): input is File | Blob {
  return (
    (typeof File !== "undefined" && input instanceof File) ||
    (typeof Blob !== "undefined" && input instanceof Blob)
  );
}

/**
 * Validates that input is a valid FileInput type.
 * Throws an error if the input is not a supported file type.
 *
 * @param input - The value to validate
 * @throws {Error} Error if the input is not a valid file input
 * @private
 */
function validateInput(input: unknown): asserts input is FileInput {
  if (
    !(
      Buffer.isBuffer(input) ||
      input instanceof Readable ||
      typeof input === "string" ||
      isFileOrBlob(input)
    )
  ) {
    throw new Error("Invalid file input type");
  }

  if (
    typeof input === "string" &&
    !input.match(FILE_CONSTANTS.DATA_URI_PATTERN) &&
    !input.match(FILE_CONSTANTS.FILE_PATH_PATTERN)
  ) {
    throw new Error("Invalid string input: expected file path or data URI");
  }
}

/**
 * Converts a stream to a buffer.
 * Collects all chunks from a readable stream into a single buffer.
 *
 * @param stream - The readable stream to convert
 * @returns Promise resolving to a buffer containing all stream data
 * @private
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Creates a data URI from a buffer and content type.
 * Formats the buffer as a base64-encoded data URI with the specified MIME type.
 *
 * @param buffer - The file content as a buffer
 * @param contentType - The MIME type of the content
 * @returns Data URI string containing the encoded file
 * @private
 */
function createDataUri(buffer: Buffer, contentType: string): DataUri {
  return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
}

/**
 * File handling utility for processing and optimizing files.
 * Provides methods to convert, detect, optimize, and prepare files for API submission.
 */
export const FileHandler = {
  /**
   * Checks if the input is a valid file input for a single file.
   * Validates that the input is a supported file type without throwing errors.
   *
   * @param input - The value to check
   * @returns True if the input is a valid file input
   */
  isValidSingleInput(input: unknown): input is FileInput {
    // Check if input is a basic valid type
    if (
      !(
        Buffer.isBuffer(input) ||
        input instanceof Readable ||
        typeof input === "string" ||
        isFileOrBlob(input)
      )
    ) {
      return false;
    }

    // If it's a string, check if it's a valid data URI or file path
    if (
      typeof input === "string" &&
      !input.match(FILE_CONSTANTS.DATA_URI_PATTERN) &&
      !input.match(FILE_CONSTANTS.FILE_PATH_PATTERN)
    ) {
      return false;
    }

    return true;
  },

  /**
   * Checks if the input is a valid file input or array of file inputs.
   * Validates single inputs or arrays of inputs without throwing errors.
   *
   * @param input - The value or array to check
   * @returns True if the input is a valid file input or array of valid inputs
   */
  isValidInput(input: unknown): input is FileInput | FileInput[] {
    // Check if it's an array
    if (Array.isArray(input)) {
      // Check if all items in the array are valid file inputs
      return input.every((item) => this.isValidSingleInput(item));
    }

    // Otherwise check as a single input
    return this.isValidSingleInput(input);
  },

  /**
   * Converts any valid file input to a buffer.
   * Handles various input types and extracts their binary content.
   *
   * @param input - The file input to convert (path, URI, buffer, stream, etc.)
   * @returns Promise resolving to a buffer containing the file content
   * @throws {Error} Error if the input cannot be converted to a buffer
   */
  async toBuffer(input: FileInput): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (input instanceof Readable) {
      return streamToBuffer(input);
    }

    if (typeof input === "string") {
      const dataUriMatch = input.match(FILE_CONSTANTS.DATA_URI_PATTERN);
      if (dataUriMatch?.[2]) {
        return Buffer.from(dataUriMatch[2], "base64");
      }

      return streamToBuffer(createReadStream(input));
    }

    if (isFileOrBlob(input)) {
      return Buffer.from(await input.arrayBuffer());
    }

    throw new Error("Invalid file input type");
  },

  /**
   * Converts a file input to a data URI.
   * Creates a base64-encoded data URI representation of the file.
   *
   * @param input - The file input to convert
   * @returns Promise resolving to a data URI containing the encoded file
   * @throws {Error} Error if the input cannot be converted to a data URI
   */
  async toDataUri(input: FileInput): Promise<DataUri> {
    // If it's already a data URI, return it
    if (
      typeof input === "string" &&
      input.match(FILE_CONSTANTS.DATA_URI_PATTERN)
    ) {
      return input as DataUri;
    }

    // Convert input to buffer
    const buffer = await this.toBuffer(input);

    // Determine the content type
    const filename = this.getFilename(input);
    const contentType = await this.detectContentType(buffer, filename);

    // Create and return the data URI
    return createDataUri(buffer, contentType);
  },

  /**
   * Gets filename from input or returns a default.
   * Extracts filename from paths, File objects, or uses a default.
   *
   * @param input - The file input to get a filename for
   * @returns The extracted or default filename
   */
  getFilename(input: FileInput): string {
    if (typeof input === "string") {
      if (input.match(FILE_CONSTANTS.DATA_URI_PATTERN)) {
        return FILE_CONSTANTS.DEFAULT_FILENAME;
      }
      return basename(input);
    }

    if (typeof File !== "undefined" && input instanceof File) {
      return input.name;
    }

    return FILE_CONSTANTS.DEFAULT_FILENAME;
  },

  /**
   * Detects content type from buffer or filename.
   * First tries content-based detection, then falls back to extension-based.
   *
   * @param buffer - The file content as a buffer
   * @param filename - The filename with extension
   * @returns Promise resolving to the detected MIME type
   */
  async detectContentType(buffer: Buffer, filename: string): Promise<string> {
    try {
      // Try to detect from buffer content first
      const fileType = await fileTypeFromBuffer(buffer);
      if (fileType?.mime) {
        return fileType.mime;
      }

      // Fall back to extension-based detection
      const mimeType = lookup(filename);
      if (mimeType) {
        return mimeType;
      }
    } catch {
      // Fall through to default
    }

    return FILE_CONSTANTS.DEFAULT_CONTENT_TYPE;
  },

  /**
   * Updates filename extension to match content type.
   * Ensures the file extension accurately reflects the actual content type.
   *
   * @param filename - The original filename
   * @param contentType - The detected content type
   * @returns Updated filename with appropriate extension
   */
  updateFilenameExtension(filename: string, contentType: string): string {
    const newExt =
      FILE_CONSTANTS.FILE_EXTENSIONS[
        contentType as keyof typeof FILE_CONSTANTS.FILE_EXTENSIONS
      ];
    if (!newExt) {
      return filename;
    }

    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex === -1) {
      // No extension, add one
      return `${filename}${newExt}`;
    }

    const currentExt = filename.slice(dotIndex).toLowerCase();
    if (currentExt === newExt) {
      // Already has the right extension
      return filename;
    }

    // Replace existing extension
    return `${filename.slice(0, dotIndex)}${newExt}`;
  },

  /**
   * Loads the Sharp module if available.
   * Dynamically imports the optional Sharp dependency for image processing.
   *
   * @returns Promise resolving to the Sharp module or null if unavailable
   */
  async getSharpModule(): Promise<typeof SharpType | null> {
    if (sharpModule === null) {
      const result = await OptionalDeps.safeImport<typeof SharpType>("sharp");
      sharpModule = result.success ? result.data : null;
    }

    return sharpModule;
  },

  /**
   * Attempts to convert an image to WebP format.
   * WebP often provides better compression ratios than other formats.
   *
   * @param image - The Sharp image instance to convert
   * @param quality - The quality level (1-100) for compression
   * @returns Promise resolving to the WebP buffer or null if conversion failed
   */
  async tryConvertToWebP(
    image: SharpType.Sharp,
    quality: number,
  ): Promise<{ buffer: Buffer } | null> {
    try {
      const webpBuffer = await image
        .webp({
          quality,
          effort: 4, // Good balance between quality and speed
        })
        .toBuffer();

      return { buffer: webpBuffer };
    } catch {
      return null;
    }
  },

  /**
   * Compresses an image using format-specific optimizations.
   * Applies appropriate compression settings based on the image format.
   *
   * @param image - The Sharp image instance to compress
   * @param format - The image format (png, jpeg, webp, etc.)
   * @param quality - The quality level (1-100) for compression
   * @returns Promise resolving to the compressed buffer or null if compression failed
   */
  async compressImage(
    image: SharpType.Sharp,
    format: string | undefined,
    quality: number,
  ): Promise<Buffer | null> {
    try {
      switch (format) {
        case "png":
          return await image
            .png({
              quality,
              compressionLevel: 9, // Maximum compression
            })
            .toBuffer();
        case "jpeg":
        case "jpg":
          return await image
            .jpeg({
              quality,
              optimizeScans: true, // Progressive JPEG
            })
            .toBuffer();
        case "webp":
          return await image
            .webp({
              quality,
              effort: 4,
            })
            .toBuffer();
        case "avif":
          return await image
            .avif({
              quality,
            })
            .toBuffer();
        default:
          return null;
      }
    } catch {
      return null;
    }
  },

  /**
   * Optimizes an image if it's too large or conversion is beneficial.
   * Uses a multi-step approach to reduce file size while maintaining quality:
   * 1. Try format conversion (e.g., to WebP) if allowed
   * 2. Try compression with original format
   * 3. Resize the image if necessary
   *
   * @param buffer - The original image buffer
   * @param contentType - The image MIME type
   * @param options - Configuration options for optimization
   * @returns Promise resolving to the optimized buffer and final content type
   */
  async optimizeImage(
    buffer: Buffer,
    contentType: string,
    options: ImageProcessingOptions,
  ): Promise<{ processedBuffer: Buffer; finalContentType: string }> {
    // Skip processing if not an image or already small enough
    if (
      !FILE_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(contentType) ||
      buffer.length <= options.maxSize
    ) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }

    // Try to load Sharp if not already loaded
    const sharp = await this.getSharpModule();

    // If Sharp isn't available, return original
    if (!sharp) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }

    try {
      // Load image and get metadata
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Step 1: Try format conversion if allowed
      if (!options.preserveFormat && options.attemptWebpConversion) {
        const result = await this.tryConvertToWebP(
          image.clone(),
          options.quality,
        );
        if (result && result.buffer.length <= options.maxSize) {
          return {
            processedBuffer: result.buffer,
            finalContentType: "image/webp",
          };
        }
      }

      // Step 2: Try compression with original format
      const compressedBuffer = await this.compressImage(
        image.clone(),
        metadata.format,
        options.quality,
      );

      if (compressedBuffer && compressedBuffer.length <= options.maxSize) {
        return {
          processedBuffer: compressedBuffer,
          finalContentType: contentType,
        };
      }

      // Step 3: Calculate resize ratio and resize if metadata available
      if (!(metadata.width && metadata.height)) {
        return { processedBuffer: buffer, finalContentType: contentType };
      }

      // Aim for slightly less than max size to account for metadata overhead
      const sizeRatio = Math.sqrt(options.maxSize / buffer.length) * 0.9;

      const newWidth = Math.floor(metadata.width * sizeRatio);
      const newHeight = Math.floor(metadata.height * sizeRatio);

      // Resize and use original format
      const resizedBuffer = await image
        .resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      return { processedBuffer: resizedBuffer, finalContentType: contentType };
    } catch (_error) {
      // If any processing fails, return original buffer
      return { processedBuffer: buffer, finalContentType: contentType };
    }
  },

  /**
   * Processes a file for submission to API.
   * Handles file conversion, optimization, and metadata extraction.
   *
   * @param input - The file input to process
   * @param context - The usage context ("attachment" or "asset") which determines size limits
   * @param options - Optional configuration for image processing
   * @returns Promise resolving to a fully processed file ready for upload
   * @throws {Error} Error if file processing fails
   */
  async processFile(
    input: FileInput,
    context: "attachment" | "asset" = "attachment",
    options?: Partial<ImageProcessingOptions>,
  ): Promise<ProcessedFile> {
    validateInput(input);

    try {
      // Convert input to buffer
      const buffer = await this.toBuffer(input);

      // Determine filename and content type
      const filename = this.getFilename(input);
      const contentType = await this.detectContentType(buffer, filename);

      // Set appropriate size limit based on context
      const maxSize =
        context === "attachment"
          ? FILE_CONSTANTS.ATTACHMENT_MAX_SIZE
          : FILE_CONSTANTS.ASSET_MAX_SIZE;

      // Configure processing options
      const processingOptions: ImageProcessingOptions = {
        maxSize,
        preserveFormat: context === "attachment",
        quality: 80,
        attemptWebpConversion: context === "asset",
        ...options,
      };

      // Process the image if needed
      const { processedBuffer, finalContentType } = await this.optimizeImage(
        buffer,
        contentType,
        processingOptions,
      );

      // Return processed file information
      return {
        buffer: processedBuffer,
        filename: this.updateFilenameExtension(filename, finalContentType),
        contentType: finalContentType,
        size: processedBuffer.length,
        dataUri: createDataUri(processedBuffer, finalContentType),
      };
    } catch (error) {
      throw new Error(
        `File processing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Appends JSON payload to a FormData object.
   * Handles different payload types and formats them correctly for API submission.
   *
   * @param form - The FormData object to append to
   * @param body - The body payload to format and append
   * @returns Promise that resolves when the payload has been appended
   */
  async appendPayloadJson(
    form: FormData,
    body: HttpRequestOptions["body"],
  ): Promise<void> {
    if (typeof body === "string") {
      form.append("payload_json", body);
    } else if (Buffer.isBuffer(body)) {
      form.append("payload_json", Buffer.from(body));
    } else if (body instanceof Readable) {
      const buffer = await streamToBuffer(body);
      form.append("payload_json", buffer);
    } else {
      form.append("payload_json", JSON.stringify(body));
    }
  },

  /**
   * Creates a FormData object with files for API submission.
   * Handles file processing, field naming, and payload formatting.
   *
   * @param files - The file(s) to process and include
   * @param body - Optional JSON payload to include
   * @param processingOptions - Optional configuration for image processing
   * @returns Promise resolving to a FormData object ready for API submission
   * @throws {Error} Error if too many files are provided or processing fails
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
    processingOptions?: Partial<ImageProcessingOptions>,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > FILE_CONSTANTS.MAX_FILES) {
      throw new Error(
        `Too many files: ${filesArray.length}. Maximum allowed is ${FILE_CONSTANTS.MAX_FILES}`,
      );
    }

    const form = new FormData();

    // Process files in parallel for better performance
    const processedFiles = await Promise.all(
      filesArray.map((file) =>
        this.processFile(file as FileInput, "attachment", processingOptions),
      ),
    );

    // Append each processed file
    processedFiles.forEach((processedFile, i) => {
      const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;

      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    });

    // Add JSON payload if provided
    if (body !== undefined) {
      await this.appendPayloadJson(form, body);
    }

    return form;
  },
} as const;
