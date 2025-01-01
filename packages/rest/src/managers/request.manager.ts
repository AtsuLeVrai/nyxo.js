import { Gunzip } from "minizlib";
import type { Dispatcher } from "undici";
import type {
  JsonErrorEntity,
  JsonErrorResponseEntity,
  RateLimitResponseEntity,
  RouteEntity,
} from "../types/index.js";
import { HttpStatusCode, JsonErrorCode } from "../types/index.js";
import { ConfigManager } from "./config.manager.js";
import type { RestRateLimitManager } from "./rate-limiter.manager.js";

export class RequestManager {
  static readonly REQUEST_CONFIG = {
    TIMEOUT: 15_000,
    MAX_RETRIES: 3,
    MIN_RETRY_DELAY: 500,
    MAX_RETRY_DELAY: 15_000,
  } as const;

  readonly #configManager: ConfigManager;
  readonly #rateLimitManager: RestRateLimitManager;
  readonly #pendingRequests = new Set<string>();
  readonly #retryableErrors = new Set([
    JsonErrorCode.cloudflareError,
    JsonErrorCode.serviceResourceRateLimited,
    JsonErrorCode.apiResourceOverloaded,
  ]);

  constructor(
    rateLimitManager: RestRateLimitManager,
    configManager: ConfigManager,
  ) {
    this.#rateLimitManager = rateLimitManager;
    this.#configManager = configManager;
  }

  get isGlobalRateLimit(): boolean {
    return (
      this.#pendingRequests.size > RequestManager.REQUEST_CONFIG.MAX_RETRIES
    );
  }

  async execute<T>(options: RouteEntity): Promise<T> {
    const requestId = this.#generateRequestId(options);
    const attempt = 1;

    try {
      this.#pendingRequests.add(requestId);
      return await this.#executeWithRetries<T>(options, attempt);
    } finally {
      this.#pendingRequests.delete(requestId);
    }
  }

  async destroy(): Promise<void> {
    if (this.#pendingRequests.size > 0) {
      await Promise.race([
        this.#waitForPendingRequests(),
        this.#createTimeoutPromise(),
      ]);
    }
  }

  async #executeWithRetries<T>(
    options: RouteEntity,
    attempt: number,
  ): Promise<T> {
    let attemptCount = attempt;
    while (attemptCount <= this.#configManager.options.maxRetries) {
      try {
        const response = await this.#executeWithTimeout(options);

        this.#rateLimitManager.updateRateLimits(
          response.headers as Record<string, string>,
          response.statusCode,
        );

        return await this.#processResponse<T>(response);
      } catch (error) {
        const shouldRetry = this.#shouldRetry(error as Error, attemptCount);
        if (!shouldRetry) {
          throw this.#enhanceError(error as Error);
        }

        const retryDelay = this.#calculateRetryDelay(
          attemptCount,
          error as Error,
        );

        await this.#wait(retryDelay);
        attemptCount++;
      }
    }

    throw new Error(
      `Maximum retry attempts (${this.#configManager.options.maxRetries}) exceeded`,
    );
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
      return await this.#executeRequest(options, controller.signal);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async #executeRequest(
    options: RouteEntity,
    signal: AbortSignal,
  ): Promise<Dispatcher.ResponseData> {
    const normalizedPath = this.#normalizePath(options.path);

    const response = await this.#configManager.retryAgent.request({
      origin: "https://discord.com",
      path: `/api/v${this.#configManager.options.version}${normalizedPath}`,
      method: options.method,
      headers: this.#buildHeaders(options),
      body: options.body,
      query: options.query,
      signal,
    });

    if (!response.body) {
      throw new Error("Response body is null");
    }

    return response;
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

    return this.#parseResponseData<T>(response, data);
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#configManager.options.authType} ${this.#configManager.options.token}`,
      "user-agent": this.#configManager.options.userAgent,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
    };

    if (this.#configManager.options.useCompression) {
      headers["accept-encoding"] = "gzip";
    }

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...options.headers };
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const buffer = Buffer.from(await response.body.arrayBuffer());

    if (
      !this.#configManager.options.useCompression ||
      response.headers["content-encoding"] !== "gzip"
    ) {
      return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const gunzip = new Gunzip({
        level: 4,
        async: true,
        flush: 2,
        finishFlush: 4,
        objectMode: false,
        strategy: 0,
      });

      gunzip
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject)
        .end(buffer);
    });
  }

  async #parseResponseData<T>(
    response: Dispatcher.ResponseData,
    data: Buffer,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (response.headers["content-type"]?.includes("application/json")) {
        try {
          resolve(JSON.parse(data.toString()) as T);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse JSON response: ${(error as Error).message}`,
            ),
          );
        }
      }

      resolve(data as unknown as T);
    });
  }

  async #handleErrorResponse(
    statusCode: number,
    data: Buffer,
    headers: Record<string, string>,
  ): Promise<never> {
    return new Promise((_, reject) => {
      const content = data.toString();

      try {
        if (statusCode === HttpStatusCode.tooManyRequests) {
          this.#handleRateLimitError(content, headers);
        }

        const errorData = JSON.parse(content);
        this.#handleJsonError(errorData);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error(`HTTP ${statusCode}: ${content}`));
        }
        reject(error);
      }
    });
  }

  #handleRateLimitError(
    content: string,
    headers: Record<string, string>,
  ): never {
    const error = JSON.parse(content) as RateLimitResponseEntity;
    const scope = headers["x-ratelimit-scope"] ?? "user";
    throw new Error(
      `Rate limit exceeded (${scope}), retry after ${error.retry_after} seconds` +
        `${error.global ? " (Global)" : ""}`,
    );
  }

  #handleJsonError(errorData: JsonErrorCode): never {
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

    throw new Error("Unknown API error format");
  }

  #shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.#configManager.options.maxRetries) {
      return false;
    }

    if (this.#isNetworkError(error)) {
      return true;
    }

    const errorCode = this.#extractErrorCode(error.message);
    if (
      errorCode &&
      this.#retryableErrors.has(errorCode as 40333 | 40062 | 130000)
    ) {
      return true;
    }

    const statusCode = this.#extractStatusCode(error.message);
    return this.#isRetryableStatusCode(statusCode);
  }

  #calculateRetryDelay(attempt: number, error: Error): number {
    const baseDelay = this.#configManager.options.baseRetryDelay;
    const retryAfter = this.#extractRetryAfter(error);

    if (retryAfter) {
      return Math.min(
        retryAfter * 1000,
        RequestManager.REQUEST_CONFIG.MAX_RETRY_DELAY,
      );
    }

    const exponentialDelay = baseDelay * 2 ** (attempt - 1);
    const jitter = Math.random() * 100;
    const delay = exponentialDelay + jitter;

    return Math.min(
      Math.max(delay, RequestManager.REQUEST_CONFIG.MIN_RETRY_DELAY),
      RequestManager.REQUEST_CONFIG.MAX_RETRY_DELAY,
    );
  }

  #isNetworkError(error: Error): boolean {
    return (
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("ECONNREFUSED")
    );
  }

  #isRetryableStatusCode(
    statusCode: number | null,
  ): statusCode is 500 | 429 | 502 {
    if (!statusCode) {
      return false;
    }

    if (statusCode === HttpStatusCode.tooManyRequests) {
      return !this.isGlobalRateLimit;
    }

    return ConfigManager.RETRY_STATUS_CODES.includes(
      statusCode as 500 | 429 | 502,
    );
  }

  #extractRetryAfter(error: Error): number | null {
    const match = error.message.match(/retry after (\d+(\.\d+)?)/i);
    return match ? Number.parseFloat(String(match[1])) : null;
  }

  #extractErrorCode(message: string): JsonErrorCode | null {
    const match = message.match(/Error (\d+):/);
    return match ? (Number(match[1]) as JsonErrorCode) : null;
  }

  #extractStatusCode(message: string): number | null {
    const match = message.match(/HTTP (\d{3})/);
    return match ? Number.parseInt(String(match[1]), 10) : null;
  }

  #isJsonErrorResponse(data: unknown): data is JsonErrorResponseEntity {
    return (
      this.#isObject(data) &&
      "code" in data &&
      "message" in data &&
      typeof data.code === "number" &&
      typeof data.message === "string"
    );
  }

  #isDetailedJsonError(data: unknown): data is JsonErrorEntity {
    return (
      this.#isJsonErrorResponse(data) &&
      "errors" in data &&
      this.#isObject(data.errors)
    );
  }

  #isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  #isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  #normalizePath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }

  #generateRequestId(options: RouteEntity): string {
    return `${options.method}:${options.path}:${Date.now()}`;
  }

  async #waitForPendingRequests(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkInterval = 100;
      const interval = setInterval(() => {
        if (this.#pendingRequests.size === 0) {
          clearInterval(interval);
          resolve();
        }
      }, checkInterval);
    });
  }

  #createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Request cleanup timeout")),
        RequestManager.REQUEST_CONFIG.TIMEOUT,
      ),
    );
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
}
