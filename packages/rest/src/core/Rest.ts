import { MimeType } from "@nyxjs/core";
import { Pool, RetryAgent, type RetryHandler } from "undici";
import { HttpMethod, HttpStatusCode, JsonErrorCode } from "../enums/index.js";
import { RateLimitManager } from "../managers/RateLimitManager.js";
import { RequestHandler } from "../managers/index.js";
import {
  ApplicationCommandsRouter,
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
import type { RequestOptions, RestOptions, RouteLike } from "../types/index.js";

export class Rest {
  static readonly #routerInstances = new WeakMap<
    Rest,
    Map<string, () => unknown>
  >();
  readonly #pool: Pool;
  readonly #retryAgent: RetryAgent;
  readonly #rateLimit: RateLimitManager;
  readonly #requestHandler: RequestHandler;
  readonly #options: RestOptions;
  readonly #activeRequests = new Set<Promise<unknown>>();
  readonly #abortController = new AbortController();
  #isDestroyed = false;

  constructor(options: RestOptions) {
    this.#options = options;
    this.#pool = this.#createPool();
    this.#retryAgent = this.#createRetryAgent();
    this.#rateLimit = new RateLimitManager();
    this.#requestHandler = new RequestHandler();

    Rest.#routerInstances.set(this, new Map());

    this.#setupAbortListener();
  }

  get isDestroyed(): boolean {
    return this.#isDestroyed;
  }

  get baseUrl(): URL {
    return new URL(`https://discord.com/api/v${this.#options.version}`);
  }

  get applications(): ApplicationRouter {
    return this.#getRouter("applications", ApplicationRouter);
  }

  get applicationCommands(): ApplicationCommandsRouter {
    return this.#getRouter("applicationCommands", ApplicationCommandsRouter);
  }

  get applicationConnections(): ApplicationConnectionRouter {
    return this.#getRouter(
      "applicationConnections",
      ApplicationConnectionRouter,
    );
  }

  get auditLogs(): AuditLogRouter {
    return this.#getRouter("auditLogs", AuditLogRouter);
  }

  get autoModeration(): AutoModerationRouter {
    return this.#getRouter("autoModeration", AutoModerationRouter);
  }

  get channels(): ChannelRouter {
    return this.#getRouter("channels", ChannelRouter);
  }

  get emojis(): EmojiRouter {
    return this.#getRouter("emojis", EmojiRouter);
  }

  get entitlements(): EntitlementRouter {
    return this.#getRouter("entitlements", EntitlementRouter);
  }

  get gateway(): GatewayRouter {
    return this.#getRouter("gateway", GatewayRouter);
  }

  get guilds(): GuildRouter {
    return this.#getRouter("guilds", GuildRouter);
  }

  get guildTemplates(): GuildTemplateRouter {
    return this.#getRouter("guildTemplates", GuildTemplateRouter);
  }

  get interactions(): InteractionRouter {
    return this.#getRouter("interactions", InteractionRouter);
  }

  get invites(): InviteRouter {
    return this.#getRouter("invites", InviteRouter);
  }

  get messages(): MessageRouter {
    return this.#getRouter("messages", MessageRouter);
  }

  get oauth2(): OAuth2Router {
    return this.#getRouter("oauth2", OAuth2Router);
  }

  get polls(): PollRouter {
    return this.#getRouter("polls", PollRouter);
  }

  get scheduledEvents(): ScheduledEventRouter {
    return this.#getRouter("scheduledEvents", ScheduledEventRouter);
  }

  get skus(): SkuRouter {
    return this.#getRouter("skus", SkuRouter);
  }

  get soundboards(): SoundboardRouter {
    return this.#getRouter("soundboards", SoundboardRouter);
  }

  get stageInstances(): StageInstanceRouter {
    return this.#getRouter("stageInstances", StageInstanceRouter);
  }

  get stickers(): StickerRouter {
    return this.#getRouter("stickers", StickerRouter);
  }

  get subscriptions(): SubscriptionRouter {
    return this.#getRouter("subscriptions", SubscriptionRouter);
  }

  get users(): UserRouter {
    return this.#getRouter("users", UserRouter);
  }

  get voices(): VoiceRouter {
    return this.#getRouter("voices", VoiceRouter);
  }

  get webhooks(): WebhookRouter {
    return this.#getRouter("webhooks", WebhookRouter);
  }

  get<T = unknown>(
    path: RouteLike,
    options?: Omit<RequestOptions, "path" | "method">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Get, path, ...options });
  }

  post<T = unknown>(
    path: RouteLike,
    options?: Omit<RequestOptions, "path" | "method">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Post, path, ...options });
  }

  put<T = unknown>(
    path: RouteLike,
    options?: Omit<RequestOptions, "path" | "method">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Put, path, ...options });
  }

  patch<T = unknown>(
    path: RouteLike,
    options?: Omit<RequestOptions, "path" | "method">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Patch, path, ...options });
  }

  delete<T = unknown>(
    path: RouteLike,
    options?: Omit<RequestOptions, "path" | "method">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Delete, path, ...options });
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    this.#checkDestroyed();

    const requestAbortController = new AbortController();
    const cleanup = () => requestAbortController.abort();
    this.#abortController.signal.addEventListener("abort", cleanup);

    const requestPromise = this.#executeRequest<T>(
      options,
      requestAbortController.signal,
    );
    this.#activeRequests.add(requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.#activeRequests.delete(requestPromise);
      this.#abortController.signal.removeEventListener("abort", cleanup);
    }
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#abortController.abort();

    try {
      await this.#cleanupRequests();
    } finally {
      this.#rateLimit.destroy();
      await Promise.all([this.#pool.close(), this.#retryAgent.close()]);
      this.#activeRequests.clear();
      Rest.#routerInstances.delete(this);
    }
  }

  #getRouter<T = unknown>(key: string, RouterClass: new (rest: Rest) => T): T {
    this.#checkDestroyed();

    const instances = Rest.#routerInstances.get(this);
    if (!instances) {
      throw new Error("Router instances not initialized");
    }

    let router = instances.get(key) as T | undefined;
    if (!router) {
      router = new RouterClass(this);
      instances.set(key, router as () => unknown);
    }

    return router;
  }

  #checkDestroyed(): void {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }
  }

  #setupAbortListener(): void {
    this.#abortController.signal.addEventListener("abort", async () => {
      await this.#cleanupRequests();
    });
  }

  async #cleanupRequests(): Promise<void> {
    await Promise.allSettled(Array.from(this.#activeRequests));
    this.#activeRequests.clear();
  }

  async #executeRequest<T>(
    options: RequestOptions,
    signal: AbortSignal,
  ): Promise<T> {
    // Handle rate limits using the RateLimitManager
    for (const waitTime of this.#rateLimit.waitForRateLimit(options)) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const headers = this.#buildHeaders(options);
    const response = await this.#retryAgent.request({
      method: options.method,
      path: this.baseUrl.pathname + options.path,
      headers,
      body: options.body,
      signal,
      query: options.query as Record<string, unknown>,
    });

    // Use RequestHandler for response processing
    return this.#requestHandler.handleResponse<T>(
      response,
      options,
      this.#rateLimit,
    );
  }

  #buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "accept-encoding": "br, gzip",
      "content-type": options.headers?.["content-type"] ?? MimeType.Json,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      ...options.headers,
    };

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

  #createPool(): Pool {
    return new Pool(this.baseUrl.origin, {
      allowH2: true,
      ...this.#options.pool,
    });
  }

  #createRetryAgent(): RetryAgent {
    const retryOptions: RetryHandler.RetryOptions = {
      retryAfter: true,
      maxRetries: this.#options.retries ?? 2,
      methods: Object.values(HttpMethod),
      statusCodes: Object.values(HttpStatusCode).map(Number),
      errorCodes: Object.values(JsonErrorCode).map(String),
      ...this.#options.retry,
    };

    return new RetryAgent(this.#pool, retryOptions);
  }
}
