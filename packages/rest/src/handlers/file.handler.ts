import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { OptionalDeps } from "@nyxojs/core";
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
    const filename =
      typeof input === "object" && input !== null && "name" in input
        ? String(input.name)
        : undefined;
    throw new Error(
      `Invalid file input type${filename ? `: ${filename}` : ""}`,
    );
  }

  if (
    typeof input === "string" &&
    !input.match(FILE_CONSTANTS.DATA_URI_PATTERN) &&
    !input.match(FILE_CONSTANTS.FILE_PATH_PATTERN)
  ) {
    throw new Error(
      `Invalid string input: expected file path or data URI (received: "${input.slice(0, 20)}${input.length > 20 ? "..." : ""}")`,
    );
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
      try {
        return await streamToBuffer(input);
      } catch (error) {
        throw new Error(
          `Failed to read from stream: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (typeof input === "string") {
      const dataUriMatch = input.match(FILE_CONSTANTS.DATA_URI_PATTERN);
      if (dataUriMatch?.[2]) {
        try {
          return Buffer.from(dataUriMatch[2], "base64");
        } catch (error) {
          throw new Error(
            `Failed to decode base64 data URI: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      try {
        return await streamToBuffer(createReadStream(input));
      } catch (error) {
        throw new Error(
          `Failed to read file from path "${basename(input)}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (isFileOrBlob(input)) {
      try {
        return Buffer.from(await input.arrayBuffer());
      } catch (error) {
        const filename = input instanceof File ? input.name : "blob";
        throw new Error(
          `Failed to read File/Blob "${filename}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    throw new Error("Unsupported file input type");
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

    try {
      // Convert input to buffer
      const buffer = await this.toBuffer(input);

      // Determine the content type
      const filename = this.getFilename(input);
      const contentType = this.detectContentType(filename);

      // Create and return the data URI
      return createDataUri(buffer, contentType);
    } catch (error) {
      const filename =
        typeof input === "string"
          ? basename(input)
          : isFileOrBlob(input) && input instanceof File
            ? input.name
            : "unknown";

      throw new Error(
        `Failed to convert to data URI: ${error instanceof Error ? error.message : String(error)} (file: ${filename})`,
      );
    }
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
   * @param filename - The filename with extension
   * @returns Promise resolving to the detected MIME type
   */
  detectContentType(filename: string): string {
    try {
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
   * Optimizes an image if it's too large or conversion is beneficial.
   * Uses a multi-step approach to reduce file size while maintaining quality.
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
    // 1. Short-circuit for small images that don't need optimization
    if (buffer.length <= options.maxSize * 0.9) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }

    // 2. Don't use Sharp for formats that don't need it
    if (!FILE_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }

    // 3. Load Sharp more efficiently
    const sharp = await this.getSharpModule();
    if (!sharp) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }

    try {
      // 4. Reduce unnecessary metadata
      const image = sharp(buffer, {
        // Optimizations for Sharp
        limitInputPixels: 50000000, // Reasonable limit
        sequentialRead: true, // Improves performance for GIFs and certain formats
      });

      // Reduce metadata
      image.withMetadata({ orientation: undefined });

      const metadata = await image.metadata();

      // 5. Optimize image processing logic
      // Direct WebP conversion if allowed (fewer steps)
      if (!options.preserveFormat && options.attemptWebpConversion) {
        try {
          const webpBuffer = await image
            .webp({
              quality: options.quality,
              effort: 3, // Less effort for more speed
              alphaQuality: 80, // Reduce alpha channel quality
            })
            .toBuffer();

          if (webpBuffer.length <= options.maxSize) {
            return {
              processedBuffer: webpBuffer,
              finalContentType: "image/webp",
            };
          }
        } catch {
          // WebP conversion failed, continue with other methods
        }
      }

      // 6. Faster optimization with original format
      if (metadata.format) {
        const compressionOptions: Record<string, any> = {
          // PNG: less compression but much faster
          png: { quality: options.quality, compressionLevel: 6 },
          // JPEG: progressive quality for loading
          jpeg: {
            quality: options.quality,
            optimizeScans: true,
            progressive: true,
          },
          // WebP: balance quality/performance
          webp: { quality: options.quality, effort: 3 },
          avif: { quality: options.quality - 10 }, // AVIF is slow, reduce quality
        };

        // Apply format-specific optimization
        const formatOptions = compressionOptions[metadata.format] || {};
        try {
          const compressedBuffer =
            // @ts-expect-error
            await image[metadata.format](formatOptions).toBuffer();

          if (compressedBuffer.length <= options.maxSize) {
            return {
              processedBuffer: compressedBuffer,
              finalContentType: contentType,
            };
          }
        } catch {
          // Format-specific compression failed, continue to resizing
        }
      }

      // 7. Smarter resizing
      if (metadata.width && metadata.height) {
        // More predictable calculation for resizing
        const targetRatio = Math.sqrt(options.maxSize / buffer.length) * 0.95;
        const newWidth = Math.floor(metadata.width * targetRatio);
        const newHeight = Math.floor(metadata.height * targetRatio);

        // Faster resizing with fewer options
        const resizedBuffer = await image
          .resize(newWidth, newHeight, {
            fit: "inside",
            withoutEnlargement: true,
            fastShrinkOnLoad: true, // Faster but less precise
          })
          .toBuffer();

        return {
          processedBuffer: resizedBuffer,
          finalContentType: contentType,
        };
      }

      // Fallback
      return { processedBuffer: buffer, finalContentType: contentType };
    } catch {
      // Return original if optimization fails
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
    try {
      validateInput(input);

      // Convert input to buffer
      const buffer = await this.toBuffer(input);

      // Determine filename and content type
      const filename = this.getFilename(input);
      const contentType = this.detectContentType(filename);

      // Set appropriate size limit based on context
      const maxSize =
        context === "attachment"
          ? FILE_CONSTANTS.ATTACHMENT_MAX_SIZE
          : FILE_CONSTANTS.ASSET_MAX_SIZE;

      // Check file size before processing
      if (buffer.length > maxSize) {
        throw new Error(
          `File size exceeds maximum allowed size (${buffer.length} > ${maxSize} bytes) for file "${filename}"`,
        );
      }

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
      // Get filename information if available
      const filenameInfo =
        typeof input === "string"
          ? basename(input)
          : input instanceof File
            ? input.name
            : undefined;

      const sizeInfo =
        input instanceof Blob
          ? input.size
          : Buffer.isBuffer(input)
            ? input.length
            : undefined;

      const typeInfo = input instanceof Blob ? input.type : undefined;

      // Add context to the error message
      const details = [
        filenameInfo && `filename: ${filenameInfo}`,
        sizeInfo && `size: ${sizeInfo} bytes`,
        typeInfo && `type: ${typeInfo}`,
      ]
        .filter(Boolean)
        .join(", ");

      throw new Error(
        `File processing failed: ${error instanceof Error ? error.message : String(error)}${details ? ` (${details})` : ""}`,
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
   * @throws {Error} Error if appending payload fails
   */
  async appendPayloadJson(
    form: FormData,
    body: HttpRequestOptions["body"],
  ): Promise<void> {
    try {
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
    } catch (error) {
      throw new Error(
        `Failed to append JSON payload: ${error instanceof Error ? error.message : String(error)}`,
      );
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

    try {
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
    } catch (error) {
      throw new Error(
        `Failed to create form data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
} as const;
