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
import { HttpStatusCode, JsonErrorCode } from "../types/index.js";
import { ConfigManager } from "./ConfigManager.js";

export class RequestHandler {
  static readonly REQUEST_TIMEOUT = 15000;
  static readonly MAX_RETRY_COUNT = 3;
  static readonly MIN_RETRY_DELAY = 500;
  static readonly MAX_RETRY_DELAY = 15000;
  readonly #rest: Rest;
  readonly #configManager: ConfigManager;
  readonly #pendingRequests = new Set<string>();
  readonly #retryableErrors = new Set([
    JsonErrorCode.CloudflareError,
    JsonErrorCode.ServiceResourceRateLimited,
    JsonErrorCode.ApiResourceOverloaded,
  ]);
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

          this.#handleRateLimitHeaders(
            response.headers as Record<string, string>,
            response.statusCode,
          );

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
          const shouldRetry = this.#shouldRetry(error as Error, attempt);
          if (!shouldRetry) {
            throw this.#enhanceError(error as Error);
          }

          const retryDelay = this.#calculateRetryDelay(attempt, error as Error);
          this.#emitRetry(error as Error, attempt);

          await this.#wait(retryDelay);
          attempt++;
        }
      }

      throw new Error(
        `Maximum retry attempts (${this.#configManager.options.maxRetries}) exceeded`,
      );
    } finally {
      this.#pendingRequests.delete(requestId);
    }
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;

    if (this.#pendingRequests.size > 0) {
      this.#rest.emit(
        "debug",
        `Waiting for ${this.#pendingRequests.size} pending requests to complete`,
      );

      const maxWaitTime = RequestHandler.REQUEST_TIMEOUT;
      const checkInterval = 100;

      try {
        await Promise.race([
          new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (this.#pendingRequests.size === 0) {
                clearInterval(interval);
                resolve();
              }
            }, checkInterval);
          }),
          new Promise<void>((_, reject) =>
            setTimeout(
              () => reject(new Error("Request cleanup timeout")),
              maxWaitTime,
            ),
          ),
        ]);
      } catch (error) {
        this.#rest.emit("error", error as Error);
      }
    }
  }

  #handleRateLimitHeaders(
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    this.#rest.updateRateLimits(headers, statusCode);
  }

  async #executeWithTimeout(
    options: RouteEntity,
  ): Promise<Dispatcher.ResponseData> {
    const timeout = this.#configManager.options.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      throw new Error(`Request timeout after ${timeout}ms: ${options.path}`);
    }, timeout);

    try {
      const normalizedPath = options.path.startsWith("/")
        ? options.path
        : `/${options.path}`;

      const response = await this.#configManager.retryAgent.request({
        origin: "https://discord.com",
        path: `/api/v${this.#configManager.options.version}${normalizedPath}`,
        method: options.method,
        headers: this.#buildHeaders(options),
        body: options.body,
        query: options.query,
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async #processResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = await this.#decompressResponse(response);

    if (!this.#isSuccessResponse(response.statusCode)) {
      await this.#handleErrorResponse(
        response.statusCode,
        data,
        response.headers as Record<string, string>,
      );
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      try {
        return JSON.parse(data.toString()) as T;
      } catch (error) {
        throw new Error(
          `Failed to parse JSON response: ${(error as Error).message}`,
        );
      }
    }

    return data as unknown as T;
  }

  #isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
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

  #handleErrorResponse(
    statusCode: number,
    data: Buffer,
    headers: Record<string, string>,
  ): Promise<never> {
    const content = data.toString();

    try {
      if (statusCode === HttpStatusCode.TooManyRequests) {
        const error = JSON.parse(content) as RateLimitResponseEntity;
        const scope = headers["x-ratelimit-scope"] ?? "user";
        throw new Error(
          `Rate limit exceeded (${scope}), retry after ${error.retry_after} seconds` +
            `${error.global ? " (Global)" : ""}`,
        );
      }

      const errorData = JSON.parse(content);

      if (this.#isJsonErrorResponse(errorData)) {
        throw new Error(
          `Discord API Error ${errorData.code}: ${errorData.message}`,
        );
      }

      if (this.#isDetailedJsonError(errorData)) {
        const details = JSON.stringify(errorData.errors, null, 2);
        throw new Error(
          `Discord API Error ${errorData.code}: ${errorData.message}\nDetails: ${details}`,
        );
      }

      throw new Error(`HTTP ${statusCode}: ${content}`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`HTTP ${statusCode}: ${content}`);
      }
      throw error;
    }
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#configManager.options.authType} ${this.#configManager.options.token}`,
      "user-agent": this.#configManager.options.userAgent,
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

  #shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.#configManager.options.maxRetries) {
      return false;
    }

    if (
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return true;
    }

    const errorCode = this.#extractErrorCode(error.message);
    if (errorCode && this.#retryableErrors.has(errorCode)) {
      return true;
    }

    const statusCode = this.#extractStatusCode(error.message);
    if (statusCode && ConfigManager.RETRY_STATUS_CODES.includes(statusCode)) {
      if (statusCode === HttpStatusCode.TooManyRequests) {
        const isGlobal = error.message.includes("(Global)");
        return !isGlobal;
      }
      return true;
    }

    return false;
  }

  #calculateRetryDelay(attempt: number, error: Error): number {
    const baseDelay = this.#configManager.options.baseRetryDelay;

    const retryAfter = this.#extractRetryAfter(error);
    if (retryAfter) {
      return Math.min(retryAfter * 1000, RequestHandler.MAX_RETRY_DELAY);
    }

    const exponentialDelay = baseDelay * 2 ** (attempt - 1);
    const jitter = Math.random() * 100;
    const delay = exponentialDelay + jitter;

    return Math.min(
      Math.max(delay, RequestHandler.MIN_RETRY_DELAY),
      RequestHandler.MAX_RETRY_DELAY,
    );
  }

  #extractRetryAfter(error: Error): number | null {
    try {
      const match = error.message.match(/retry after (\d+(\.\d+)?)/i);
      return match ? Number.parseFloat(String(match[1])) : null;
    } catch {
      return null;
    }
  }

  #extractErrorCode(message: string): JsonErrorCode | null {
    const match = message.match(/Error (\d+):/);
    return match ? (Number(match[1]) as JsonErrorCode) : null;
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
    return match ? Number.parseInt(String(match[1]), 10) : null;
  }

  #enhanceError(error: Error): Error {
    if (error.message.includes("Invalid Form Body")) {
      return new Error(`Invalid request format: ${error.message}`);
    }
    if (error.message.includes("Missing Access")) {
      return new Error("Missing permissions for this request");
    }

    if (error.message.includes("50035")) {
      return new Error(
        `Invalid form body. Check your request data: ${error.message}`,
      );
    }
    if (error.message.includes("40001")) {
      return new Error("Unauthorized. Check your token.");
    }

    return error;
  }

  #generateRequestId(options: RouteEntity): string {
    return `${options.method}:${options.path}:${Date.now()}`;
  }

  #wait(ms: number): Promise<void> {
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
