import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import { Readable } from "node:stream";
import slugify from "@sindresorhus/slugify";
import FormData from "form-data";
import { lookup } from "mime-types";
import type { Dispatcher } from "undici";
import { z } from "zod";
import type { DataUriImageData, FileData, FileType } from "../types/index.js";

const DEFAULT_MAX_TOTAL_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const FileOptions = z
  .object({
    allowedMimeTypes: z.array(z.string()).optional(),
    preserveFilenames: z.boolean().default(true),
    sanitizeFilenames: z.boolean().default(true),
    maxTotalSize: z.number().default(DEFAULT_MAX_TOTAL_SIZE),
    maxAttachments: z
      .number()
      .max(MAX_ATTACHMENTS_PER_MESSAGE)
      .default(MAX_ATTACHMENTS_PER_MESSAGE),
    slugifyOptions: z
      .object({
        separator: z.string().default("-"),
        lowercase: z.boolean().default(true),
        strict: z.boolean().default(true),
      })
      .default({}),
  })
  .strict();

export type FileOptions = z.infer<typeof FileOptions>;

export class FileProcessorService {
  readonly #options: FileOptions;

  constructor(options: Partial<FileOptions> = {}) {
    this.#options = FileOptions.parse(options);
  }

  async createFormData(
    files: FileType[],
    body?: Dispatcher.RequestOptions["body"],
  ): Promise<FormData> {
    if (files.length > this.#options.maxAttachments) {
      throw new Error(
        `Too many attachments. Maximum allowed: ${this.#options.maxAttachments}`,
      );
    }

    const form = new FormData();

    for (let i = 0; i < files.length; i++) {
      const fileData = await this.processFile(files[i] as FileType);
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

  async processFile(input: FileType): Promise<FileData> {
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

    if (
      this.#options.allowedMimeTypes &&
      this.#options.allowedMimeTypes.length > 0 &&
      !this.#options.allowedMimeTypes.includes(fileData.contentType)
    ) {
      throw new Error(`Unsupported file type: ${fileData.contentType}`);
    }

    if (fileData.size > this.#options.maxTotalSize) {
      throw new Error(
        `Total file size exceeds limit: ${this.#options.maxTotalSize} bytes`,
      );
    }

    if (this.#options.sanitizeFilenames) {
      const extension = fileData.filename.split(".").pop() || "";
      const baseName = fileData.filename.slice(
        0,
        fileData.filename.length - extension.length - 1,
      );

      fileData.filename =
        slugify(baseName, this.#options.slugifyOptions) +
        (extension ? `.${extension}` : "");
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

  #processBuffer(buffer: Buffer): FileData {
    return {
      buffer: buffer,
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
      const detectedType = lookup(filename) || "application/octet-stream";

      return {
        buffer,
        filename,
        contentType: detectedType,
        size: stats.size,
      };
    } finally {
      await handle.close();
    }
  }

  #processDataUri(dataUri: DataUriImageData): FileData {
    const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
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
}
