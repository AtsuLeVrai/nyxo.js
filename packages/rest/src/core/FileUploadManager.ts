import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { MimeTypes } from "@nyxjs/core";
import FormData from "form-data";
import { DISCORD_CDN_URL } from "../common/constants";
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
    private readonly formData: FormData;

    public constructor() {
        this.formData = new FormData();
    }

    public static attachmentUrl(filename: string): string {
        return `attachment://${filename}`;
    }

    public static imageData(type: "image/gif" | "image/jpeg" | "image/png", data: Buffer): string {
        return `data:${type};base64,${data.toString("base64")}`;
    }

    public static parseAttachmentCdnUrl(urlString: string): AttachmentCdnUrlParameters {
        const url = new URL(urlString);
        return {
            ex: url.searchParams.get("ex") ?? "",
            hm: url.searchParams.get("hm") ?? "",
            is: url.searchParams.get("is") ?? "",
        };
    }

    public static constructAttachmentCdnUrl(baseUrl: string, params: AttachmentCdnUrlParameters): string {
        const url = new URL(baseUrl);
        for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
        return url.toString();
    }

    public static isValidDiscordCdnUrl(cdnUrl: string): boolean {
        try {
            const url = new URL(cdnUrl);
            return (
                url.hostname === DISCORD_CDN_URL &&
                url.pathname.startsWith("/attachments/") &&
                ["ex", "hm", "is"].every((param) => url.searchParams.has(param))
            );
        } catch {
            return false;
        }
    }

    private static getContentType(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase() ?? "";
        const contentTypes: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
        };
        return contentTypes[extension] || MimeTypes.Bin;
    }

    private static getFileDetails(
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
            return {
                content: file,
                filename: providedFilename ?? "file.bin",
                contentType: providedFilename ? this.getContentType(providedFilename) : MimeTypes.Bin,
            };
        } else if (file instanceof Blob) {
            return {
                content: file,
                filename: providedFilename ?? "blob",
                contentType: file.type ?? MimeTypes.Bin,
            };
        }

        throw new Error("Invalid file type");
    }

    public addFile(fieldName: string, file: FileInput, filename?: string): this {
        const { content, filename: detectedFilename, contentType } = FileUploadManager.getFileDetails(file, filename);
        this.formData.append(fieldName, content, { filename: detectedFilename, contentType });
        return this;
    }

    public addFiles(files: Record<string, { content: FileInput; filename?: string }>): this {
        for (const [fieldName, { content, filename }] of Object.entries(files)) {
            this.addFile(fieldName, content, filename);
        }

        return this;
    }

    public addFields(fields: Record<string, unknown>): this {
        for (const [key, value] of Object.entries(fields)) {
            this.formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }

        return this;
    }

    public addPayload(fields: Record<string, unknown>): this {
        this.formData.append("payload_json", JSON.stringify(fields));
        return this;
    }

    public getFormData(): FormData {
        return this.formData;
    }

    public getHeaders(): Record<string, string> {
        return this.formData.getHeaders();
    }
}
