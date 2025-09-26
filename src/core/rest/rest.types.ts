import type { ReadStream } from "node:fs";
import type { HttpResponseCodes, JsonErrorCodes } from "../../resources/index.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | DataUri;

export interface FileAsset {
  data: Buffer | ReadStream;
  filename: string;
  contentType: string;
  size: number | null;
}

export interface HttpRequestOptions {
  path: string;
  method: HttpMethod;
  body?: string | Buffer;
  headers?: Record<string, string>;
  query?: object;
  files?: FileInput | FileInput[];
  reason?: string;
}

export interface HttpResponse<T> {
  statusCode: HttpResponseCodes;
  headers: Record<string, string>;
  data: T;
  reason?: string;
}

export interface ApiErrorDetail {
  code: JsonErrorCodes;
  message: string;
}

export interface ApiErrorStructure {
  _errors?: ApiErrorDetail[];
  [key: string]: ApiErrorStructure | ApiErrorDetail[] | undefined;
}

export interface ApiErrorResponse {
  code: JsonErrorCodes;
  message: string;
  errors?: ApiErrorStructure;
}
