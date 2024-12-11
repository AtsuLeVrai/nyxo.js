import { ApiVersion } from "@nyxjs/core";
import { Pool, ProxyAgent, RetryAgent, type RetryHandler } from "undici";
import type { Rest } from "../core/index.js";
import type { RestOptionsEntity } from "../types/index.js";
import {
  AuthTypeFlag,
  HttpMethodFlag,
  HttpStatusCode,
} from "../utils/index.js";

export class ConfigManager {
  static readonly #DEFAULT_VERSION: ApiVersion.V10 = ApiVersion.V10;
  static readonly #DEFAULT_AUTH_TYPE = AuthTypeFlag.Bot;
  static readonly #DEFAULT_MAX_RETRIES = 3;
  static readonly #DEFAULT_BASE_RETRY_DELAY = 1000;
  static readonly #DEFAULT_TIMEOUT = 15000;
  static readonly #DEFAULT_RATE_LIMIT_RETRY = 3;
  static readonly #DEFAULT_MAX_CONCURRENT = 10;
  static readonly #DEFAULT_USER_AGENT =
    "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)";
  static readonly #MAX_TIMEOUT = 30000;
  static readonly #RETRY_STATUS_CODES =
    Object.values(HttpStatusCode).map(Number);

  readonly options: Required<RestOptionsEntity>;
  retryAgent: RetryAgent;
  readonly #rest: Rest;
  readonly #pool: Pool;
  #proxyAgent: ProxyAgent | null = null;
  #isDestroyed = false;

  constructor(rest: Rest, options: RestOptionsEntity) {
    this.#rest = rest;
    this.#validateConfiguration(options);
    this.options = this.#mergeOptions(options);

    this.#proxyAgent = this.#createProxyAgent();
    this.#pool = this.#createPool();
    this.retryAgent = this.#createRetryAgent();
  }

  updateProxy(proxyOptions: ProxyAgent.Options | null): void {
    if (this.#isDestroyed) {
      throw new Error("ConfigManager has been destroyed");
    }

    this.#rest.emit("debug", "Updating proxy configuration");

    this.#cleanupProxy()
      .then(() => {
        if (proxyOptions) {
          this.#setupNewProxy(proxyOptions);
        } else {
          this.#removeProxy();
        }

        this.retryAgent = this.#createRetryAgent();
        this.#rest.emit("proxyUpdate", proxyOptions);
      })
      .catch((error) => {
        this.#rest.emit(
          "error",
          new Error(`Failed to update proxy: ${error.message}`),
        );
        throw error;
      });
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#rest.emit("debug", "Starting configuration cleanup");

    try {
      await this.#cleanupProxy();
      await Promise.all([this.retryAgent.close(), this.#pool.destroy()]);

      this.#rest.emit("debug", "Configuration cleanup completed");
    } catch (error) {
      this.#rest.emit(
        "error",
        new Error(
          `Failed to cleanup configuration: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      throw error;
    }
  }

  #mergeOptions(options: RestOptionsEntity): Required<RestOptionsEntity> {
    return {
      version: ConfigManager.#DEFAULT_VERSION,
      authType: ConfigManager.#DEFAULT_AUTH_TYPE,
      maxRetries: ConfigManager.#DEFAULT_MAX_RETRIES,
      baseRetryDelay: ConfigManager.#DEFAULT_BASE_RETRY_DELAY,
      timeout: ConfigManager.#DEFAULT_TIMEOUT,
      rateLimitRetryLimit: ConfigManager.#DEFAULT_RATE_LIMIT_RETRY,
      maxConcurrentRequests: ConfigManager.#DEFAULT_MAX_CONCURRENT,
      compress: true,
      userAgent: ConfigManager.#DEFAULT_USER_AGENT,
      ...options,
      proxy: options.proxy ?? { uri: "" },
      pool: this.#getPoolOptions(options),
      retry: this.#getRetryOptions(options),
    } as Required<RestOptionsEntity>;
  }

  #getPoolOptions(options: RestOptionsEntity): Pool.Options {
    return {
      allowH2: true,
      connections:
        options.maxConcurrentRequests ?? ConfigManager.#DEFAULT_MAX_CONCURRENT,
      keepAliveTimeout: 30000,
      keepAliveMaxTimeout: 60000,
      connect: {
        rejectUnauthorized: true,
        ALPNProtocols: ["h2", "http/1.1"],
        secureOptions: 0x40000000,
        keepAlive: true,
        keepAliveInitialDelay: 60000,
        timeout: options.timeout ?? ConfigManager.#DEFAULT_TIMEOUT,
      },
      ...options.pool,
    };
  }

  #getRetryOptions(options: RestOptionsEntity): RetryHandler.RetryOptions {
    return {
      maxRetries: options.maxRetries ?? ConfigManager.#DEFAULT_MAX_RETRIES,
      minTimeout:
        options.baseRetryDelay ?? ConfigManager.#DEFAULT_BASE_RETRY_DELAY,
      maxTimeout: ConfigManager.#MAX_TIMEOUT,
      timeoutFactor: 2,
      methods: Object.values(HttpMethodFlag),
      statusCodes: ConfigManager.#RETRY_STATUS_CODES,
      retryAfter: true,
      ...options.retry,
    };
  }

  async #cleanupProxy(): Promise<void> {
    if (this.#proxyAgent) {
      this.#rest.emit("debug", "Closing existing proxy agent");
      try {
        await this.#proxyAgent.close();
      } catch (error) {
        this.#rest.emit(
          "error",
          new Error(
            `Failed to close proxy agent: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }
  }

  #setupNewProxy(proxyOptions: ProxyAgent.Options): void {
    this.#rest.emit(
      "debug",
      `Setting up new proxy agent with URI: ${proxyOptions.uri}`,
    );
    this.#proxyAgent = new ProxyAgent({
      allowH2: true,
      ...proxyOptions,
    });
    this.options.proxy = proxyOptions;
  }

  #removeProxy(): void {
    this.#rest.emit("debug", "Removing proxy configuration");
    this.#proxyAgent = null;
    this.options.proxy = { uri: "" };
  }

  #validateConfiguration(options: Partial<RestOptionsEntity>): void {
    this.#rest.emit("debug", "Validating configuration");

    if (options.userAgent && !this.#isValidUserAgent(options.userAgent)) {
      throw new Error("Invalid user agent format");
    }

    if (
      options.timeout &&
      (options.timeout < 0 || options.timeout > ConfigManager.#MAX_TIMEOUT)
    ) {
      throw new Error(
        `Timeout must be between 0 and ${ConfigManager.#MAX_TIMEOUT}`,
      );
    }

    if (options.maxRetries && options.maxRetries < 0) {
      throw new Error("Max retries cannot be negative");
    }

    if (options.baseRetryDelay && options.baseRetryDelay < 0) {
      throw new Error("Base retry delay cannot be negative");
    }

    if (options.maxConcurrentRequests && options.maxConcurrentRequests < 1) {
      throw new Error("Max concurrent requests must be at least 1");
    }

    this.#rest.emit("debug", "Configuration validated successfully");
  }

  #isValidUserAgent(userAgent: string): boolean {
    return /^DiscordBot \(https?:\/\/.*?, [\d.]+\)$/.test(userAgent);
  }

  #createPool(): Pool {
    const options = this.#getPoolOptions(this.options);
    return new Pool("https://discord.com", options);
  }

  #createProxyAgent(): ProxyAgent | null {
    if (!this.options.proxy?.uri) {
      return null;
    }

    const options: ProxyAgent.Options = {
      allowH2: true,
      ...this.options.proxy,
    };

    return new ProxyAgent(options);
  }

  #createRetryAgent(): RetryAgent {
    const agent = this.#proxyAgent ?? this.#pool;
    const options = this.#getRetryOptions(this.options);
    return new RetryAgent(agent, options);
  }
}
