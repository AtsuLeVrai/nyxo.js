import { ApiVersion } from "@nyxjs/core";
import { Pool, ProxyAgent, RetryAgent, type RetryHandler } from "undici";
import type { Rest } from "../core/index.js";
import type { RestOptionsEntity } from "../types/index.js";
import {
  AuthTypeFlag,
  HttpMethodFlag,
  HttpStatusCode,
} from "../types/index.js";

export class ConfigManager {
  static readonly CURRENT_API_VERSION = ApiVersion.V10;
  static readonly SUPPORTED_API_VERSIONS = new Set([
    ApiVersion.V9,
    ApiVersion.V10,
  ]);
  static readonly USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;
  static readonly DEFAULT_USER_AGENT =
    "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)";
  static readonly DEFAULT_TIMEOUT = 15000;
  static readonly MAX_TIMEOUT = 30000;
  static readonly DEFAULT_MAX_RETRIES = 3;
  static readonly DEFAULT_BASE_RETRY_DELAY = 1000;
  static readonly MIN_RETRY_DELAY = 500;
  static readonly MAX_RETRY_DELAY = 15000;
  static readonly DEFAULT_RATE_LIMIT_RETRY = 3;
  static readonly DEFAULT_MAX_CONCURRENT = 10;
  static readonly DEFAULT_AUTH_TYPE = AuthTypeFlag.Bot;
  static readonly DEFAULT_COMPRESS = true;

  static readonly DEFAULT_POOL_OPTIONS: Pool.Options = {
    allowH2: true,
    connections: ConfigManager.DEFAULT_MAX_CONCURRENT,
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 60000,
    connect: {
      rejectUnauthorized: true,
      ALPNProtocols: ["h2", "http/1.1"],
      secureOptions: 0x40000000,
      keepAlive: true,
      keepAliveInitialDelay: 60000,
      timeout: ConfigManager.DEFAULT_TIMEOUT,
    },
  };

  static readonly RETRY_STATUS_CODES = [
    HttpStatusCode.TooManyRequests,
    HttpStatusCode.ServerError,
    HttpStatusCode.GatewayUnavailable,
  ];

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
          new Error(`Failed to update proxy: ${this.#getErrorMessage(error)}`),
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
          `Failed to cleanup configuration: ${this.#getErrorMessage(error)}`,
        ),
      );
      throw error;
    }
  }

  #mergeOptions(options: RestOptionsEntity): Required<RestOptionsEntity> {
    const version = options.version ?? ConfigManager.CURRENT_API_VERSION;
    if (!ConfigManager.SUPPORTED_API_VERSIONS.has(version)) {
      throw new Error(
        `API version ${version} is not supported. Supported versions: ${Array.from(ConfigManager.SUPPORTED_API_VERSIONS).join(", ")}`,
      );
    }

    return {
      token: options.token,
      version,
      authType: options.authType ?? ConfigManager.DEFAULT_AUTH_TYPE,
      maxRetries: this.#validateNumber(
        options.maxRetries,
        ConfigManager.DEFAULT_MAX_RETRIES,
        "maxRetries",
        1,
      ),
      baseRetryDelay: this.#validateNumber(
        options.baseRetryDelay,
        ConfigManager.DEFAULT_BASE_RETRY_DELAY,
        "baseRetryDelay",
        ConfigManager.MIN_RETRY_DELAY,
        ConfigManager.MAX_RETRY_DELAY,
      ),
      timeout: this.#validateNumber(
        options.timeout,
        ConfigManager.DEFAULT_TIMEOUT,
        "timeout",
        1000,
        ConfigManager.MAX_TIMEOUT,
      ),
      rateLimitRetryLimit: this.#validateNumber(
        options.rateLimitRetryLimit,
        ConfigManager.DEFAULT_RATE_LIMIT_RETRY,
        "rateLimitRetryLimit",
        0,
      ),
      maxConcurrentRequests: this.#validateNumber(
        options.maxConcurrentRequests,
        ConfigManager.DEFAULT_MAX_CONCURRENT,
        "maxConcurrentRequests",
        1,
      ),
      userAgent: options.userAgent ?? ConfigManager.DEFAULT_USER_AGENT,
      compress: options.compress ?? ConfigManager.DEFAULT_COMPRESS,
      proxy: options.proxy ?? { uri: "" },
      pool: { ...ConfigManager.DEFAULT_POOL_OPTIONS, ...options.pool },
      retry: this.#getRetryOptions(options),
    } as Required<RestOptionsEntity>;
  }

  #validateNumber(
    value: number | undefined,
    defaultValue: number,
    name: string,
    min?: number,
    max?: number,
  ): number {
    const resolvedValue = value ?? defaultValue;

    if (!Number.isFinite(resolvedValue)) {
      throw new Error(`${name} must be a finite number`);
    }

    if (min !== undefined && resolvedValue < min) {
      throw new Error(`${name} must be at least ${min}`);
    }

    if (max !== undefined && resolvedValue > max) {
      throw new Error(`${name} must not exceed ${max}`);
    }

    return resolvedValue;
  }

  #getRetryOptions(options: RestOptionsEntity): RetryHandler.RetryOptions {
    return {
      maxRetries: options.maxRetries ?? ConfigManager.DEFAULT_MAX_RETRIES,
      minTimeout:
        options.baseRetryDelay ?? ConfigManager.DEFAULT_BASE_RETRY_DELAY,
      maxTimeout: ConfigManager.MAX_TIMEOUT,
      timeoutFactor: 2,
      methods: Object.values(HttpMethodFlag),
      statusCodes: ConfigManager.RETRY_STATUS_CODES,
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
            `Failed to close proxy agent: ${this.#getErrorMessage(error)}`,
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

  #validateConfiguration(options: RestOptionsEntity): void {
    this.#rest.emit("debug", "Validating configuration");

    if (options.userAgent && !this.#isValidUserAgent(options.userAgent)) {
      throw new Error(
        "Invalid user agent format. Must match: DiscordBot (url, version)",
      );
    }

    // Token is required
    if (!options.token) {
      throw new Error("Token is required");
    }

    // Auth type must be valid
    if (
      options.authType &&
      !Object.values(AuthTypeFlag).includes(options.authType)
    ) {
      throw new Error("Invalid auth type");
    }

    this.#validateNumber(
      options.timeout,
      ConfigManager.DEFAULT_TIMEOUT,
      "timeout",
      1000,
      ConfigManager.MAX_TIMEOUT,
    );
    this.#validateNumber(
      options.maxRetries,
      ConfigManager.DEFAULT_MAX_RETRIES,
      "maxRetries",
      0,
    );
    this.#validateNumber(
      options.baseRetryDelay,
      ConfigManager.DEFAULT_BASE_RETRY_DELAY,
      "baseRetryDelay",
      ConfigManager.MIN_RETRY_DELAY,
      ConfigManager.MAX_RETRY_DELAY,
    );
    this.#validateNumber(
      options.maxConcurrentRequests,
      ConfigManager.DEFAULT_MAX_CONCURRENT,
      "maxConcurrentRequests",
      1,
    );

    if (options.proxy && !options.proxy.uri) {
      throw new Error("Proxy URI must be provided when using proxy");
    }

    this.#rest.emit("debug", "Configuration validated successfully");
  }

  #isValidUserAgent(userAgent: string): boolean {
    return ConfigManager.USER_AGENT_REGEX.test(userAgent);
  }

  #createPool(): Pool {
    const poolOptions = this.options.pool ?? ConfigManager.DEFAULT_POOL_OPTIONS;
    return new Pool("https://discord.com", poolOptions);
  }

  #createProxyAgent(): ProxyAgent | null {
    if (!this.options.proxy?.uri) {
      return null;
    }

    return new ProxyAgent({
      allowH2: true,
      ...this.options.proxy,
    });
  }

  #createRetryAgent(): RetryAgent {
    const agent = this.#proxyAgent ?? this.#pool;
    const options = this.#getRetryOptions(this.options);
    return new RetryAgent(agent, options);
  }

  #getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
