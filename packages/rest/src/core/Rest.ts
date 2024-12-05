import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import { EventEmitter } from "eventemitter3";
import FormData from "form-data";
import { Gunzip } from "minizlib";
import { type Dispatcher, Pool } from "undici";
import type { BaseRouter } from "../routes/base.js";
import {
  ApplicationCommandRouter,
  ApplicationConnectionRouter,
  ApplicationRouter,
  AuditLogRouter,
  AutoModerationRouter,
  ChannelRouter,
  EmojiRouter,
  EntitlementRouter,
  GatewayRouter,
  GuildRouter,
  GuildTemplateRouter,
  InteractionRouter,
  InviteRouter,
  MessageRouter,
  OAuth2Router,
  PollRouter,
  ScheduledEventRouter,
  SkuRouter,
  SoundboardRouter,
  StageInstanceRouter,
  StickerRouter,
  SubscriptionRouter,
  UserRouter,
  VoiceRouter,
  WebhookRouter,
} from "../routes/index.js";
import type {
  BatchRequestOptions,
  BatchRequestResult,
  DiscordUserAgent,
  PathLike,
  RateLimitEntity,
  RateLimitHitEventData,
  RateLimitResponseEntity,
  RestEventMap,
  RestOptionsEntity,
  RouteEntity,
} from "../types/index.js";
import {
  type AuthTypeFlag,
  HttpMethodFlag,
  HttpStatusCode,
} from "../utils/index.js";

export class Rest extends EventEmitter<RestEventMap> {
  static readonly MAX_FILE_SIZE: number = 25 * 1024 * 1024;
  static readonly BASE_URL: string = "https://discord.com";

  readonly #pool: Pool;
  #options: RestOptionsEntity;
  #globalRateLimit: number | null = null;
  readonly #buckets = new Map<string, Omit<RateLimitEntity, "bucket">>();
  readonly #routers = new Map<string, BaseRouter>();
  readonly #routerDefinitions: Record<string, () => BaseRouter> = {
    applications: () => new ApplicationRouter(this),
    commands: () => new ApplicationCommandRouter(this),
    connections: () => new ApplicationConnectionRouter(this),
    auditLogs: () => new AuditLogRouter(this),
    autoModeration: () => new AutoModerationRouter(this),
    channels: () => new ChannelRouter(this),
    emojis: () => new EmojiRouter(this),
    entitlements: () => new EntitlementRouter(this),
    gateway: () => new GatewayRouter(this),
    guilds: () => new GuildRouter(this),
    templates: () => new GuildTemplateRouter(this),
    interactions: () => new InteractionRouter(this),
    invites: () => new InviteRouter(this),
    messages: () => new MessageRouter(this),
    oauth2: () => new OAuth2Router(this),
    polls: () => new PollRouter(this),
    scheduledEvents: () => new ScheduledEventRouter(this),
    skus: () => new SkuRouter(this),
    soundboards: () => new SoundboardRouter(this),
    stages: () => new StageInstanceRouter(this),
    stickers: () => new StickerRouter(this),
    subscriptions: () => new SubscriptionRouter(this),
    users: () => new UserRouter(this),
    voice: () => new VoiceRouter(this),
    webhooks: () => new WebhookRouter(this),
  } as const;

  constructor(options: RestOptionsEntity) {
    super();
    this.#validateConfiguration(options);
    this.#options = { ...options };
    this.#pool = new Pool(Rest.BASE_URL, {
      allowH2: true,
      connections: 10,
      pipelining: 1,
      keepAliveTimeout: 30000,
      keepAliveMaxTimeout: 60000,
      connect: {
        rejectUnauthorized: true,
      },
    });
  }

  get applications(): ApplicationRouter {
    return this.#getRouter("applications");
  }

  get commands(): ApplicationCommandRouter {
    return this.#getRouter("commands");
  }

  get connections(): ApplicationConnectionRouter {
    return this.#getRouter("connections");
  }

  get auditLogs(): AuditLogRouter {
    return this.#getRouter("auditLogs");
  }

  get autoModeration(): AutoModerationRouter {
    return this.#getRouter("autoModeration");
  }

  get channels(): ChannelRouter {
    return this.#getRouter("channels");
  }

  get emojis(): EmojiRouter {
    return this.#getRouter("emojis");
  }

  get entitlements(): EntitlementRouter {
    return this.#getRouter("entitlements");
  }

  get gateway(): GatewayRouter {
    return this.#getRouter("gateway");
  }

  get guilds(): GuildRouter {
    return this.#getRouter("guilds");
  }

  get templates(): GuildTemplateRouter {
    return this.#getRouter("templates");
  }

  get interactions(): InteractionRouter {
    return this.#getRouter("interactions");
  }

  get invites(): InviteRouter {
    return this.#getRouter("invites");
  }

  get messages(): MessageRouter {
    return this.#getRouter("messages");
  }

  get oauth2(): OAuth2Router {
    return this.#getRouter("oauth2");
  }

  get polls(): PollRouter {
    return this.#getRouter("polls");
  }

  get scheduledEvents(): ScheduledEventRouter {
    return this.#getRouter("scheduledEvents");
  }

  get skus(): SkuRouter {
    return this.#getRouter("skus");
  }

  get soundboards(): SoundboardRouter {
    return this.#getRouter("soundboards");
  }

  get stages(): StageInstanceRouter {
    return this.#getRouter("stages");
  }

  get stickers(): StickerRouter {
    return this.#getRouter("stickers");
  }

  get subscriptions(): SubscriptionRouter {
    return this.#getRouter("subscriptions");
  }

  get users(): UserRouter {
    return this.#getRouter("users");
  }

  get voice(): VoiceRouter {
    return this.#getRouter("voice");
  }

  get webhooks(): WebhookRouter {
    return this.#getRouter("webhooks");
  }

  get<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Get, path, ...options });
  }

  post<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Post, path, ...options });
  }

  put<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Put, path, ...options });
  }

  patch<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Patch, path, ...options });
  }

  delete<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Delete, path, ...options });
  }

  async destroy(): Promise<void> {
    this.emit("debug", "Destroying REST client");
    this.#buckets.clear();
    await this.#pool.destroy();
    this.#globalRateLimit = null;
    this.#routers.clear();
    this.removeAllListeners();
  }

  async request<T>(options: RouteEntity): Promise<T> {
    const normalizedPath: PathLike = options.path.startsWith("/")
      ? options.path
      : `/${options.path}`;
    const path: PathLike = `/api/v${this.#options.version.toString()}${normalizedPath}`;

    const startTime = Date.now();
    this.emit("debug", `Making request to ${path}`);
    await this.#handleRateLimits(normalizedPath);

    try {
      let requestOptions = { ...options };
      if (requestOptions.files) {
        this.emit("debug", "Processing files for upload");
        requestOptions = await this.#handleFiles(requestOptions);
      }

      const response = await this.#pool.request({
        path,
        headers: this.#buildHeaders(requestOptions),
        method: requestOptions.method,
        body: requestOptions.body,
        query: requestOptions.query,
      });

      const endTime = Date.now();
      this.emit("apiRequest", {
        method: requestOptions.method,
        path,
        status: response.statusCode,
        responseTime: endTime - startTime,
      });

      this.#updateRateLimits(response.headers as Record<string, string>);
      return this.#handleResponse<T>(response);
    } catch (error) {
      this.emit("error", new Error(String(error)));
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  async requestWithRetry<T>(
    options: RouteEntity,
    maxRetries = 3,
    baseDelay = 1000,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.request<T>(options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries - 1) {
          const delay = this.generateJitterDelay(baseDelay * 2 ** attempt);
          this.emit(
            "debug",
            `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
          );
          await this.#wait(delay);
        }
      }
    }

    throw lastError ?? new Error("An unknown error occurred");
  }

  async batchRequest<T>(
    options: BatchRequestOptions<T>,
  ): Promise<BatchRequestResult<T>> {
    const {
      requests,
      concurrency = 5,
      abortOnError = false,
      onProgress,
    } = options;

    const startTime = Date.now();
    const timings: number[] = [];
    const results: (T | Error)[] = new Array(requests.length);
    const successful: T[] = [];
    const failed: Error[] = [];

    const pool = new Set<Promise<void>>();
    let currentIndex = 0;

    const processRequest = async (index: number): Promise<void> => {
      const request = requests[index];
      if (!request) {
        return;
      }

      const requestStartTime = Date.now();

      try {
        if (this.isRateLimited(request.path)) {
          const bucketKey = this.#getBucketKey(request.path);
          const rateLimit = this.#buckets.get(bucketKey);
          const delay = (rateLimit?.reset ?? 0) * 1000 - Date.now();
          if (delay > 0) {
            await this.#wait(delay);
          }
        }

        const result = await this.request<T>({
          method: request.method,
          path: request.path,
          ...request.options,
        });

        results[index] = result;
        successful.push(result);
        timings.push(Date.now() - requestStartTime);

        onProgress?.(
          successful.length + failed.length,
          requests.length,
          result,
        );
      } catch (error) {
        const errorObject =
          error instanceof Error ? error : new Error(String(error));
        results[index] = errorObject;
        failed.push(errorObject);

        if (abortOnError) {
          throw errorObject;
        }

        onProgress?.(successful.length + failed.length, requests.length);
      }
    };

    while (currentIndex < requests.length || pool.size > 0) {
      while (pool.size < concurrency && currentIndex < requests.length) {
        const promise = processRequest(currentIndex++);
        pool.add(promise);
        promise.finally(() => pool.delete(promise));
      }

      if (pool.size > 0) {
        await Promise.race(Array.from(pool));
      }
    }

    const endTime = Date.now();

    return {
      results,
      successful,
      failed,
      timings: {
        total: endTime - startTime,
        average: timings.reduce((a, b) => a + b, 0) / timings.length,
        fastest: Math.min(...timings),
        slowest: Math.max(...timings),
      },
    };
  }

  generateJitterDelay(baseDelay = 1000): number {
    return baseDelay + Math.random() * 1000;
  }

  isRateLimited(path: string): boolean {
    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#buckets.get(bucketKey);

    if (this.#globalRateLimit && Date.now() < this.#globalRateLimit) {
      return true;
    }

    if (rateLimit?.remaining === 0) {
      const resetTime = rateLimit.reset * 1000;
      return Date.now() < resetTime;
    }

    return false;
  }

  updateToken(token: string): void {
    if (!this.#isValidToken(token)) {
      throw new Error("Token cannot be empty");
    }
    this.#options.token = token;
    this.emit("debug", "Token updated successfully");
  }

  updateAuthType(authType: AuthTypeFlag): void {
    this.#options.authType = authType;
    this.emit("debug", `Auth type updated to ${authType}`);
  }

  updateUserAgent(userAgent: DiscordUserAgent): void {
    if (!this.#isValidUserAgent(userAgent)) {
      throw new Error("Invalid user agent format");
    }
    this.#options.userAgent = userAgent;
    this.emit("debug", "User agent updated");
  }

  updateCompression(compress: boolean): void {
    this.#options.compress = compress;
    this.emit("debug", `Compression ${compress ? "enabled" : "disabled"}`);
  }

  updateConfiguration(options: Partial<RestOptionsEntity>): void {
    const newConfiguration = { ...this.#options, ...options };
    this.#validateConfiguration(newConfiguration);
    this.#options = newConfiguration;
    this.emit("debug", "Rest configuration updated successfully");
  }

  getConfiguration(): Readonly<RestOptionsEntity> {
    return Object.freeze({ ...this.#options });
  }

  #getRouter<T>(key: string): T {
    if (!this.#routers.has(key) && this.#routerDefinitions[key]) {
      this.#routers.set(key, this.#routerDefinitions[key]());
    }
    return this.#routers.get(key) as T;
  }

  #isValidToken(token?: string): boolean {
    if (!token) {
      return false;
    }

    return token.length > 0;
  }

  #isValidUserAgent(userAgent: string): boolean {
    return /^DiscordBot \(https?:\/\/.*?, [\d.]+\)$/.test(userAgent);
  }

  #validateConfiguration(
    options: Partial<RestOptionsEntity> | RestOptionsEntity,
  ): void {
    if (!this.#isValidToken(options.token)) {
      throw new Error("Token is required");
    }

    if (options.userAgent && !this.#isValidUserAgent(options.userAgent)) {
      throw new Error("Invalid user agent format");
    }
  }

  async #handleResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = await this.#decompressResponse(response);

    if (response.statusCode !== HttpStatusCode.Ok) {
      if (response.statusCode === HttpStatusCode.TooManyRequests) {
        const error = JSON.parse(data.toString()) as RateLimitResponseEntity;
        const retryAfter = error.retry_after * 1000;

        if (error.global) {
          this.#globalRateLimit = Date.now() + retryAfter;
          this.emit(
            "warn",
            `Global rate limit exceeded, retry after ${retryAfter}ms`,
          );
          throw new Error(
            `Global rate limit exceeded, retry after ${retryAfter}ms`,
          );
        }

        this.emit("warn", `Route rate limited, retry after ${retryAfter}ms`);
        throw new Error(`Route rate limited, retry after ${retryAfter}ms`);
      }

      this.emit(
        "error",
        new Error(`HTTP error ${response.statusCode}: ${data.toString()}`),
      );
      throw new Error(`HTTP error ${response.statusCode}: ${data.toString()}`);
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      return JSON.parse(data.toString()) as T;
    }

    return data as unknown as T;
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const buffer = Buffer.from(await response.body.arrayBuffer());

    if (
      !this.#options.compress ||
      response.headers["content-encoding"] !== "gzip"
    ) {
      return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const decompressor = new Gunzip({ level: 9 });

      decompressor
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", (error) => {
          this.emit("error", new Error(String(error)));
          reject(error);
        })
        .end(buffer);
    });
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      "content-type": "application/json",
    };

    if (this.#options.compress) {
      headers["accept-encoding"] = "gzip";
    }

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...options.headers };
  }

  async #handleFiles(options: RouteEntity): Promise<RouteEntity> {
    const form = new FormData();
    const files = Array.isArray(options.files)
      ? options.files
      : [options.files];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        continue;
      }

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      if (typeof file === "string") {
        const stats = await stat(file);
        if (stats.size > Rest.MAX_FILE_SIZE) {
          const error = new Error(
            `File too large: max size is ${Rest.MAX_FILE_SIZE} bytes`,
          );
          this.emit("error", error);
          throw error;
        }

        const handle = await open(file);
        try {
          buffer = await handle.readFile();
          filename = basename(file);
          contentType = "application/octet-stream";
        } finally {
          await handle.close();
        }
      } else if (file instanceof File) {
        if (file.size > Rest.MAX_FILE_SIZE) {
          const error = new Error(
            `File too large: max size is ${Rest.MAX_FILE_SIZE} bytes`,
          );
          this.emit("error", error);
          throw error;
        }
        buffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
        contentType = file.type;
      } else {
        const error = new Error(`Invalid file type at index ${i}`);
        this.emit("error", error);
        throw error;
      }

      form.append(files.length === 1 ? "file" : `files[${i}]`, buffer, {
        filename,
        contentType,
      });
    }

    if (options.body) {
      form.append("payload_json", options.body);
    }

    return {
      ...options,
      body: form.getBuffer(),
      headers: form.getHeaders(options.headers),
    };
  }

  #updateRateLimits(headers: Record<string, string>): void {
    const bucket = headers["x-ratelimit-bucket"];
    if (!bucket) {
      return;
    }

    const reset = Number(headers["x-ratelimit-reset"]);
    const resetAfter = Number(headers["x-ratelimit-reset-after"]);
    const remaining = Number(headers["x-ratelimit-remaining"]);
    const limit = Number(headers["x-ratelimit-limit"]);
    const global = Boolean(headers["x-ratelimit-global"]);
    const scope = String(
      headers["x-ratelimit-scope"],
    ) as RateLimitHitEventData["scope"];

    if ([reset, resetAfter, remaining, limit].some(Number.isNaN) || !bucket) {
      this.emit("warn", "Invalid rate limit headers received");
      return;
    }

    if (remaining === 0) {
      this.emit("rateLimitHit", {
        bucket,
        resetAfter,
        limit,
        scope,
      });
    }

    this.#buckets.set(bucket, {
      limit,
      remaining,
      reset,
      resetAfter,
      global,
      scope,
    });

    if (global) {
      const retryAfter = headers["retry-after"];
      if (retryAfter) {
        this.#globalRateLimit = Date.now() + Number(retryAfter) * 1000;
        this.emit(
          "debug",
          `Setting global rate limit for ${retryAfter} seconds`,
        );
      }
    }
  }

  #getBucketKey(path: string): string {
    const majorIdMatch = path.match(/^\/(?:channels|guilds|webhooks)\/(\d+)/);
    if (majorIdMatch) {
      const [, majorId] = majorIdMatch;
      return `${majorId}:${path}`;
    }
    return path;
  }

  async #handleRateLimits(path: string): Promise<void> {
    if (this.#globalRateLimit && Date.now() < this.#globalRateLimit) {
      const delay = this.#globalRateLimit - Date.now();
      this.emit("warn", `Global rate limit hit, waiting ${delay}ms`);
      await this.#wait(delay);
      return;
    }

    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#buckets.get(bucketKey);

    if (rateLimit?.remaining === 0) {
      const resetTime = rateLimit.reset * 1000;
      if (Date.now() < resetTime) {
        const delay = resetTime - Date.now();
        this.emit(
          "debug",
          `Rate limit for bucket ${bucketKey}, waiting ${delay}ms`,
        );
        await this.#wait(delay);
      }
    }
  }

  async #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
