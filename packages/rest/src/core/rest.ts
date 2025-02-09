import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { BaseRouter } from "../base/index.js";
import { ApiError } from "../errors/index.js";
import {
  RateLimitManager,
  RequestManager,
  RetryManager,
} from "../managers/index.js";
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
import type {
  ApiRequestOptions,
  JsonErrorResponse,
  RestEventHandlers,
} from "../types/index.js";

export class Rest extends EventEmitter<RestEventHandlers> {
  readonly #routerCache = new Store<string, Store<string, BaseRouter>>();
  readonly #options: RestOptions;
  readonly #request: RequestManager;
  readonly #rateLimiter: RateLimitManager;
  readonly #retry: RetryManager;

  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#request = new RequestManager(this, this.#options);
    this.#rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
    this.#retry = new RetryManager(this, this.#options.retry);
  }

  get applications(): ApplicationRouter {
    return this.getRouter(ApplicationRouter);
  }

  get commands(): ApplicationCommandRouter {
    return this.getRouter(ApplicationCommandRouter);
  }

  get connections(): ApplicationConnectionRouter {
    return this.getRouter(ApplicationConnectionRouter);
  }

  get guilds(): GuildRouter {
    return this.getRouter(GuildRouter);
  }

  get channels(): ChannelRouter {
    return this.getRouter(ChannelRouter);
  }

  get invites(): InviteRouter {
    return this.getRouter(InviteRouter);
  }

  get templates(): GuildTemplateRouter {
    return this.getRouter(GuildTemplateRouter);
  }

  get users(): UserRouter {
    return this.getRouter(UserRouter);
  }

  get auditLogs(): AuditLogRouter {
    return this.getRouter(AuditLogRouter);
  }

  get messages(): MessageRouter {
    return this.getRouter(MessageRouter);
  }

  get interactions(): InteractionRouter {
    return this.getRouter(InteractionRouter);
  }

  get emojis(): EmojiRouter {
    return this.getRouter(EmojiRouter);
  }

  get stickers(): StickerRouter {
    return this.getRouter(StickerRouter);
  }

  get voice(): VoiceRouter {
    return this.getRouter(VoiceRouter);
  }

  get soundboards(): SoundboardRouter {
    return this.getRouter(SoundboardRouter);
  }

  get stages(): StageInstanceRouter {
    return this.getRouter(StageInstanceRouter);
  }

  get scheduledEvents(): ScheduledEventRouter {
    return this.getRouter(ScheduledEventRouter);
  }

  get polls(): PollRouter {
    return this.getRouter(PollRouter);
  }

  get autoModeration(): AutoModerationRouter {
    return this.getRouter(AutoModerationRouter);
  }

  get webhooks(): WebhookRouter {
    return this.getRouter(WebhookRouter);
  }

  get oauth2(): OAuth2Router {
    return this.getRouter(OAuth2Router);
  }

  get gateway(): GatewayRouter {
    return this.getRouter(GatewayRouter);
  }

  get skus(): SkuRouter {
    return this.getRouter(SkuRouter);
  }

  get entitlements(): EntitlementRouter {
    return this.getRouter(EntitlementRouter);
  }

  get subscriptions(): SubscriptionRouter {
    return this.getRouter(SubscriptionRouter);
  }

  getRouter<T extends BaseRouter>(RouterClass: new (rest: Rest) => T): T {
    let sessionRouters = this.#routerCache.get(RouterClass.name);
    if (!sessionRouters) {
      sessionRouters = new Store();
      this.#routerCache.set(RouterClass.name, sessionRouters);
    }

    const routerName = RouterClass.name;
    let router = sessionRouters.get(routerName) as T;

    if (!router) {
      router = new RouterClass(this);
      sessionRouters.set(routerName, router);
    }

    return router;
  }

  request<T>(options: ApiRequestOptions): Promise<T> {
    return this.#retry.execute(
      async () => {
        this.#rateLimiter.checkRateLimit(options.path, options.method);

        const response = await this.#request.request<T>(options);

        this.#rateLimiter.updateRateLimit(
          options.path,
          options.method,
          response.headers,
          response.statusCode,
        );

        if (
          response.statusCode >= 400 &&
          this.isJsonErrorEntity(response.data)
        ) {
          throw new ApiError(
            response.data,
            response.statusCode,
            options.method,
            options.path,
          );
        }

        return response.data;
      },
      { method: options.method, path: options.path },
    );
  }

  isJsonErrorEntity(error: unknown): error is JsonErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  get<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  post<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  put<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  patch<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  delete<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  destroy(): void {
    this.#routerCache.clear();
    this.#rateLimiter.destroy();
    this.removeAllListeners();
  }
}
