import { Buffer } from "node:buffer";
import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { URL } from "node:url";
import { MimeTypes } from "@nyxjs/core";
import FormData from "form-data";
import type { FileInput } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/reference#signed-attachment-cdn-urls-attachment-cdn-url-parameters}
 */
export type AttachmentCdnUrlParameters = {
    /**
     * Hex timestamp indicating when an attachment CDN URL will expire
     */
    ex: string;
    /**
     * Unique signature that remains valid until the URL's expiration
     */
    hm: string;
    /**
     * Hex timestamp indicating when the URL was issued
     */
    is: string;
};

export class FileUploadManager {
    readonly #formData: FormData;

    public constructor() {
        this.#formData = new FormData();
    }

    public static from(): FileUploadManager {
        return new FileUploadManager();
    }

    public parseAttachmentCdnUrl(urlString: string): {
        parameters: AttachmentCdnUrlParameters;
        toString(): string;
    } {
        try {
            const url = new URL(urlString);
            if (!this.isValidDiscordCdnUrl(url)) {
                throw new Error("Invalid Discord CDN URL");
            }

            const parameters = {
                ex: url.searchParams.get("ex") ?? "",
                hm: url.searchParams.get("hm") ?? "",
                is: url.searchParams.get("is") ?? "",
            };

            return {
                parameters,
                toString: () => url.toString(),
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    public constructAttachmentCdnUrl(baseUrl: string, params: AttachmentCdnUrlParameters): string {
        const url = new URL(baseUrl);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        return url.toString();
    }

    public attachmentUrl(filename: string): string {
        if (typeof filename !== "string" || filename.length === 0) {
            throw new Error("Invalid filename");
        }

        return `attachment://${filename}`;
    }

    public imageData(type: "image/gif" | "image/jpeg" | "image/png", data: Buffer): string {
        if (!(data instanceof Buffer)) {
            throw new TypeError("Invalid data: must be a Buffer");
        }

        return `data:${type};base64,${data.toString("base64")}`;
    }

    public addFile(fieldName: string, file: FileInput, filename?: string): this {
        if (typeof fieldName !== "string" || fieldName.length === 0) {
            throw new Error("Invalid field name");
        }

        const details = this.getFileDetails(file, filename);
        this.#formData.append(fieldName, details.content, {
            filename: details.filename,
            contentType: details.contentType,
        });
        return this;
    }

    public addFiles(files: Readonly<Record<string, { content: FileInput; filename?: string }>>): this {
        for (const [fieldName, { content, filename }] of Object.entries(files)) {
            this.addFile(fieldName, content, filename);
        }

        return this;
    }

    public addFields(fields: Readonly<Record<string, unknown>>): this {
        for (const [key, value] of Object.entries(fields)) {
            this.#formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }

        return this;
    }

    public addPayload(fields: Readonly<Record<string, unknown>>): this {
        this.#formData.append("payload_json", JSON.stringify(fields));
        return this;
    }

    public getFormData(): Readonly<FormData> {
        return this.#formData;
    }

    public getHeaders(): Readonly<Record<string, string>> {
        return Object.freeze(this.#formData.getHeaders());
    }

    private isValidDiscordCdnUrl(url: URL): boolean {
        return (
            url.hostname === "discord.com" &&
            url.pathname.startsWith("/attachments/") &&
            ["ex", "hm", "is"].every((param) => url.searchParams.has(param))
        );
    }

    private getContentType(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase() ?? "";
        const contentTypes: Readonly<Record<string, string>> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
        };
        return contentTypes[extension] || MimeTypes.Bin;
    }

    private getFileDetails(
        file: FileInput,
        providedFilename?: string
    ): {
        content: any;
        contentType: string;
        filename: string;
    } {
        if (typeof file === "string") {
            const filename = basename(file);
            return {
                content: createReadStream(file),
                filename,
                contentType: this.getContentType(filename),
            };
        } else if (file instanceof Buffer) {
            const filename = providedFilename ?? "file.bin";
            return {
                content: file,
                filename,
                contentType: providedFilename ? this.getContentType(filename) : MimeTypes.Bin,
            };
        } else if (file instanceof Blob) {
            return { content: file, filename: providedFilename ?? "blob", contentType: file.type ?? MimeTypes.Bin };
        }

        throw new Error("Invalid file type");
    }
}
