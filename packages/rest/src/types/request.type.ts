import type { Dispatcher } from "undici";

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
  code: number;
  message: string;
  errors?: Record<string, unknown>;
}

export interface RouteEntity
  extends Omit<Dispatcher.RequestOptions, "origin" | "path" | "headers"> {
  path: PathLike;
  headers?: Record<string, string>;
  files?: FileType | FileType[];
  reason?: string;
}
