import { type Dispatcher, Pool, ProxyAgent, RetryAgent } from "undici";
import type {
  JsonErrorEntity,
  RestOptions,
  RouteEntity,
} from "../types/index.js";
import type { FileHandlerManager } from "./file-handler.manager.js";
import type { RateLimitManager } from "./rate-limiter.manager.js";

export class RequestManager {
  #retryAgent: RetryAgent;
  #proxyAgent: ProxyAgent | null = null;
  readonly #pool: Pool;
  readonly #options: Required<RestOptions>;
  readonly #rateLimitManager: RateLimitManager;
  readonly #fileHandlerManager: FileHandlerManager;
  readonly #pendingRequests = new Set<string>();

  constructor(
    options: RestOptions,
    rateLimitManager: RateLimitManager,
    fileHandlerManager: FileHandlerManager,
  ) {
    this.#options = this.#mergeOptions(options);
    this.#rateLimitManager = rateLimitManager;
    this.#fileHandlerManager = fileHandlerManager;
    this.#proxyAgent = this.#createProxyAgent();
    this.#pool = this.#createPool();
    this.#retryAgent = this.#createRetryAgent();
  }

  get isGlobalRateLimit(): boolean {
    return this.#pendingRequests.size > Number(this.#options.retry.maxRetries);
  }

  async execute<T>(options: RouteEntity): Promise<T> {
    const requestId = this.#generateRequestId(options);

    try {
      this.#pendingRequests.add(requestId);

      let response: Dispatcher.ResponseData;
      if (options.files) {
        response = await this.#executeWithTimeout(
          await this.#fileHandlerManager.handleFiles(options),
        );
      } else {
        response = await this.#executeWithTimeout(options);
      }

      return await this.#processResponse<T>(response);
    } finally {
      this.#pendingRequests.delete(requestId);
    }
  }

  async destroy(): Promise<void> {
    if (this.#pendingRequests.size > 0) {
      await Promise.race([
        this.#proxyAgent?.close(),
        this.#retryAgent.close(),
        this.#pool.destroy(),
      ]);
    }
  }

  async updateProxy(proxyOptions: ProxyAgent.Options | null): Promise<void> {
    if (this.#proxyAgent) {
      await this.#proxyAgent.close();
    }

    if (proxyOptions) {
      this.#options.proxy = proxyOptions;
      this.#proxyAgent = new ProxyAgent({
        allowH2: true,
        ...proxyOptions,
      });
    } else {
      this.#proxyAgent = null;
      this.#options.proxy = { uri: "" };
    }

    this.#retryAgent = this.#createRetryAgent();
  }

  async #executeWithTimeout(
    options: RouteEntity,
  ): Promise<Dispatcher.ResponseData> {
    const timeout = this.#options.retry.maxTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      throw new Error(`Request timeout after ${timeout}ms: ${options.path}`);
    }, timeout);

    try {
      const path = this.#normalizePath(options.path);
      await this.#rateLimitManager.checkRateLimit(path, options.method);

      const response = await this.#retryAgent.request({
        origin: "https://discord.com",
        path: `/api/v${this.#options.version}${path}`,
        headers: this.#buildHeaders(options),
        signal: controller.signal,
        method: options.method,
        body: options.body,
        query: options.query,
        reset: options.reset,
        bodyTimeout: options.bodyTimeout,
        blocking: options.blocking,
        headersTimeout: options.headersTimeout,
        throwOnError: options.throwOnError,
        opaque: options.opaque,
        onInfo: options.onInfo,
        responseHeader: options.responseHeader,
        highWaterMark: options.highWaterMark ?? 65536,
        idempotent: options.idempotent,
        upgrade: options.upgrade,
        expectContinue: options.expectContinue,
        maxRedirections: options.maxRedirections,
        redirectionLimitReached: options.redirectionLimitReached,
      });

      this.#rateLimitManager.updateRateLimit(
        path,
        options.method,
        response.headers as Record<string, string>,
        response.statusCode,
      );

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async #processResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = Buffer.from(await response.body.arrayBuffer());

    if (!this.#isSuccessResponse(response.statusCode)) {
      const error: JsonErrorEntity = JSON.parse(data.toString());
      throw new Error(
        `${error.code}: ${error.message}\n${JSON.stringify(error.errors, null, 2)}`,
      );
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      try {
        return JSON.parse(data.toString());
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
    }

    return data as unknown as T;
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `Bot ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
    };

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...options.headers };
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

  #createPool(): Pool {
    return new Pool("https://discord.com", this.#options.pool);
  }

  #createProxyAgent(): ProxyAgent | null {
    if (!this.#options.proxy?.uri) {
      return null;
    }

    return new ProxyAgent(this.#options.proxy);
  }

  #createRetryAgent(): RetryAgent {
    const agent = this.#proxyAgent ?? this.#pool;
    return new RetryAgent(agent, this.#options.retry);
  }

  #mergeOptions(options: RestOptions): Required<RestOptions> {
    return {
      token: options.token,
      version: options.version ?? 10,
      userAgent:
        options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      proxy: {
        allowH2: true,
        uri: "",
        ...options.proxy,
      },
      retry: {
        retryAfter: true,
        maxRetries: 3,
        minTimeout: 100,
        maxTimeout: 15000,
        timeoutFactor: 2,
        ...options.retry,
      },
      pool: {
        allowH2: true,
        maxConcurrentStreams: 1000,
        keepAliveTimeout: 10000,
        keepAliveMaxTimeout: 30000,
        bodyTimeout: 8000,
        headersTimeout: 8000,
        connect: {
          rejectUnauthorized: true,
          ALPNProtocols: ["h2"],
          secureOptions: 0x40000000,
          keepAlive: true,
          keepAliveInitialDelay: 10000,
          timeout: 5000,
          noDelay: true,
        },
        ...options.pool,
      },
    };
  }
}
