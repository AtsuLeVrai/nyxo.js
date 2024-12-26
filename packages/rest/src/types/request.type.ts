import type { Dispatcher } from "undici";
import type { FileType } from "./file-handler.type.js";
import type { HttpMethodFlag, JsonErrorCode } from "./rest.type.js";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;
export type PathLike = `/${string}`;

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export interface RateLimitResponseEntity {
  message: string;
  retry_after: number;
  global: boolean;
  code?: JsonErrorCode;
}

export interface JsonErrorEntity {
  code: number;
  message: string;
  errors?: Record<string, unknown>;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-example-json-error-response}
 */
export interface JsonErrorResponseEntity {
  code: JsonErrorCode;
  message: string;
}

export interface RouteEntity
  extends Omit<
    Dispatcher.RequestOptions,
    "origin" | "path" | "method" | "headers"
  > {
  method: HttpMethodFlag;
  path: PathLike;
  headers?: Record<string, string>;
  files?: FileType | FileType[];
  reason?: string;
}
