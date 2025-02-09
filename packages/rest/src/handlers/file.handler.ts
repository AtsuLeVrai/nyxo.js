import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import sharp from "sharp";
import type { Dispatcher } from "undici";
import type { DataUri, FileInput, ProcessedFile } from "../types/index.js";

const FILE_CONSTANTS = {
  PATTERNS: {
    DATA_URI: /^data:(.+);base64,(.+)$/,
    FILE_PATH: /^[/.]|^[a-zA-Z]:\\/,
  },
  LIMITS: {
    MAX_ASSET_SIZE: 256 * 1024, // 256KB
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 10,
  },
  IMAGE: {
    COMPRESSION_QUALITIES: [80, 60, 40] as const,
    SUPPORTED_TYPES: new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ]),
  },
  DEFAULTS: {
    FILENAME: "file" as const,
    CONTENT_TYPE: "application/octet-stream" as const,
  },
  CONTEXTS: {
    ATTACHMENT: "attachment" as const,
    ASSET: "asset" as const,
  },
} as const;

export const FileHandler = {
  // Type guards
  isBuffer(input: unknown): input is Buffer {
    return Buffer.isBuffer(input);
  },

  isFile(input: unknown): input is File {
    return typeof File !== "undefined" && input instanceof File;
  },

  isBlob(input: unknown): input is Blob {
    return typeof Blob !== "undefined" && input instanceof Blob;
  },

  isReadable(input: unknown): input is Readable {
    return input instanceof Readable;
  },

  isDataUri(input: unknown): input is DataUri {
    return (
      typeof input === "string" && FILE_CONSTANTS.PATTERNS.DATA_URI.test(input)
    );
  },

  isFilePath(input: unknown): input is string {
    return (
      typeof input === "string" && FILE_CONSTANTS.PATTERNS.FILE_PATH.test(input)
    );
  },

  isValidSingleInput(input: unknown): input is FileInput {
    return (
      this.isBuffer(input) ||
      this.isFile(input) ||
      this.isBlob(input) ||
      this.isReadable(input) ||
      (typeof input === "string" &&
        (this.isDataUri(input) || this.isFilePath(input)))
    );
  },

  isValidInput(input: unknown): input is FileInput | FileInput[] {
    return Array.isArray(input)
      ? input.every((item) => this.isValidSingleInput(item))
      : this.isValidSingleInput(input);
  },

  // Buffer handling
  async readStreamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  },

  async toBuffer(input: FileInput): Promise<Buffer> {
    if (this.isBuffer(input)) {
      return input;
    }

    if (this.isReadable(input)) {
      return await this.readStreamToBuffer(input);
    }

    if (typeof input === "string") {
      if (this.isDataUri(input)) {
        const matches = input.match(FILE_CONSTANTS.PATTERNS.DATA_URI);
        if (!matches?.[2]) {
          throw new Error("Invalid data URI format");
        }
        return Buffer.from(matches[2], "base64");
      }

      return await this.readStreamToBuffer(createReadStream(input));
    }

    if (this.isFile(input) || this.isBlob(input)) {
      return Buffer.from(await input.arrayBuffer());
    }

    throw new Error("Invalid file input");
  },

  // Data URI handling
  bufferToDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  },

  dataUriToContentType(dataUri: DataUri): string {
    const matches = dataUri.match(FILE_CONSTANTS.PATTERNS.DATA_URI);
    return matches?.[1] || FILE_CONSTANTS.DEFAULTS.CONTENT_TYPE;
  },

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
  },

  // Image processing
  async compressImage(
    image: sharp.Sharp,
    format: string | undefined,
    quality: number,
  ): Promise<Buffer | null> {
    try {
      switch (format) {
        case "png":
          return await image.png({ quality, compressionLevel: 9 }).toBuffer();
        case "jpeg":
        case "jpg":
          return await image.jpeg({ quality }).toBuffer();
        case "webp":
          return await image.webp({ quality }).toBuffer();
        default:
          return null;
      }
    } catch {
      return null;
    }
  },

  async resizeImageIfNeeded(
    buffer: Buffer,
    maxSize: number,
    contentType: string,
    qualities: readonly number[] = FILE_CONSTANTS.IMAGE.COMPRESSION_QUALITIES,
  ): Promise<Buffer> {
    try {
      if (
        buffer.length <= maxSize ||
        !FILE_CONSTANTS.IMAGE.SUPPORTED_TYPES.has(contentType)
      ) {
        return buffer;
      }

      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!(metadata.width && metadata.height)) {
        throw new Error("Unable to get image dimensions");
      }

      // Try compression first
      for (const quality of qualities) {
        const compressed = await this.compressImage(
          image,
          metadata.format,
          quality,
        );
        if (compressed && compressed.length <= maxSize) {
          return compressed;
        }
      }

      // If compression not enough, resize
      const ratio = Math.sqrt(maxSize / buffer.length);
      const newWidth = Math.floor(metadata.width * ratio);
      const newHeight = Math.floor(metadata.height * ratio);

      return await image.resize(newWidth, newHeight).toBuffer();
    } catch {
      return buffer;
    }
  },

  // File information
  getFilename(input: FileInput): string {
    if (typeof input === "string") {
      return this.isDataUri(input)
        ? FILE_CONSTANTS.DEFAULTS.FILENAME
        : basename(input);
    }
    if (this.isFile(input)) {
      return input.name;
    }
    return FILE_CONSTANTS.DEFAULTS.FILENAME;
  },

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

      return FILE_CONSTANTS.DEFAULTS.CONTENT_TYPE;
    } catch {
      return FILE_CONSTANTS.DEFAULTS.CONTENT_TYPE;
    }
  },

  async processFile(
    input: FileInput,
    context: "attachment" | "asset" = "attachment",
  ): Promise<ProcessedFile> {
    if (!this.isValidInput(input)) {
      throw new Error("Invalid file input");
    }

    try {
      const buffer = await this.toBuffer(input);
      const maxSize =
        context === "asset"
          ? FILE_CONSTANTS.LIMITS.MAX_ASSET_SIZE
          : FILE_CONSTANTS.LIMITS.MAX_SIZE;

      const filename = this.getFilename(input);
      const contentType = await this.getContentType(buffer, filename);

      const processedBuffer = await this.resizeImageIfNeeded(
        buffer,
        maxSize,
        contentType,
      );

      return {
        buffer: processedBuffer,
        filename,
        contentType,
        size: processedBuffer.length,
        dataUri: this.bufferToDataUri(processedBuffer, contentType),
      };
    } catch (error) {
      throw new Error("File processing failed", {
        cause: error,
      });
    }
  },

  // Form data creation
  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > FILE_CONSTANTS.LIMITS.MAX_FILES) {
      throw new Error(
        `Discord Error ${filesArray.length} files are too many. Max is ${FILE_CONSTANTS.LIMITS.MAX_FILES}`,
      );
    }

    const form = new FormData();

    for (let i = 0; i < filesArray.length; i++) {
      const processedFile = await this.processFile(filesArray[i] as FileInput);
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
      } else if (body instanceof Readable) {
        const buffer = await this.readStreamToBuffer(body);
        form.append("payload_json", buffer);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    }

    return form;
  },
} as const;
