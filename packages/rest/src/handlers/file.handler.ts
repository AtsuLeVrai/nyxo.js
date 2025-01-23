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

export class FileHandler {
  readonly #maxSize = 10 * 1024 * 1024;
  readonly #maxFiles = 10;

  static isBuffer(input: unknown): input is Buffer {
    return Buffer.isBuffer(input);
  }

  static isFile(input: unknown): input is File {
    return typeof File !== "undefined" && input instanceof File;
  }

  static isBlob(input: unknown): input is Blob {
    return typeof Blob !== "undefined" && input instanceof Blob;
  }

  static isReadable(input: unknown): input is Readable {
    return input instanceof Readable;
  }

  static isDataUri(input: unknown): input is DataUri {
    return typeof input === "string" && DATA_URI_REGEX.test(input);
  }

  static isFilePath(input: unknown): input is string {
    return typeof input === "string" && FILE_PATH_REGEX.test(input);
  }

  static isValidSingleInput(input: unknown): input is FileInput {
    return (
      FileHandler.isBuffer(input) ||
      FileHandler.isFile(input) ||
      FileHandler.isBlob(input) ||
      FileHandler.isReadable(input) ||
      (typeof input === "string" &&
        (FileHandler.isDataUri(input) || FileHandler.isFilePath(input)))
    );
  }

  static isValidInput(input: unknown): input is FileInput | FileInput[] {
    return Array.isArray(input)
      ? input.every((item) => FileHandler.isValidSingleInput(item))
      : FileHandler.isValidSingleInput(input);
  }

  static async toBuffer(input: FileInput): Promise<Buffer> {
    if (FileHandler.isBuffer(input)) {
      return input;
    }

    if (FileHandler.isReadable(input)) {
      const chunks: Buffer[] = [];
      for await (const chunk of input) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    }

    if (typeof input === "string") {
      if (FileHandler.isDataUri(input)) {
        const matches = input.match(DATA_URI_REGEX);
        if (!matches?.[2]) {
          throw new Error("Invalid data URI format");
        }
        return Buffer.from(matches[2], "base64");
      }

      const stream = createReadStream(input);
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    }

    if (FileHandler.isFile(input) || FileHandler.isBlob(input)) {
      return Buffer.from(await input.arrayBuffer());
    }

    throw new Error("Invalid file input");
  }

  static bufferToDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}` as DataUri;
  }

  static dataUriToContentType(dataUri: DataUri): string {
    const matches = dataUri.match(DATA_URI_REGEX);
    return matches?.[1] || "application/octet-stream";
  }

  static async toDataUri(input: FileInput): Promise<DataUri> {
    if (FileHandler.isDataUri(input)) {
      return input;
    }

    const buffer = await FileHandler.toBuffer(input);
    const type = await fileTypeFromBuffer(buffer);

    return FileHandler.bufferToDataUri(
      buffer,
      type?.mime ?? "application/octet-stream",
    );
  }

  static async resizeImageIfNeeded(
    buffer: Buffer,
    maxSize: number,
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

      for (const quality of [80, 60, 40]) {
        if (metadata.format === "png") {
          const resized = await image
            .png({ quality, compressionLevel: 9 })
            .toBuffer();
          if (resized.length <= maxSize) {
            return resized;
          }
        } else if (metadata.format === "jpeg" || metadata.format === "jpg") {
          const resized = await image.jpeg({ quality }).toBuffer();
          if (resized.length <= maxSize) {
            return resized;
          }
        } else if (metadata.format === "webp") {
          const resized = await image.webp({ quality }).toBuffer();
          if (resized.length <= maxSize) {
            return resized;
          }
        }
      }

      const ratio = Math.sqrt(maxSize / buffer.length);
      const newWidth = Math.floor(metadata.width * ratio);
      const newHeight = Math.floor(metadata.height * ratio);

      return await image.resize(newWidth, newHeight).toBuffer();
    } catch {
      return buffer;
    }
  }

  async processFile(
    input: FileInput,
    context: "attachment" | "asset" = "attachment",
  ): Promise<ProcessedFile> {
    if (!FileHandler.isValidInput(input)) {
      throw new Error("Invalid file input");
    }

    const buffer = await FileHandler.toBuffer(input);
    const maxSize = context === "asset" ? MAX_ASSET_SIZE : this.#maxSize;

    const processedBuffer = await FileHandler.resizeImageIfNeeded(
      buffer,
      maxSize,
    );

    if (processedBuffer.length > maxSize) {
      throw new Error(
        `Discord Error ${JsonErrorCode.FileUploadTooBig}: ` +
          `File size ${processedBuffer.length} exceeds maximum size of ${maxSize} bytes`,
      );
    }

    let filename: string;
    if (typeof input === "string") {
      filename = FileHandler.isDataUri(input) ? "file" : basename(input);
    } else if (FileHandler.isFile(input)) {
      filename = input.name;
    } else {
      filename = "file";
    }

    const fileType = await fileTypeFromBuffer(processedBuffer);
    const mimeType = lookup(filename);
    const contentType =
      fileType?.mime || mimeType || "application/octet-stream";

    return {
      buffer: processedBuffer,
      filename,
      contentType,
      size: processedBuffer.length,
      dataUri: FileHandler.bufferToDataUri(processedBuffer, contentType),
    };
  }

  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > this.#maxFiles) {
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
        const chunks: Buffer[] = [];
        for await (const chunk of body) {
          chunks.push(Buffer.from(chunk));
        }
        form.append("payload_json", Buffer.concat(chunks));
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    }

    return form;
  }
}
