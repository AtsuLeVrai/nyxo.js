import { open, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import slugify from "@sindresorhus/slugify";
import FormData from "form-data";
import { lookup } from "mime-types";
import sharp, { type FormatEnum } from "sharp";
import type { Dispatcher } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { FileProcessorOptions } from "../options/index.js";
import type {
  BaseImageOptionsEntity,
  DataUriImageData,
  FileData,
  FileType,
  FileValidationOptions,
} from "../types/index.js";

const DATA_URI_REGEX = /^data:(.+);base64,(.+)$/;

export class FileProcessorService {
  readonly #options: z.output<typeof FileProcessorOptions>;

  constructor(options: z.input<typeof FileProcessorOptions> = {}) {
    try {
      this.#options = FileProcessorOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  async toDataUri(
    input: FileType,
    options: Partial<FileValidationOptions> = {},
  ): Promise<string> {
    if (typeof input === "string" && this.isDataUri(input)) {
      return input;
    }

    const fileData = await this.processFile(
      input,
      {
        asDataUri: true,
      },
      {
        ...options,
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".gif"],
      },
    );

    if (!fileData.dataUri) {
      throw new Error("Failed to convert file to data URI");
    }

    return fileData.dataUri;
  }

  async createFormData(
    files: FileType[],
    body?: Dispatcher.RequestOptions["body"],
    imageOptions?: BaseImageOptionsEntity,
  ): Promise<FormData> {
    if (files.length > this.#options.maxAttachments) {
      throw new Error(
        `Too many attachments. Maximum allowed: ${this.#options.maxAttachments}`,
      );
    }

    const form = new FormData();
    let totalSize = 0;

    for (let i = 0; i < files.length; i++) {
      const fileData = await this.processFile(
        files[i] as FileType,
        imageOptions,
      );
      totalSize += fileData.size;

      if (totalSize > this.#options.maxTotalSize) {
        throw new Error(
          `Total files size exceeds limit: ${this.#options.maxTotalSize} bytes`,
        );
      }

      const fieldName = files.length === 1 ? "file" : `files[${i}]`;
      form.append(fieldName, fileData.buffer, {
        filename: fileData.filename,
        contentType: fileData.contentType,
        knownLength: fileData.size,
      });
    }

    if (body) {
      if (body instanceof Readable) {
        form.append("payload_json", body);
      } else if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
        form.append("payload_json", Buffer.from(body));
      } else if (typeof body === "string") {
        form.append("payload_json", body);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    }

    return form;
  }

  async processFile(
    input: FileType,
    imageOptions?: BaseImageOptionsEntity,
    validationOptions: Partial<FileValidationOptions> = {},
  ): Promise<FileData> {
    const options = { ...validationOptions };
    let fileData: FileData;

    if (Buffer.isBuffer(input)) {
      fileData = this.#processBuffer(input);
    } else if (input instanceof File) {
      fileData = await this.#processFileObject(input);
    } else if (input instanceof URL) {
      fileData = await this.#processFilePath(input.pathname);
    } else if (typeof input === "string") {
      if (this.isDataUri(input)) {
        fileData = this.#processDataUri(input);
      } else {
        fileData = await this.#processFilePath(input);
      }
    } else {
      throw new Error("Invalid file input type");
    }

    await this.#validateFile(fileData, options);

    if (this.isImage(fileData.contentType) && imageOptions) {
      fileData = await this.#processImage(fileData, imageOptions);
    }

    if (this.#options.sanitizeFilenames) {
      fileData.filename = this.#sanitizeFilename(fileData.filename);
    }

    if (imageOptions?.asDataUri) {
      fileData.dataUri = `data:${fileData.contentType};base64,${fileData.buffer.toString("base64")}`;
    }

    return fileData;
  }

  isDataUri(input: string): input is DataUriImageData {
    return input.startsWith("data:");
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith("image/");
  }

  isVideo(contentType: string): boolean {
    return contentType.startsWith("video/");
  }

  isAudio(contentType: string): boolean {
    return contentType.startsWith("audio/");
  }

  async #validateFile(
    fileData: FileData,
    options: Partial<FileValidationOptions>,
  ): Promise<void> {
    if (options.maxSizeBytes && fileData.size > options.maxSizeBytes) {
      throw new Error(`File size exceeds limit: ${options.maxSizeBytes} bytes`);
    }

    const ext = extname(fileData.filename).toLowerCase();
    if (!options.allowedExtensions?.includes(ext)) {
      throw new Error(`File extension not allowed: ${ext}`);
    }

    if (!options.allowedTypes?.includes(fileData.contentType)) {
      throw new Error(`File type not allowed: ${fileData.contentType}`);
    }

    if (options.validateImage && this.isImage(fileData.contentType)) {
      await this.#validateImageSize(fileData.buffer);
    }
  }

  async #validateImageSize(buffer: Buffer): Promise<void> {
    const metadata = await sharp(buffer).metadata();
    const maxDimension = 4096;

    if (
      (metadata.width && metadata.width > maxDimension) ||
      (metadata.height && metadata.height > maxDimension)
    ) {
      throw new Error(
        `Image dimensions exceed Discord's limits (max: ${maxDimension}x${maxDimension})`,
      );
    }
  }

  async #processImage(
    fileData: FileData,
    options: BaseImageOptionsEntity,
  ): Promise<FileData> {
    let transformer = sharp(fileData.buffer);

    if (options.format) {
      transformer = transformer.toFormat(options.format as keyof FormatEnum);
    }

    // biome-ignore lint/style/useExplicitLengthCheck: <explanation>
    if (options.size && options.size > 0) {
      transformer = transformer.resize(options.size, options.size, {
        fit: "contain",
        withoutEnlargement: true,
      });
    }

    fileData.buffer = await transformer.toBuffer();
    fileData.size = fileData.buffer.length;

    if (options.format) {
      fileData.contentType = `image/${options.format}`;
      const filename = fileData.filename.split(".").slice(0, -1).join(".");
      fileData.filename = `${filename}.${options.format}`;
    }

    return fileData;
  }

  #processBuffer(buffer: Buffer): FileData {
    return {
      buffer,
      filename: "buffer-file",
      contentType: "application/octet-stream",
      size: buffer.length,
    };
  }

  async #processFileObject(file: File): Promise<FileData> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      filename: file.name,
      contentType: file.type || lookup(file.name) || "application/octet-stream",
      size: file.size,
    };
  }

  async #processFilePath(filePath: string): Promise<FileData> {
    const stats = await stat(filePath);
    const handle = await open(filePath);

    try {
      const buffer = await handle.readFile();
      const filename = basename(filePath);
      return {
        buffer,
        filename,
        contentType: lookup(filename) || "application/octet-stream",
        size: stats.size,
      };
    } finally {
      await handle.close();
    }
  }

  #processDataUri(dataUri: DataUriImageData): FileData {
    const matches = dataUri.match(DATA_URI_REGEX);
    if (!matches) {
      throw new Error("Invalid data URI format");
    }

    const [, contentType, base64Data] = matches;
    if (!(contentType && base64Data)) {
      throw new Error("Invalid data URI format");
    }

    const buffer = Buffer.from(base64Data, "base64");

    return {
      buffer,
      filename: `data-uri.${contentType.split("/")[1] || "bin"}`,
      contentType,
      size: buffer.length,
    };
  }

  #sanitizeFilename(filename: string): string {
    const extension = filename.split(".").pop() || "";
    const baseName = filename.slice(0, filename.length - extension.length - 1);
    return (
      slugify(baseName, this.#options.slugifyOptions) +
      (extension ? `.${extension}` : "")
    );
  }
}
