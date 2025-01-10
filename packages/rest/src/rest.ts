import { ApiVersion } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import { type Brotli, BrotliDecompress, Gunzip, Inflate } from "minizlib";
import { Pool, ProxyAgent, RetryAgent, type RetryHandler } from "undici";
import { z } from "zod";
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
} from "./routes/index.js";
import { FileProcessorService, RateLimitService } from "./services/index.js";
import type {
  FileType,
  HttpResponse,
  PathLike,
  RestEvents,
  RouteEntity,
} from "./types/index.js";

export const RestOptions = z
  .object({
    token: z.string(),
    version: z.nativeEnum(ApiVersion).optional().default(ApiVersion.V10),
    compress: z.boolean().optional().default(true),
    userAgent: z
      .string()
      .optional()
      .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
    pool: z.custom<Pool.Options>().optional().default({
      allowH2: false,
      maxConcurrentStreams: 100,
      keepAliveTimeout: 10000,
      keepAliveMaxTimeout: 30000,
      bodyTimeout: 15000,
      headersTimeout: 15000,
    }),
    retry: z.custom<RetryHandler.RetryOptions>().optional().default({
      retryAfter: false,
      maxRetries: 3,
      minTimeout: 100,
      maxTimeout: 15000,
      timeoutFactor: 2,
    }),
    proxy: z.custom<ProxyAgent.Options>().optional(),
  })
  .strict();

export type RestOptions = z.infer<typeof RestOptions>;

export class Rest extends EventEmitter<RestEvents> {
  #applications: ApplicationRouter | null = null;
  #commands: ApplicationCommandRouter | null = null;
  #connections: ApplicationConnectionRouter | null = null;
  #auditLogs: AuditLogRouter | null = null;
  #autoModeration: AutoModerationRouter | null = null;
  #channels: ChannelRouter | null = null;
  #emojis: EmojiRouter | null = null;
  #entitlements: EntitlementRouter | null = null;
  #gateway: GatewayRouter | null = null;
  #guilds: GuildRouter | null = null;
  #templates: GuildTemplateRouter | null = null;
  #interactions: InteractionRouter | null = null;
  #invites: InviteRouter | null = null;
  #messages: MessageRouter | null = null;
  #oauth2: OAuth2Router | null = null;
  #polls: PollRouter | null = null;
  #scheduledEvents: ScheduledEventRouter | null = null;
  #skus: SkuRouter | null = null;
  #soundboards: SoundboardRouter | null = null;
  #stages: StageInstanceRouter | null = null;
  #stickers: StickerRouter | null = null;
  #subscriptions: SubscriptionRouter | null = null;
  #users: UserRouter | null = null;
  #voice: VoiceRouter | null = null;
  #webhooks: WebhookRouter | null = null;
  #proxyAgent: ProxyAgent | null = null;
  readonly #pendingRequests = new Set<string>();

  #retryAgent: RetryAgent;
  readonly #pool: Pool;
  readonly #options: RestOptions;
  readonly #rateLimitService: RateLimitService;
  readonly #processor: FileProcessorService;

  constructor(options: RestOptions) {
    super();
    this.#options = RestOptions.parse(options);

    this.#rateLimitService = new RateLimitService();
    this.#processor = new FileProcessorService();

    this.#pool = new Pool("https://discord.com", this.#options.pool);

    if (this.#options.proxy) {
      this.#proxyAgent = new ProxyAgent(this.#options.proxy);
    }

    this.#retryAgent = new RetryAgent(
      this.#proxyAgent ?? this.#pool,
      this.#options.retry,
    );

    this.#setupEventForwarding(this.#rateLimitService);
  }

  get applications(): ApplicationRouter {
    if (!this.#applications) {
      this.#applications = new ApplicationRouter(this);
    }

    return this.#applications;
  }

  get commands(): ApplicationCommandRouter {
    if (!this.#commands) {
      this.#commands = new ApplicationCommandRouter(this);
    }

    return this.#commands;
  }

  get connections(): ApplicationConnectionRouter {
    if (!this.#connections) {
      this.#connections = new ApplicationConnectionRouter(this);
    }

    return this.#connections;
  }

  get auditLogs(): AuditLogRouter {
    if (!this.#auditLogs) {
      this.#auditLogs = new AuditLogRouter(this);
    }

    return this.#auditLogs;
  }

  get autoModeration(): AutoModerationRouter {
    if (!this.#autoModeration) {
      this.#autoModeration = new AutoModerationRouter(this);
    }

    return this.#autoModeration;
  }

  get channels(): ChannelRouter {
    if (!this.#channels) {
      this.#channels = new ChannelRouter(this);
    }

    return this.#channels;
  }

  get emojis(): EmojiRouter {
    if (!this.#emojis) {
      this.#emojis = new EmojiRouter(this);
    }

    return this.#emojis;
  }

  get entitlements(): EntitlementRouter {
    if (!this.#entitlements) {
      this.#entitlements = new EntitlementRouter(this);
    }

    return this.#entitlements;
  }

  get gateway(): GatewayRouter {
    if (!this.#gateway) {
      this.#gateway = new GatewayRouter(this);
    }

    return this.#gateway;
  }

  get guilds(): GuildRouter {
    if (!this.#guilds) {
      this.#guilds = new GuildRouter(this);
    }

    return this.#guilds;
  }

  get templates(): GuildTemplateRouter {
    if (!this.#templates) {
      this.#templates = new GuildTemplateRouter(this);
    }

    return this.#templates;
  }

  get interactions(): InteractionRouter {
    if (!this.#interactions) {
      this.#interactions = new InteractionRouter(this);
    }

    return this.#interactions;
  }

  get invites(): InviteRouter {
    if (!this.#invites) {
      this.#invites = new InviteRouter(this);
    }

    return this.#invites;
  }

  get messages(): MessageRouter {
    if (!this.#messages) {
      this.#messages = new MessageRouter(this);
    }

    return this.#messages;
  }

  get oauth2(): OAuth2Router {
    if (!this.#oauth2) {
      this.#oauth2 = new OAuth2Router(this);
    }

    return this.#oauth2;
  }

  get polls(): PollRouter {
    if (!this.#polls) {
      this.#polls = new PollRouter(this);
    }

    return this.#polls;
  }

  get scheduledEvents(): ScheduledEventRouter {
    if (!this.#scheduledEvents) {
      this.#scheduledEvents = new ScheduledEventRouter(this);
    }

    return this.#scheduledEvents;
  }

  get skus(): SkuRouter {
    if (!this.#skus) {
      this.#skus = new SkuRouter(this);
    }

    return this.#skus;
  }

  get soundboards(): SoundboardRouter {
    if (!this.#soundboards) {
      this.#soundboards = new SoundboardRouter(this);
    }

    return this.#soundboards;
  }

  get stages(): StageInstanceRouter {
    if (!this.#stages) {
      this.#stages = new StageInstanceRouter(this);
    }

    return this.#stages;
  }

  get stickers(): StickerRouter {
    if (!this.#stickers) {
      this.#stickers = new StickerRouter(this);
    }

    return this.#stickers;
  }

  get subscriptions(): SubscriptionRouter {
    if (!this.#subscriptions) {
      this.#subscriptions = new SubscriptionRouter(this);
    }

    return this.#subscriptions;
  }

  get users(): UserRouter {
    if (!this.#users) {
      this.#users = new UserRouter(this);
    }

    return this.#users;
  }

  get voice(): VoiceRouter {
    if (!this.#voice) {
      this.#voice = new VoiceRouter(this);
    }

    return this.#voice;
  }

  get webhooks(): WebhookRouter {
    if (!this.#webhooks) {
      this.#webhooks = new WebhookRouter(this);
    }

    return this.#webhooks;
  }

  async request<T>(options: RouteEntity): Promise<HttpResponse<T>> {
    const requestId = this.#generateRequestId(options);

    try {
      this.#pendingRequests.add(requestId);
      await this.#rateLimitService.checkRateLimit(options.path, options.method);
      const controller = new AbortController();

      const preparedOptions = options.files
        ? await this.handleFiles(options)
        : options;

      this.emit(
        "request",
        preparedOptions.path,
        preparedOptions.method,
        requestId,
        preparedOptions,
      );

      const startTime = Date.now();

      const response = await this.#retryAgent.request({
        ...preparedOptions,
        origin: "https://discord.com",
        path: this.#buildPath(preparedOptions.path),
        headers: this.#buildHeaders(preparedOptions),
        signal: controller.signal,
      });

      this.emit(
        "response",
        preparedOptions.path,
        preparedOptions.method,
        response.statusCode,
        Date.now() - startTime,
        requestId,
      );

      this.#rateLimitService.processHeaders(
        options.path,
        options.method,
        response.headers as Record<string, string>,
        response.statusCode,
      );

      const contentType = response.headers["content-type"];
      if (!contentType?.includes("application/json")) {
        throw new Error(
          `Expected content-type application/json but received ${contentType}`,
        );
      }

      const rawBody = Buffer.from(await response.body.arrayBuffer());
      const contentEncoding = response.headers["content-encoding"];

      const decompressedBody = await this.#decompress(
        rawBody,
        contentEncoding as string,
      );

      let data: unknown;
      try {
        data = JSON.parse(decompressedBody.toString());
      } catch {
        throw new Error("Failed to parse response body");
      }

      if (data === null || data === undefined) {
        throw new Error("Response data is null or undefined");
      }

      return {
        data: data as T,
        status: response.statusCode,
        headers: response.headers,
      };
    } finally {
      this.#pendingRequests.delete(requestId);
    }
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "GET",
      path: path,
    });
  }

  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "POST",
      path: path,
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PUT",
      path: path,
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      path: path,
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "DELETE",
      path: path,
    });
  }

  async destroy(): Promise<void> {
    try {
      this.#rateLimitService.destroy();
      await Promise.all([
        this.#proxyAgent?.close(),
        this.#retryAgent.close(),
        this.#pool.destroy(),
      ]);
    } finally {
      this.removeAllListeners();
    }
  }

  async updateProxy(proxyOptions?: ProxyAgent.Options): Promise<void> {
    if (this.#proxyAgent) {
      await this.#proxyAgent.close();
    }

    if (proxyOptions) {
      this.#proxyAgent = new ProxyAgent(proxyOptions);
    }
  }

  async handleFiles(options: RouteEntity): Promise<RouteEntity> {
    if (!options.files) {
      return options;
    }

    const files = Array.isArray(options.files)
      ? options.files
      : [options.files];
    const validFiles = files.filter(
      (file): file is FileType => file !== undefined,
    );

    const form = await this.#processor.createFormData(validFiles, options.body);

    return {
      ...options,
      body: form.getBuffer(),
      headers: {
        ...form.getHeaders(),
        "content-length": form.getLengthSync().toString(),
        ...options.headers,
      },
    };
  }

  async #decompress(buffer: Buffer, contentEncoding?: string): Promise<Buffer> {
    let decompressedBody: Brotli | Inflate | Gunzip;
    if (contentEncoding?.includes("br")) {
      decompressedBody = new BrotliDecompress({ level: 11 });
    } else if (contentEncoding?.includes("gzip")) {
      decompressedBody = new Gunzip({ level: 9 });
    } else if (contentEncoding?.includes("deflate")) {
      decompressedBody = new Inflate({ level: 9 });
    } else {
      return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      decompressedBody.on("data", (chunk: Buffer) => chunks.push(chunk));
      decompressedBody.on("end", () => resolve(Buffer.concat(chunks)));
      decompressedBody.on("error", reject);

      decompressedBody.end(buffer);
    });
  }

  #buildPath(path: string): PathLike {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/api/v${this.#options.version}${normalizedPath}`;
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `Bot ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
    };

    if (this.#options.compress) {
      headers["accept-encoding"] = "gzip,deflate,br";
    }
    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...(options.headers as Record<string, string>) };
  }

  #generateRequestId(options: RouteEntity): string {
    return `${options.method}:${options.path}:${Date.now()}:${Math.random().toString(36)}`;
  }

  #setupEventForwarding(...emitter: EventEmitter<RestEvents>[]): void {
    const events: (keyof RestEvents)[] = [
      "debug",
      "request",
      "response",
      "rateLimited",
      "invalidRequestWarning",
      "cloudflareWarning",
      "cloudflareBan",
    ];

    for (const service of emitter) {
      for (const event of events) {
        service.on(event, (...args) => this.emit(event, ...args));
      }
    }
  }
}
