import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import sharp from "sharp";
import type { Dispatcher } from "undici";
import {
  type DataUri,
  type FileInput,
  JsonErrorCode,
  type ProcessedFile,
} from "../types/index.js";

const DATA_URI_REGEX = /^data:(.+);base64,(.+)$/;
const FILE_PATH_REGEX = /^[/.]|^[a-zA-Z]:\\/;
const MAX_ASSET_SIZE = 256 * 1024;
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const DEFAULT_FILENAME = "file";
const DEFAULT_CONTENT_TYPE = "application/octet-stream";
const COMPRESSION_QUALITIES = [80, 60, 40] as const;

export const FileHandler = {
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
    return typeof input === "string" && DATA_URI_REGEX.test(input);
  },

  isFilePath(input: unknown): input is string {
    return typeof input === "string" && FILE_PATH_REGEX.test(input);
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
        const matches = input.match(DATA_URI_REGEX);
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

  bufferToDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  },

  dataUriToContentType(dataUri: DataUri): string {
    const matches = dataUri.match(DATA_URI_REGEX);
    return matches?.[1] || DEFAULT_CONTENT_TYPE;
  },

  async toDataUri(input: FileInput): Promise<DataUri> {
    if (this.isDataUri(input)) {
      return input;
    }

    const buffer = await this.toBuffer(input);
    const type = await fileTypeFromBuffer(buffer);

    return this.bufferToDataUri(buffer, type?.mime ?? DEFAULT_CONTENT_TYPE);
  },

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
    qualities: readonly number[] = COMPRESSION_QUALITIES,
  ): Promise<Buffer> {
    try {
      if (buffer.length <= maxSize) {
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

  getFilename(input: FileInput): string {
    if (typeof input === "string") {
      return this.isDataUri(input) ? DEFAULT_FILENAME : basename(input);
    }
    if (this.isFile(input)) {
      return input.name;
    }
    return DEFAULT_FILENAME;
  },

  async getContentType(buffer: Buffer, filename: string): Promise<string> {
    const fileType = await fileTypeFromBuffer(buffer);
    const mimeType = lookup(filename);
    return fileType?.mime || mimeType || DEFAULT_CONTENT_TYPE;
  },

  async processFile(
    input: FileInput,
    context: "attachment" | "asset" = "attachment",
  ): Promise<ProcessedFile> {
    if (!this.isValidInput(input)) {
      throw new Error("Invalid file input");
    }

    const buffer = await this.toBuffer(input);
    const maxSize = context === "asset" ? MAX_ASSET_SIZE : MAX_SIZE;

    const processedBuffer = await this.resizeImageIfNeeded(buffer, maxSize);

    if (processedBuffer.length > maxSize) {
      throw new Error(
        `Discord Error ${JsonErrorCode.FileUploadTooBig}: ` +
          `File size ${processedBuffer.length} exceeds maximum size of ${maxSize} bytes`,
      );
    }

    const filename = this.getFilename(input);
    const contentType = await this.getContentType(processedBuffer, filename);

    return {
      buffer: processedBuffer,
      filename,
      contentType,
      size: processedBuffer.length,
      dataUri: this.bufferToDataUri(processedBuffer, contentType),
    };
  },

  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > MAX_FILES) {
      throw new Error(
        `Discord Error ${JsonErrorCode.FileUploadTooBig}: Too many files provided`,
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
