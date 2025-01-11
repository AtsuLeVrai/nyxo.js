export enum EncodingErrorCode {
  ValidationError = "VALIDATION_ERROR",
  PayloadSizeExceeded = "PAYLOAD_SIZE_EXCEEDED",
  InvalidEtfKeys = "INVALID_ETF_KEYS",
  EncodingError = "ENCODING_ERROR",
  DecodingError = "DECODING_ERROR",
}

export class EncodingError extends Error {
  readonly code: EncodingErrorCode;

  constructor(code: EncodingErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "EncodingError";
    this.code = code;
    this.cause = cause;
  }

  static validationError(cause: unknown): EncodingError {
    return new EncodingError(
      EncodingErrorCode.ValidationError,
      "Options validation error",
      cause,
    );
  }

  static payloadSizeExceeded(size: number, maxSize: number): EncodingError {
    return new EncodingError(
      EncodingErrorCode.PayloadSizeExceeded,
      `Payload size ${size} bytes exceeds maximum ${maxSize} bytes`,
    );
  }

  static invalidEtfKeys(key: string): EncodingError {
    return new EncodingError(
      EncodingErrorCode.InvalidEtfKeys,
      `Invalid ETF key: ${key} is not a string`,
    );
  }

  static encodingError(type: string, cause?: unknown): EncodingError {
    return new EncodingError(
      EncodingErrorCode.EncodingError,
      `Error encoding ${type}`,
      cause,
    );
  }

  static decodingError(type: string, cause?: unknown): EncodingError {
    return new EncodingError(
      EncodingErrorCode.DecodingError,
      `Error decoding ${type}`,
      cause,
    );
  }
}
