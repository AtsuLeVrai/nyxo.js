import type { ApiVersion, PremiumTier } from "@nyxjs/core";
import type { ProxyAgent } from "undici";
import {
  FileHandlerManager,
  RateLimitManager,
  RequestManager,
  TokenManager,
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
import type { PathLike, RestOptions, RouteEntity } from "../types/index.js";

export class Rest {
  static readonly CDN_URL = "https://cdn.discordapp.com";
  static readonly MEDIA_URL = "https://media.discordapp.net";
  static readonly API_URL = "https://discord.com/api";

  readonly options: RestOptions;
  readonly token: TokenManager;
  readonly fileManager: FileHandlerManager;
  readonly rateLimitManager: RateLimitManager;
  readonly requestManager: RequestManager;

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

  #isDestroyed = false;

  constructor(options: RestOptions) {
    this.options = options;

    this.token = new TokenManager(options.token);
    this.fileManager = new FileHandlerManager();
    this.rateLimitManager = new RateLimitManager();
    this.requestManager = new RequestManager(
      this.options,
      this.rateLimitManager,
      this.fileManager,
    );
  }

  get destroyed(): boolean {
    return this.#isDestroyed;
  }

  get apiVersion(): ApiVersion {
    return this.options.version ?? 10;
  }

  setBoostTier(tier: PremiumTier): void {
    this.#validateClientState();
    this.fileManager.setBoostTier(tier);
  }

  get<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.requestManager.execute<T>({
      ...options,
      method: "GET",
      path,
    });
  }

  post<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.requestManager.execute<T>({
      ...options,
      method: "POST",
      path,
    });
  }

  put<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.requestManager.execute<T>({
      ...options,
      method: "PUT",
      path,
    });
  }

  patch<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.requestManager.execute<T>({
      ...options,
      method: "PATCH",
      path,
    });
  }

  delete<T>(
    path: PathLike,
    options: Omit<RouteEntity, "method" | "path"> = {},
  ): Promise<T> {
    return this.requestManager.execute<T>({
      ...options,
      method: "DELETE",
      path,
    });
  }

  processFiles(options: RouteEntity): Promise<RouteEntity> {
    this.#validateClientState();
    return this.fileManager.handleFiles(options);
  }

  async updateProxy(proxyOptions: ProxyAgent.Options | null): Promise<void> {
    this.#validateClientState();
    await this.requestManager.updateProxy(proxyOptions);
  }

  getConfig(): RestOptions {
    this.#validateClientState();
    return this.options;
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;

    this.rateLimitManager.destroy();
    await this.requestManager.destroy();
  }

  #validateClientState(): void {
    if (this.#isDestroyed) {
      throw new Error("Rest client has been destroyed");
    }
  }
}
