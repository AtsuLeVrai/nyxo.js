import type { ApiVersion } from "@nyxjs/core";
import type { Dispatcher } from "undici";
import type { AuthType, HttpMethod, JsonErrorCode } from "../utils/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export interface RateLimitResponseEntity {
  message: string;
  retry_after: number;
  global: boolean;
  code?: JsonErrorCode;
}

export interface JsonErrorResponse {
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
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;

export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  global: boolean;
  scope: "user" | "global" | "shared";
}

export type PathLike = `/${string}`;
export type FileType = File | string;

export interface RequestOptions
  extends Omit<
    Dispatcher.RequestOptions,
    "origin" | "path" | "method" | "headers"
  > {
  method: HttpMethod;
  path: PathLike;
  headers?: Record<string, string>;
  files?: FileType | FileType[];
  reason?: string;
}

export type DiscordUserAgent = `DiscordBot (${string}, ${string})`;

export interface RestOptions {
  token: string;
  version: ApiVersion;
  authType: AuthType;
  userAgent?: DiscordUserAgent;
  compress?: boolean;
}
