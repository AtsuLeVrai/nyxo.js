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
import { HttpMethodFlag } from "../utils/index.js";

export class Rest extends EventEmitter<RestEventMap> {
  readonly #configManager: ConfigManager;
  readonly #fileHandler: FileHandler;
  readonly #rateLimiter: RateLimiter;
  readonly #requestHandler: RequestHandler;
  readonly #routerManager: RouterManager;
  #isDestroyed = false;

  constructor(options: RestOptionsEntity) {
    super();

    this.#configManager = new ConfigManager(this, options);
    this.#fileHandler = new FileHandler(this);
    this.#rateLimiter = new RateLimiter(this);
    this.#requestHandler = new RequestHandler(this, this.#configManager);
    this.#routerManager = new RouterManager(this);
  }

  get destroyed(): boolean {
    return this.#isDestroyed;
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    this.#ensureNotDestroyed();
    return this.request<T>({
      ...options,
      method: HttpMethodFlag.Get,
      path: path,
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
      path: path as `/${string}`,
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
      path: path as `/${string}`,
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
      path: path as `/${string}`,
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
      path: path as `/${string}`,
    });
  }

  updateProxy(proxyOptions: ProxyAgent.Options | null): void {
    this.#ensureNotDestroyed();
    this.#configManager.updateProxy(proxyOptions);
  }

  getConfig(): Required<RestOptionsEntity> {
    this.#ensureNotDestroyed();
    return this.#configManager.options;
  }

  processFiles(options: RouteEntity): Promise<RouteEntity> {
    this.#ensureNotDestroyed();
    return this.#fileHandler.handleFiles(options);
  }

  async checkRateLimit(path: string): Promise<void> {
    this.#ensureNotDestroyed();
    await this.#rateLimiter.checkRateLimits(path);
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    this.#ensureNotDestroyed();
    this.#rateLimiter.updateRateLimits(headers, statusCode);
  }

  async request<T>(options: RouteEntity): Promise<T> {
    this.#ensureNotDestroyed();
    await this.checkRateLimit(options.path);

    let requestOptions = options;
    if (requestOptions.files) {
      requestOptions = await this.processFiles(requestOptions);
    }

    return this.#requestHandler.execute<T>(requestOptions);
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    this.#ensureNotDestroyed();
    return this.#routerManager.getRouter(key);
  }

  hasRouter(key: RouterKey): boolean {
    this.#ensureNotDestroyed();
    return this.#routerManager.hasRouter(key);
  }

  getAvailableRouters(): RouterKey[] {
    this.#ensureNotDestroyed();
    return this.#routerManager.getAvailableRouters();
  }

  clearRouters(): void {
    this.#ensureNotDestroyed();
    this.#routerManager.clearRouters();
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.emit("debug", "Starting Rest client cleanup");

    try {
      await Promise.all([
        this.#configManager.destroy(),
        this.#requestHandler.destroy(),
        this.#routerManager.destroy(),
      ]);

      this.#fileHandler.destroy();
      this.#rateLimiter.destroy();

      this.removeAllListeners();
      this.emit("debug", "Rest client cleanup completed");
    } catch (error) {
      this.emit(
        "error",
        new Error(
          `Failed to cleanup Rest client: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      throw error;
    }
  }

  #ensureNotDestroyed(): void {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }
  }
}
