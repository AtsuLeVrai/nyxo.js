export interface HttpErrorContext {
  timestamp?: number;
  path?: string;
  method?: string;
  retryable?: boolean;
  headers?: Record<string, string>;
  status?: number;
  code?: number;
  errors?: Record<string, unknown>;
  body?: unknown;
  rawBody?: string;
  cause?: Error;
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

  get code(): number | undefined {
    return this.context.code;
  }

  get headers(): Record<string, string> | undefined {
    return this.context.headers;
  }

  get errors(): Record<string, unknown> | undefined {
    return this.context.errors;
  }

  #isRetryableStatus(status?: number): boolean {
    if (!status) {
      return false;
    }
    return (status >= 500 && status < 600) || [408, 429].includes(status);
  }
}
