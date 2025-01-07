import type { Dispatcher, Pool, ProxyAgent, RetryHandler } from "undici";
import type { JsonErrorCode } from "../constants/index.js";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export type DiscordUserAgent = `DiscordBot (${string}, ${string})`;
/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;
export type PathLike = `/${string}`;
export type FileType = File | string;

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-example-json-error-response}
 */
export interface JsonErrorEntity {
  code: JsonErrorCode;
  message: string;
  errors?: Record<string, unknown>;
}

export interface RouteEntity
  extends Omit<Dispatcher.RequestOptions, "origin" | "path"> {
  path: PathLike;
  files?: FileType | FileType[];
  reason?: string;
}

export interface RestOptions {
  token: string;
  version?: 10;
  userAgent?: DiscordUserAgent;
  proxy?: ProxyAgent.Options;
  pool?: Pool.Options;
  retry?: RetryHandler.RetryOptions;
}

export interface RestEvents {
  globalRateLimit: (
    remaining: number,
    resetTimestamp: number,
    limit: number,
  ) => void;
  request: (
    path: string,
    method: string,
    requestId: string,
    options?: RouteEntity,
  ) => void;
  response: (
    path: string,
    method: string,
    statusCode: number,
    latency: number,
    requestId: string,
  ) => void;
  rateLimit: (
    path: string,
    method: string,
    timeout: number,
    limit: number,
    remaining: number,
  ) => void;
}
