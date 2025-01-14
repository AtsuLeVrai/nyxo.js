/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type DataUriImageData = `data:${string};base64,${string}`;

export type FileType = string | File | Buffer | DataUriImageData | URL;

export interface FileData {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
  dataUri?: string;
}

export interface FileValidationOptions {
  maxSizeBytes: number;
  allowedTypes: string[];
  allowedExtensions: string[];
  validateImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}
