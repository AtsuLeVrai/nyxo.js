import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { request } from "undici";
import { HttpError } from "../errors/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import type { RestOptions } from "../options/index.js";
import type {
  JsonErrorEntity,
  RequestOptions,
  RestEvents,
} from "../types/index.js";

const HTTP_DEFAULTS = {
  apiBaseUrl: "https://discord.com",
  contentType: "application/json",
  rateLimitPrecision: "millisecond",
} as const;

export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  latency: number;
}

export class HttpService extends EventEmitter<RestEvents> {
  readonly #options: RestOptions;

  constructor(options: RestOptions) {
    super();
    this.#options = options;
  }

  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const startTime = this.#getCurrentTimestamp();

    try {
      const url = this.#formatPath(options.path);
      const requestOptions = await this.#prepareRequestOptions(options, url);
      const response = await this.#executeRequest(requestOptions);
      const latency = this.#calculateLatency(startTime);

      if (response.statusCode === 204) {
        return this.#createEmptyResponse<T>(response, latency);
      }

      const data = await this.#parseResponseData(response);

      if (response.statusCode >= 400) {
        this.#handleErrorResponse(response.statusCode, data);
      }

      this.emit("request", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        latency,
        timestamp: this.#getCurrentTimestamp(),
      });

      return {
        data: data as T,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        latency,
      };
    } catch (error) {
      this.#handleRequestError(error, options);
    }
  }

  #formatPath(path: string): URL {
    if (path.includes("..")) {
      throw new HttpError("Path cannot contain directory traversal");
    }

    const cleanPath = this.#cleanPath(path);

    try {
      return new URL(
        `/api/v${this.#options.version}/${cleanPath}`,
        HTTP_DEFAULTS.apiBaseUrl,
      );
    } catch (error) {
      throw new HttpError(
        `"Invalid API path": ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  #cleanPath(path: string): string {
    return path
      .trim()
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "");
  }

  async #prepareRequestOptions(
    options: RequestOptions,
    url: URL,
  ): Promise<Dispatcher.RequestOptions> {
    let requestOptions: Dispatcher.RequestOptions = {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      signal: AbortSignal.timeout(this.#options.queue.timeout),
      headers: this.#getHeaders(options),
    };

    if (options.files) {
      requestOptions = await this.#addFormDataToOptions(
        requestOptions,
        options,
      );
    }

    return requestOptions;
  }

  async #addFormDataToOptions(
    options: Dispatcher.RequestOptions,
    requestOptions: RequestOptions,
  ): Promise<Dispatcher.RequestOptions> {
    if (!requestOptions.files) {
      throw new Error(
        "Request options contain files but no file handler is available",
      );
    }

    const formData = await FileHandler.createFormData(
      requestOptions.files,
      requestOptions.body,
    );

    return {
      ...options,
      body: formData.getBuffer(),
      headers: {
        ...options.headers,
        ...formData.getHeaders(),
      },
    };
  }

  #getHeaders(options: RequestOptions): Record<string, string> {
    const baseHeaders = this.#createBaseHeaders();
    this.#addAuditLogReason(baseHeaders, options.reason);

    const customHeaders = HeaderHandler.parse(options.headers).headers || {};
    this.#checkConflictingHeaders(customHeaders, baseHeaders);

    return {
      ...baseHeaders,
      ...customHeaders,
    };
  }

  #createBaseHeaders(): Record<string, string> {
    return {
      authorization: `Bot ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "content-type": HTTP_DEFAULTS.contentType,
      "x-ratelimit-precision": HTTP_DEFAULTS.rateLimitPrecision,
    };
  }

  #addAuditLogReason(headers: Record<string, string>, reason?: string): void {
    if (!reason) {
      return;
    }

    try {
      headers["x-audit-log-reason"] = encodeURIComponent(reason);
    } catch {
      throw new Error("Reason contains non-encodable characters");
    }
  }

  #checkConflictingHeaders(
    custom: Record<string, string>,
    base: Record<string, string>,
  ): void {
    const conflictingHeaders = Object.keys(custom)
      .filter((header) => header.toLowerCase() in base)
      .map((header) => header.toLowerCase());

    if (conflictingHeaders.length > 0) {
      this.emit(
        "error",
        `Conflicting headers detected: ${conflictingHeaders.join(", ")}`,
      );
    }
  }

  async #executeRequest(
    options: Dispatcher.RequestOptions,
  ): Promise<Dispatcher.ResponseData> {
    return await request(options);
  }

  async #parseResponseData(
    response: Dispatcher.ResponseData,
  ): Promise<unknown> {
    const buffer = Buffer.from(await response.body.arrayBuffer());
    try {
      return JSON.parse(buffer.toString());
    } catch {
      throw new HttpError("Failed to parse JSON response", {
        status: response.statusCode,
        rawBody: buffer.toString(),
      });
    }
  }

  #createEmptyResponse<T>(
    response: Dispatcher.ResponseData,
    latency: number,
  ): HttpResponse<T> {
    return {
      data: {} as T,
      statusCode: response.statusCode,
      headers: response.headers as Record<string, string>,
      latency,
    };
  }

  #handleErrorResponse(status: number, data: unknown): never {
    if (this.#isDiscordApiError(data)) {
      throw new HttpError(data.message, {
        code: data.code,
        status,
        errors: data.errors,
      });
    }

    throw new HttpError(this.#getErrorMessage(data), { status });
  }

  #getErrorMessage(data: unknown): string {
    return typeof data === "object" && data !== null && "message" in data
      ? String(data.message)
      : "Unknown API Error";
  }

  #handleRequestError(error: unknown, options: RequestOptions): never {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      error instanceof Error ? error.message : "Unknown API Error",
      {
        path: options.path,
        method: options.method,
      },
    );
  }

  #isDiscordApiError(data: unknown): data is JsonErrorEntity {
    return (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      "message" in data
    );
  }

  #getCurrentTimestamp(): number {
    return Date.now();
  }

  #calculateLatency(startTime: number): number {
    return this.#getCurrentTimestamp() - startTime;
  }
}
