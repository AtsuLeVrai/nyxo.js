export interface FileErrorContext {
  cause?: Error;
  validationError?: boolean;
  processingError?: boolean;
}

export class FileProcessingError extends Error {
  readonly context: FileErrorContext;

  constructor(message: string, context: FileErrorContext = {}) {
    super(message);
    this.name = "FileProcessingError";
    this.context = context;
  }
}
