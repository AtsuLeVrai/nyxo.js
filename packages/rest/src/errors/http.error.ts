import type { HttpStatusCode } from "../types/index.js";
import { RestBaseError } from "./rest.error.js";

export class RestHttpError extends RestBaseError {
  readonly status: HttpStatusCode;
  readonly method?: string;
  readonly url?: string;

  constructor(
    status: HttpStatusCode,
    message: string,
    method?: string,
    url?: string,
  ) {
    super(message);
    this.name = "RestHttpError";
    this.status = status;
    this.method = method;
    this.url = url;
  }

  override toString(): string {
    return `${this.name}[${this.status}]: ${this.message}`;
  }
}

export function isRestHttpError(error: unknown): error is RestHttpError {
  return error instanceof RestHttpError;
}
