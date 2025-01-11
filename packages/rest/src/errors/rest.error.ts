import type { HttpStatusCode, JsonErrorCode } from "../types/index.js";

export class RestBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RestBaseError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RestApiError extends RestBaseError {
  readonly code: JsonErrorCode;
  readonly status: HttpStatusCode;
  readonly errors?: Record<string, unknown>;
  readonly method?: string;
  readonly url?: string;

  constructor(
    code: JsonErrorCode,
    status: HttpStatusCode,
    message: string,
    errors?: Record<string, unknown>,
    method?: string,
    url?: string,
  ) {
    super(message);
    this.name = "RestApiError";
    this.code = code;
    this.status = status;
    this.errors = errors;
    this.method = method;
    this.url = url;
  }

  override toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }
}

export function isRestApiError(error: unknown): error is RestApiError {
  return error instanceof RestApiError;
}
