import type { ApiVersion } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import type { ProxyAgent } from "undici";
import {
  ConfigManager,
  FileHandler,
  RateLimiter,
  RequestHandler,
  RouterManager,
} from "../managers/index.js";
import type {
  PathLike,
  RestEventMap,
  RestOptionsEntity,
  RouteEntity,
  RouterDefinitions,
  RouterKey,
} from "../types/index.js";
import { HttpMethodFlag } from "../types/index.js";

export class Rest extends EventEmitter<RestEventMap> {
  static readonly CDN_URL = "https://cdn.discordapp.com";
  static readonly MEDIA_URL = "https://media.discordapp.net";
  static readonly API_URL = "https://discord.com/api";
  readonly configManager: ConfigManager;
  readonly fileHandler: FileHandler;
  readonly rateLimiter: RateLimiter;
  readonly requestHandler: RequestHandler;
  readonly routerManager: RouterManager;
  #isDestroyed = false;
  #retryOnRateLimit = true;

  constructor(options: RestOptionsEntity) {
    super();

    this.configManager = new ConfigManager(this, options);
    this.fileHandler = new FileHandler(this);
    this.rateLimiter = new RateLimiter(this);
    this.requestHandler = new RequestHandler(this, this.configManager);
    this.routerManager = new RouterManager(this);

    this.emit(
      "debug",
      `Rest client created with API version ${options.version}`,
    );
  }

  get destroyed(): boolean {
    return this.#isDestroyed;
  }

  get apiVersion(): ApiVersion.V10 {
    return this.configManager.options.version;
  }

  setRetryOnRateLimit(retry: boolean): void {
    this.#retryOnRateLimit = retry;
  }

  setCompression(enabled: boolean): void {
    this.configManager.options.compress = enabled;
    this.emit("debug", `Compression ${enabled ? "enabled" : "disabled"}`);
  }

  async request<T>(options: RouteEntity): Promise<T> {
    this.#ensureNotDestroyed();

    const path = this.#normalizePath(options.path);
    const finalOptions = { ...options, path };

    if (!path.startsWith("/interactions")) {
      await this.checkRateLimit(path);
    }

    let requestOptions = finalOptions;
    if (finalOptions.files) {
      this.emit("debug", "Processing files for request");
      requestOptions = await this.processFiles(finalOptions);
    }

    return this.requestHandler.execute<T>(requestOptions);
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Get,
      path,
    });
  }

  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Post,
      path: path,
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Put,
      path: path,
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Patch,
      path: path,
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Delete,
      path: path,
    });
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    this.#ensureNotDestroyed();
    return this.routerManager.getRouter(key);
  }

  hasRouter(key: RouterKey): boolean {
    this.#ensureNotDestroyed();
    return this.routerManager.hasRouter(key);
  }

  getAvailableRouters(): RouterKey[] {
    this.#ensureNotDestroyed();
    return this.routerManager.getAvailableRouters();
  }

  clearRouters(): void {
    this.#ensureNotDestroyed();
    this.routerManager.clearRouters();
  }

  updateProxy(proxyOptions: ProxyAgent.Options | null): void {
    this.#ensureNotDestroyed();
    this.configManager.updateProxy(proxyOptions);
  }

  getConfig(): Required<RestOptionsEntity> {
    this.#ensureNotDestroyed();
    return this.configManager.options;
  }

  processFiles(options: RouteEntity): Promise<RouteEntity> {
    this.#ensureNotDestroyed();
    return this.fileHandler.handleFiles(options);
  }

  setBoostTier(tier: number): void {
    this.#ensureNotDestroyed();
    this.fileHandler.setBoostTier(tier);
  }

  async checkRateLimit(path: string): Promise<void> {
    this.#ensureNotDestroyed();
    if (this.#retryOnRateLimit) {
      await this.rateLimiter.checkRateLimits(path);
    }
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    this.#ensureNotDestroyed();
    this.rateLimiter.updateRateLimits(headers, statusCode);
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.emit("debug", "Starting Rest client cleanup");

    try {
      await Promise.all([
        this.configManager.destroy(),
        this.requestHandler.destroy(),
        this.routerManager.destroy(),
      ]);

      this.fileHandler.destroy();
      this.rateLimiter.destroy();

      this.removeAllListeners();

      this.emit("debug", "Rest client cleanup completed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.emit(
        "error",
        new Error(`Failed to cleanup Rest client: ${errorMessage}`),
      );
      throw error;
    }
  }

  #ensureNotDestroyed(): void {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }
  }

  #normalizePath(path: string): PathLike {
    return path.startsWith("/") ? (path as PathLike) : `/${path}`;
  }
}
