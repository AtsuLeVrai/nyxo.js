import { type Dispatcher, request } from "undici";
import type { Rest } from "../core/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import type { RestOptions } from "../options/index.js";
import type { RequestOptions } from "../types/index.js";

export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
}

interface ParsedRequest {
  url: URL;
  options: Dispatcher.RequestOptions;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly headers: Record<string, string>;

  constructor(
    message: string,
    statusCode: number,
    headers: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

// Regex for cleaning leading slashes from paths
const PATH_REGEX = /^\/+/;

export class HttpService {
  readonly #rest: Rest;
  readonly #options: RestOptions;

  constructor(rest: Rest, options: RestOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Performs an HTTP request with the given options and returns the response
   * Handles request preparation, execution, and response processing
   * Emits request and error events for monitoring
   */
  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const requestStart = Date.now();
    let responseBody: Buffer | null = null;

    try {
      // Prepare the request with all necessary headers and configurations
      const preparedRequest = await this.#prepareRequest(options);

      // Execute the HTTP request
      const response = await request(preparedRequest.options);

      // Read and process the response body
      responseBody = await this.#readResponseBody(response);

      // Process the response and create the result object
      const result = this.#processResponse<T>(response, responseBody);

      // Calculate request duration and emit success event
      const requestDuration = Date.now() - requestStart;
      this.#emitRequestMetrics(
        options,
        response,
        result.headers,
        requestDuration,
      );

      return result;
    } catch (error) {
      // Handle and emit any errors that occurred during the request
      this.#handleRequestError(error, options, requestStart);
      throw error;
    }
  }

  // Prepares the request by building the URL and setting up request options
  #prepareRequest(
    options: RequestOptions,
  ): Promise<ParsedRequest> | ParsedRequest {
    const url = this.#buildUrl(options.path);
    const baseOptions = this.#buildBaseRequestOptions(options, url);

    // Handle file uploads separately due to different content type and body format
    if (options.files) {
      return this.#handleFileUpload(options, baseOptions);
    }

    // Process request body if present
    if (options.body) {
      baseOptions.body = this.#serializeRequestBody(options.body);
    }

    return { url, options: baseOptions };
  }

  // Builds the complete URL for the request
  #buildUrl(path: string): URL {
    const cleanPath = path.replace(PATH_REGEX, "");
    return new URL(
      `/api/v${this.#options.version}/${cleanPath}`,
      this.#options.baseUrl,
    );
  }

  // Creates the base request options with common headers and settings
  #buildBaseRequestOptions(
    options: RequestOptions,
    url: URL,
  ): Dispatcher.RequestOptions {
    const requestOptions: Dispatcher.RequestOptions = {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: this.#buildRequestHeaders(options),
    };

    // Add audit log reason if provided
    if (options.reason && requestOptions.headers) {
      (requestOptions.headers as Record<string, string>)["x-audit-log-reason"] =
        encodeURIComponent(options.reason);
    }

    return requestOptions;
  }

  // Builds the complete set of request headers
  #buildRequestHeaders(options: RequestOptions): Record<string, string> {
    return {
      authorization: `Bot ${this.#options.token}`,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
      "user-agent": this.#options.userAgent,
      ...HeaderHandler.parse(options.headers).headers,
    };
  }

  // Handles file upload requests by creating multipart form data
  async #handleFileUpload(
    options: RequestOptions,
    baseOptions: Dispatcher.RequestOptions,
  ): Promise<ParsedRequest> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    const formData = await FileHandler.createFormData(
      options.files,
      options.body,
    );

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
    };
  }

  // Safely reads the response body, handling empty responses
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

  // Processes the response and creates the final response object
  #processResponse<T>(
    response: Dispatcher.ResponseData,
    bodyContent: Buffer,
  ): HttpResponse<T> {
    const headers = HeaderHandler.parse(response.headers).headers;

    // Handle empty responses (HTTP 204)
    if (response.statusCode === 204) {
      return { data: {} as T, statusCode: response.statusCode, headers };
    }

    // Parse and validate JSON response
    const data = this.#parseResponseBody<T>(
      bodyContent,
      response.statusCode,
      headers,
    );
    return { data, statusCode: response.statusCode, headers };
  }

  // Serializes the request body to JSON if needed
  #serializeRequestBody(body: unknown): string {
    return typeof body === "string" ? body : JSON.stringify(body);
  }

  // Parses the response body and handles parsing errors
  #parseResponseBody<T>(
    bodyContent: Buffer,
    statusCode: number,
    headers: Record<string, string>,
  ): T {
    if (bodyContent.length === 0) {
      return {} as T;
    }

    try {
      return JSON.parse(bodyContent.toString()) as T;
    } catch {
      throw new HttpError("Invalid JSON response", statusCode, headers);
    }
  }

  // Emits request metrics for monitoring
  #emitRequestMetrics(
    options: RequestOptions,
    response: Dispatcher.ResponseData,
    headers: Record<string, string>,
    duration: number,
  ): void {
    this.#rest.emit("request", {
      path: options.path,
      method: options.method,
      statusCode: response.statusCode,
      headers,
      latency: duration,
      timestamp: Date.now(),
    });
  }

  // Handles and emits request errors
  #handleRequestError(
    error: unknown,
    options: RequestOptions,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;
    this.#rest.emit(
      "error",
      error instanceof Error ? error : new Error(String(error)),
      {
        path: options.path,
        method: options.method,
        duration,
        error,
      },
    );
  }
}
