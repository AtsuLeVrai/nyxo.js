import { MimeType } from "@nyxjs/core";
import { BrotliDecompress, Gunzip } from "minizlib";
import { type Dispatcher, Pool, RetryAgent, type RetryHandler } from "undici";
import { HttpMethod, HttpStatusCode, JsonErrorCode } from "../enums/index.js";
import { RateLimitManager } from "../managers/index.js";
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
import type {
  RateLimitResponseEntity,
  RequestOptions,
  RestOptions,
  RouteLike,
} from "../types/index.js";

export class Rest {
  #options: RestOptions;
  readonly #pool: Pool;
  readonly #retryAgent: RetryAgent;
  readonly #rateLimit = new RateLimitManager();
  readonly #abortController = new AbortController();
  readonly #activeRequests: Set<Promise<unknown>> = new Set();
  #isDestroyed = false;

  #applications: ApplicationRouter | null = null;
  #applicationCommands: ApplicationCommandsRouter | null = null;
  #applicationConnections: ApplicationConnectionRouter | null = null;
  #auditLogs: AuditLogRouter | null = null;
  #autoModeration: AutoModerationRouter | null = null;
  #channels: ChannelRouter | null = null;
  #emojis: EmojiRouter | null = null;
  #entitlements: EntitlementRouter | null = null;
  #gateway: GatewayRouter | null = null;
  #guilds: GuildRouter | null = null;
  #guildTemplates: GuildTemplateRouter | null = null;
  #interactions: InteractionRouter | null = null;
  #invites: InviteRouter | null = null;
  #messages: MessageRouter | null = null;
  #oauth2: OAuth2Router | null = null;
  #polls: PollRouter | null = null;
  #scheduledEvents: ScheduledEventRouter | null = null;
  #skus: SkuRouter | null = null;
  #soundboards: SoundboardRouter | null = null;
  #stageInstances: StageInstanceRouter | null = null;
  #stickers: StickerRouter | null = null;
  #subscriptions: SubscriptionRouter | null = null;
  #users: UserRouter | null = null;
  #voices: VoiceRouter | null = null;
  #webhooks: WebhookRouter | null = null;

  constructor(options: RestOptions) {
    this.#options = options;
    this.#pool = this.#createPool();
    this.#retryAgent = this.#createRetryAgent();
    this.#abortController.signal.addEventListener("abort", async () => {
      await this.#cleanupRequests();
    });
  }

  get applications(): ApplicationRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applications) {
      this.#applications = new ApplicationRouter(this);
    }

    return this.#applications;
  }

  get applicationCommands(): ApplicationCommandsRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applicationCommands) {
      this.#applicationCommands = new ApplicationCommandsRouter(this);
    }

    return this.#applicationCommands;
  }

  get applicationConnections(): ApplicationConnectionRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applicationConnections) {
      this.#applicationConnections = new ApplicationConnectionRouter(this);
    }

    return this.#applicationConnections;
  }

  get auditLogs(): AuditLogRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#auditLogs) {
      this.#auditLogs = new AuditLogRouter(this);
    }

    return this.#auditLogs;
  }

  get autoModeration(): AutoModerationRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#autoModeration) {
      this.#autoModeration = new AutoModerationRouter(this);
    }

    return this.#autoModeration;
  }

  get channels(): ChannelRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#channels) {
      this.#channels = new ChannelRouter(this);
    }

    return this.#channels;
  }

  get emojis(): EmojiRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#emojis) {
      this.#emojis = new EmojiRouter(this);
    }

    return this.#emojis;
  }

  get entitlements(): EntitlementRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#entitlements) {
      this.#entitlements = new EntitlementRouter(this);
    }

    return this.#entitlements;
  }

  get gateway(): GatewayRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#gateway) {
      this.#gateway = new GatewayRouter(this);
    }

    return this.#gateway;
  }

  get guilds(): GuildRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#guilds) {
      this.#guilds = new GuildRouter(this);
    }

    return this.#guilds;
  }

  get guildTemplates(): GuildTemplateRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#guildTemplates) {
      this.#guildTemplates = new GuildTemplateRouter(this);
    }

    return this.#guildTemplates;
  }

  get interactions(): InteractionRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#interactions) {
      this.#interactions = new InteractionRouter(this);
    }

    return this.#interactions;
  }

  get invites(): InviteRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#invites) {
      this.#invites = new InviteRouter(this);
    }

    return this.#invites;
  }

  get messages(): MessageRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#messages) {
      this.#messages = new MessageRouter(this);
    }

    return this.#messages;
  }

  get oauth2(): OAuth2Router {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#oauth2) {
      this.#oauth2 = new OAuth2Router(this);
    }

    return this.#oauth2;
  }

  get polls(): PollRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#polls) {
      this.#polls = new PollRouter(this);
    }

    return this.#polls;
  }

  get scheduledEvents(): ScheduledEventRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#scheduledEvents) {
      this.#scheduledEvents = new ScheduledEventRouter(this);
    }

    return this.#scheduledEvents;
  }

  get skus(): SkuRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#skus) {
      this.#skus = new SkuRouter(this);
    }

    return this.#skus;
  }

  get soundboards(): SoundboardRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#soundboards) {
      this.#soundboards = new SoundboardRouter(this);
    }

    return this.#soundboards;
  }

  get stageInstances(): StageInstanceRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#stageInstances) {
      this.#stageInstances = new StageInstanceRouter(this);
    }

    return this.#stageInstances;
  }

  get stickers(): StickerRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#stickers) {
      this.#stickers = new StickerRouter(this);
    }

    return this.#stickers;
  }

  get subscriptions(): SubscriptionRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#subscriptions) {
      this.#subscriptions = new SubscriptionRouter(this);
    }

    return this.#subscriptions;
  }

  get users(): UserRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#users) {
      this.#users = new UserRouter(this);
    }

    return this.#users;
  }

  get voices(): VoiceRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#voices) {
      this.#voices = new VoiceRouter(this);
    }

    return this.#voices;
  }

  get webhooks(): WebhookRouter {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#webhooks) {
      this.#webhooks = new WebhookRouter(this);
    }

    return this.#webhooks;
  }

  get isDestroyed(): boolean {
    return this.#isDestroyed;
  }

  get baseUrl(): URL {
    return new URL(
      `https://discord.com/api/v${this.#options.version.toString()}`,
    );
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
      this.#applications = null;
      this.#applicationCommands = null;
      this.#applicationConnections = null;
      this.#auditLogs = null;
      this.#autoModeration = null;
      this.#channels = null;
      this.#emojis = null;
      this.#entitlements = null;
      this.#gateway = null;
      this.#guilds = null;
      this.#guildTemplates = null;
      this.#interactions = null;
      this.#invites = null;
      this.#messages = null;
      this.#oauth2 = null;
      this.#polls = null;
      this.#scheduledEvents = null;
      this.#skus = null;
      this.#soundboards = null;
      this.#stageInstances = null;
      this.#stickers = null;
      this.#subscriptions = null;
      this.#users = null;
      this.#voices = null;
      this.#webhooks = null;
    }
  }

  async request<T = unknown>(request: RequestOptions): Promise<T> {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    const requestAbortController = new AbortController();
    this.#abortController.signal.addEventListener("abort", () => {
      requestAbortController.abort();
    });

    const waitTime = this.#rateLimit.isRateLimited(request);
    if (waitTime) {
      const timeoutPromise = new Promise((resolve) => {
        const timeout = setTimeout(resolve, waitTime);
        requestAbortController.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
        });
      });

      try {
        await timeoutPromise;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request aborted during rate limit wait");
        }
        throw error;
      }
    }

    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "accept-encoding": "br, gzip",
      "content-type": request.headers?.["content-type"] ?? MimeType.Json,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      ...request.headers,
    };

    if (request.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(request.reason);
    }

    const requestPromise = this.#retryAgent
      .request({
        method: request.method,
        path: this.baseUrl.pathname + request.path,
        headers,
        body: request.body,
        signal: requestAbortController.signal,
        query: request.query as Record<string, unknown>,
      })
      .then((response) => this.#handleResponse<T>(response, request));

    return this.#trackRequest(requestPromise);
  }

  async #cleanupRequests(): Promise<void> {
    await Promise.allSettled(Array.from(this.#activeRequests));
    this.#activeRequests.clear();
  }

  async #trackRequest<T>(requestPromise: Promise<T>): Promise<T> {
    this.#activeRequests.add(requestPromise);
    try {
      return await requestPromise;
    } finally {
      this.#activeRequests.delete(requestPromise);
    }
  }

  async #handleResponse<T = unknown>(
    response: Dispatcher.ResponseData,
    request: RequestOptions,
  ): Promise<T> {
    if (this.#isDestroyed) {
      throw new Error(
        "Rest client has been destroyed during response handling",
      );
    }

    this.#rateLimit.handleRateLimit(
      request,
      response.headers as Record<string, string>,
    );

    if (response.statusCode !== HttpStatusCode.Ok) {
      if (
        [
          HttpStatusCode.Unauthorized,
          HttpStatusCode.Forbidden,
          HttpStatusCode.TooManyRequests,
        ].includes(response.statusCode)
      ) {
        this.#rateLimit.handleInvalidRequest();
      }

      if (response.statusCode === HttpStatusCode.TooManyRequests) {
        const rateLimitError =
          (await response.body.json()) as RateLimitResponseEntity;
        this.#rateLimit.handleRateLimitError(rateLimitError);
        throw new Error(`Rate limited: ${rateLimitError.message}`);
      }

      throw new Error(
        `HTTP Error ${response.statusCode}: ${JSON.stringify(await response.body.json())}`,
      );
    }

    const contentType = response.headers["content-type"] as string;
    const encoding = response.headers["content-encoding"] as string;

    if (contentType?.includes(MimeType.Json)) {
      const buffer = Buffer.from(await response.body.arrayBuffer());
      const decompressed = await this.#decompressResponse(buffer, encoding);
      return JSON.parse(decompressed.toString());
    }

    return response.body.arrayBuffer() as T;
  }

  async #decompressResponse(
    data: Buffer,
    encoding: "br" | "gzip" | string,
  ): Promise<Buffer> {
    if (!encoding) {
      return data;
    }

    return new Promise<Buffer>((resolve, reject) => {
      let stream: BrotliDecompress | Gunzip;
      switch (encoding) {
        case "br": {
          stream = new BrotliDecompress({ level: 11 });
          break;
        }

        case "gzip": {
          stream = new Gunzip({ level: 9 });
          break;
        }

        default: {
          resolve(data);
          return;
        }
      }

      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
      stream.end(data);
    });
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
