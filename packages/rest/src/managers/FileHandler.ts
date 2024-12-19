import { open, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import FormData from "form-data";
import { lookup } from "mime-types";
import type { Rest } from "../core/Rest.js";
import type { FileEntity, RouteEntity } from "../types/index.js";

export class FileHandler {
  static readonly MAX_FILE_SIZE = 25 * 1024 * 1024;
  static readonly MAX_FILES = 10;
  static readonly ALLOWED_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp3",
    ".ogg",
    ".wav",
    ".mp4",
    ".mov",
    ".doc",
    ".docx",
    ".pdf",
    ".txt",
    ".csv",
    ".xls",
    ".xlsx",
    ".json",
  ]);

  readonly #rest: Rest;
  #isDestroyed = false;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  async handleFiles(options: RouteEntity): Promise<RouteEntity> {
    if (this.#isDestroyed) {
      throw new Error("FileHandler has been destroyed");
    }

    const files = Array.isArray(options.files)
      ? options.files
      : [options.files];

    if (files.length > FileHandler.MAX_FILES) {
      throw new Error(
        `Maximum number of files (${FileHandler.MAX_FILES}) exceeded`,
      );
    }

    const form = new FormData();

    try {
      await this.#validateFiles(files);

      for (let i = 0; i < files.length; i++) {
        await this.#processFile(form, i, files.length, files[i]);
      }

      if (options.body) {
        if (typeof options.body === "object") {
          form.append("payload_json", JSON.stringify(options.body));
        } else {
          form.append("payload_json", options.body);
        }
      }

      return {
        ...options,
        body: form.getBuffer(),
        headers: {
          ...form.getHeaders(options.headers),
          "Content-Length": form.getLengthSync().toString(),
        },
      };
    } catch (error) {
      this.#rest.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  destroy(): void {
    this.#isDestroyed = true;
  }

  async #validateFiles(files: Array<FileEntity | undefined>): Promise<void> {
    let totalSize = 0;

    for (const file of files) {
      if (!file) {
        continue;
      }

      try {
        const size = await this.#getFileSize(file);
        totalSize += size;

        if (size > FileHandler.MAX_FILE_SIZE) {
          throw new Error(
            `File size ${size} bytes exceeds maximum size ${FileHandler.MAX_FILE_SIZE} bytes`,
          );
        }

        const extension = this.#getFileExtension(file);
        if (!FileHandler.ALLOWED_EXTENSIONS.has(extension.toLowerCase())) {
          throw new Error(`File extension ${extension} is not allowed`);
        }
      } catch (error) {
        this.#rest.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    }

    if (totalSize > FileHandler.MAX_FILE_SIZE * FileHandler.MAX_FILES) {
      throw new Error(
        `Total file size ${totalSize} bytes exceeds maximum allowed`,
      );
    }
  }

  async #getFileSize(file: FileEntity): Promise<number> {
    if (typeof file === "string") {
      const stats = await stat(file);
      return stats.size;
    }
    if (file instanceof File) {
      return file.size;
    }
    throw new Error("Invalid file type");
  }

  #getFileExtension(file: FileEntity): string {
    if (typeof file === "string") {
      return extname(file);
    }
    if (file instanceof File) {
      return extname(file.name);
    }
    throw new Error("Invalid file type");
  }

  async #processFile(
    form: FormData,
    index: number,
    totalFiles: number,
    file?: FileEntity,
  ): Promise<void> {
    if (!file) {
      return;
    }

    try {
      const { buffer, filename, contentType } = await this.#getFileData(file);
      const fieldName = totalFiles === 1 ? "file" : `files[${index}]`;

      this.#rest.emit("debug", `Processing file ${filename} (${contentType})`);

      form.append(fieldName, buffer, {
        filename,
        contentType,
        knownLength: buffer.length,
      });
    } catch (error) {
      this.#rest.emit(
        "error",
        new Error(
          `Failed to process file at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      throw error;
    }
  }

  #getFileData(file: FileEntity): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    if (typeof file === "string") {
      return this.#handleFilePathInput(file);
    }
    if (file instanceof File) {
      return this.#handleFileInput(file);
    }
    throw new Error("Invalid file type");
  }

  async #handleFilePathInput(filePath: string): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    try {
      const stats = await stat(filePath);

      if (!stats.isFile()) {
        throw new Error("Path does not point to a file");
      }

      if (stats.size > FileHandler.MAX_FILE_SIZE) {
        throw new Error(
          `File too large: max size is ${FileHandler.MAX_FILE_SIZE} bytes`,
        );
      }

      const handle = await open(filePath);
      try {
        const buffer = await handle.readFile();
        const filename = basename(filePath);
        const contentType = lookup(filename) || "application/octet-stream";

        return { buffer, filename, contentType };
      } finally {
        await handle.close();
      }
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async #handleFileInput(file: File): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    try {
      if (file.size > FileHandler.MAX_FILE_SIZE) {
        throw new Error(
          `File too large: max size is ${FileHandler.MAX_FILE_SIZE} bytes`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        buffer,
        filename: file.name,
        contentType:
          file.type || lookup(file.name) || "application/octet-stream",
      };
    } catch (error) {
      throw new Error(
        `Failed to process File object: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
