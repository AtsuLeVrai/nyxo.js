export interface JsonErrorField {
  code: string;
  message: string;
  path: string[];
}

export interface JsonErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

export interface ApiErrorContext {
  statusCode: number;
  path?: string;
  method?: string;
  headers?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly requestId: string;
  readonly statusCode: number;
  readonly path?: string;
  readonly method?: string;
  readonly timestamp: string;
  readonly code: number;
  readonly errors?: Record<string, { _errors: JsonErrorField[] }>;

  constructor(
    requestId: string,
    jsonError: JsonErrorResponse,
    context: ApiErrorContext,
  ) {
    super(jsonError.message);
    this.name = this.constructor.name;
    this.requestId = requestId;
    this.statusCode = context.statusCode;
    this.path = context.path;
    this.method = context.method;
    this.timestamp = new Date().toISOString();
    this.code = jsonError.code;
    this.errors = jsonError.errors;
  }

  toJson(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      requestId: this.requestId,
      statusCode: this.statusCode,
      path: this.path,
      method: this.method,
      timestamp: this.timestamp,
      code: this.code,
      errors: this.errors,
    };
  }

  override toString(): string {
    const baseMessage = `${this.name}: [${this.requestId}] ${this.message} (${this.method} ${this.path})`;

    if (!this.errors) {
      return baseMessage;
    }

    const fieldErrors = Object.entries(this.errors)
      .map(
        ([field, { _errors }]) =>
          `${field}: ${_errors.map((e) => e.message).join(", ")}`,
      )
      .join("\n");

    return `${baseMessage}\nField Errors:\n${fieldErrors}`;
  }
}
