import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import pQueue from "p-queue";
import type { Dispatcher } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { HttpError, RateLimitError } from "../errors/index.js";
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

const HTTP_METHOD_PRIORITIES: Record<Dispatcher.HttpMethod, number> = {
  GET: 0,
  POST: 1,
  PUT: 2,
  PATCH: 2,
  DELETE: 3,
  HEAD: 0,
  CONNECT: 0,
  OPTIONS: 0,
  TRACE: 0,
};

export class Rest extends EventEmitter<RestEvents> {
  readonly queue: pQueue;
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

    this.queue = this.#createQueue();
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
    const request = await this.queue.add(
      async () => {
        let attempt = 0;

        while (true) {
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
            attempt++;
            await this.#handleRequestError(error, attempt);
          }
        }
      },
      { priority: this.#calculatePriority(options) },
    );

    if (!request) {
      throw new Error("Request failed");
    }

    return request;
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

  destroy(): void {
    this.queue.clear();
    this.rateLimiter.destroy();
    this.removeAllListeners();
  }

  #createQueue(): pQueue {
    const queue = new pQueue(this.#options.queue);
    queue.on("error", (error) => this.emit("error", error));
    return queue;
  }

  #calculatePriority(options: RequestOptions): number {
    return HTTP_METHOD_PRIORITIES[options.method] ?? 3;
  }

  async #handleRequestError(error: unknown, attempt: number): Promise<void> {
    if (error instanceof RateLimitError) {
      await this.#handleRateLimitError(error);
      return;
    }

    if (
      error instanceof HttpError &&
      error.retryable &&
      attempt < this.#options.maxRetries
    ) {
      await this.#handleRetryableError(error, attempt);
      return;
    }

    this.emit("error", "Request failed", {
      attempt,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }

  async #handleRateLimitError(error: RateLimitError): Promise<void> {
    if (error.retryable) {
      await setTimeout(error.getRetryDelay());
      return;
    }
    throw error;
  }

  async #handleRetryableError(
    error: HttpError,
    attempt: number,
  ): Promise<void> {
    const backoff = this.#calculateBackoff(attempt);

    this.emit("debug", "Retrying failed request", {
      attempt,
      backoff,
      status: error.status,
      code: error.code,
    });

    await setTimeout(backoff);
  }

  #calculateBackoff(attempt: number): number {
    const baseDelay = Math.min(1000 * 2 ** attempt, 30000);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  }
}
