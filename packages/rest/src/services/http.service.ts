import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { request } from "undici";
import type { z } from "zod";
import { HttpError } from "../errors/index.js";
import { FileHandler } from "../handlers/index.js";
import type { HttpOptions } from "../options/index.js";
import type {
  JsonErrorEntity,
  RequestOptions,
  RestEvents,
} from "../types/index.js";

export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  latency: number;
}

export class HttpService extends EventEmitter<RestEvents> {
  readonly #file = new FileHandler();
  readonly #options: z.output<typeof HttpOptions>;

  constructor(options: z.output<typeof HttpOptions>) {
    super();
    this.#options = options;
  }

  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const startTime = Date.now();

    try {
      const url = this.#formatPath(options.path);
      let processedOptions: Dispatcher.RequestOptions = {
        ...options,
        origin: url.origin,
        path: url.pathname + url.search,
        signal: AbortSignal.timeout(this.#options.timeout),
        headers: this.#getHeaders(options),
      };

      if (options.files) {
        const formData = await this.#file.createFormData(
          options.files,
          options.body,
        );
        processedOptions = {
          ...processedOptions,
          body: formData.getBuffer(),
          headers: {
            ...processedOptions.headers,
            ...formData.getHeaders(),
          },
        };
      }

      const response = await request(processedOptions);
      const latency = Date.now() - startTime;

      if (response.statusCode === 204) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
          latency,
        };
      }

      const buffer = Buffer.from(await response.body.arrayBuffer());
      let data: unknown;
      try {
        data = JSON.parse(buffer.toString());
      } catch {
        throw new HttpError("Failed to parse JSON response", {
          status: response.statusCode,
          rawBody: buffer.toString(),
        });
      }

      if (response.statusCode >= 400) {
        this.#handleErrorResponse(response.statusCode, data);
      }

      this.emit("request", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        latency,
        timestamp: Date.now(),
      });

      return {
        data: data as T,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        latency,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(
        error instanceof Error ? error.message : "Request failed",
        {
          path: options.path,
          method: options.method,
        },
      );
    }
  }

  #formatPath(path: string): URL {
    if (path.includes("..")) {
      throw new HttpError("Path cannot contain directory traversal");
    }

    const cleanPath = path
      .trim()
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "");

    try {
      return new URL(
        `/api/v${this.#options.version}/${cleanPath}`,
        "https://discord.com",
      );
    } catch (error) {
      throw new HttpError(
        `Invalid API path: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  #getHeaders(options: RequestOptions): Record<string, string> {
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
        "error",
        `Conflicting headers detected: ${conflictingHeaders.join(", ")}`,
      );
    }

    return {
      ...baseHeaders,
      ...customHeaders,
    } as Record<string, string>;
  }

  #handleErrorResponse(status: number, data: unknown): never {
    if (this.#isDiscordApiError(data)) {
      throw new HttpError(data.message, {
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
