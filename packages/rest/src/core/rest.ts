import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
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
  readonly #defaultSessionId: string = "default";

  constructor(options: z.input<typeof RestOptions>) {
    super();
    this.addSession(this.#defaultSessionId, options);
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
    this.removeAllListeners();
  }

  removeSession(sessionId: string): void {
    if (sessionId === this.#defaultSessionId) {
      throw new Error("Cannot remove default session");
    }

    const session = this.#sessions.get(sessionId);
    if (session) {
      session.rateLimiter.destroy();
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
