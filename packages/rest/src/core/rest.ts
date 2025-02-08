import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { BaseRouter } from "../base/index.js";
import { ApiError } from "../errors/index.js";
import { RetryManager, SessionManager } from "../managers/index.js";
import type { RestOptions } from "../options/index.js";
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
  readonly sessions: SessionManager;
  readonly retry: RetryManager;

  readonly #routerCache = new Store<string, Store<string, BaseRouter>>();

  constructor(options: z.input<typeof RestOptions>) {
    super();
    this.sessions = new SessionManager(this, options);
    this.retry = new RetryManager(this);
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

  getGuilds(sessionId: string): GuildRouter {
    return this.getRouter(GuildRouter, sessionId);
  }

  getChannels(sessionId: string): ChannelRouter {
    return this.getRouter(ChannelRouter, sessionId);
  }

  getInvites(sessionId: string): InviteRouter {
    return this.getRouter(InviteRouter, sessionId);
  }

  getTemplates(sessionId: string): GuildTemplateRouter {
    return this.getRouter(GuildTemplateRouter, sessionId);
  }

  getUsers(sessionId: string): UserRouter {
    return this.getRouter(UserRouter, sessionId);
  }

  getAuditLogs(sessionId: string): AuditLogRouter {
    return this.getRouter(AuditLogRouter, sessionId);
  }

  getMessages(sessionId: string): MessageRouter {
    return this.getRouter(MessageRouter, sessionId);
  }

  getInteractions(sessionId: string): InteractionRouter {
    return this.getRouter(InteractionRouter, sessionId);
  }

  getEmojis(sessionId: string): EmojiRouter {
    return this.getRouter(EmojiRouter, sessionId);
  }

  getStickers(sessionId: string): StickerRouter {
    return this.getRouter(StickerRouter, sessionId);
  }

  getVoice(sessionId: string): VoiceRouter {
    return this.getRouter(VoiceRouter, sessionId);
  }

  getSoundboards(sessionId: string): SoundboardRouter {
    return this.getRouter(SoundboardRouter, sessionId);
  }

  getStages(sessionId: string): StageInstanceRouter {
    return this.getRouter(StageInstanceRouter, sessionId);
  }

  getScheduledEvents(sessionId: string): ScheduledEventRouter {
    return this.getRouter(ScheduledEventRouter, sessionId);
  }

  getPolls(sessionId: string): PollRouter {
    return this.getRouter(PollRouter, sessionId);
  }

  getAutoModeration(sessionId: string): AutoModerationRouter {
    return this.getRouter(AutoModerationRouter, sessionId);
  }

  getWebhooks(sessionId: string): WebhookRouter {
    return this.getRouter(WebhookRouter, sessionId);
  }

  getOAuth2(sessionId: string): OAuth2Router {
    return this.getRouter(OAuth2Router, sessionId);
  }

  getGateway(sessionId: string): GatewayRouter {
    return this.getRouter(GatewayRouter, sessionId);
  }

  getSkus(sessionId: string): SkuRouter {
    return this.getRouter(SkuRouter, sessionId);
  }

  getEntitlements(sessionId: string): EntitlementRouter {
    return this.getRouter(EntitlementRouter, sessionId);
  }

  getSubscriptions(sessionId: string): SubscriptionRouter {
    return this.getRouter(SubscriptionRouter, sessionId);
  }

  getApplications(sessionId: string): ApplicationRouter {
    return this.getRouter(ApplicationRouter, sessionId);
  }

  getCommands(sessionId: string): ApplicationCommandRouter {
    return this.getRouter(ApplicationCommandRouter, sessionId);
  }

  getConnections(sessionId: string): ApplicationConnectionRouter {
    return this.getRouter(ApplicationConnectionRouter, sessionId);
  }

  getRouter<T extends BaseRouter>(
    RouterClass: new (rest: Rest, sessionId?: string) => T,
    sessionId: string = this.sessions.defaultSessionId,
  ): T {
    let sessionRouters = this.#routerCache.get(sessionId);
    if (!sessionRouters) {
      sessionRouters = new Store();
      this.#routerCache.set(sessionId, sessionRouters);
    }

    const routerName = RouterClass.name;
    let router = sessionRouters.get(routerName) as T;

    if (!router) {
      router = new RouterClass(this, sessionId);
      sessionRouters.set(routerName, router);
    }

    return router;
  }

  request<T>(options: ApiRequestOptions, sessionId?: string): Promise<T> {
    return this.retry.execute(
      async () => {
        const session = this.sessions.getSessionInfo(sessionId);

        session.rateLimiter.checkRateLimit(options.path, options.method);

        const response = await session.request.request<T>(options);

        session.rateLimiter.updateRateLimit(
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
      { method: options.method, path: options.path, sessionId },
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
    sessionId?: string,
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path }, sessionId);
  }

  post<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
    sessionId?: string,
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path }, sessionId);
  }

  put<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
    sessionId?: string,
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path }, sessionId);
  }

  patch<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
    sessionId?: string,
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path }, sessionId);
  }

  delete<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
    sessionId?: string,
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path }, sessionId);
  }

  destroy(): void {
    this.sessions.destroy();
    this.#routerCache.clear();
    this.removeAllListeners();
  }
}
