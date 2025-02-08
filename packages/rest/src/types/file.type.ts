import type { Readable } from "node:stream";

/**
 * Represents a data URI string
 * @see {@link https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs}
 */
export type DataUri = `data:${string};base64,${string}`;

/**
 * Valid input types for file uploads
 */
export type FileInput = string | Buffer | Readable | File | Blob | DataUri;

/**
 * Represents a processed file ready for upload
 */
export interface ProcessedFile {
  /** File content as a buffer */
  buffer: Buffer;
  /** Name of the file */
  filename: string;
  /** MIME type of the file */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** File content as a data URI */
  dataUri: DataUri;
}
