import type { Dispatcher } from "undici";
import type { FileInput } from "../handlers/index.js";

/**
 * Response from an HTTP request with parsed data
 */
export interface HttpResponse<T = unknown> {
  /** Parsed response data */
  data: T;

  /** HTTP status code */
  statusCode: number;

  /** Normalized response headers */
  headers: Record<string, string>;
}

/**
 * Prepared request data ready to be sent
 */
export interface ParsedRequest {
  /** Fully constructed URL */
  url: URL;

  /** Request options for undici */
  options: Dispatcher.RequestOptions;
}

/**
 * Extended request options for Discord API
 */
export interface ApiRequestOptions extends Dispatcher.RequestOptions {
  /** Files to upload with the request */
  files?: FileInput | FileInput[];

  /** Audit log reason for the action (goes into x-audit-log-reason header) */
  reason?: string;
}
