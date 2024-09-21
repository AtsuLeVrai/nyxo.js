import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { MimeTypes } from "@nyxjs/core";
import FormData from "form-data";
import { DISCORD_CDN_URL } from "../libs/constants";
import type { AttachmentCdnUrlParameters } from "../types";

const CONTENT_TYPES = new Map([
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["gif", "image/gif"],
    ["webp", "image/webp"],
]);

type ContentType = MimeTypes.Bin | (typeof CONTENT_TYPES extends Map<string, infer V> ? V : never);

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

    public static getContentType(filename: string): ContentType {
        const extension = filename.split(".").pop()?.toLowerCase() ?? "";
        return CONTENT_TYPES.get(extension) ?? MimeTypes.Bin;
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

    public addFile(file: string): this {
        const filename = basename(file);
        this.formData.append("file", createReadStream(file), {
            filename,
            contentType: FileUploadManager.getContentType(filename),
        });
        return this;
    }

    public addFiles(files: string[]): this {
        for (const [index, file] of files.entries()) {
            const filename = basename(file);
            this.formData.append(`files[${index}]`, createReadStream(file), {
                contentType: FileUploadManager.getContentType(filename),
                filename,
            });
        }

        return this;
    }

    public createPayload(payload: Record<string, unknown>, files?: string[] | string): this {
        if (files) {
            void (Array.isArray(files) ? this.addFiles(files) : this.addFile(files));
        }

        this.formData.append("payload_json", JSON.stringify(payload));
        return this;
    }

    public getFormData(): FormData {
        return this.formData;
    }
}
