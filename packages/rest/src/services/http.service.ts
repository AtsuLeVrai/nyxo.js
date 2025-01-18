import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { Pool, ProxyAgent, RetryAgent } from "undici";
import type { z } from "zod";
import { ApiError, HttpError } from "../errors/index.js";
import type { HttpOptions } from "../options/index.js";
import {
  HttpStatusCode,
  type JsonErrorEntity,
  type RequestOptions,
  type RestEvents,
} from "../types/index.js";

interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
}

export class HttpService extends EventEmitter<RestEvents> {
  readonly #pool: Pool;
  #proxyAgent: ProxyAgent | null = null;
  readonly #retryAgent: RetryAgent;
  readonly #options: z.output<typeof HttpOptions>;

  constructor(options: z.output<typeof HttpOptions>) {
    super();
    this.#options = options;
    this.#pool = new Pool("https://discord.com", this.#options.pool);

    if (this.#options.proxy) {
      this.#proxyAgent = new ProxyAgent(this.#options.proxy);
    }

    this.#retryAgent = new RetryAgent(
      this.#proxyAgent ?? this.#pool,
      this.#options.retry,
    );
  }

  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    const controller = new AbortController();

    this.emit("requestStart", {
      path: options.path,
      method: options.method,
      body: options.body,
      timestamp: startTime,
    });

    try {
      const response = await this.#retryAgent.request({
        ...options,
        origin: "https://discord.com",
        path: this.#formatPath(options.path),
        signal: controller.signal,
        headers: this.#getHeaders({
          headers: options.headers as Record<string, string>,
          reason: options.reason,
        }),
      });

      this.emit("requestFinish", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        latency: Date.now() - startTime,
      });

      if (response.statusCode === HttpStatusCode.NoContent) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
        };
      }

      const data = await this.#parseResponse<T>(response);
      return {
        data,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      if (error instanceof HttpError || error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new HttpError(`Request failed: ${error.message}`, {
          cause: error,
          path: options.path,
          method: options.method,
        });
      }

      throw new HttpError("Request failed", {
        path: options.path,
        method: options.method,
      });
    } finally {
      controller.abort();
    }
  }

  async updateProxy(proxyOptions?: ProxyAgent.Options): Promise<void> {
    if (this.#proxyAgent) {
      await this.#proxyAgent.close();
    }

    if (proxyOptions) {
      this.#proxyAgent = new ProxyAgent(proxyOptions);
    }
  }

  async destroy(): Promise<void> {
    try {
      await Promise.all([
        this.#proxyAgent?.close(),
        this.#retryAgent.close(),
        this.#pool.destroy(),
      ]);
    } finally {
      this.removeAllListeners();
    }
  }

  #formatPath(path: string): string {
    if (path.includes("..")) {
      throw new HttpError("Path cannot contain directory traversal");
    }

    const cleanPath = path
      .trim()
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "");

    try {
      const fullPath = `/api/v${this.#options.version}/${cleanPath}`;
      new URL(fullPath, "https://discord.com");
      return fullPath;
    } catch (error) {
      throw new HttpError(
        `Invalid API path: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  #getHeaders(options: {
    headers?: Record<string, string>;
    reason?: string;
  }): Record<string, string> {
    const baseHeaders: Record<string, string> = {
      authorization: `Bot ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
    };

    if (options.reason) {
      try {
        baseHeaders["x-audit-log-reason"] = encodeURIComponent(options.reason);
      } catch {
        throw new Error("Reason contains non-encodable characters");
      }
    }

    const customHeaders = options.headers || {};
    const conflictingHeaders = Object.keys(customHeaders)
      .filter((header) => header.toLowerCase() in baseHeaders)
      .map((header) => header.toLowerCase());

    if (conflictingHeaders.length > 0) {
      this.emit(
        "warn",
        `Conflicting headers detected: ${conflictingHeaders.join(", ")}`,
      );
    }

    return {
      ...baseHeaders,
      ...customHeaders,
    };
  }

  async #parseResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const contentType = response.headers["content-type"];

    if (!contentType?.includes("application/json")) {
      throw new HttpError(
        `Invalid content type: expected application/json but received ${contentType}`,
        { status: response.statusCode },
      );
    }

    const buffer = Buffer.from(await response.body.arrayBuffer());
    let data: unknown;

    try {
      data = JSON.parse(buffer.toString());
    } catch {
      throw new HttpError("Failed to parse JSON response", {
        status: response.statusCode,
      });
    }

    if (response.statusCode >= 400) {
      this.#handleErrorResponse(response.statusCode, data);
    }

    return data as T;
  }

  #handleErrorResponse(status: number, data: unknown): never {
    if (this.#isDiscordApiError(data)) {
      throw new ApiError({
        message: data.message,
        code: data.code,
        status,
        errors: data.errors,
      });
    }

    throw new HttpError(
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : "Unknown API Error",
      { status },
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
}
