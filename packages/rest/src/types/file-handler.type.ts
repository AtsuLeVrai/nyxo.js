export type FileType = File | string;

export interface FileInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
