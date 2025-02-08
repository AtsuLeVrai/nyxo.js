import type { JsonErrorField, JsonErrorResponse } from "../types/index.js";

export class ApiError extends Error {
  readonly code: number;
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly errors?: Record<string, { _errors: JsonErrorField[] }>;

  constructor(
    error: JsonErrorResponse,
    status: number,
    method: string,
    url: string,
  ) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.status = status;
    this.method = method;
    this.url = url;
    this.errors = error.errors;
  }

  override toString(): string {
    const baseMessage = `${this.name}[${this.code}]: ${this.message} (${this.method} ${this.url})`;
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
