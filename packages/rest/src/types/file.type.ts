import type { Readable } from "node:stream";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | Readable | File | Blob | DataUri;

export interface ProcessedFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  dataUri: string;
}
