import { EventEmitter } from "eventemitter3";
import { Pool, ProxyAgent, RetryAgent } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { RestOptions } from "./options/index.js";
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
import {
  type FileType,
  type HttpResponse,
  HttpStatusCode,
  type JsonErrorEntity,
  type PathLike,
  type RestEvents,
  type RouteEntity,
} from "./types/index.js";

export class Rest extends EventEmitter<RestEvents> {
  readonly applications = new ApplicationRouter(this);
  readonly commands = new ApplicationCommandRouter(this);
  readonly connections = new ApplicationConnectionRouter(this);
  readonly auditLogs = new AuditLogRouter(this);
  readonly autoModeration = new AutoModerationRouter(this);
  readonly channels = new ChannelRouter(this);
  readonly emojis = new EmojiRouter(this);
  readonly entitlements = new EntitlementRouter(this);
  readonly gateway = new GatewayRouter(this);
  readonly guilds = new GuildRouter(this);
  readonly templates = new GuildTemplateRouter(this);
  readonly interactions = new InteractionRouter(this);
  readonly invites = new InviteRouter(this);
  readonly messages = new MessageRouter(this);
  readonly oauth2 = new OAuth2Router(this);
  readonly polls = new PollRouter(this);
  readonly scheduledEvents = new ScheduledEventRouter(this);
  readonly skus = new SkuRouter(this);
  readonly soundboards = new SoundboardRouter(this);
  readonly stages = new StageInstanceRouter(this);
  readonly stickers = new StickerRouter(this);
  readonly subscriptions = new SubscriptionRouter(this);
  readonly users = new UserRouter(this);
  readonly voice = new VoiceRouter(this);
  readonly webhooks = new WebhookRouter(this);

  #proxyAgent: ProxyAgent | null = null;
  readonly #pendingRequests = new Set<string>();

  #retryAgent: RetryAgent;
  readonly #pool: Pool;
  readonly #options: z.output<typeof RestOptions>;
  readonly #rateLimitService: RateLimitService;
  readonly #processor: FileProcessorService;

  constructor(options: z.input<typeof RestOptions>) {
    super();
    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      const validationError = fromError(error);
      throw new Error(validationError.message);
    }

    this.#rateLimitService = new RateLimitService(this.#options.rateLimit);
    this.#processor = new FileProcessorService(this.#options.fileProcessor);

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

  async request<T>(options: RouteEntity): Promise<HttpResponse<T>> {
    const requestId = this.#generateRequestId(options);

    try {
      this.#pendingRequests.add(requestId);

      try {
        await this.#rateLimitService.checkRateLimit(
          options.path,
          options.method,
        );
      } catch {
        throw new Error(
          `Rate limit check failed. Method: ${options.method}, Path: ${options.path}`,
        );
      }

      const controller = new AbortController();

      const preparedOptions = await this.handleFiles(options);

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

      if (response.statusCode === HttpStatusCode.NoContent) {
        return {
          data: null as T,
          status: response.statusCode,
          headers: response.headers,
        };
      }

      const contentType = response.headers["content-type"];
      if (!contentType?.includes("application/json")) {
        throw new Error(
          `HTTP Error ${response.statusCode}: Invalid content type. ` +
            `Expected application/json but received ${contentType}. ` +
            `Method: ${options.method}, Path: ${options.path}`,
        );
      }

      const rawBody = Buffer.from(await response.body.arrayBuffer());

      let data: unknown;
      try {
        data = JSON.parse(rawBody.toString());
      } catch {
        throw new Error(
          `HTTP Error ${response.statusCode}: Failed to parse response body. ` +
            `Method: ${options.method}, Path: ${options.path}`,
        );
      }

      if (response.statusCode >= 400) {
        if (this.#isDiscordApiError(data)) {
          throw new Error(
            `Discord API Error ${response.statusCode} (Code: ${data.code}): ${data.message}. Method: ${options.method}, Path: ${options.path}${
              data.errors
                ? `\nDetails: ${JSON.stringify(data.errors, null, 2)}`
                : ""
            }`,
          );
        }

        throw new Error(
          `HTTP Error ${response.statusCode}: ${
            typeof data === "object" && data !== null && "message" in data
              ? String(data.message)
              : "Unknown API Error"
          }\nMethod: ${options.method}, Path: ${options.path}`,
        );
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

  #isDiscordApiError(data: unknown): data is JsonErrorEntity {
    return (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      "message" in data
    );
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
