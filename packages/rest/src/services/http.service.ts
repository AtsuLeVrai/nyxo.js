import { EventEmitter } from "eventemitter3";
import { BrotliDecompress, Gunzip, Inflate } from "minizlib";
import type { Dispatcher } from "undici";
import { request } from "undici";
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
  latency: number;
}

export class HttpService extends EventEmitter<RestEvents> {
  readonly #options: z.output<typeof HttpOptions>;

  constructor(options: z.output<typeof HttpOptions>) {
    super();
    this.#options = options;
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
      const url = this.#formatPath(options.path);
      const requestOptions: Dispatcher.RequestOptions = {
        ...options,
        origin: url.origin,
        path: url.pathname + url.search,
        signal: controller.signal,
        headers: this.#getHeaders(options),
      };

      requestOptions.signal = AbortSignal.timeout(this.#options.timeout);
      const response = await request(requestOptions);
      const latency = Date.now() - startTime;

      this.emit("requestFinish", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        latency,
      });

      if (response.statusCode === HttpStatusCode.NoContent) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
          latency,
        };
      }

      const data = await this.#parseResponse<T>(response);
      return {
        data,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        latency,
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

    if (this.#options.acceptEncoding) {
      baseHeaders["accept-encoding"] = "gzip, deflate, br";
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
    } as Record<string, string>;
  }

  async #parseResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const contentType = response.headers["content-type"];

    if (!contentType?.includes("application/json")) {
      throw new HttpError(
        `Invalid content type: expected application/json but received ${contentType}`,
        { status: response.statusCode },
      );
    }

    const buffer = await this.#decompressResponse(response);
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

    return data as T;
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const contentType = response.headers["content-encoding"];
    const buffer = Buffer.from(await response.body.arrayBuffer());

    if (!contentType) {
      return buffer;
    }

    let stream: Gunzip | Inflate | BrotliDecompress;
    switch (contentType) {
      case "gzip":
        stream = new Gunzip({ level: 9 });
        break;
      case "deflate":
        stream = new Inflate({ level: 9 });
        break;
      case "br":
        stream = new BrotliDecompress({ level: 11 });
        break;
      default:
        throw new HttpError(`Unsupported content encoding: ${contentType}`);
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
      stream.end(buffer);
    });
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
