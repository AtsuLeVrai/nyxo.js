import type { Readable } from "node:stream";
import type { FileInput } from "../handlers/index.js";

/**
 * Supported HTTP methods for API requests.
 * Defines the standard methods that can be used when making HTTP requests.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Configuration options for an HTTP request.
 * Contains all parameters needed to construct and send an API request.
 */
export interface HttpRequestOptions {
  /**
   * API path to request.
   * Should not include the base URL. Example: "/users/123".
   */
  path: string;

  /**
   * HTTP method to use for the request.
   * Determines how the request interacts with the server resource.
   */
  method: HttpMethod;

  /**
   * Request body data.
   * Can be a string, Buffer, or Readable stream.
   */
  body?: string | Buffer | Readable;

  /**
   * Request headers as key-value pairs.
   * Example: { "Content-Type": "application/json" }
   */
  headers?: Record<string, string>;

  /**
   * Query parameters to append to the URL.
   * Will be converted to a query string and appended to the path.
   */
  query?: object;

  /**
   * Files to upload with the request.
   * Can be a single file or an array of files.
   */
  files?: FileInput | FileInput[];

  /**
   * Audit log reason for the action.
   * Will be sent in the x-audit-log-reason header.
   */
  reason?: string;
}

/**
 * Structured response from an HTTP request with parsed data.
 * Provides a unified format for handling API responses.
 *
 * @template T - Type of the parsed response data
 */
export interface HttpResponse<T> {
  /**
   * HTTP status code returned by the server.
   * Standard codes as defined in the HTTP specification.
   */
  statusCode: number;

  /**
   * Normalized response headers as key-value pairs.
   * Header names are converted to lowercase.
   */
  headers: Record<string, string>;

  /**
   * Parsed response data.
   * Type depends on the generic parameter T.
   */
  data: T;

  /**
   * Reason for the response, if provided by the server.
   * May contain additional context about the response.
   */
  reason?: string;
}
