import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import pQueue from "p-queue";
import type { Dispatcher } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { HttpError, RateLimitError } from "../errors/index.js";
import { RouterFactory } from "../factory/index.js";
import { RateLimiterManager } from "../managers/index.js";
import { RestOptions } from "../options/index.js";
import type {
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
  readonly routers: RouterFactory;
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
    this.routers = new RouterFactory(this);
  }

  get applications(): ApplicationRouter {
    return this.routers.getRouter("applications");
  }

  get commands(): ApplicationCommandRouter {
    return this.routers.getRouter("commands");
  }

  get connections(): ApplicationConnectionRouter {
    return this.routers.getRouter("connections");
  }

  get guilds(): GuildRouter {
    return this.routers.getRouter("guilds");
  }

  get channels(): ChannelRouter {
    return this.routers.getRouter("channels");
  }

  get invites(): InviteRouter {
    return this.routers.getRouter("invites");
  }

  get templates(): GuildTemplateRouter {
    return this.routers.getRouter("templates");
  }

  get users(): UserRouter {
    return this.routers.getRouter("users");
  }

  get auditLogs(): AuditLogRouter {
    return this.routers.getRouter("auditLogs");
  }

  get messages(): MessageRouter {
    return this.routers.getRouter("messages");
  }

  get interactions(): InteractionRouter {
    return this.routers.getRouter("interactions");
  }

  get emojis(): EmojiRouter {
    return this.routers.getRouter("emojis");
  }

  get stickers(): StickerRouter {
    return this.routers.getRouter("stickers");
  }

  get voice(): VoiceRouter {
    return this.routers.getRouter("voice");
  }

  get soundboards(): SoundboardRouter {
    return this.routers.getRouter("soundboards");
  }

  get stages(): StageInstanceRouter {
    return this.routers.getRouter("stages");
  }

  get scheduledEvents(): ScheduledEventRouter {
    return this.routers.getRouter("scheduledEvents");
  }

  get polls(): PollRouter {
    return this.routers.getRouter("polls");
  }

  get autoModeration(): AutoModerationRouter {
    return this.routers.getRouter("autoModeration");
  }

  get webhooks(): WebhookRouter {
    return this.routers.getRouter("webhooks");
  }

  get oauth2(): OAuth2Router {
    return this.routers.getRouter("oauth2");
  }

  get gateway(): GatewayRouter {
    return this.routers.getRouter("gateway");
  }

  get skus(): SkuRouter {
    return this.routers.getRouter("skus");
  }

  get entitlements(): EntitlementRouter {
    return this.routers.getRouter("entitlements");
  }

  get subscriptions(): SubscriptionRouter {
    return this.routers.getRouter("subscriptions");
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
    this.routers.destroy();
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
