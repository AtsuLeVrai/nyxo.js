import type { ApiVersion, PremiumTier } from "@nyxjs/core";
import type { ProxyAgent } from "undici";
import {
  ConfigManager,
  FileHandlerManager,
  RequestManager,
  RestRateLimitManager,
  RouterManager,
  TokenManager,
} from "../managers/index.js";
import {
  type AuthTypeFlag,
  HttpMethodFlag,
  type PathLike,
  type RestOptions,
  type RouteEntity,
  type RouterDefinitions,
  type RouterKey,
} from "../types/index.js";

export class Rest {
  static readonly CDN_URL = "https://cdn.discordapp.com";
  static readonly MEDIA_URL = "https://media.discordapp.net";
  static readonly API_URL = "https://discord.com/api";

  readonly config: ConfigManager;
  readonly file: FileHandlerManager;
  readonly rateLimit: RestRateLimitManager;
  readonly request: RequestManager;
  readonly router: RouterManager;
  readonly token: TokenManager;

  private retryOnRateLimit = true;
  private isDestroyed = false;

  constructor(options: RestOptions) {
    this.#validateOptions(options);

    this.token = new TokenManager(options.token);
    this.config = new ConfigManager({
      ...options,
      token: this.token.value,
    });
    this.file = new FileHandlerManager();
    this.rateLimit = new RestRateLimitManager();
    this.request = new RequestManager(this.rateLimit, this.config);
    this.router = new RouterManager(this);
  }

  get destroyed(): boolean {
    return this.isDestroyed;
  }

  get apiVersion(): ApiVersion.V10 {
    return this.config.options.version;
  }

  setRetryOnRateLimit(retry: boolean): void {
    this.#validateClientState();
    this.retryOnRateLimit = retry;
  }

  setCompression(enabled: boolean): void {
    this.#validateClientState();
    this.config.options.compress = enabled;
  }

  setAuthType(authType: AuthTypeFlag): void {
    this.#validateClientState();
    this.config.options.authType = authType;
  }

  setBoostTier(tier: PremiumTier): void {
    this.#validateClientState();
    this.file.setBoostTier(tier);
  }

  async makeRequest<T>(options: RouteEntity): Promise<T> {
    this.#validateClientState();

    const path = this.#normalizePath(options.path);
    const finalOptions = { ...options, path };

    if (!path.startsWith("/interactions")) {
      await this.checkRateLimit(path);
    }

    if (finalOptions.files) {
      return this.request.execute<T>(await this.processFiles(finalOptions));
    }

    return this.request.execute<T>(finalOptions);
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.makeRequest<T>({
      ...options,
      method: HttpMethodFlag.Get,
      path,
    });
  }

  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.makeRequest<T>({
      ...options,
      method: HttpMethodFlag.Post,
      path,
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.makeRequest<T>({
      ...options,
      method: HttpMethodFlag.Put,
      path,
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.makeRequest<T>({
      ...options,
      method: HttpMethodFlag.Patch,
      path,
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.makeRequest<T>({
      ...options,
      method: HttpMethodFlag.Delete,
      path,
    });
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    this.#validateClientState();
    return this.router.getRouter(key);
  }

  hasRouter(key: RouterKey): boolean {
    this.#validateClientState();
    return this.router.hasRouter(key);
  }

  getAvailableRouters(): RouterKey[] {
    this.#validateClientState();
    return this.router.getAvailableRouters();
  }

  getCachedRouters(): RouterKey[] {
    this.#validateClientState();
    return this.router.getCachedRouters();
  }

  clearRouters(): void {
    this.#validateClientState();
    this.router.clearRouters();
  }

  isCachedRouter(key: RouterKey): boolean {
    this.#validateClientState();
    return this.router.isCached(key);
  }

  removeCachedRouter(key: RouterKey): boolean {
    this.#validateClientState();
    return this.router.removeCachedRouter(key);
  }

  processFiles(options: RouteEntity): Promise<RouteEntity> {
    this.#validateClientState();
    return this.file.handleFiles(options);
  }

  async checkRateLimit(path: string): Promise<void> {
    this.#validateClientState();
    if (this.retryOnRateLimit) {
      await this.rateLimit.checkRateLimits(path);
    }
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    this.#validateClientState();
    this.rateLimit.updateRateLimits(headers, statusCode);
  }

  async updateProxy(proxyOptions: ProxyAgent.Options | null): Promise<void> {
    this.#validateClientState();
    await this.config.updateProxy(proxyOptions);
  }

  getConfig(): Required<RestOptions> {
    this.#validateClientState();
    return this.config.options;
  }

  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    this.rateLimit.destroy();
    await Promise.all([
      this.config.destroy(),
      this.request.destroy(),
      this.router.destroy(),
    ]);
  }

  #validateClientState(): void {
    if (this.isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }
  }

  #validateOptions(options: RestOptions): void {
    if (!options.token) {
      throw new Error("Token is required");
    }
  }

  #normalizePath(path: string): PathLike {
    return path.startsWith("/") ? (path as PathLike) : `/${path}`;
  }
}
