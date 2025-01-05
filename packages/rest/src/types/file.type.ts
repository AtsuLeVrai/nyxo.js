export interface FileData {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}
