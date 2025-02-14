import type { RateLimitScope } from "./managers.type.js";

export interface RequestErrorJson {
  name: string;
  message: string;
  statusCode: number;
  path?: string;
  method?: string;
}

export interface RateLimitErrorContext {
  method: string;
  path: string;
  scope: RateLimitScope;
  retryAfter: number;
  global?: boolean;
  bucketHash?: string;
  attempts?: number;
}

export interface RateLimitErrorJson {
  name: string;
  message: string;
  code: number;
  context: RateLimitErrorContext;
}

export interface JsonErrorField {
  code: string;
  message: string;
  path: string[];
}

/** @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json} */
export interface JsonErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}
