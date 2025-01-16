export interface HttpErrorContext {
  cause?: Error;
  path?: string;
  method?: string;
  status?: number;
}

export class HttpError extends Error {
  readonly context: HttpErrorContext;

  constructor(message: string, context: HttpErrorContext = {}) {
    super(message);
    this.name = "HttpError";
    this.context = context;
  }
}

export interface ApiErrorContext {
  message: string;
  code: number;
  status: number;
  errors?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly context: ApiErrorContext;

  constructor(context: ApiErrorContext) {
    super(context.message);
    this.name = "ApiError";
    this.context = context;
  }
}
