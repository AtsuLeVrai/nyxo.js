import { type Dispatcher, request } from "undici";
import type { Rest } from "../core/index.js";
import { RequestError } from "../errors/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import type { RestOptions } from "../options/index.js";
import type {
  ApiRequestOptions,
  ParsedRequest,
  RequestResponse,
} from "../types/index.js";

const PATH_REGEX = /^\/+/;

export class RequestManager {
  readonly #rest: Rest;
  readonly #options: RestOptions;

  constructor(rest: Rest, options: RestOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  async request<T>(options: ApiRequestOptions): Promise<RequestResponse<T>> {
    const requestStart = Date.now();

    try {
      const preparedRequest = await this.#prepareRequest(options);
      const response = await request(preparedRequest.options);
      const responseBody = await this.#readResponseBody(response);

      const result = await this.#processResponse<T>(response, responseBody);

      const duration = Date.now() - requestStart;
      result.duration = duration;

      this.#rest.emit("requestFinish", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        headers: result.headers,
        latency: duration,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      this.#handleRequestError(error, options, requestStart);
      throw error;
    }
  }

  #prepareRequest(
    options: ApiRequestOptions,
  ): Promise<ParsedRequest> | ParsedRequest {
    const url = this.#buildUrl(options.path);
    const baseOptions = this.#buildBaseRequestOptions(options, url);

    if (options.files) {
      return this.#handleFileUpload(options, baseOptions);
    }

    if (options.body) {
      baseOptions.body = this.#serializeRequestBody(options.body);
    }

    return { url, options: baseOptions };
  }

  #buildUrl(path: string): URL {
    const cleanPath = path.replace(PATH_REGEX, "");
    return new URL(
      `/api/v${this.#options.version}/${cleanPath}`,
      this.#options.baseUrl,
    );
  }

  #buildBaseRequestOptions(
    options: ApiRequestOptions,
    url: URL,
  ): Dispatcher.RequestOptions {
    return {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: this.#buildRequestHeaders(options),
    };
  }

  #buildRequestHeaders(options: ApiRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
      "user-agent": this.#options.userAgent,
      accept: "application/json",
      connection: "keep-alive",
      "x-api-version": `v${this.#options.version}`,
      ...HeaderHandler.parse(options.headers).headers,
    };

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

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

  async #processResponse<T>(
    response: Dispatcher.ResponseData,
    bodyContent: Buffer,
  ): Promise<RequestResponse<T>> {
    const headers = HeaderHandler.parse(response.headers).headers;

    if (response.statusCode >= 400) {
      const text = await response.body.text();
      throw new RequestError(
        `HTTP ${response.statusCode} ${text}`,
        response.statusCode,
        headers,
      );
    }

    if (response.statusCode === 204) {
      return {
        data: {} as T,
        statusCode: response.statusCode,
        headers,
        duration: 0,
      };
    }

    const data = this.#parseResponseBody<T>(
      bodyContent,
      response.statusCode,
      headers,
    );

    return {
      data,
      statusCode: response.statusCode,
      headers,
      duration: 0,
    };
  }

  #serializeRequestBody(body: unknown): string {
    try {
      return typeof body === "string" ? body : JSON.stringify(body);
    } catch (error) {
      throw new Error("Failed to serialize request body", {
        cause: error,
      });
    }
  }

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
      throw new RequestError("Invalid JSON response", statusCode, headers);
    }
  }

  #handleRequestError(
    error: unknown,
    options: ApiRequestOptions,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;

    if (error instanceof RequestError) {
      error.path = options.path;
      error.method = options.method;
    }

    this.#rest.emit(
      "error",
      error instanceof Error ? error : new Error(String(error)),
      {
        context: {
          path: options.path,
          method: options.method,
          duration,
          timestamp: new Date().toISOString(),
        },
      },
    );
  }
}
