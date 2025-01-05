import { EventEmitter } from "eventemitter3";
import { type Dispatcher, Pool, ProxyAgent, RetryAgent } from "undici";
import { HttpConstants } from "../constants/index.js";
import type { RestEvents, RestOptions, RouteEntity } from "../types/index.js";

export class HttpService extends EventEmitter<RestEvents> {
  #proxyAgent: ProxyAgent | null = null;
  #retryAgent: RetryAgent;
  readonly #pool: Pool;

  readonly #options: Required<Omit<RestOptions, "proxy">> &
    Pick<RestOptions, "proxy">;

  constructor(
    options: Required<Omit<RestOptions, "proxy">> & Pick<RestOptions, "proxy">,
  ) {
    super();
    this.#options = options;
    this.#pool = this.#createPool();
    this.#proxyAgent = this.#createProxyAgent();
    this.#retryAgent = this.#createRetryAgent();
  }

  async request(options: RouteEntity): Promise<Dispatcher.ResponseData> {
    const requestId = `${options.method}:${options.path}:${Date.now()}`;
    const controller = new AbortController();

    this.emit("request", options.path, options.method, requestId, options);
    const startTime = Date.now();

    const response = await this.#retryAgent.request({
      ...options,
      origin: HttpConstants.urls.api,
      path: `/api/v${this.#options.version}${this.#normalizePath(options.path)}`,
      headers: this.#buildHeaders(options),
      signal: controller.signal,
    });

    this.emit(
      "response",
      options.path,
      options.method,
      response.statusCode,
      Date.now() - startTime,
      requestId,
    );

    return response;
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

  async updateProxy(proxyOptions?: ProxyAgent.Options): Promise<void> {
    if (this.#proxyAgent) {
      await this.#proxyAgent.close();
    }

    if (proxyOptions) {
      this.#proxyAgent = new ProxyAgent({
        allowH2: true,
        ...proxyOptions,
      });
      this.#retryAgent = this.#createRetryAgent();
    }
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

    return { ...headers, ...(options.headers as Record<string, string>) };
  }

  #createPool(): Pool {
    return new Pool(HttpConstants.urls.api, this.#options.pool);
  }

  #createProxyAgent(): ProxyAgent | null {
    if (!this.#options.proxy) {
      return null;
    }
    return new ProxyAgent({ ...this.#options.proxy, allowH2: true });
  }

  #createRetryAgent(): RetryAgent {
    return new RetryAgent(this.#proxyAgent ?? this.#pool, this.#options.retry);
  }

  #normalizePath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }
}
