import type { BaseErrorContext } from "./rest.errors.js";

export interface HttpErrorContext extends BaseErrorContext {
  cause?: Error;
  status?: number;
  rawBody?: string;
  body?: unknown;
}

export class HttpError extends Error {
  readonly context: HttpErrorContext;
  readonly timestamp: number;

  constructor(message: string, context: HttpErrorContext = {}) {
    super(message);
    this.name = "HttpError";
    this.timestamp = Date.now();
    this.context = {
      ...context,
      timestamp: this.timestamp,
      retryable: context.retryable ?? this.#isRetryableStatus(context.status),
    };
  }

  get retryable(): boolean {
    return this.context.retryable ?? false;
  }

  get status(): number | undefined {
    return this.context.status;
  }

  get headers(): Record<string, string> | undefined {
    return this.context.headers;
  }

  get path(): string | undefined {
    return this.context.path;
  }

  get method(): string | undefined {
    return this.context.method;
  }

  #isRetryableStatus(status?: number): boolean {
    if (!status) {
      return false;
    }

    return (status >= 500 && status < 600) || [408, 429].includes(status);
  }
}

export interface ApiErrorContext extends BaseErrorContext {
  message: string;
  code: number;
  status: number;
  errors?: Record<string, unknown>;
  body?: unknown;
}

export class ApiError extends Error {
  readonly context: ApiErrorContext;
  readonly timestamp: number;

  constructor(context: ApiErrorContext) {
    super(context.message);
    this.name = "ApiError";
    this.timestamp = Date.now();

    this.context = {
      ...context,
      timestamp: this.timestamp,
    };
  }

  get code(): number {
    return this.context.code;
  }

  get status(): number {
    return this.context.status;
  }

  get headers(): Record<string, string> | undefined {
    return this.context.headers;
  }

  get retryable(): boolean {
    return this.context.retryable ?? false;
  }

  get errors(): Record<string, unknown> | undefined {
    return this.context.errors;
  }
}
