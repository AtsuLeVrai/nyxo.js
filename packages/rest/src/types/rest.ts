import type { ApiVersion, Integer } from "@nyxjs/core";
import type { Dispatcher, Pool, RetryHandler } from "undici";
import type { AuthType, HttpMethod, JsonErrorCode } from "../enums/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export interface RateLimitResponseEntity {
  message: string;
  retry_after: number;
  global: boolean;
  code?: JsonErrorCode;
}

export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  global: boolean;
  scope: "user" | "global" | "shared";
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-example-json-error-response}
 */
export interface JsonErrorResponseEntity {
  code: JsonErrorCode;
  message: string;
}

export type RouteLike = `/${string}`;

export interface RequestOptions {
  method: HttpMethod;
  path: RouteLike;
  body?: Dispatcher.DispatchOptions["body"];
  headers?: Record<string, string>;
  query?: unknown;
  reason?: string;
}

export interface RestOptions {
  token: string;
  version: ApiVersion;
  authType: AuthType;
  userAgent?: `DiscordBot (${string}, ${string})`;
  pool?: Partial<Pool.Options>;
  retry?: Partial<RetryHandler.RetryOptions>;
  retries?: Integer;
  timeout?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;
