import { Gunzip } from "minizlib";
import type { Dispatcher } from "undici";
import type { Rest } from "../core/index.js";
import type {
  JsonErrorEntity,
  JsonErrorResponseEntity,
  RateLimitResponseEntity,
  RequestRetry,
  RouteEntity,
} from "../types/index.js";
import { HttpStatusCode } from "../utils/index.js";
import type { ConfigManager } from "./ConfigManager.js";

export class RequestHandler {
  readonly #rest: Rest;
  readonly #configManager: ConfigManager;
  readonly #pendingRequests = new Set<string>();
  #isDestroyed = false;

  constructor(rest: Rest, configManager: ConfigManager) {
    this.#rest = rest;
    this.#configManager = configManager;
  }

  async execute<T>(options: RouteEntity): Promise<T> {
    if (this.#isDestroyed) {
      throw new Error("RequestHandler has been destroyed");
    }

    const startTime = Date.now();
    const requestId = this.#generateRequestId(options);
    let attempt = 1;

    try {
      this.#pendingRequests.add(requestId);

      while (attempt <= this.#configManager.options.maxRetries) {
        try {
          const response = await this.#executeWithTimeout(options);

          this.#rest.emit("responseReceived", {
            method: options.method,
            path: options.path,
            status: response.statusCode,
            headers: response.headers,
          });

          const result = await this.#processResponse<T>(response);
          const responseTime = Date.now() - startTime;

          this.#rest.emit("apiRequest", {
            method: options.method,
            path: options.path,
            status: response.statusCode,
            responseTime,
            attempt,
          });

          return result;
        } catch (error) {
          if (!this.#shouldRetry(error, attempt)) {
            throw error;
          }

          const retryDelay = this.#calculateRetryDelay(attempt);
          this.#emitRetry(error as Error, attempt);

          await this.#wait(retryDelay);
          attempt++;
        }
      }

      throw new Error("Maximum retry attempts exceeded");
    } finally {
      this.#pendingRequests.delete(requestId);
    }
  }

  async destroy(): Promise<void> {
    this.#isDestroyed = true;

    if (this.#pendingRequests.size > 0) {
      this.#rest.emit(
        "debug",
        `Waiting for ${this.#pendingRequests.size} pending requests to complete`,
      );

      const timeout = 5000;
      const timeoutPromise = this.#wait(timeout);

      await Promise.race([
        timeoutPromise,
        new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (this.#pendingRequests.size === 0) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        }),
      ]);
    }
  }

  async #executeWithTimeout(
    options: RouteEntity,
  ): Promise<Dispatcher.ResponseData> {
    const timeout = this.#configManager.options.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.#rest.emit(
        "error",
        new Error(`Request timeout after ${timeout}ms: ${options.path}`),
      );
    }, timeout);

    const normalizedPath = options.path.startsWith("/")
      ? options.path
      : `/${options.path}`;

    try {
      return await this.#configManager.retryAgent.request({
        origin: "https://discord.com",
        path: `/api/v${this.#configManager.options.version}${normalizedPath}`,
        method: options.method,
        headers: this.#buildHeaders(options),
        body: options.body,
        query: options.query,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async #processResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = await this.#decompressResponse(response);

    if (response.statusCode !== HttpStatusCode.Ok) {
      await this.#handleErrorResponse(response.statusCode, data);
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      try {
        return JSON.parse(data.toString()) as T;
      } catch {
        throw new Error("Failed to parse JSON response");
      }
    }

    return data as unknown as T;
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const buffer = Buffer.from(await response.body.arrayBuffer());

    if (
      !this.#configManager.options.compress ||
      response.headers["content-encoding"] !== "gzip"
    ) {
      return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const decompressor = new Gunzip({
        level: 4,
        async: true,
        flush: 2,
        finishFlush: 4,
        objectMode: false,
        strategy: 0,
      });

      decompressor
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject)
        .end(buffer);
    });
  }

  async #handleErrorResponse(statusCode: number, data: Buffer): Promise<void> {
    return new Promise((_resolve, reject) => {
      const content = data.toString();

      try {
        if (statusCode === HttpStatusCode.TooManyRequests) {
          const error = JSON.parse(content) as RateLimitResponseEntity;
          reject(
            new Error(
              `Rate limit exceeded, retry after ${error.retry_after * 1000}ms`,
            ),
          );
        }

        const errorData = JSON.parse(content);

        if (this.#isJsonErrorResponse(errorData)) {
          reject(
            new Error(
              `Discord API Error ${errorData.code}: ${errorData.message}`,
            ),
          );
        }

        if (this.#isDetailedJsonError(errorData)) {
          const details = JSON.stringify(errorData.errors, null, 2);
          reject(
            new Error(
              `Discord API Error ${errorData.code}: ${errorData.message}\nDetails: ${details}`,
            ),
          );
        }

        reject(new Error(`HTTP ${statusCode}: ${content}`));
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error(`HTTP ${statusCode}: ${content}`));
        }
        reject(error);
      }
    });
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#configManager.options.authType} ${this.#configManager.options.token}`,
      "user-agent":
        this.#configManager.options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
    };

    if (this.#configManager.options.compress) {
      headers["accept-encoding"] = "gzip";
    }

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...options.headers };
  }

  #shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.#configManager.options.maxRetries) {
      return false;
    }

    if (error instanceof Error) {
      if (
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ECONNRESET") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return true;
      }

      const statusCode = this.#extractStatusCode(error.message);
      if (statusCode) {
        return [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524].includes(
          statusCode,
        );
      }
    }

    return false;
  }

  #calculateRetryDelay(attempt: number): number {
    const baseDelay = this.#configManager.options.baseRetryDelay;
    const maxDelay = 30000;

    const exponentialDelay = baseDelay * 2 ** (attempt - 1);
    const jitter = Math.random() * 100;

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  #isJsonErrorResponse(data: unknown): data is JsonErrorResponseEntity {
    return (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      "message" in data &&
      typeof (data as JsonErrorResponseEntity).code === "number" &&
      typeof (data as JsonErrorResponseEntity).message === "string"
    );
  }

  #isDetailedJsonError(data: unknown): data is JsonErrorEntity {
    return (
      this.#isJsonErrorResponse(data) &&
      "errors" in data &&
      typeof (data as JsonErrorEntity).errors === "object"
    );
  }

  #extractStatusCode(message: string): number | null {
    const match = message.match(/HTTP (\d{3})/);
    // @ts-expect-error: match is not null
    return match ? Number.parseInt(match[1], 10) : null;
  }

  #generateRequestId(options: RouteEntity): string {
    return `${options.method}:${options.path}:${Date.now()}`;
  }

  async #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #emitRetry(error: Error, attempt: number): void {
    const retryEvent: RequestRetry = {
      error,
      attempt,
      maxAttempts: this.#configManager.options.maxRetries,
    };

    this.#rest.emit("requestRetry", retryEvent);
  }
}
