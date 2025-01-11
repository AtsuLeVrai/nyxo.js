export enum CompressionErrorCode {
  NotInitialized = "NOT_INITIALIZED",
  InitializationFailed = "INITIALIZATION_FAILED",
  InvalidChunkSize = "INVALID_CHUNK_SIZE",
  MemoryLimitExceeded = "MEMORY_LIMIT_EXCEEDED",
  MaxChunksExceeded = "MAX_CHUNKS_EXCEEDED",
  DecompressionFailed = "DECOMPRESSION_FAILED",
  ValidationError = "VALIDATION_ERROR",
}

export class CompressionError extends Error {
  readonly code: CompressionErrorCode;

  constructor(code: CompressionErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "CompressionError";
    this.code = code;
    this.cause = cause;
  }

  static notInitialized(): CompressionError {
    return new CompressionError(
      CompressionErrorCode.NotInitialized,
      "Compression service not initialized",
    );
  }

  static initializationFailed(type: string, cause?: unknown): CompressionError {
    return new CompressionError(
      CompressionErrorCode.InitializationFailed,
      `${type} initialization failed`,
      cause,
    );
  }

  static invalidChunkSize(size: number, maxSize: number): CompressionError {
    return new CompressionError(
      CompressionErrorCode.InvalidChunkSize,
      `Chunk size exceeds maximum: ${size} > ${maxSize}`,
    );
  }

  static memoryLimitExceeded(current: number, max: number): CompressionError {
    return new CompressionError(
      CompressionErrorCode.MemoryLimitExceeded,
      `Memory limit exceeded: ${current} > ${max}`,
    );
  }

  static maxChunksExceeded(): CompressionError {
    return new CompressionError(
      CompressionErrorCode.MaxChunksExceeded,
      "Maximum chunks in memory exceeded",
    );
  }

  static decompressionFailed(type: string, cause?: unknown): CompressionError {
    return new CompressionError(
      CompressionErrorCode.DecompressionFailed,
      `${type} decompression failed`,
      cause,
    );
  }

  static validationError(cause: unknown): CompressionError {
    return new CompressionError(
      CompressionErrorCode.ValidationError,
      "Validation error",
      cause,
    );
  }
}
