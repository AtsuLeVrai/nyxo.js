import { ApiVersion } from "@nyxjs/core";
import { Pool, ProxyAgent, RetryAgent, type RetryHandler } from "undici";
import {
  AuthTypeFlag,
  HttpMethodFlag,
  HttpStatusCode,
  type RestOptions,
} from "../types/index.js";

export class ConfigManager {
  static readonly API = {
    CURRENT_VERSION: ApiVersion.V10,
    SUPPORTED_VERSIONS: new Set([ApiVersion.V10]),
    USER_AGENT_PATTERN: /^DiscordBot \((.+), ([0-9.]+)\)$/,
    DEFAULT_USER_AGENT: "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
  } as const;

  static readonly TIMEOUTS = {
    DEFAULT: 15_000,
    MAX: 30_000,
    MIN_RETRY_DELAY: 500,
    MAX_RETRY_DELAY: 15_000,
  } as const;

  static readonly DEFAULTS = {
    MAX_RETRIES: 3,
    BASE_RETRY_DELAY: 1_000,
    RATE_LIMIT_RETRY: 3,
    MAX_CONCURRENT: 10,
    AUTH_TYPE: AuthTypeFlag.Bot,
    COMPRESS: true,
  } as const;

  static readonly RETRY_STATUS_CODES = [
    HttpStatusCode.TooManyRequests,
    HttpStatusCode.ServerError,
    HttpStatusCode.GatewayUnavailable,
  ] as const;

  static readonly DEFAULT_POOL_OPTIONS: Pool.Options = {
    allowH2: true,
    connections: ConfigManager.DEFAULTS.MAX_CONCURRENT,
    keepAliveTimeout: 30_000,
    keepAliveMaxTimeout: 60_000,
    connect: {
      rejectUnauthorized: true,
      ALPNProtocols: ["h2", "http/1.1"],
      secureOptions: 0x40000000,
      keepAlive: true,
      keepAliveInitialDelay: 60_000,
      timeout: ConfigManager.TIMEOUTS.DEFAULT,
    },
  } as const;

  readonly options: Required<RestOptions>;
  retryAgent: RetryAgent;

  readonly #pool: Pool;
  #proxyAgent: ProxyAgent | null = null;
  #isDestroyed = false;

  constructor(options: RestOptions) {
    this.#validateConfiguration(options);
    this.options = this.#mergeOptions(options);

    this.#proxyAgent = this.#createProxyAgent();
    this.#pool = this.#createPool();
    this.retryAgent = this.#createRetryAgent();
  }

  async updateProxy(proxyOptions: ProxyAgent.Options | null): Promise<void> {
    this.#validateManagerState();

    await this.#cleanupProxy();

    if (proxyOptions) {
      this.#setupNewProxy(proxyOptions);
    } else {
      this.#removeProxy();
    }

    this.retryAgent = this.#createRetryAgent();
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;

    try {
      await Promise.race([
        this.#cleanupProxy(),
        this.retryAgent.close(),
        this.#pool.destroy(),
      ]);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  #mergeOptions(options: RestOptions): Required<RestOptions> {
    const version = this.#validateApiVersion(
      options.version ?? ConfigManager.API.CURRENT_VERSION,
    );

    return {
      token: options.token,
      version,
      authType: options.authType ?? ConfigManager.DEFAULTS.AUTH_TYPE,
      maxRetries: this.#validateNumber(
        options.maxRetries,
        ConfigManager.DEFAULTS.MAX_RETRIES,
        "maxRetries",
        1,
      ),
      baseRetryDelay: this.#validateNumber(
        options.baseRetryDelay,
        ConfigManager.DEFAULTS.BASE_RETRY_DELAY,
        "baseRetryDelay",
        ConfigManager.TIMEOUTS.MIN_RETRY_DELAY,
        ConfigManager.TIMEOUTS.MAX_RETRY_DELAY,
      ),
      timeout: this.#validateNumber(
        options.timeout,
        ConfigManager.TIMEOUTS.DEFAULT,
        "timeout",
        1000,
        ConfigManager.TIMEOUTS.MAX,
      ),
      userAgent: options.userAgent ?? ConfigManager.API.DEFAULT_USER_AGENT,
      compress: options.compress ?? ConfigManager.DEFAULTS.COMPRESS,
      proxy: options.proxy ?? { uri: "" },
      pool: { ...ConfigManager.DEFAULT_POOL_OPTIONS, ...options.pool },
      retry: this.#getRetryOptions(options),
    } as Required<RestOptions>;
  }

  #validateManagerState(): void {
    if (this.#isDestroyed) {
      throw new Error("ConfigManager has been destroyed");
    }
  }

  #validateConfiguration(options: RestOptions): void {
    if (!options.token) {
      throw new Error("Token is required");
    }

    if (options.userAgent && !this.#isValidUserAgent(options.userAgent)) {
      throw new Error(
        "Invalid user agent format. Must match: DiscordBot (url, version)",
      );
    }

    if (
      options.authType &&
      !Object.values(AuthTypeFlag).includes(options.authType)
    ) {
      throw new Error("Invalid auth type");
    }

    if (options.proxy && !options.proxy.uri) {
      throw new Error("Proxy URI must be provided when using proxy");
    }
  }

  #validateApiVersion(version: ApiVersion): ApiVersion {
    if (!ConfigManager.API.SUPPORTED_VERSIONS.has(version)) {
      const supported = Array.from(ConfigManager.API.SUPPORTED_VERSIONS).join(
        ", ",
      );
      throw new Error(
        `API version ${version} is not supported. Supported versions: ${supported}`,
      );
    }
    return version;
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

  #getRetryOptions(options: RestOptions): RetryHandler.RetryOptions {
    return {
      maxRetries: options.maxRetries ?? ConfigManager.DEFAULTS.MAX_RETRIES,
      minTimeout:
        options.baseRetryDelay ?? ConfigManager.DEFAULTS.BASE_RETRY_DELAY,
      maxTimeout: ConfigManager.TIMEOUTS.MAX,
      timeoutFactor: 2,
      methods: Object.values(HttpMethodFlag),
      statusCodes: ConfigManager.RETRY_STATUS_CODES.map(Number),
      retryAfter: true,
      ...options.retry,
    };
  }

  #isValidUserAgent(userAgent: string): boolean {
    return ConfigManager.API.USER_AGENT_PATTERN.test(userAgent);
  }

  async #cleanupProxy(): Promise<void> {
    if (this.#proxyAgent) {
      await this.#proxyAgent.close();
    }
  }

  #setupNewProxy(proxyOptions: ProxyAgent.Options): void {
    this.#proxyAgent = new ProxyAgent({
      allowH2: true,
      ...proxyOptions,
    });
    this.options.proxy = proxyOptions;
  }

  #removeProxy(): void {
    this.#proxyAgent = null;
    this.options.proxy = { uri: "" };
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
}
