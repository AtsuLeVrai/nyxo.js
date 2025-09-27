import { createReadStream, existsSync, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename } from "node:path";

export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | DataUri;

export interface FileAsset {
  readonly data: Buffer | ReadStream;
  readonly filename: string;
  readonly contentType: string;
  readonly size: number | null;
}

export const MAX_FILE_COUNT = 10 as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DATA_URI_REGEX = /^data:(.+);base64,(.*)$/;

const MIME_TYPES = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".ogg", "audio/ogg"],
  [".flac", "audio/flac"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".txt", "text/plain"],
  [".json", "application/json"],
  [".pdf", "application/pdf"],
]);

const EXTENSION_MAP = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
  ["audio/mpeg", "mp3"],
  ["audio/wav", "wav"],
  ["application/json", "json"],
  ["text/plain", "txt"],
]);

export async function toBuffer(
  input: FileInput,
): Promise<{ data: Buffer | ReadStream; size: number | null }> {
  if (Buffer.isBuffer(input)) {
    return { data: input, size: input.length };
  }

  if (typeof input === "string") {
    const dataUriMatch = input.match(DATA_URI_REGEX);
    if (dataUriMatch) {
      try {
        const base64Data = dataUriMatch[2] as string;
        const buf = Buffer.from(base64Data, "base64");
        return { data: buf, size: buf.length };
      } catch (error) {
        throw new Error(
          `Invalid data URI: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (!existsSync(input)) {
      throw new Error(`File does not exist: ${input}`);
    }

    try {
      const fileStats = await stat(input);
      const stream = createReadStream(input, {
        highWaterMark: 64 * 1024,
        autoClose: true,
      });

      stream.on("error", () => {
        stream.destroy();
      });

      return { data: stream, size: fileStats.size };
    } catch (error) {
      throw new Error(
        `Failed to read file "${input}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(`Unsupported input type: ${typeof input}`);
}

export async function toDataUri(input: FileInput): Promise<DataUri> {
  if (typeof input === "string" && DATA_URI_REGEX.test(input)) {
    return input as DataUri;
  }

  const processed = await processFile(input);

  // Convert ReadStream to Buffer for DataUri
  let buffer: Buffer;
  if (Buffer.isBuffer(processed.data)) {
    buffer = processed.data;
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of processed.data) {
      chunks.push(chunk);
    }
    buffer = Buffer.concat(chunks);
  }

  return `data:${processed.contentType};base64,${buffer.toString("base64")}`;
}

export async function processFile(input: FileInput): Promise<FileAsset> {
  let filename = "file.bin";
  if (typeof input === "string") {
    const dataUriMatch = input.match(DATA_URI_REGEX);
    if (dataUriMatch) {
      const mimeType = dataUriMatch[1] as string;
      filename = `file.${EXTENSION_MAP.get(mimeType) || "bin"}`;
    } else {
      filename = basename(input) || filename;
    }
  }

  const contentType =
    MIME_TYPES.get(filename.toLowerCase().match(/\.[^.]*$/)?.[0] || "") ||
    "application/octet-stream";
  const { data, size } = await toBuffer(input);
  return { data, filename, contentType, size };
}

export async function createFormData(
  files: FileInput | FileInput[],
  payloadJson?: string,
): Promise<FormData> {
  const filesArray = Array.isArray(files) ? files : [files];

  validateFileCount(filesArray);

  const form = new FormData();

  for (let i = 0; i < filesArray.length; i++) {
    const processed = await processFile(filesArray[i] as FileInput);

    if (processed.size !== null) {
      validateFileSize(processed.size);
    }

    const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;

    // Handle Buffer vs ReadStream
    if (Buffer.isBuffer(processed.data)) {
      const blob = new Blob([processed.data], { type: processed.contentType });
      form.append(fieldName, blob, processed.filename);
    } else {
      // Convert ReadStream to Buffer
      const chunks: Buffer[] = [];
      for await (const chunk of processed.data) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const blob = new Blob([buffer], { type: processed.contentType });
      form.append(fieldName, blob, processed.filename);
    }
  }

  if (payloadJson) {
    form.append("payload_json", payloadJson);
  }

  return form;
}

export function validateFileCount(files: FileInput[]): void {
  if (files.length > MAX_FILE_COUNT) {
    throw new Error(`Too many files: ${files.length} (max: ${MAX_FILE_COUNT})`);
  }
}

export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${size} bytes (max: ${MAX_FILE_SIZE})`);
  }
}
