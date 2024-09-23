import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { MimeTypes } from "@nyxjs/core";
import FormData from "form-data";
import { DISCORD_CDN_URL } from "../common/constants";
import type { FileInput } from "../types";

const formData = Symbol("formData");

/**
 * @see {@link https://discord.com/developers/docs/reference#signed-attachment-cdn-urls-attachment-cdn-url-parameters}
 */
export type AttachmentCdnUrlParameters = Readonly<{
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
}>;

export class AttachmentCdnUrl {
    private constructor(private readonly url: URL) {}

    public get parameters(): AttachmentCdnUrlParameters {
        return {
            ex: this.url.searchParams.get("ex") ?? "",
            hm: this.url.searchParams.get("hm") ?? "",
            is: this.url.searchParams.get("is") ?? "",
        };
    }

    public static parse(urlString: string): AttachmentCdnUrl {
        try {
            const url = new URL(urlString);
            if (!AttachmentCdnUrl.isValidDiscordCdnUrl(url)) {
                throw new Error("Invalid Discord CDN URL");
            }

            return new AttachmentCdnUrl(url);
        } catch (error) {
            throw new Error(`Invalid URL: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public static construct(baseUrl: string, params: AttachmentCdnUrlParameters): AttachmentCdnUrl {
        const url = new URL(baseUrl);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        return new AttachmentCdnUrl(url);
    }

    private static isValidDiscordCdnUrl(url: URL): boolean {
        return (
            url.hostname === DISCORD_CDN_URL &&
            url.pathname.startsWith("/attachments/") &&
            ["ex", "hm", "is"].every((param) => url.searchParams.has(param))
        );
    }

    public toString(): string {
        return this.url.toString();
    }
}

class FileDetails {
    public constructor(
        public readonly content: any,
        public readonly filename: string,
        public readonly contentType: string
    ) {}

    public static from(file: FileInput, providedFilename?: string): FileDetails {
        if (typeof file === "string") {
            const filename = basename(file);
            return new FileDetails(createReadStream(file), filename, FileDetails.getContentType(filename));
        } else if (file instanceof Buffer) {
            return new FileDetails(
                file,
                providedFilename ?? "file.bin",
                providedFilename ? FileDetails.getContentType(providedFilename) : MimeTypes.Bin
            );
        } else if (file instanceof Blob) {
            return new FileDetails(file, providedFilename ?? "blob", file.type ?? MimeTypes.Bin);
        }

        throw new Error("Invalid file type");
    }

    private static getContentType(filename: string): string {
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
}

export class FileUploadManager {
    private readonly [formData]: FormData;

    public constructor() {
        this[formData] = new FormData();
    }

    public static attachmentUrl(filename: string): string {
        if (typeof filename !== "string" || filename.length === 0) {
            throw new Error("Invalid filename");
        }

        return `attachment://${filename}`;
    }

    public static imageData(type: "image/gif" | "image/jpeg" | "image/png", data: Buffer): string {
        if (!(data instanceof Buffer)) {
            throw new TypeError("Invalid data: must be a Buffer");
        }

        return `data:${type};base64,${data.toString("base64")}`;
    }

    public addFile(fieldName: string, file: FileInput, filename?: string): this {
        if (typeof fieldName !== "string" || fieldName.length === 0) {
            throw new Error("Invalid field name");
        }

        const details = FileDetails.from(file, filename);
        this[formData].append(fieldName, details.content, {
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
            this[formData].append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }

        return this;
    }

    public addPayload(fields: Readonly<Record<string, unknown>>): this {
        this[formData].append("payload_json", JSON.stringify(fields));
        return this;
    }

    public getFormData(): Readonly<FormData> {
        return this[formData];
    }

    public getHeaders(): Readonly<Record<string, string>> {
        return Object.freeze(this[formData].getHeaders());
    }
}
