import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { lookup } from "mime-types";
import type { Rest } from "../core/index.js";
import type { FileEntity, RouteEntity } from "../types/index.js";

export class FileHandler {
  static readonly DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
  static readonly TIER_1_MAX_FILE_SIZE = 25 * 1024 * 1024;
  static readonly TIER_2_MAX_FILE_SIZE = 50 * 1024 * 1024;
  static readonly TIER_3_MAX_FILE_SIZE = 100 * 1024 * 1024;
  static readonly MAX_FILES = 10;

  readonly #rest: Rest;
  #maxFileSize: number;
  #isDestroyed = false;

  constructor(rest: Rest, boostTier = 0) {
    this.#rest = rest;
    this.#maxFileSize = this.#getMaxFileSizeForTier(boostTier);
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
        const payload =
          typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body);
        form.append("payload_json", payload);
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

  setBoostTier(tier: number): void {
    this.#maxFileSize = this.#getMaxFileSizeForTier(tier);
  }

  destroy(): void {
    this.#isDestroyed = true;
  }

  #getMaxFileSizeForTier(tier: number): number {
    switch (tier) {
      case 1:
        return FileHandler.TIER_1_MAX_FILE_SIZE;
      case 2:
        return FileHandler.TIER_2_MAX_FILE_SIZE;
      case 3:
        return FileHandler.TIER_3_MAX_FILE_SIZE;
      default:
        return FileHandler.DEFAULT_MAX_FILE_SIZE;
    }
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

        if (size > this.#maxFileSize) {
          throw new Error(
            `File size ${size} bytes exceeds maximum size ${this.#maxFileSize} bytes`,
          );
        }
      } catch (error) {
        this.#rest.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    }

    const maxTotalSize = this.#maxFileSize * FileHandler.MAX_FILES;
    if (totalSize > maxTotalSize) {
      throw new Error(
        `Total file size ${totalSize} bytes exceeds maximum allowed ${maxTotalSize} bytes`,
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

      if (stats.size > this.#maxFileSize) {
        throw new Error(
          `File too large: max size is ${this.#maxFileSize} bytes`,
        );
      }

      const handle = await open(filePath);
      try {
        const buffer = await handle.readFile();
        const filename = basename(filePath);
        const contentType =
          String(lookup(filename)) ?? "application/octet-stream";

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
      if (file.size > this.#maxFileSize) {
        throw new Error(
          `File too large: max size is ${this.#maxFileSize} bytes`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        buffer,
        filename: file.name,
        contentType:
          file.type ?? lookup(file.name) ?? "application/octet-stream",
      };
    } catch (error) {
      throw new Error(
        `Failed to process File object: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
