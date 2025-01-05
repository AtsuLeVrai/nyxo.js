import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { contentType } from "mime-types";
import { FileConstants } from "../constants/index.js";
import type { FileData, FileType } from "../types/index.js";

export class FileProcessorService {
  async createFormData(
    files: FileType[],
    body?: Record<string, unknown> | string,
  ): Promise<FormData> {
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

    if (body !== undefined) {
      const payload = typeof body === "string" ? body : JSON.stringify(body);
      form.append("payload_json", payload);
    }

    return form;
  }

  processFile(file: FileType): Promise<FileData> {
    if (typeof file === "string") {
      return this.#processFilePath(file);
    }
    if (file instanceof File) {
      return this.#processFileObject(file);
    }
    throw new Error("Invalid file type provided");
  }

  async #processFilePath(filePath: string): Promise<FileData> {
    try {
      const stats = await stat(filePath);
      const handle = await open(filePath);

      try {
        const buffer = await handle.readFile();
        const filename = basename(filePath);
        const detectedType =
          contentType(filename) || FileConstants.defaultContentTypes;

        return {
          buffer,
          filename,
          contentType: detectedType,
          size: stats.size,
        };
      } finally {
        await handle.close();
      }
    } catch (error) {
      throw new Error(
        `Failed to process file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async #processFileObject(file: File): Promise<FileData> {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        buffer,
        filename: file.name,
        contentType:
          file.type ||
          contentType(file.name) ||
          FileConstants.defaultContentTypes,
        size: file.size,
      };
    } catch (error) {
      throw new Error(
        `Failed to process File object: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
