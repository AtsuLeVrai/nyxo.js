import { EventEmitter } from "eventemitter3";
import type { ProxyAgent } from "undici";
import type { z } from "zod";
import { RestError } from "./errors/index.js";
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
import {
  FileProcessorService,
  HttpService,
  RateLimiterService,
} from "./services/index.js";
import type { RequestOptions, RestEvents } from "./types/index.js";

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

  readonly #http: HttpService;
  readonly #rateLimiter: RateLimiterService;
  readonly #fileProcessor: FileProcessorService;
  readonly #options: z.output<typeof RestOptions>;

  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof Error) {
        throw new RestError("Invalid options provided", { cause: error });
      }

      throw new RestError("Invalid options provided");
    }

    this.#fileProcessor = new FileProcessorService();
    this.#rateLimiter = new RateLimiterService(this.#options);
    this.#http = new HttpService(this.#options);

    this.#setupEventForwarding(this.#rateLimiter, this.#http);
  }

  async request<T>(options: RequestOptions): Promise<T> {
    try {
      this.#rateLimiter.checkRateLimit(options.path, options.method);

      const processedOptions = await this.#processedOptions(options);

      const response = await this.#http.request<T>(processedOptions);

      this.#rateLimiter.updateRateLimit(
        options.path,
        options.method,
        response.headers,
        response.statusCode,
      );

      return response.data;
    } catch (error) {
      if (error instanceof RestError) {
        throw error;
      }

      throw new RestError("Failed to make request");
    }
  }

  get<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "GET",
      path,
    });
  }

  post<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "POST",
      path,
    });
  }

  put<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "PUT",
      path,
    });
  }

  patch<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      path,
    });
  }

  delete<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "DELETE",
      path,
    });
  }

  async updateProxy(options?: ProxyAgent.Options): Promise<void> {
    await this.#http.updateProxy(options);
  }

  async destroy(): Promise<void> {
    try {
      this.#rateLimiter.reset();
      await this.#http.destroy();
    } finally {
      this.removeAllListeners();
    }
  }

  async #processedOptions(options: RequestOptions): Promise<RequestOptions> {
    if (options.files) {
      const formData = await this.#fileProcessor.createFormData(
        options.files,
        options.body,
      );

      return {
        ...options,
        body: formData.getBuffer(),
        headers: formData.getHeaders(options.headers as Record<string, string>),
      };
    }

    return options;
  }

  #setupEventForwarding(...emitters: EventEmitter<RestEvents>[]): void {
    const forwardedEvents: (keyof RestEvents)[] = [
      "debug",
      "error",
      "warn",
      "rateLimited",
      "requestStart",
      "requestFinish",
    ];

    for (const emitter of emitters) {
      for (const event of forwardedEvents) {
        emitter.on(event, (...args) => {
          this.emit(event, ...args);
        });
      }
    }
  }
}
