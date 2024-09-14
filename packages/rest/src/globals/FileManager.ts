import type { Buffer } from "node:buffer";
import { URL } from "node:url";
import type { DataUriSchema } from "@nyxjs/core";
import { ContentTypes } from "@nyxjs/core";
import FormData from "form-data";

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

const CONTENT_TYPES = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
} as const;

type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES] | ContentTypes.Bin;

export class FileManager {
    private static readonly CDN_HOSTNAME = "cdn.discordapp.com";

    private static readonly ATTACHMENTS_PATH = "/attachments/";

    public static attachmentUrl(filename: string): string {
        return `attachment://${filename}`;
    }

    public static createFormData(object: Record<string, any>, files?: string[] | string): FormData {
        const form = new FormData();
        form.append("payload_json", JSON.stringify(object), { contentType: ContentTypes.Json });

        if (files) {
            if (Array.isArray(files)) {
                for (const [index, file] of files.entries()) {
                    form.append(`files[${index}]`, file, {
                        filename: file,
                        contentType: this.getContentType(file),
                    });
                }
            } else {
                form.append("file", files, {
                    filename: files,
                    contentType: this.getContentType(files),
                });
            }
        }

        return form;
    }

    public static imageData(type: "image/gif" | "image/jpeg" | "image/png", data: Buffer): DataUriSchema {
        return `data:${type};base64,${data.toString("base64")}`;
    }

    public static getContentType(filename: string): ContentType {
        const extension = filename.split(".").pop()?.toLowerCase() ?? "";
        return CONTENT_TYPES[extension as keyof typeof CONTENT_TYPES] ?? ContentTypes.Bin;
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

    public static isValidDiscordCdnUrl(urlString: string): boolean {
        try {
            const url = new URL(urlString);
            return (
                url.hostname === this.CDN_HOSTNAME &&
                url.pathname.startsWith(this.ATTACHMENTS_PATH) &&
                ["ex", "hm", "is"].every((param) => url.searchParams.has(param))
            );
        } catch {
            return false;
        }
    }
}
