import type { ApiVersion } from "@nyxjs/core";
import type { Dispatcher } from "undici";
import type {
  AuthTypeFlag,
  HttpMethodFlag,
  JsonErrorCode,
} from "../utils/index.js";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;
export type PathLike = `/${string}`;
export type FileEntity = File | string;
export type DiscordUserAgent = `DiscordBot (${string}, ${string})`;
export type RateLimitScope = "user" | "global" | "shared";

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

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#header-format-rate-limit-header-examples}
 */
export interface RateLimitEntity {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  global: boolean;
  scope: RateLimitScope;
}

export interface RouteEntity
  extends Omit<
    Dispatcher.RequestOptions,
    "origin" | "path" | "method" | "headers"
  > {
  method: HttpMethodFlag;
  path: PathLike;
  headers?: Record<string, string>;
  files?: FileEntity | FileEntity[];
  reason?: string;
}

export interface RestOptionsEntity {
  token: string;
  version: ApiVersion.V10;
  authType: AuthTypeFlag;
  userAgent?: DiscordUserAgent;
  compress?: boolean;
}

export interface RestEventMap {
  debug: [message: string];
  warn: [message: string];
  error: [error: Error];
  apiRequest: [ApiRequestEventData];
  rateLimitHit: [RateLimitHitEventData];
}

export interface ApiRequestEventData {
  method: HttpMethodFlag;
  path: string;
  status: number;
  responseTime: number;
}

export interface RateLimitHitEventData {
  bucket: string;
  resetAfter: number;
  limit: number;
  scope: RateLimitScope;
}

export interface BatchRequestOptions<T> {
  requests: Array<{
    method: HttpMethodFlag;
    path: PathLike;
    options?: Omit<RouteEntity, "method" | "path">;
  }>;
  concurrency?: number;
  abortOnError?: boolean;
  onProgress?: (completed: number, total: number, result?: T) => void;
}

export interface BatchRequestResult<T> {
  results: (T | Error)[];
  successful: T[];
  failed: Error[];
  timings: {
    total: number;
    average: number;
    fastest: number;
    slowest: number;
  };
}
