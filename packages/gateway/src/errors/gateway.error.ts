export enum GatewayErrorCode {
  ValidationError = "VALIDATION_ERROR",
  ConnectionError = "CONNECTION_ERROR",
  AuthenticationFailed = "AUTHENTICATION_FAILED",
  InvalidSession = "INVALID_SESSION",
  InvalidIntents = "INVALID_INTENTS",
  MaxRetriesExceeded = "MAX_RETRIES_EXCEEDED",
  InvalidPayload = "INVALID_PAYLOAD",
  WebsocketError = "WEBSOCKET_ERROR",
  CleanupError = "CLEANUP_ERROR",
  InvalidState = "INVALID_STATE",
  InitializationError = "INITIALIZATION_ERROR",
}

export class GatewayError extends Error {
  readonly code: GatewayErrorCode;
  readonly metadata: Record<string, unknown>;

  constructor(
    code: GatewayErrorCode,
    message: string,
    cause?: unknown,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "GatewayError";
    this.code = code;
    this.cause = cause;
    this.metadata = metadata;
  }

  static validationError(cause: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.ValidationError,
      "Options validation error",
      cause,
    );
  }

  static connectionError(url: string, cause?: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.ConnectionError,
      `Failed to connect to ${url}`,
      cause,
      { url },
    );
  }

  static authenticationFailed(cause?: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.AuthenticationFailed,
      "Authentication failed",
      cause,
    );
  }

  static invalidSession(resumable: boolean): GatewayError {
    return new GatewayError(
      GatewayErrorCode.InvalidSession,
      `Session invalidated${resumable ? " (resumable)" : ""}`,
      undefined,
      { resumable },
    );
  }

  static invalidIntents(intents: number): GatewayError {
    return new GatewayError(
      GatewayErrorCode.InvalidIntents,
      `Invalid intents provided: ${intents}`,
      undefined,
      { intents },
    );
  }

  static maxRetriesExceeded(attempts: number): GatewayError {
    return new GatewayError(
      GatewayErrorCode.MaxRetriesExceeded,
      `Maximum reconnection attempts (${attempts}) reached`,
      undefined,
      { attempts },
    );
  }

  static invalidPayload(opcode: number): GatewayError {
    return new GatewayError(
      GatewayErrorCode.InvalidPayload,
      `Invalid payload with opcode ${opcode}`,
      undefined,
      { opcode },
    );
  }

  static websocketError(code: number, cause?: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.WebsocketError,
      `WebSocket error with code ${code}`,
      cause,
      { code },
    );
  }

  static cleanupError(cause: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.CleanupError,
      "Failed to cleanup resources",
      cause,
    );
  }

  static invalidState(state: string): GatewayError {
    return new GatewayError(
      GatewayErrorCode.InvalidState,
      `Invalid gateway state: ${state}`,
      undefined,
      { state },
    );
  }

  static initializationError(component: string, cause?: unknown): GatewayError {
    return new GatewayError(
      GatewayErrorCode.InitializationError,
      `Failed to initialize ${component}`,
      cause,
      { component },
    );
  }
}
