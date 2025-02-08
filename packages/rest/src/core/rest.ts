import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
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

// Constants for request handling
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
  readonly http: HttpService;
  readonly rateLimiter: RateLimitManager;
  readonly #options: RestOptions;

  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.http = new HttpService(this, this.#options);
    this.rateLimiter = new RateLimitManager(this.#options.rateLimit);
  }

  // Getters for options and routers
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

  // Enhanced request method with better error handling and retry logic
  async request<T>(options: ApiRequestOptions, attempt = 0): Promise<T> {
    try {
      return await this.#executeRequest<T>(options);
    } catch (error) {
      const normalizedError = this.#normalizeError(error);

      const shouldRetry = await this.#handleRequestError(
        normalizedError,
        options,
        attempt,
      );

      if (!shouldRetry || attempt >= this.#options.retry.maxRetries) {
        throw normalizedError;
      }

      return this.request(options, attempt + 1);
    }
  }

  calculateRetryDelay(baseDelay: number, attempt: number): number {
    const exponentialDelay = Math.min(
      baseDelay * 2 ** attempt,
      this.#options.retry.maxDelay,
    );

    const maxJitter = Math.min(
      exponentialDelay * this.#options.retry.jitter,
      REQUEST_CONSTANTS.MAX_JITTER,
    );
    const jitter = Math.random() * maxJitter;

    return Math.max(
      exponentialDelay + jitter,
      REQUEST_CONSTANTS.MIN_RETRY_DELAY,
    );
  }

  // Calculate backoff with improved error handling
  calculateBackoff(attempt: number): number {
    const exponentialDelay = 1000 * 2 ** attempt;
    const backoffDelay = Math.max(exponentialDelay);
    const finalDelay = Math.min(backoffDelay, this.#options.retry.maxDelay);

    const jitter = Math.random() * this.#options.retry.jitter * finalDelay;
    return finalDelay + jitter;
  }

  // Type guard for API error responses
  isJsonErrorEntity(error: unknown): error is JsonErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  // HTTP method convenience wrappers
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

  // Cleanup resources
  destroy(): void {
    this.rateLimiter.destroy();
    this.removeAllListeners();
  }

  // Validate and process the request
  async #executeRequest<T>(options: ApiRequestOptions): Promise<T> {
    // Check rate limits before making the request
    this.rateLimiter.checkRateLimit(options.path, options.method);

    const response = await this.http.request<T>(options);

    // Update rate limit information after the request
    this.rateLimiter.updateRateLimit(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
    );

    // Handle error responses
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

  // Handle different types of request errors
  async #handleRequestError(
    error: Error,
    options: ApiRequestOptions,
    attempt: number,
  ): Promise<boolean> {
    if (!this.#shouldRetry(error, attempt)) {
      return false;
    }

    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      const retryDelay = this.calculateRetryDelay(
        error.context.retryAfter,
        attempt,
      );

      this.#emitDebugInfo("rate_limit", options, {
        attempt,
        delay: retryDelay,
        retryAfter: error.context.retryAfter,
      });

      await setTimeout(retryDelay);
      return true;
    }

    // Handle other retryable errors
    const retryDelay = this.calculateBackoff(attempt);

    this.#emitDebugInfo("retry", options, {
      attempt,
      delay: retryDelay,
      error,
    });

    await setTimeout(retryDelay);
    return true;
  }

  // Emit debug information in a consistent format
  #emitDebugInfo(
    type: "rate_limit" | "retry",
    options: ApiRequestOptions,
    details: Record<string, unknown>,
  ): void {
    const message =
      type === "rate_limit"
        ? `Rate limited on ${options.method} ${options.path}. Retrying in ${details.delay}ms`
        : `Request failed, retrying ${options.method} ${options.path}`;

    this.emit("debug", message, details);
  }

  // Improved error normalization
  #normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(typeof error === "string" ? error : JSON.stringify(error));
  }

  // Enhanced retry decision logic
  #shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.#options.retry.maxRetries) {
      return false;
    }

    // Handle API errors
    if (error instanceof ApiError) {
      // Vérifier d'abord les codes non-retryables
      if (this.#options.retry.nonRetryableStatusCodes.includes(error.status)) {
        return false;
      }
      // Puis vérifier les codes retryables
      return this.#options.retry.retryableStatusCodes.includes(error.status);
    }

    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      return this.#options.retry.retryOn.rateLimits;
    }

    // Handle network errors
    const errorMessage = error.message.toLowerCase();
    const isNetworkError = this.#options.retry.retryableErrors.some((code) =>
      errorMessage.includes(code.toLowerCase()),
    );
    if (isNetworkError) {
      return this.#options.retry.retryOn.networkErrors;
    }

    // Handle timeout errors
    const isTimeoutError = errorMessage.includes("timeout");
    if (isTimeoutError) {
      return this.#options.retry.retryOn.timeouts;
    }

    // Handle non-retryable errors
    const isNonRetryableError = this.#options.retry.nonRetryableErrors.some(
      (code) => errorMessage.includes(code.toLowerCase()),
    );
    if (isNonRetryableError) {
      return false;
    }

    return false;
  }
}
