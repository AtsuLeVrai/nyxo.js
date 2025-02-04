import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { RateLimiterManager } from "../managers/index.js";
import { RestOptions } from "../options/index.js";
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
import { HttpService } from "../services/index.js";
import type { RequestOptions, RestEvents } from "../types/index.js";

export class Rest extends EventEmitter<RestEvents> {
  readonly http: HttpService;
  readonly rateLimiter: RateLimiterManager;
  readonly #options: RestOptions;

  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.rateLimiter = new RateLimiterManager(this, this.#options.rateLimit);
    this.http = new HttpService(this, this.#options);
  }

  get options(): Readonly<RestOptions> {
    return this.#options;
  }

  get applications(): ApplicationRouter {
    return new ApplicationRouter(this);
  }

  get commands(): ApplicationCommandRouter {
    return new ApplicationCommandRouter(this);
  }

  get connections(): ApplicationConnectionRouter {
    return new ApplicationConnectionRouter(this);
  }

  get guilds(): GuildRouter {
    return new GuildRouter(this);
  }

  get channels(): ChannelRouter {
    return new ChannelRouter(this);
  }

  get invites(): InviteRouter {
    return new InviteRouter(this);
  }

  get templates(): GuildTemplateRouter {
    return new GuildTemplateRouter(this);
  }

  get users(): UserRouter {
    return new UserRouter(this);
  }

  get auditLogs(): AuditLogRouter {
    return new AuditLogRouter(this);
  }

  get messages(): MessageRouter {
    return new MessageRouter(this);
  }

  get interactions(): InteractionRouter {
    return new InteractionRouter(this);
  }

  get emojis(): EmojiRouter {
    return new EmojiRouter(this);
  }

  get stickers(): StickerRouter {
    return new StickerRouter(this);
  }

  get voice(): VoiceRouter {
    return new VoiceRouter(this);
  }

  get soundboards(): SoundboardRouter {
    return new SoundboardRouter(this);
  }

  get stages(): StageInstanceRouter {
    return new StageInstanceRouter(this);
  }

  get scheduledEvents(): ScheduledEventRouter {
    return new ScheduledEventRouter(this);
  }

  get polls(): PollRouter {
    return new PollRouter(this);
  }

  get autoModeration(): AutoModerationRouter {
    return new AutoModerationRouter(this);
  }

  get webhooks(): WebhookRouter {
    return new WebhookRouter(this);
  }

  get oauth2(): OAuth2Router {
    return new OAuth2Router(this);
  }

  get gateway(): GatewayRouter {
    return new GatewayRouter(this);
  }

  get skus(): SkuRouter {
    return new SkuRouter(this);
  }

  get entitlements(): EntitlementRouter {
    return new EntitlementRouter(this);
  }

  get subscriptions(): SubscriptionRouter {
    return new SubscriptionRouter(this);
  }

  async request<T>(options: RequestOptions): Promise<T> {
    try {
      this.rateLimiter.checkRateLimit(options.path, options.method);

      const response = await this.http.request<T>(options);

      this.rateLimiter.updateRateLimit(
        options.path,
        options.method,
        response.latency,
        response.headers,
        response.statusCode,
      );

      return response.data;
    } catch (error) {
      throw new Error("Request failed", {
        cause: error,
      });
    }
  }

  get<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  post<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  put<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  patch<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  delete<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  async destroy(): Promise<void> {
    await this.http.destroy();
    this.rateLimiter.destroy();
    this.removeAllListeners();
  }
}
