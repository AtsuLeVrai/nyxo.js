import type { RequestErrorJson } from "../types/index.js";

export class RequestError extends Error {
  statusCode: number;
  headers: Record<string, string>;
  path?: string;
  method?: string;

  constructor(
    message: string,
    statusCode: number,
    headers: Record<string, string>,
    options?: {
      path?: string;
      method?: string;
    },
  ) {
    super(message);
    this.name = "RequestError";
    this.statusCode = statusCode;
    this.headers = headers;
    this.path = options?.path;
    this.method = options?.method;
  }

  toJson(): RequestErrorJson {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      path: this.path,
      method: this.method,
    };
  }
}
