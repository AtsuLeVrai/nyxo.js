import type { Readable } from "node:stream";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type DataUri = `data:${string};base64,${string}`;
export type FileInput =
  | string
  | File
  | Buffer
  | DataUri
  | URL
  | Readable
  | Blob
  | ArrayBuffer
  | Uint8Array
  | ReadableStream;

export interface ProcessedFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  dataUri?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  validateImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  embedImage?: boolean;
}
