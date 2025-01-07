import { EventEmitter } from "eventemitter3";
import { HttpConstants } from "./constants/index.js";
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
import {
  FileProcessorService,
  HttpService,
  RateLimitService,
} from "./services/index.js";
import type {
  FileType,
  HttpResponse,
  PathLike,
  RestEvents,
  RestOptions,
  RouteEntity,
} from "./types/index.js";
import { FileValidatorService } from "./validators/index.js";

export class Rest extends EventEmitter<RestEvents> {
  readonly #options: Required<Omit<RestOptions, "proxy">> &
    Pick<RestOptions, "proxy">;
  readonly #httpService: HttpService;
  readonly #rateLimitService: RateLimitService;
  readonly #validator: FileValidatorService;
  readonly #processor: FileProcessorService;

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
  readonly #pendingRequests = new Set<string>();

  constructor(options: RestOptions) {
    super();

    this.#options = this.#normalizeConfig(options);
    this.#httpService = new HttpService(this.#options);
    this.#rateLimitService = new RateLimitService();
    this.#validator = new FileValidatorService();
    this.#processor = new FileProcessorService();

    this.#setupEventForwarding(this.#httpService, this.#rateLimitService);
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

      const preparedOptions = options.files
        ? await this.handleFiles(options)
        : options;

      const response = await this.#httpService.request(preparedOptions);

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

      const body = Buffer.from(await response.body.arrayBuffer());
      let data: unknown;

      try {
        data = JSON.parse(body.toString());
      } catch {
        throw new Error("Failed to parse response body");
      }

      if (data === null || data === undefined) {
        throw new Error("Response data is null or undefined");
      }

      return {
        data: data as T,
        headers: response.headers,
        status: response.statusCode,
        context: response.context,
        opaque: response.opaque,
        trailers: response.trailers,
        cached: false,
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
      path: this.#normalizePath(path),
    });
  }

  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "POST",
      path: this.#normalizePath(path),
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PUT",
      path: this.#normalizePath(path),
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      path: this.#normalizePath(path),
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...options,
      method: "DELETE",
      path: this.#normalizePath(path),
    });
  }

  async destroy(): Promise<void> {
    await this.#httpService.destroy();
    this.#rateLimitService.destroy();
    this.removeAllListeners();
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

    await this.#validateFiles(validFiles);

    const form = await this.#processor.createFormData(
      validFiles,
      options.body as Record<string, unknown> | string,
    );

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

  async #validateFiles(files: FileType[]): Promise<void> {
    const countValidation = this.#validator.validateFileCount(files.length);
    if (!countValidation.isValid) {
      throw new Error(countValidation.error);
    }

    let totalSize = 0;
    for (const file of files) {
      const fileData = await this.#processor.processFile(file);

      const sizeValidation = this.#validator.validateFileSize(fileData.size);
      if (!sizeValidation.isValid) {
        throw new Error(sizeValidation.error);
      }

      const typeValidation = this.#validator.validateContentType(
        fileData.contentType,
      );
      if (!typeValidation.isValid) {
        throw new Error(typeValidation.error);
      }

      totalSize += fileData.size;
    }

    const totalSizeValidation = this.#validator.validateTotalSize(totalSize);
    if (!totalSizeValidation.isValid) {
      throw new Error(totalSizeValidation.error);
    }
  }

  #generateRequestId(options: RouteEntity): string {
    return `${options.method}:${options.path}:${Date.now()}:${Math.random().toString(36)}`;
  }

  #normalizePath(path: string): PathLike {
    const stringPath = path.toString();
    return (
      stringPath.startsWith("/") ? stringPath : `/${stringPath}`
    ) as PathLike;
  }

  #normalizeConfig(
    config: RestOptions,
  ): Required<Omit<RestOptions, "proxy">> & Pick<RestOptions, "proxy"> {
    return {
      token: config.token,
      proxy: config.proxy,
      version: config.version ?? HttpConstants.defaultApiVersion,
      userAgent: config.userAgent ?? HttpConstants.defaultUserAgent,
      retry: {
        retryAfter: true,
        maxRetries: 3,
        minTimeout: 100,
        maxTimeout: 15000,
        timeoutFactor: 2,
        ...config.retry,
      },
      pool: {
        allowH2: true,
        maxConcurrentStreams: 100,
        keepAliveTimeout: 10000,
        keepAliveMaxTimeout: 30000,
        bodyTimeout: HttpConstants.timeout.default,
        headersTimeout: HttpConstants.timeout.default,
        connect: {
          rejectUnauthorized: true,
          ALPNProtocols: ["h2"],
          secureOptions: 0x40000000,
          keepAlive: true,
          keepAliveInitialDelay: 10000,
          timeout: HttpConstants.timeout.connect,
          noDelay: true,
        },
      },
    };
  }

  #setupEventForwarding(...emitter: EventEmitter<RestEvents>[]): void {
    const events: (keyof RestEvents)[] = [
      "request",
      "response",
      "rateLimit",
      "globalRateLimit",
    ];

    for (const service of emitter) {
      for (const event of events) {
        service.on(event, (...args) => this.emit(event, ...args));
      }
    }
  }
}
