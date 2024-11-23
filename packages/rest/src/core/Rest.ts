import { MimeType } from "@nyxjs/core";
import { BrotliDecompress, Gunzip } from "minizlib";
import { type Dispatcher, Pool, RetryAgent, type RetryHandler } from "undici";
import { HttpMethod, HttpStatusCode, JsonErrorCode } from "../enums/index.js";
import { RateLimitManager } from "../managers/index.js";
import {
  ApplicationCommandsRoutes,
  ApplicationConnectionRoutes,
  ApplicationRoutes,
  AuditLogRoutes,
  AutoModerationRoutes,
  ChannelRoutes,
  EmojiRoutes,
  EntitlementRoutes,
  GatewayRoutes,
  GuildRoutes,
  GuildTemplateRoutes,
  InteractionRoutes,
  InviteRoutes,
  MessageRoutes,
  OAuth2Routes,
  PollRoutes,
  ScheduledEventRoutes,
  SkuRoutes,
  SoundboardRoutes,
  StageInstanceRoutes,
  StickerRoutes,
  SubscriptionRoutes,
  UserRoutes,
  VoiceRoutes,
  WebhookRoutes,
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

  #applications: ApplicationRoutes | null = null;
  #applicationCommands: ApplicationCommandsRoutes | null = null;
  #applicationConnections: ApplicationConnectionRoutes | null = null;
  #auditLogs: AuditLogRoutes | null = null;
  #autoModeration: AutoModerationRoutes | null = null;
  #channels: ChannelRoutes | null = null;
  #emojis: EmojiRoutes | null = null;
  #entitlements: EntitlementRoutes | null = null;
  #gateway: GatewayRoutes | null = null;
  #guilds: GuildRoutes | null = null;
  #guildTemplates: GuildTemplateRoutes | null = null;
  #interactions: InteractionRoutes | null = null;
  #invites: InviteRoutes | null = null;
  #messages: MessageRoutes | null = null;
  #oauth2: OAuth2Routes | null = null;
  #polls: PollRoutes | null = null;
  #scheduledEvents: ScheduledEventRoutes | null = null;
  #skus: SkuRoutes | null = null;
  #soundboards: SoundboardRoutes | null = null;
  #stageInstances: StageInstanceRoutes | null = null;
  #stickers: StickerRoutes | null = null;
  #subscriptions: SubscriptionRoutes | null = null;
  #users: UserRoutes | null = null;
  #voices: VoiceRoutes | null = null;
  #webhooks: WebhookRoutes | null = null;

  constructor(options: RestOptions) {
    this.#options = options;
    this.#pool = this.#createPool();
    this.#retryAgent = this.#createRetryAgent();
    this.#abortController.signal.addEventListener("abort", async () => {
      await this.#cleanupRequests();
    });
  }

  get applications(): ApplicationRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applications) {
      this.#applications = new ApplicationRoutes(this);
    }

    return this.#applications;
  }

  get applicationCommands(): ApplicationCommandsRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applicationCommands) {
      this.#applicationCommands = new ApplicationCommandsRoutes(this);
    }

    return this.#applicationCommands;
  }

  get applicationConnections(): ApplicationConnectionRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#applicationConnections) {
      this.#applicationConnections = new ApplicationConnectionRoutes(this);
    }

    return this.#applicationConnections;
  }

  get auditLogs(): AuditLogRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#auditLogs) {
      this.#auditLogs = new AuditLogRoutes(this);
    }

    return this.#auditLogs;
  }

  get autoModeration(): AutoModerationRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#autoModeration) {
      this.#autoModeration = new AutoModerationRoutes(this);
    }

    return this.#autoModeration;
  }

  get channels(): ChannelRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#channels) {
      this.#channels = new ChannelRoutes(this);
    }

    return this.#channels;
  }

  get emojis(): EmojiRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#emojis) {
      this.#emojis = new EmojiRoutes(this);
    }

    return this.#emojis;
  }

  get entitlements(): EntitlementRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#entitlements) {
      this.#entitlements = new EntitlementRoutes(this);
    }

    return this.#entitlements;
  }

  get gateway(): GatewayRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#gateway) {
      this.#gateway = new GatewayRoutes(this);
    }

    return this.#gateway;
  }

  get guilds(): GuildRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#guilds) {
      this.#guilds = new GuildRoutes(this);
    }

    return this.#guilds;
  }

  get guildTemplates(): GuildTemplateRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#guildTemplates) {
      this.#guildTemplates = new GuildTemplateRoutes(this);
    }

    return this.#guildTemplates;
  }

  get interactions(): InteractionRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#interactions) {
      this.#interactions = new InteractionRoutes(this);
    }

    return this.#interactions;
  }

  get invites(): InviteRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#invites) {
      this.#invites = new InviteRoutes(this);
    }

    return this.#invites;
  }

  get messages(): MessageRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#messages) {
      this.#messages = new MessageRoutes(this);
    }

    return this.#messages;
  }

  get oauth2(): OAuth2Routes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#oauth2) {
      this.#oauth2 = new OAuth2Routes(this);
    }

    return this.#oauth2;
  }

  get polls(): PollRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#polls) {
      this.#polls = new PollRoutes(this);
    }

    return this.#polls;
  }

  get scheduledEvents(): ScheduledEventRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#scheduledEvents) {
      this.#scheduledEvents = new ScheduledEventRoutes(this);
    }

    return this.#scheduledEvents;
  }

  get skus(): SkuRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#skus) {
      this.#skus = new SkuRoutes(this);
    }

    return this.#skus;
  }

  get soundboards(): SoundboardRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#soundboards) {
      this.#soundboards = new SoundboardRoutes(this);
    }

    return this.#soundboards;
  }

  get stageInstances(): StageInstanceRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#stageInstances) {
      this.#stageInstances = new StageInstanceRoutes(this);
    }

    return this.#stageInstances;
  }

  get stickers(): StickerRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#stickers) {
      this.#stickers = new StickerRoutes(this);
    }

    return this.#stickers;
  }

  get subscriptions(): SubscriptionRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#subscriptions) {
      this.#subscriptions = new SubscriptionRoutes(this);
    }

    return this.#subscriptions;
  }

  get users(): UserRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#users) {
      this.#users = new UserRoutes(this);
    }

    return this.#users;
  }

  get voices(): VoiceRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#voices) {
      this.#voices = new VoiceRoutes(this);
    }

    return this.#voices;
  }

  get webhooks(): WebhookRoutes {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }

    if (!this.#webhooks) {
      this.#webhooks = new WebhookRoutes(this);
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
