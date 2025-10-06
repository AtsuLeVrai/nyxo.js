import { createReadStream, existsSync, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename } from "node:path";

/**
 * Data URI string format for base64-encoded file content with MIME type.
 * Used for embedding file data directly in API requests without separate uploads.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs} for data URI specification
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Flexible file input types supporting various file sources for Discord API uploads.
 * Accepts file paths, binary data, or data URI strings for maximum compatibility.
 */
export type FileInput = string | Buffer | DataUri;

/**
 * Processed file representation ready for Discord API submission.
 * Contains file data, metadata, and content type information for upload operations.
 */
export interface FileAsset {
  /** File content as Buffer or ReadStream for efficient memory usage */
  readonly data: Buffer | ReadStream;
  /** Original or derived filename for the uploaded file */
  readonly filename: string;
  /** MIME type for proper content handling by Discord */
  readonly contentType: string;
  /** File size in bytes (null if size cannot be determined) */
  readonly size: number | null;
}

/**
 * Maximum number of files allowed in a single Discord API request.
 * Enforced to prevent request size limits and API abuse.
 *
 * @see {@link https://discord.com/developers/docs/reference#uploading-files} for Discord file upload limits
 */
export const MAX_FILE_COUNT = 10 as const;

/**
 * Maximum individual file size in bytes (10MB) for Discord uploads.
 * Larger files will be rejected to maintain API performance and storage limits.
 *
 * @see {@link https://discord.com/developers/docs/reference#uploading-files} for Discord file size limits
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Regular expression for parsing data URI format strings */
const DATA_URI_REGEX = /^data:(.+);base64,(.*)$/;

/**
 * MIME type mappings for common file extensions.
 * Used to determine appropriate Content-Type headers for file uploads.
 */
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

/**
 * File extension mappings for MIME types.
 * Used to generate appropriate filenames from content type information.
 */
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

/**
 * Converts various file input types to Buffer or ReadStream with size information.
 * Handles file paths, existing buffers, and data URIs efficiently.
 *
 * @param input - File input in any supported format
 * @returns Object containing file data and size information
 * @throws {Error} When file doesn't exist, is unreadable, or data URI is invalid
 */
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

/**
 * Converts any file input to a base64 data URI string.
 * Useful for embedding files directly in JSON payloads or storing file data.
 *
 * @param input - File input to convert to data URI
 * @returns Promise resolving to data URI string with MIME type and base64 data
 * @throws {Error} When file processing or base64 encoding fails
 */
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

/**
 * Processes file input into a complete FileAsset with metadata and content type detection.
 * Determines appropriate MIME types, filenames, and prepares data for API submission.
 *
 * @param input - Raw file input to process
 * @returns Promise resolving to FileAsset with complete file information
 * @throws {Error} When file processing or type detection fails
 */
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

/**
 * Creates FormData suitable for Discord API multipart file uploads.
 * Handles multiple files and optional JSON payload for webhook and attachment endpoints.
 *
 * @param files - Single file or array of files to include in the form
 * @param payloadJson - Optional JSON string to include as payload_json field
 * @returns Promise resolving to FormData ready for HTTP submission
 * @throws {Error} When file count or size limits are exceeded
 * @see {@link https://discord.com/developers/docs/reference#uploading-files} for Discord upload format
 */
export async function createFormData(
  files: FileInput | FileInput[],
  payloadJson?: string,
): Promise<FormData> {
  const filesArray = Array.isArray(files) ? files : [files];

  if (files.length > MAX_FILE_COUNT) {
    throw new Error(`Too many files: ${files.length} (max: ${MAX_FILE_COUNT})`);
  }

  const form = new FormData();

  for (let i = 0; i < filesArray.length; i++) {
    const processed = await processFile(filesArray[i] as FileInput);

    if (processed.size !== null && processed.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${processed.size} bytes (max: ${MAX_FILE_SIZE})`);
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
