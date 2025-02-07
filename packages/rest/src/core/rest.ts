import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { RateLimitManager, RateLimiterError } from "../managers/index.js";
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
  JsonErrorEntity,
  JsonErrorField,
  RequestOptions,
  RestEvents,
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

export class ApiError extends Error {
  readonly code: number;
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly errors?: Record<string, { _errors: JsonErrorField[] }>;

  constructor(
    error: JsonErrorEntity,
    status: number,
    method: string,
    url: string,
  ) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.status = status;
    this.method = method;
    this.url = url;
    this.errors = error.errors;
  }

  // Improved error message formatting
  override toString(): string {
    const baseMessage = `${this.name}[${this.code}]: ${this.message} (${this.method} ${this.url})`;
    if (!this.errors) {
      return baseMessage;
    }

    // Format field errors if they exist
    const fieldErrors = Object.entries(this.errors)
      .map(
        ([field, { _errors }]) =>
          `${field}: ${_errors.map((e) => e.message).join(", ")}`,
      )
      .join("\n");

    return `${baseMessage}\nField Errors:\n${fieldErrors}`;
  }
}

export class Rest extends EventEmitter<RestEvents> {
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
    this.rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
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
  async request<T>(options: RequestOptions): Promise<T> {
    let attempt = 0;
    let lastError: Error | null = null;
    const lastDelay = 0;

    while (attempt < this.#options.retry.maxRetries) {
      try {
        return await this.#executeRequest<T>(options);
      } catch (error) {
        lastError = this.#normalizeError(error);

        if (
          await this.#handleRequestError(lastError, options, attempt, lastDelay)
        ) {
          attempt++;
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error("Max retry attempts reached");
  }

  // Calculate retry delay with improved jitter handling
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
  calculateBackoff(attempt: number, lastDelay: number): number {
    const exponentialDelay = this.#options.retry.baseDelay * 2 ** attempt;
    const backoffDelay = Math.max(
      exponentialDelay,
      lastDelay * this.#options.retry.backoff,
    );
    const finalDelay = Math.min(backoffDelay, this.#options.retry.maxDelay);

    const jitter = Math.random() * this.#options.retry.jitter * finalDelay;
    return finalDelay + jitter;
  }

  // Type guard for API error responses
  isJsonErrorEntity(error: unknown): error is JsonErrorEntity {
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

  // Cleanup resources
  destroy(): void {
    this.rateLimiter.destroy();
    this.removeAllListeners();
  }

  // Validate and process the request
  async #executeRequest<T>(options: RequestOptions): Promise<T> {
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
  #handleRequestError(
    error: Error,
    options: RequestOptions,
    attempt: number,
    lastDelay: number,
  ): Promise<boolean> | boolean {
    // Handle rate limit errors
    if (error instanceof RateLimiterError) {
      return this.#handleRateLimitError(error, options, attempt);
    }

    // Handle other retryable errors
    if (this.#shouldRetry(error, attempt)) {
      return this.#handleRetryableError(error, options, attempt, lastDelay);
    }

    return false;
  }

  // Handle rate limit specific errors
  async #handleRateLimitError(
    error: RateLimiterError,
    options: RequestOptions,
    attempt: number,
  ): Promise<boolean> {
    const retryDelay = this.calculateRetryDelay(
      error.context.retryAfter * 1000,
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

  // Handle general retryable errors
  async #handleRetryableError(
    error: Error,
    options: RequestOptions,
    attempt: number,
    lastDelay: number,
  ): Promise<boolean> {
    const retryDelay = this.calculateBackoff(attempt, lastDelay);

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
    options: RequestOptions,
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
      if (
        REQUEST_CONSTANTS.NON_RETRYABLE_STATUS_CODES.includes(
          error.status as 401 | 403 | 404,
        )
      ) {
        return false;
      }
      return this.#options.retry.retryableStatusCodes.includes(error.status);
    }

    // Always retry rate limit errors
    if (error instanceof RateLimiterError) {
      return true;
    }

    // Handle network errors
    return REQUEST_CONSTANTS.NETWORK_ERROR_PATTERNS.some((pattern) =>
      error.message.includes(pattern),
    );
  }
}
