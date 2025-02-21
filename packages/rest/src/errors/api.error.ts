import { BaseApiError, type BaseApiErrorContext } from "../base/index.js";

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

export interface ApiErrorJson {
  name: string;
  message: string;
  context: BaseApiErrorContext & {
    code: number;
    errors?: Record<string, { _errors: JsonErrorField[] }>;
  };
}

export class ApiError extends BaseApiError {
  readonly code: number;
  readonly errors?: Record<string, { _errors: JsonErrorField[] }>;

  constructor(
    error: JsonErrorResponse,
    status: number,
    headers: Record<string, unknown>,
    method: string,
    path: string,
  ) {
    super(error.message, {
      statusCode: status,
      method,
      path,
      headers,
    });
    this.code = error.code;
    this.errors = error.errors;
  }

  toJson(): ApiErrorJson {
    return {
      name: this.name,
      message: this.message,
      context: {
        ...this.context,
        code: this.code,
        errors: this.errors,
      },
    };
  }

  override toString(): string {
    const baseMessage = super.toString();

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
