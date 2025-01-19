import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type FormData from "form-data";
import type { Dispatcher } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ApiError,
  HttpError,
  RateLimitError,
  RestError,
} from "./errors/index.js";
import { FileHandler } from "./handlers/index.js";
import { RestOptions } from "./options/index.js";
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
} from "./routes/index.js";
import { HttpService, RateLimiterService } from "./services/index.js";
import type {
  BucketStatusInfo,
  FileInput,
  GlobalRateLimitStats,
  ImageProcessingOptions,
  ProcessedFile,
  RequestOptions,
  RestEvents,
} from "./types/index.js";

export const REST_FORWARDED_EVENTS: (keyof RestEvents)[] = [
  "debug",
  "error",
  "warn",
  "requestStart",
  "requestFinish",
  "rateLimited",
  "bucketCreated",
  "bucketDeleted",
  "invalidRequest",
];

export class Rest extends EventEmitter<RestEvents> {
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

  readonly #http: HttpService;
  readonly #rateLimiter: RateLimiterService;
  readonly #file: FileHandler;
  readonly #options: z.output<typeof RestOptions>;

  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new RestError(fromError(error).message);
    }

    this.#file = new FileHandler(this.#options);
    this.#rateLimiter = new RateLimiterService(this.#options);
    this.#http = new HttpService(this.#options);

    this.#setupEventForwarding([this.#rateLimiter, this.#http]);
  }

  get<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "GET",
      path,
    });
  }

  post<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "POST",
      path,
    });
  }

  put<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "PUT",
      path,
    });
  }

  patch<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      path,
    });
  }

  delete<T>(
    path: string,
    options: Omit<RequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({
      ...options,
      method: "DELETE",
      path,
    });
  }

  createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
    imageOptions?: ImageProcessingOptions,
  ): Promise<FormData> {
    return this.#file.createFormData(files, body, imageOptions);
  }

  processFile(
    input: FileInput,
    imageOptions?: ImageProcessingOptions,
  ): Promise<ProcessedFile> {
    return this.#file.processFile(input, imageOptions);
  }

  checkRateLimit(path: string, method: string): void {
    this.#rateLimiter.checkRateLimit(path, method);
  }

  updateRateLimit(
    path: string,
    method: string,
    latency: number,
    headers: Record<string, string>,
    status: number,
  ): void {
    this.#rateLimiter.updateRateLimit(path, method, latency, headers, status);
  }

  resetRateLimits(): void {
    this.#rateLimiter.reset();
  }

  getGlobalRateLimitStats(): GlobalRateLimitStats {
    return this.#rateLimiter.getGlobalStats();
  }

  isSharedRateLimit(error: RateLimitError): boolean {
    return error.context.scope === "shared";
  }

  shouldRetryRequest(error: RateLimitError): boolean {
    return this.#rateLimiter.shouldRetry(error);
  }

  getBucketStatus(path: string, method: string): BucketStatusInfo | null {
    return this.#rateLimiter.getBucketStatus(path, method);
  }

  getNextReset(path: string, method: string): number | null {
    return this.#rateLimiter.getNextReset(path, method);
  }

  calculateLatency(bucketHash: string, latency: number): void {
    this.#rateLimiter.calculateLatency(bucketHash, latency);
  }

  incrementInvalidRequestCount(): void {
    this.#rateLimiter.incrementInvalidRequestCount();
  }

  getGlobalStats(): GlobalRateLimitStats {
    return this.#rateLimiter.getGlobalStats();
  }

  destroy(): void {
    try {
      this.#rateLimiter.reset();
    } finally {
      this.removeAllListeners();
    }
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const maxRetries = this.#options.maxRetries;
    let attempt = 0;

    while (true) {
      try {
        this.#rateLimiter.checkRateLimit(options.path, options.method);

        const processedOptions = await this.#getRequestOptions(options);
        const response = await this.#http.request<T>(processedOptions);

        this.#rateLimiter.updateRateLimit(
          options.path,
          options.method,
          response.latency,
          response.headers,
          response.statusCode,
        );

        return response.data;
      } catch (error) {
        attempt++;

        if (error instanceof RateLimitError) {
          this.emit("rateLimited", {
            timeToReset: error.timeToReset,
            limit: error.context.limit ?? 0,
            remaining: error.context.remaining ?? 0,
            method: options.method,
            path: options.path,
            global: error.global,
            scope: error.scope,
            bucketHash: error.bucket,
            retryAfter: error.context.retryAfter,
          });

          if (error.global) {
            const stats = this.#rateLimiter.getGlobalStats();
            this.emit("debug", "Hit global rate limit", {
              timeToReset: stats.timeToReset,
              totalBuckets: stats.totalBuckets,
              activeBuckets: stats.activeBuckets,
            });
            await this.#waitAndRetry(error.getRetryDelay());
            continue;
          }

          if (error.bucket) {
            const bucketStatus = this.#rateLimiter.getBucketStatus(
              options.path,
              options.method,
            );
            if (bucketStatus) {
              this.emit("debug", "Bucket status", { ...bucketStatus });
            }
          }

          if (error.retryable && this.#rateLimiter.shouldRetry(error)) {
            if (error.bucket) {
              this.#rateLimiter.calculateLatency(
                error.bucket,
                Date.now() - error.timestamp,
              );
            }

            const waitTime = error.getRetryDelay();

            this.emit("debug", "Retrying rate limited request", {
              waitTime,
              attempt,
              scope: error.scope,
            });

            await this.#waitAndRetry(waitTime);
            continue;
          }

          throw error;
        }

        if (error instanceof HttpError) {
          const canRetry = error.retryable && attempt < maxRetries;

          if (canRetry) {
            const backoff = this.#calculateBackoff(attempt);

            this.emit("debug", "Retrying failed request", {
              attempt,
              backoff,
              error: error.message,
              status: error.status,
              path: error.path,
            });

            await this.#waitAndRetry(backoff);
            continue;
          }

          this.emit("error", `Request failed after ${attempt} attempts`, {
            error: error.message,
            method: error.method ?? options.method,
            path: error.path ?? options.path,
            status: error.status,
          });
        }

        if (error instanceof ApiError) {
          if ([401, 403, 429].includes(error.status)) {
            this.#rateLimiter.incrementInvalidRequestCount();

            const stats = this.#rateLimiter.getGlobalStats();
            this.emit("debug", "Invalid request count increased", {
              count: stats.invalidRequestCount,
              code: error.code,
              status: error.status,
              message: error.message,
            });

            if (
              stats.invalidRequestCount >= this.#options.invalidRequestMaxLimit
            ) {
              this.emit("warn", "Too many invalid requests", {
                count: stats.invalidRequestCount,
                window: this.#options.invalidRequestWindow,
                lastError: {
                  code: error.code,
                  status: error.status,
                  message: error.message,
                },
              });
            }
          }

          if (error.retryable && attempt < maxRetries) {
            const backoff = this.#calculateBackoff(attempt);

            this.emit("debug", "Retrying failed API request", {
              attempt,
              backoff,
              code: error.code,
              status: error.status,
            });

            await this.#waitAndRetry(backoff);
            continue;
          }

          throw error;
        }

        this.emit("error", "Unhandled error occurred", {
          error: error instanceof Error ? error.message : "Unknown error",
          attempt,
        });

        throw error;
      }
    }
  }

  async #getRequestOptions(options: RequestOptions): Promise<RequestOptions> {
    if (!options.files) {
      return options;
    }

    const formData = await this.#file.createFormData(
      options.files,
      options.body,
    );

    return {
      ...options,
      body: formData.getBuffer(),
      headers: formData.getHeaders(options.headers as Record<string, string>),
    };
  }

  async #waitAndRetry(delay: number): Promise<void> {
    this.emit("debug", `Waiting ${delay}ms before retry`);
    await setTimeout(delay);
  }

  #calculateBackoff(attempt: number): number {
    const base = Math.min(1000 * 2 ** attempt, 5000);
    const jitter = Math.random() * 1000;
    return base + jitter;
  }

  #setupEventForwarding(services: EventEmitter<RestEvents>[]): void {
    for (const service of services) {
      for (const event of REST_FORWARDED_EVENTS) {
        service.on(event, (...args) => this.emit(event, ...args));
      }
    }
  }
}
