import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { OptionalDeps } from "@nyxjs/core";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import type SharpType from "sharp";
import type { Dispatcher } from "undici";

const DATA_URI = /^data:(.+);base64,(.+)$/;
const FILE_PATH = /^[/.]|^[a-zA-Z]:\\/;
const MAX_FILES = 10;
const DEFAULT_FILENAME = "file";
const DEFAULT_CONTENT_TYPE = "application/octet-stream";
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** @see {@link https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs} */
export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | Readable | File | Blob | DataUri;

export interface ProcessedFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  dataUri: DataUri;
}

export interface ImageProcessingOptions {
  maxSize: number;
  preserveFormat: boolean;
  qualities: number[];
  useAdaptiveCompression: boolean;
  preserveMetadata: string[];
}

export class FileHandler {
  // Sharp module cache
  #hasCheckedSharp = false;
  #sharp: typeof SharpType | null = null;

  isBuffer(input: unknown): input is Buffer {
    return Buffer.isBuffer(input);
  }

  isFile(input: unknown): input is File {
    return typeof File !== "undefined" && input instanceof File;
  }

  isBlob(input: unknown): input is Blob {
    return typeof Blob !== "undefined" && input instanceof Blob;
  }

  isReadable(input: unknown): input is Readable {
    return input instanceof Readable;
  }

  isDataUri(input: unknown): input is DataUri {
    return typeof input === "string" && DATA_URI.test(input);
  }

  isFilePath(input: unknown): input is string {
    return typeof input === "string" && FILE_PATH.test(input);
  }

  isValidSingleInput(input: unknown): input is FileInput {
    return (
      this.isBuffer(input) ||
      this.isFile(input) ||
      this.isBlob(input) ||
      this.isReadable(input) ||
      (typeof input === "string" &&
        (this.isDataUri(input) || this.isFilePath(input)))
    );
  }

  isValidInput(input: unknown): input is FileInput | FileInput[] {
    return Array.isArray(input)
      ? input.every((item) => this.isValidSingleInput(item))
      : this.isValidSingleInput(input);
  }

  async toBuffer(input: FileInput): Promise<Buffer> {
    if (this.isBuffer(input)) {
      return input;
    }

    if (this.isReadable(input)) {
      return await this.#readStreamToBuffer(input);
    }

    if (typeof input === "string") {
      if (this.isDataUri(input)) {
        const matches = input.match(DATA_URI);
        if (!matches?.[2]) {
          throw new Error("Invalid data URI format");
        }
        return Buffer.from(matches[2], "base64");
      }

      return await this.#readStreamToBuffer(createReadStream(input));
    }

    if (this.isFile(input) || this.isBlob(input)) {
      return Buffer.from(await input.arrayBuffer());
    }

    throw new Error("Invalid file input");
  }

  bufferToDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  dataUriToContentType(dataUri: DataUri): string {
    const matches = dataUri.match(DATA_URI);
    return matches?.[1] || DEFAULT_CONTENT_TYPE;
  }

  async toDataUri(input: FileInput): Promise<DataUri> {
    if (this.isDataUri(input)) {
      return input;
    }

    const buffer = await this.toBuffer(input);
    const contentType = await this.getContentType(
      buffer,
      this.getFilename(input),
    );

    return this.bufferToDataUri(buffer, contentType);
  }

  /**
   * Enhanced image processing with multiple optimization strategies
   */
  async resizeImageIfNeeded(
    buffer: Buffer,
    maxSize: number,
    contentType: string,
    options: Partial<ImageProcessingOptions> = {},
  ): Promise<{ buffer: Buffer; contentType: string }> {
    // Skip if already small enough
    if (buffer.length <= maxSize || !SUPPORTED_IMAGE_TYPES.has(contentType)) {
      return { buffer, contentType };
    }

    // Try to get Sharp module
    const sharp = await this.#getSharp();

    // If Sharp is not available, use fallback method
    if (!sharp) {
      const resizedBuffer = await this.#fallbackResizeImage(
        buffer,
        maxSize,
        contentType,
      );
      return { buffer: resizedBuffer, contentType };
    }

    // Set defaults for options
    const defaultOptions: ImageProcessingOptions = {
      maxSize,
      preserveFormat: false,
      qualities: [80, 60, 40, 30],
      useAdaptiveCompression: true,
      preserveMetadata: ["orientation", "icc"],
    };

    const opts = { ...defaultOptions, ...options };

    try {
      // Create sharp instance with proper options
      const image = sharp(buffer, {
        failOn: "none",
        density: 300,
      });

      // Get metadata for format-specific handling
      const metadata = await image.metadata();
      if (!(metadata.width && metadata.height)) {
        throw new Error("Unable to get image dimensions");
      }

      // Preserve important metadata if requested
      if (opts.preserveMetadata.length > 0) {
        image.withMetadata({
          orientation: opts.preserveMetadata.includes("orientation")
            ? metadata.orientation
            : undefined,
        });
      }

      // Step 1: Try format conversion if allowed
      if (!opts.preserveFormat) {
        const convertResult = await this.#convertToEfficientFormat(
          image.clone(),
          contentType,
          opts.qualities[0],
        );

        if (convertResult && convertResult.buffer.length <= opts.maxSize) {
          image.destroy(); // Clean up resources
          return convertResult;
        }
      }

      // Step 2: Try compression with original format
      for (const quality of opts.qualities) {
        // Special case for PNG - try both with and without palette
        if (metadata.format === "png") {
          // First try without palette (better for photos)
          const withoutPalette = await this.#compressImage(
            image.clone(),
            metadata.format,
            quality,
            false,
          );

          if (withoutPalette && withoutPalette.length <= opts.maxSize) {
            image.destroy();
            return { buffer: withoutPalette, contentType };
          }

          // Then try with palette (better for graphics)
          const withPalette = await this.#compressImage(
            image.clone(),
            metadata.format,
            quality,
            true,
          );

          if (withPalette && withPalette.length <= opts.maxSize) {
            image.destroy();
            return { buffer: withPalette, contentType };
          }
        } else {
          // For other formats, just try normal compression
          const compressed = await this.#compressImage(
            image.clone(),
            metadata.format,
            quality,
          );

          if (compressed && compressed.length <= opts.maxSize) {
            image.destroy();
            return { buffer: compressed, contentType };
          }
        }
      }

      // Step 3: Adaptive compression - try resize + compression combinations
      if (opts.useAdaptiveCompression) {
        // Calculate potential scale ratios
        const ratios = [0.9, 0.8, 0.7, 0.5];

        for (const ratio of ratios) {
          const newWidth = Math.floor(metadata.width * ratio);
          const newHeight = Math.floor(metadata.height * ratio);

          // Skip if dimensions become too small
          if (newWidth < 200 || newHeight < 200) {
            continue;
          }

          const resized = image.clone().resize(newWidth, newHeight, {
            fit: "inside",
            withoutEnlargement: true,
          });

          for (const quality of opts.qualities) {
            const compressed = await this.#compressImage(
              resized.clone(),
              metadata.format,
              quality,
            );

            if (compressed && compressed.length <= opts.maxSize) {
              image.destroy();
              return { buffer: compressed, contentType };
            }
          }
        }
      }

      // Step 4: Last resort - calculate exact resize ratio needed
      const sizeRatio = Math.sqrt(opts.maxSize / buffer.length);
      const finalRatio = Math.min(sizeRatio, 0.9); // Don't reduce more than 90% at once

      const newWidth = Math.floor(metadata.width * finalRatio);
      const newHeight = Math.floor(metadata.height * finalRatio);

      const result = await image
        .resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      image.destroy();
      return { buffer: result, contentType };
    } catch (_error) {
      // If Sharp fails, fall back to the basic method
      const resizedBuffer = await this.#fallbackResizeImage(
        buffer,
        maxSize,
        contentType,
      );
      return { buffer: resizedBuffer, contentType };
    }
  }

  getFilename(input: FileInput): string {
    if (typeof input === "string") {
      return this.isDataUri(input) ? DEFAULT_FILENAME : basename(input);
    }
    if (this.isFile(input)) {
      return input.name;
    }
    return DEFAULT_FILENAME;
  }

  async getContentType(buffer: Buffer, filename: string): Promise<string> {
    try {
      const fileType = await fileTypeFromBuffer(buffer);
      if (fileType?.mime) {
        return fileType.mime;
      }

      const mimeType = lookup(filename);
      if (mimeType) {
        return mimeType;
      }

      return DEFAULT_CONTENT_TYPE;
    } catch {
      return DEFAULT_CONTENT_TYPE;
    }
  }

  async processFile(
    input: FileInput,
    context: "attachment" | "asset" = "attachment",
    options: Partial<ImageProcessingOptions> = {},
  ): Promise<ProcessedFile> {
    if (!this.isValidInput(input)) {
      throw new Error("Invalid file input");
    }

    try {
      const buffer = await this.toBuffer(input);
      const maxSize = context === "asset" ? 256 * 1024 : 10 * 1024 * 1024;

      const filename = this.getFilename(input);
      const contentType = await this.getContentType(buffer, filename);

      // Configure options based on context
      const processingOptions: Partial<ImageProcessingOptions> = {
        ...options,
        maxSize,
        // Preserve format for attachments by default, but allow conversion for assets
        preserveFormat:
          context === "attachment"
            ? (options.preserveFormat ?? true)
            : (options.preserveFormat ?? false),
      };

      const { buffer: processedBuffer, contentType: finalContentType } =
        await this.resizeImageIfNeeded(
          buffer,
          maxSize,
          contentType,
          processingOptions,
        );

      return {
        buffer: processedBuffer,
        filename: this.#updateFilenameExtension(filename, finalContentType),
        contentType: finalContentType,
        size: processedBuffer.length,
        dataUri: this.bufferToDataUri(processedBuffer, finalContentType),
      };
    } catch (error) {
      throw new Error("File processing failed", {
        cause: error,
      });
    }
  }

  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
    processingOptions?: Partial<ImageProcessingOptions>,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > MAX_FILES) {
      throw new Error(
        `Discord Error ${filesArray.length} files are too many. Max is ${MAX_FILES}`,
      );
    }

    const form = new FormData();

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

    if (body) {
      if (typeof body === "string") {
        form.append("payload_json", body);
      } else if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
        form.append("payload_json", Buffer.from(body));
      } else if (this.isReadable(body)) {
        const buffer = await this.#readStreamToBuffer(body);
        form.append("payload_json", buffer);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    }

    return form;
  }

  /**
   * Check if Sharp is available and cache the result
   */
  async #getSharp(): Promise<typeof SharpType | null> {
    if (!this.#hasCheckedSharp) {
      this.#hasCheckedSharp = true;
      const result = await OptionalDeps.safeImport<typeof SharpType>("sharp");
      this.#sharp = result.success ? result.data : null;
    }

    return this.#sharp;
  }

  async #readStreamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  /**
   * Compresses an image using format-specific optimizations
   */
  async #compressImage(
    image: SharpType.Sharp,
    format: string | undefined,
    quality: number,
    usePalette = true,
  ): Promise<Buffer | null> {
    try {
      switch (format) {
        case "png":
          return await image
            .png({
              quality,
              compressionLevel: 9,
              palette: usePalette,
              colors: usePalette ? 256 : undefined,
              dither: usePalette ? 0.5 : undefined,
            })
            .toBuffer();
        case "jpeg":
        case "jpg":
          return await image
            .jpeg({
              quality,
              trellisQuantisation: true,
              overshootDeringing: true,
              optimizeScans: true,
            })
            .toBuffer();
        case "webp":
          return await image
            .webp({
              quality,
              lossless: quality >= 95,
              effort: 6,
              nearLossless: quality >= 90 && quality < 95,
            })
            .toBuffer();
        case "avif":
          return await image
            .avif({
              quality,
              lossless: quality >= 95,
              effort: 7,
            })
            .toBuffer();
        default:
          return null;
      }
    } catch (_error) {
      return null;
    }
  }

  /**
   * Attempts to convert image to more efficient format
   */
  async #convertToEfficientFormat(
    image: SharpType.Sharp,
    originalContentType: string,
    quality = 80,
  ): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (
      !SUPPORTED_IMAGE_TYPES.has(originalContentType) ||
      originalContentType === "image/webp" ||
      originalContentType === "image/avif"
    ) {
      return null;
    }

    try {
      const webpBuffer = await image
        .webp({
          quality,
          effort: 6,
          nearLossless: quality >= 90,
        })
        .toBuffer();

      return {
        buffer: webpBuffer,
        contentType: "image/webp",
      };
    } catch {
      return null;
    }
  }

  /**
   * Basic image resizing without sharp, using Canvas API if available
   */
  async #fallbackResizeImage(
    buffer: Buffer,
    maxSize: number,
    contentType: string,
  ): Promise<Buffer> {
    // If it's already small enough, just return the original
    if (buffer.length <= maxSize || !SUPPORTED_IMAGE_TYPES.has(contentType)) {
      return buffer;
    }

    const canvasResult =
      await OptionalDeps.safeImport<typeof import("canvas")>("canvas");

    if (canvasResult.success) {
      const { createCanvas, loadImage } = canvasResult.data;

      // Create an image from the buffer
      const image = await loadImage(buffer);

      // Calculate new dimensions to maintain aspect ratio
      const ratio = Math.sqrt(maxSize / buffer.length);
      const newWidth = Math.floor(image.width * ratio);
      const newHeight = Math.floor(image.height * ratio);

      // Create a canvas with the new dimensions
      const canvas = createCanvas(newWidth, newHeight);
      const ctx = canvas.getContext("2d");

      // Draw the image on the canvas with the new dimensions
      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      // Convert the canvas to a buffer
      const mimeType = contentType === "image/png" ? "image/png" : "image/jpeg";
      const quality = contentType === "image/png" ? undefined : 0.8;

      // @ts-expect-error: Canvas typings are incomplete
      return canvas.toBuffer(mimeType, { quality });
    }

    // If Canvas is not available or fails, return the original buffer
    return buffer;
  }

  #updateFilenameExtension(filename: string, contentType: string): string {
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
  }
}

// Export a singleton instance for easy access
export const fileHandler = new FileHandler();
