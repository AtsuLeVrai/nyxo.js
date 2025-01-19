export interface FileErrorContext {
  cause?: Error;
  validationError?: boolean;
  processingError?: boolean;
}

export class FileError extends Error {
  readonly context: FileErrorContext;

  constructor(message: string, context: FileErrorContext = {}) {
    super(message);
    this.name = "FileError";
    this.context = context;
  }
}
