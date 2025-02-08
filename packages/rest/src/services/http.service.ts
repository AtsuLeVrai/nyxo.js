import { type Dispatcher, request } from "undici";
import type { Rest } from "../core/index.js";
import { HttpError } from "../errors/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import type { RestOptions } from "../options/index.js";
import type { ApiRequestOptions } from "../types/index.js";

// Enhanced typings for HTTP responses
export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  duration: number;
}

// Constants
const PATH_REGEX = /^\/+/;

interface ParsedRequest {
  url: URL;
  options: Dispatcher.RequestOptions;
  requestId: string;
}

// Main HTTP Service class
export class HttpService {
  readonly #rest: Rest;
  readonly #options: RestOptions;
  readonly #requestTimeouts: Map<string, NodeJS.Timeout>;

  constructor(rest: Rest, options: RestOptions) {
    this.#rest = rest;
    this.#options = options;
    this.#requestTimeouts = new Map();
  }

  /**
   * Performs an HTTP request with the given options and returns the response
   * Handles request preparation, execution, and response processing
   * Emits request and error events for monitoring
   */
  async request<T>(options: ApiRequestOptions): Promise<HttpResponse<T>> {
    const requestStart = Date.now();
    const requestId = this.#generateRequestId();

    try {
      const preparedRequest = await this.#prepareRequest(options, requestId);
      const response = await request(preparedRequest.options);
      const responseBody = await this.#readResponseBody(response);

      const result = await this.#processResponse<T>(
        response,
        responseBody,
        requestId,
      );

      // Calculate duration and emit metrics
      const duration = Date.now() - requestStart;
      result.duration = duration;

      this.#emitRequestMetrics(options, response, result.headers, {
        requestId,
        duration,
      });

      return result;
    } catch (error) {
      this.#handleRequestError(error, options, requestStart, requestId);
      throw error;
    } finally {
      this.#clearRequestTimeout(requestId);
    }
  }

  /**
   * Prepares the request with enhanced headers and configurations
   */
  #prepareRequest(
    options: ApiRequestOptions,
    requestId: string,
  ): Promise<ParsedRequest> | ParsedRequest {
    const url = this.#buildUrl(options.path);
    const baseOptions = this.#buildBaseRequestOptions(options, url, requestId);

    if (options.files) {
      return this.#handleFileUpload(options, baseOptions);
    }

    if (options.body) {
      baseOptions.body = this.#serializeRequestBody(options.body);
    }

    return { url, options: baseOptions, requestId };
  }

  /**
   * Builds the complete URL for the request
   */
  #buildUrl(path: string): URL {
    const cleanPath = path.replace(PATH_REGEX, "");
    return new URL(
      `/api/v${this.#options.version}/${cleanPath}`,
      this.#options.baseUrl,
    );
  }

  /**
   * Creates base request options with all necessary configurations
   */
  #buildBaseRequestOptions(
    options: ApiRequestOptions,
    url: URL,
    requestId: string,
  ): Dispatcher.RequestOptions {
    return {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: this.#buildRequestHeaders(options, requestId),
    };
  }

  /**
   * Builds enhanced request headers with security and tracking
   */
  #buildRequestHeaders(
    options: ApiRequestOptions,
    requestId: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `Bot ${this.#options.token}`,
      "content-type": "application/json",
      "x-request-id": requestId,
      "x-ratelimit-precision": "millisecond",
      "user-agent": this.#options.userAgent,
      accept: "application/json",
      // "accept-encoding": "gzip, deflate",
      connection: "keep-alive",
      "x-api-version": `v${this.#options.version}`,
      ...HeaderHandler.parse(options.headers).headers,
    };

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

  /**
   * Handles file upload requests
   */
  async #handleFileUpload(
    options: ApiRequestOptions,
    baseOptions: Dispatcher.RequestOptions,
  ): Promise<ParsedRequest> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    const formData = await FileHandler.createFormData(
      options.files,
      options.body,
    );

    const requestId = this.#generateRequestId();
    return {
      url: new URL(baseOptions.path, baseOptions.origin),
      options: {
        ...baseOptions,
        body: formData.getBuffer(),
        headers: {
          ...baseOptions.headers,
          ...formData.getHeaders(),
        },
      },
      requestId,
    };
  }

  /**
   * Safely reads the response body
   */
  async #readResponseBody(response: Dispatcher.ResponseData): Promise<Buffer> {
    try {
      return Buffer.from(await response.body.arrayBuffer());
    } catch (error) {
      if (error instanceof Error && error.message.includes("stream")) {
        return Buffer.alloc(0);
      }
      throw error;
    }
  }

  /**
   * Processes and validates the response
   */
  async #processResponse<T>(
    response: Dispatcher.ResponseData,
    bodyContent: Buffer,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const headers = HeaderHandler.parse(response.headers).headers;

    // Handle error responses
    if (response.statusCode >= 400) {
      const text = await response.body.text();
      throw new HttpError(
        `HTTP ${response.statusCode} ${text}`,
        response.statusCode,
        headers,
        { requestId },
      );
    }

    // Handle empty responses
    if (response.statusCode === 204) {
      return {
        data: {} as T,
        statusCode: response.statusCode,
        headers,
        duration: 0,
      };
    }

    // Parse and return response
    const data = this.#parseResponseBody<T>(
      bodyContent,
      response.statusCode,
      headers,
      requestId,
    );

    return {
      data,
      statusCode: response.statusCode,
      headers,
      duration: 0,
    };
  }

  /**
   * Serializes request body to JSON
   */
  #serializeRequestBody(body: unknown): string {
    try {
      return typeof body === "string" ? body : JSON.stringify(body);
    } catch (error) {
      throw new Error("Failed to serialize request body", {
        cause: error,
      });
    }
  }

  /**
   * Parses response body with error handling
   */
  #parseResponseBody<T>(
    bodyContent: Buffer,
    statusCode: number,
    headers: Record<string, string>,
    requestId: string,
  ): T {
    if (bodyContent.length === 0) {
      return {} as T;
    }

    try {
      return JSON.parse(bodyContent.toString()) as T;
    } catch {
      throw new HttpError("Invalid JSON response", statusCode, headers, {
        requestId,
      });
    }
  }

  /**
   * Emits request metrics for monitoring
   */
  #emitRequestMetrics(
    options: ApiRequestOptions,
    response: Dispatcher.ResponseData,
    headers: Record<string, string>,
    context: {
      requestId: string;
      duration: number;
    },
  ): void {
    this.#rest.emit("request", {
      path: options.path,
      method: options.method,
      statusCode: response.statusCode,
      headers,
      latency: context.duration,
      timestamp: Date.now(),
      requestId: context.requestId,
    });
  }

  /**
   * Enhanced error handling with context
   */
  #handleRequestError(
    error: unknown,
    options: ApiRequestOptions,
    startTime: number,
    requestId: string,
  ): void {
    const duration = Date.now() - startTime;

    if (error instanceof HttpError) {
      error.requestId = requestId;
      error.path = options.path;
      error.method = options.method;
    }

    this.#rest.emit(
      "error",
      error instanceof Error ? error : new Error(String(error)),
      {
        context: {
          requestId,
          path: options.path,
          method: options.method,
          duration,
          timestamp: new Date().toISOString(),
        },
      },
    );
  }

  // Utility methods
  #generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  #clearRequestTimeout(requestId: string): void {
    const timeoutId = this.#requestTimeouts.get(requestId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.#requestTimeouts.delete(requestId);
    }
  }
}
