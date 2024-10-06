import type { Buffer } from "node:buffer";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { MimeTypes } from "@nyxjs/core";
import FormData from "form-data";

export class FileUpload {
    readonly #formData: FormData = new FormData();

    readonly #fileLimit: number;

    public constructor(fileLimit: number = 25 * 1_024 * 1_024) {
        this.#fileLimit = fileLimit;
    }

    public getHeaders(additionalHeaders?: Record<string, any>): Record<string, string> {
        return this.#formData.getHeaders(additionalHeaders);
    }

    public getFormData(): FormData {
        return this.#formData;
    }

    public toBuffer(): Buffer {
        return this.#formData.getBuffer();
    }

    public createAttachmentUrl(file: string): string {
        return `attachment://${file}`;
    }

    public addField(name: string, value: string): void {
        this.#formData.append(name, value);
    }

    public addPayload(payload: Record<string, any>): void {
        this.#formData.append("payload_json", JSON.stringify(payload), {
            contentType: MimeTypes.Json,
        });
    }

    public async addFiles(files: string[] | string): Promise<void> {
        if (Array.isArray(files)) {
            await Promise.all(files.map(async (file, index) => this.#processFile(file, index)));
        } else {
            await this.#processFile(files);
        }
    }

    async #processFile(file: string, index?: number): Promise<void> {
        const fileStats = await stat(file);
        if (fileStats.size > this.#fileLimit) {
            throw new Error(`File size exceeds the limit of ${this.#fileLimit / (1_024 * 1_024)} MiB`);
        }

        const filename = basename(file);
        const contentType = this.#getMimeType(filename);
        const fieldName = index === undefined ? "file" : `files[${index}]`;
        this.#formData.append(fieldName, createReadStream(file), {
            filename,
            contentType,
        });
    }

    #getMimeType(filename: string): MimeTypes {
        const extension = extname(filename).slice(1);
        switch (extension) {
            case "png": {
                return MimeTypes.Png;
            }

            case "jpg": {
                return MimeTypes.Jpeg;
            }

            case "jpeg": {
                return MimeTypes.Jpeg;
            }

            case "gif": {
                return MimeTypes.Gif;
            }

            case "webp": {
                return MimeTypes.Webp;
            }

            default: {
                return MimeTypes.Bin;
            }
        }
    }
}
