import { Buffer } from "node:buffer";
import { createReadStream } from "node:fs";
import type { Readable } from "node:stream";
import type { Integer } from "@nyxjs/core";
import { FormData } from "undici";

type FileAttachment = {
    description?: string;
    file: Buffer | Readable | string;
    filename: string;
    id: Integer;
};

export class FileHandler {
    private files: FileAttachment[] = [];

    private payloadJson: any = {};

    public constructor(private maxSize: number = 25 * 1_024 * 1_024) {}

    public addFile(file: Buffer | Readable | string, filename: string, description?: string): number {
        const id = this.files.length;
        this.files.push({
            id,
            file,
            filename,
            description,
        });
        return id;
    }

    public setPayloadJson(payload: any) {
        this.payloadJson = payload;
    }

    public createFormData(): FormData {
        const formData = new FormData();
        let totalSize = 0;

        for (const [index, fileAttachment] of this.files.entries()) {
            let fileContent: Buffer | Readable;
            if (typeof fileAttachment.file === "string") {
                fileContent = createReadStream(fileAttachment.file);
            } else if (Buffer.isBuffer(fileAttachment.file)) {
                fileContent = fileAttachment.file;
                totalSize += fileContent.length;
            } else {
                fileContent = fileAttachment.file;
            }

            formData.append(`files[${index}]`, fileContent, fileAttachment.filename);
        }

        if (totalSize > this.maxSize) {
            throw new Error(`Total file size exceeds the limit of ${this.maxSize} bytes`);
        }

        if (Object.keys(this.payloadJson).length > 0) {
            this.payloadJson.attachments = this.files.map((file) => ({
                id: file.id,
                filename: file.filename,
                description: file.description,
            }));
            formData.append("payload_json", JSON.stringify(this.payloadJson));
        }

        return formData;
    }

    private getContentType(filename: string): string {
        const ext = filename.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
}
