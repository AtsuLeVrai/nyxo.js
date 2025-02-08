import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { BaseRouter } from "../base/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import { RateLimitManager } from "../managers/index.js";
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
import type {
  ApiRequestOptions,
  JsonErrorResponse,
  RestEventHandlers,
} from "../types/index.js";

interface SessionInfo {
  httpService: HttpService;
  rateLimiter: RateLimitManager;
  options: RestOptions;
}

const REQUEST_CONSTANTS = {
  MIN_RETRY_DELAY: 100,
  MAX_JITTER: 500,
  NON_RETRYABLE_STATUS_CODES: [401, 403, 404],
  NETWORK_ERROR_PATTERNS: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EPIPE",
    "ENOTFOUND",
    "ENETUNREACH",
  ],
} as const;

export class Rest extends EventEmitter<RestEventHandlers> {
  readonly #sessions = new Map<string, SessionInfo>();
  readonly #routerCache = new Map<string, Map<string, BaseRouter>>();
  readonly #defaultSessionId: string = "default";

  constructor(options: z.input<typeof RestOptions>) {
    super();
    this.addSession(this.#defaultSessionId, options);
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
    sessionId?: string,
  ): T {
    const id = sessionId || this.#defaultSessionId;

    let sessionRouters = this.#routerCache.get(id);
    if (!sessionRouters) {
      sessionRouters = new Map();
      this.#routerCache.set(id, sessionRouters);
    }

    const routerName = RouterClass.name;
    let router = sessionRouters.get(routerName) as T;

    if (!router) {
      router = new RouterClass(this, id);
      sessionRouters.set(routerName, router);
    }

    return router;
  }

  getSessionOptions(sessionId?: string): Readonly<RestOptions> {
    const session = this.getSessionInfo(sessionId || this.#defaultSessionId);
    return { ...session.options };
  }

  updateSessionOptions(
    options: z.input<typeof RestOptions>,
    sessionId?: string,
  ): void {
    const id = sessionId || this.#defaultSessionId;
    const session = this.getSessionInfo(id);
    const oldOptions = { ...session.options };

    const updatedOptions = RestOptions.safeParse({
      ...oldOptions,
      ...options,
    });
    if (!updatedOptions.success) {
      throw new Error(fromZodError(updatedOptions.error).message);
    }

    const httpService = new HttpService(this, updatedOptions.data);
    const rateLimiter = new RateLimitManager(
      this,
      updatedOptions.data.rateLimit,
    );
    session.rateLimiter.destroy();

    this.#sessions.set(id, {
      httpService,
      rateLimiter,
      options: updatedOptions.data,
    });

    this.emit("sessionUpdated", {
      sessionId: id,
      timestamp: Date.now(),
      oldOptions,
      newOptions: updatedOptions.data,
    });
  }

  getOption<K extends keyof RestOptions>(
    key: K,
    sessionId?: string,
  ): RestOptions[K] {
    const options = this.getSessionOptions(sessionId);
    return options[key];
  }

  getOptions<K extends keyof RestOptions>(
    keys: K[],
    sessionId?: string,
  ): Pick<RestOptions, K> {
    const options = this.getSessionOptions(sessionId);
    return keys.reduce(
      (acc, key) => {
        acc[key] = options[key];
        return acc;
      },
      {} as Pick<RestOptions, K>,
    );
  }

  addSession(sessionId: string, options: z.input<typeof RestOptions>): void {
    if (this.#sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }

    const parsedOptions = RestOptions.safeParse(options);
    if (!parsedOptions.success) {
      throw new Error(fromZodError(parsedOptions.error).message);
    }

    const httpService = new HttpService(this, parsedOptions.data);
    const rateLimiter = new RateLimitManager(
      this,
      parsedOptions.data.rateLimit,
    );

    this.#sessions.set(sessionId, {
      httpService,
      rateLimiter,
      options: parsedOptions.data,
    });

    this.emit("sessionCreated", {
      sessionId,
      timestamp: Date.now(),
      options: parsedOptions.data,
    });
  }

  getSessionInfo(sessionId?: string): SessionInfo {
    const id = sessionId || this.#defaultSessionId;
    const session = this.#sessions.get(id);

    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    return session;
  }

  async request<T>(
    options: ApiRequestOptions,
    sessionId?: string,
    attempt = 0,
  ): Promise<T> {
    const session = this.getSessionInfo(sessionId);

    try {
      return await this.#executeRequest<T>(options, session);
    } catch (error) {
      const normalizedError = this.#normalizeError(error);

      const shouldRetry = await this.#handleRequestError(
        normalizedError,
        options,
        attempt,
        session.options,
      );

      if (!shouldRetry || attempt >= session.options.retry.maxRetries) {
        throw normalizedError;
      }

      return this.request(options, sessionId, attempt + 1);
    }
  }

  calculateRetryDelay(
    baseDelay: number,
    attempt: number,
    options: RestOptions,
  ): number {
    const exponentialDelay = Math.min(
      baseDelay * 2 ** attempt,
      options.retry.maxDelay,
    );

    const maxJitter = Math.min(
      exponentialDelay * options.retry.jitter,
      REQUEST_CONSTANTS.MAX_JITTER,
    );
    const jitter = Math.random() * maxJitter;

    return Math.max(
      exponentialDelay + jitter,
      REQUEST_CONSTANTS.MIN_RETRY_DELAY,
    );
  }

  calculateBackoff(attempt: number, options: RestOptions): number {
    const exponentialDelay = 1000 * 2 ** attempt;
    const finalDelay = Math.min(exponentialDelay, options.retry.maxDelay);
    const jitter = Math.random() * options.retry.jitter * finalDelay;
    return finalDelay + jitter;
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

  getSessions(): string[] {
    return Array.from(this.#sessions.keys());
  }

  hasSession(sessionId: string): boolean {
    return this.#sessions.has(sessionId);
  }

  destroy(): void {
    for (const [, session] of this.#sessions) {
      session.rateLimiter.destroy();
    }

    this.#sessions.clear();
    this.#routerCache.clear();
    this.removeAllListeners();
  }

  removeSession(sessionId: string): void {
    if (sessionId === this.#defaultSessionId) {
      throw new Error("Cannot remove default session");
    }

    const session = this.#sessions.get(sessionId);
    if (session) {
      session.rateLimiter.destroy();
      this.#routerCache.delete(sessionId);
      this.#sessions.delete(sessionId);

      this.emit("sessionDestroyed", {
        sessionId,
        timestamp: Date.now(),
      });
    }
  }

  async #executeRequest<T>(
    options: ApiRequestOptions,
    session: SessionInfo,
  ): Promise<T> {
    session.rateLimiter.checkRateLimit(options.path, options.method);

    const response = await session.httpService.request<T>(options);

    session.rateLimiter.updateRateLimit(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
    );

    if (response.statusCode >= 400 && this.isJsonErrorEntity(response.data)) {
      throw new ApiError(
        response.data,
        response.statusCode,
        options.method,
        options.path,
      );
    }

    return response.data;
  }

  async #handleRequestError(
    error: Error,
    options: ApiRequestOptions,
    attempt: number,
    sessionOptions: RestOptions,
  ): Promise<boolean> {
    if (!this.#shouldRetry(error, attempt, sessionOptions)) {
      return false;
    }

    if (error instanceof RateLimitError) {
      const retryDelay = this.calculateRetryDelay(
        error.context.retryAfter,
        attempt,
        sessionOptions,
      );

      this.emit(
        "debug",
        `Rate limited on ${options.method} ${options.path}. Retrying in ${retryDelay}ms`,
        {
          attempt,
          delay: retryDelay,
          retryAfter: error.context.retryAfter,
        },
      );

      await setTimeout(retryDelay);
      return true;
    }

    const backoffDelay = this.calculateBackoff(attempt, sessionOptions);
    await setTimeout(backoffDelay);
    return true;
  }

  #normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(typeof error === "string" ? error : JSON.stringify(error));
  }

  #shouldRetry(error: Error, attempt: number, options: RestOptions): boolean {
    if (attempt >= options.retry.maxRetries) {
      return false;
    }

    if (error instanceof ApiError) {
      return options.retry.retryableStatusCodes.includes(error.status);
    }

    if (error instanceof RateLimitError) {
      return options.retry.retryOn.rateLimits;
    }

    const errorMessage = error.message.toLowerCase();

    const isNetworkError = options.retry.retryableErrors.some((code) =>
      errorMessage.includes(code.toLowerCase()),
    );
    if (isNetworkError) {
      return options.retry.retryOn.networkErrors;
    }

    if (errorMessage.includes("timeout")) {
      return options.retry.retryOn.timeouts;
    }

    return false;
  }
}
