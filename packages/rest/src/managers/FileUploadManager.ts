import { MimeType } from "@nyxjs/core";
import FormData from "form-data";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export interface FileUpload {
  data: Buffer;
  filename: string;
}

export class FileUploadManager {
  #form = new FormData();

  static #isValidExtension(ext: string): ext is AllowedExtension {
    return ALLOWED_EXTENSIONS.includes(ext as AllowedExtension);
  }

  static #validateFileSize(files: FileUpload[] | FileUpload): void {
    const totalSize = Array.isArray(files)
      ? files.reduce((sum, file) => sum + file.data.length, 0)
      : files.data.length;

    if (totalSize > MAX_FILE_SIZE) {
      throw new Error(
        `Total file size exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  static #getContentType(filename: string): MimeType {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (!FileUploadManager.#isValidExtension(ext)) {
      throw new Error(
        `Invalid file type. Allowed types are: ${ALLOWED_EXTENSIONS.join(", ")}`,
      );
    }

    switch (ext) {
      case "jpg":
      case "jpeg":
        return MimeType.Jpeg;
      case "png":
        return MimeType.Png;
      case "gif":
        return MimeType.Gif;
      case "webp":
        return MimeType.Webp;
      default:
        return MimeType.OctetStream;
    }
  }

  setFile(file: FileUpload): this {
    FileUploadManager.#validateFileSize(file);

    this.#form.append("file", file.data, {
      filename: file.filename,
      knownLength: file.data.length,
      contentType: FileUploadManager.#getContentType(file.filename),
    });

    return this;
  }

  setFiles(files: FileUpload[]): this {
    if (files.length === 0) {
      throw new Error("No files provided");
    }

    FileUploadManager.#validateFileSize(files);

    for (const [index, file] of files.entries()) {
      this.#form.append(`files[${index}]`, file.data, {
        filename: file.filename,
        knownLength: file.data.length,
        contentType: FileUploadManager.#getContentType(file.filename),
      });
    }
    return this;
  }

  setPayload(object: Record<string, unknown>): this {
    this.#form.append("payload_json", JSON.stringify(object));
    return this;
  }

  getHeaders(): Record<string, string> {
    return this.#form.getHeaders();
  }

  getForm(): FormData {
    return this.#form;
  }

  getBuffer(): Buffer {
    return this.#form.getBuffer();
  }

  getBoundary(): string {
    return this.#form.getBoundary();
  }
}
