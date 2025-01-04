import type { ApiVersion, PremiumTier } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import type { ProxyAgent } from "undici";
import {
  FileHandlerManager,
  RateLimitManager,
  RequestManager,
} from "../managers/index.js";
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
  DestroyOptions,
  PathLike,
  RestEvents,
  RestOptions,
  RouteEntity,
} from "../types/index.js";

export class Rest extends EventEmitter<RestEvents> {
  static readonly CDN_URL = "https://cdn.discordapp.com";
  static readonly MEDIA_URL = "https://media.discordapp.net";
  static readonly API_URL = "https://discord.com/api";

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

  readonly options: RestOptions;

  readonly #fileManager: FileHandlerManager;
  readonly #rateLimitManager: RateLimitManager;
  readonly #requestManager: RequestManager;

  constructor(options: RestOptions) {
    super();
    this.options = options;
    this.#fileManager = new FileHandlerManager();
    this.#rateLimitManager = new RateLimitManager();
    this.#requestManager = new RequestManager(
      this.options,
      this.#rateLimitManager,
      this.#fileManager,
    );

    this.#forwardEvents(this.#rateLimitManager, this.#requestManager);
  }

  get apiVersion(): ApiVersion {
    return this.options.version ?? 10;
  }

  get globalReset(): number | null {
    return this.#rateLimitManager.globalReset;
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.#requestManager.execute<T>({
      ...options,
      method: "GET",
      path,
    });
  }
  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.#requestManager.execute<T>({
      ...options,
      method: "POST",
      path,
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.#requestManager.execute<T>({
      ...options,
      method: "PUT",
      path,
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.#requestManager.execute<T>({
      ...options,
      method: "PATCH",
      path,
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.#requestManager.execute<T>({
      ...options,
      method: "DELETE",
      path,
    });
  }

  setBoostTier(tier: PremiumTier): void {
    this.#fileManager.setBoostTier(tier);
  }

  processFiles(options: RouteEntity): Promise<RouteEntity> {
    return this.#fileManager.handleFiles(options);
  }

  async updateProxy(proxyOptions?: ProxyAgent.Options): Promise<void> {
    await this.#requestManager.updateProxy(proxyOptions);
  }

  getConfig(): RestOptions {
    return this.options;
  }

  async destroy(options: DestroyOptions = {}): Promise<void> {
    await this.#requestManager.destroy(options);
    this.#rateLimitManager.destroy();
    this.removeAllListeners();
  }

  #forwardEvents(...emitters: EventEmitter<RestEvents>[]): void {
    const restEvents: (keyof RestEvents)[] = [
      "request",
      "rateLimit",
      "response",
    ];

    for (const emitter of emitters) {
      for (const event of restEvents) {
        emitter.on(event, (...args) => {
          return this.emit(event, ...args);
        });
      }
    }
  }
}
