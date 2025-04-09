import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { OptionalDeps } from "@nyxjs/core";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import type SharpType from "sharp";
import type { Dispatcher } from "undici";

// Constants
const FILE_CONSTANTS = {
  MAX_FILES: 10,
  DEFAULT_FILENAME: "file",
  DEFAULT_CONTENT_TYPE: "application/octet-stream",
  DATA_URI_PATTERN: /^data:(.+);base64,(.+)$/,
  FILE_PATH_PATTERN: /^[/.]|^[a-zA-Z]:\\/,
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
  ATTACHMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ASSET_MAX_SIZE: 256 * 1024, // 256KB
};

// Types
export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | Readable | File | Blob | DataUri;

export interface ImageProcessingOptions {
  maxSize: number;
  preserveFormat: boolean;
  quality: number;
  attemptWebpConversion: boolean;
}

export interface ProcessedFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  dataUri: DataUri;
}

// Cache for Sharp module
let sharpModule: typeof SharpType | null = null;

// Helper functions
function isFileOrBlob(input: unknown): input is File | Blob {
  return (
    (typeof File !== "undefined" && input instanceof File) ||
    (typeof Blob !== "undefined" && input instanceof Blob)
  );
}

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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function createDataUri(buffer: Buffer, contentType: string): DataUri {
  return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
}

// The FileHandler object
export const FileHandler = {
  /**
   * Checks if the input is a valid file input for a single file
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
   * Checks if the input is a valid file input or array of file inputs
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
   * Converts any valid file input to a buffer
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
   * Converts a file input to a data URI
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
   * Gets filename from input or returns a default
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
   * Detects content type from buffer or filename
   */
  async detectContentType(buffer: Buffer, filename: string): Promise<string> {
    try {
      const fileType = await fileTypeFromBuffer(buffer);
      if (fileType?.mime) {
        return fileType.mime;
      }

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
   * Updates filename extension to match content type
   */
  updateFilenameExtension(filename: string, contentType: string): string {
    const extensionMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/avif": ".avif",
      "image/gif": ".gif",
    };

    const newExt = extensionMap[contentType];
    if (!newExt) {
      return filename;
    }

    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex === -1) {
      return `${filename}${newExt}`;
    }

    const currentExt = filename.slice(dotIndex).toLowerCase();
    if (currentExt === newExt) {
      return filename;
    }

    return `${filename.slice(0, dotIndex)}${newExt}`;
  },

  /**
   * Loads the Sharp module if available
   */
  async getSharpModule(): Promise<typeof SharpType | null> {
    if (sharpModule === null) {
      const result = await OptionalDeps.safeImport<typeof SharpType>("sharp");
      sharpModule = result.success ? result.data : null;
    }

    return sharpModule;
  },

  /**
   * Attempts to convert an image to WebP format
   */
  async tryConvertToWebP(
    image: SharpType.Sharp,
    quality: number,
  ): Promise<{ buffer: Buffer } | null> {
    try {
      const webpBuffer = await image
        .webp({
          quality,
          effort: 4,
        })
        .toBuffer();

      return { buffer: webpBuffer };
    } catch {
      return null;
    }
  },

  /**
   * Compresses an image using format-specific optimizations
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
              compressionLevel: 9,
            })
            .toBuffer();
        case "jpeg":
        case "jpg":
          return await image
            .jpeg({
              quality,
              optimizeScans: true,
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
   * Optimizes an image if it's too large or conversion is beneficial
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

      // Step 3: Calculate resize ratio and resize
      const sizeRatio = Math.sqrt(options.maxSize / buffer.length) * 0.9;

      if (!(metadata.width && metadata.height)) {
        return { processedBuffer: buffer, finalContentType: contentType };
      }

      const newWidth = Math.floor(metadata.width * sizeRatio);
      const newHeight = Math.floor(metadata.height * sizeRatio);

      const resizedBuffer = await image
        .resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      return { processedBuffer: resizedBuffer, finalContentType: contentType };
    } catch (_error) {
      return { processedBuffer: buffer, finalContentType: contentType };
    }
  },

  /**
   * Processes a file for submission to API
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
   * Appends JSON payload to a FormData object
   */
  async appendPayloadJson(
    form: FormData,
    body: Dispatcher.RequestOptions["body"],
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
   * Creates a FormData object with files for API submission
   */
  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
    processingOptions?: Partial<ImageProcessingOptions>,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > FILE_CONSTANTS.MAX_FILES) {
      throw new Error(
        `Too many files: ${filesArray.length}. Maximum allowed is ${FILE_CONSTANTS.MAX_FILES}`,
      );
    }

    const form = new FormData();

    // Process and append each file
    for (let i = 0; i < filesArray.length; i++) {
      const processedFile = await this.processFile(
        filesArray[i] as FileInput,
        "attachment",
        processingOptions,
      );

      const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;

      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    }

    // Add JSON payload if provided
    if (body) {
      await this.appendPayloadJson(form, body);
    }

    return form;
  },
} as const;
