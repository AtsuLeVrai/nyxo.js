export interface BaseErrorContext {
  timestamp?: number;
  path?: string;
  method?: string;
  retryable?: boolean;
  headers?: Record<string, string>;
}

export interface RestErrorContext extends BaseErrorContext {
  cause?: Error;
  code?: string;
}

export class RestError extends Error {
  readonly context: RestErrorContext;
  readonly timestamp: number;

  constructor(message: string, context: RestErrorContext = {}) {
    super(message);
    this.name = "RestError";
    this.timestamp = Date.now();
    this.context = {
      ...context,
      timestamp: this.timestamp,
    };
  }

  get code(): string | undefined {
    return this.context.code;
  }
}
