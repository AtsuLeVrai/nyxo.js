import type { Buffer } from "node:buffer";
import type { DataUriSchema } from "@nyxjs/core";
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

export class FileManager {
    // TODO: Implement the form data methods
    public createFormData(): FormData {
        return new FormData();
    }

    /**
     * @see {@link https://discord.com/developers/docs/reference#image-data}
     */
    public imageData(type: "image/gif" | "image/jpeg" | "image/png", data: Buffer): DataUriSchema {
        return `data:${type};base64,${data.toString("base64")}`;
    }

    private attachmentUrl(filename: string): string {
        return `attachment://${filename}`;
    }

    private getContentType(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "png": {
                return "image/png";
            }

            case "jpg": {
                return "image/jpeg";
            }

            case "jpeg": {
                return "image/jpeg";
            }

            case "gif": {
                return "image/gif";
            }

            case "webp": {
                return "image/webp";
            }

            default: {
                return "application/octet-stream";
            }
        }
    }
}
