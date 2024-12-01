import { Readable } from "node:stream";
import { MimeType } from "@nyxjs/core";
import FormData from "form-data";
import { BrotliDecompress, Gunzip } from "minizlib";
import { type Dispatcher, Pool, RetryAgent } from "undici";
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
  JsonErrorResponse,
  PathLike,
  RateLimitData,
  RequestOptions,
  RestOptions,
} from "../types/index.js";
import { HttpMethod, HttpStatusCode, JsonErrorCode } from "../utils/index.js";

export class Rest {
  static readonly #BASE_URL = "https://discord.com/api";
  static readonly #MAX_FILE_SIZE = 25 * 1024 * 1024;
  static readonly #ALLOWED_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ] as const;

  readonly applications = new ApplicationRouter(this);
  readonly applicationCommands = new ApplicationCommandRouter(this);
  readonly applicationConnections = new ApplicationConnectionRouter(this);
  readonly auditLogs = new AuditLogRouter(this);
  readonly autoModeration = new AutoModerationRouter(this);
  readonly channels = new ChannelRouter(this);
  readonly emojis = new EmojiRouter(this);
  readonly entitlements = new EntitlementRouter(this);
  readonly gateway = new GatewayRouter(this);
  readonly guilds = new GuildRouter(this);
  readonly guildTemplates = new GuildTemplateRouter(this);
  readonly interactions = new InteractionRouter(this);
  readonly invites = new InviteRouter(this);
  readonly messages = new MessageRouter(this);
  readonly oauth2 = new OAuth2Router(this);
  readonly polls = new PollRouter(this);
  readonly scheduledEvents = new ScheduledEventRouter(this);
  readonly skus = new SkuRouter(this);
  readonly soundboards = new SoundboardRouter(this);
  readonly stageInstances = new StageInstanceRouter(this);
  readonly stickers = new StickerRouter(this);
  readonly subscriptions = new SubscriptionRouter(this);
  readonly users = new UserRouter(this);
  readonly voices = new VoiceRouter(this);
  readonly webhook = new WebhookRouter(this);
  readonly #pool: Pool;
  readonly #retryAgent: RetryAgent;
  readonly #options: RestOptions;
  readonly #rateLimits = new Map<string, RateLimitData>();
  #globalRateLimitTimer: NodeJS.Timeout | null = null;

  constructor(options: RestOptions) {
    this.#options = options;
    this.#pool = new Pool(Rest.#BASE_URL, {
      connections: 4,
      pipelining: 1,
      ...options.pool,
    });

    this.#retryAgent = new RetryAgent(this.#pool, {
      retryAfter: true,
      maxRetries: this.#options.retries,
      maxTimeout: this.#options.timeout,
      timeoutFactor: 2,
      methods: Object.values(HttpMethod),
      statusCodes: Object.values(HttpStatusCode).map(Number),
      errorCodes: Object.values(JsonErrorCode).map(String),
    });
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const signal = options.signal ?? controller.signal;
    const timeout = setTimeout(() => controller.abort(), this.#options.timeout);

    try {
      const rateLimit = this.#rateLimits.get(options.path);
      if (rateLimit && this.#shouldWaitForRateLimit(rateLimit)) {
        await this.#waitForRateLimit(rateLimit);
      }

      let requestOptions = options;
      if (
        Array.isArray(requestOptions.files) &&
        requestOptions.files.length > 0
      ) {
        await this.#validateFiles(requestOptions.files);
        requestOptions = await this.#prepareMultipartRequest(requestOptions);
      }

      const response = await this.#retryAgent.request({
        ...requestOptions,
        path: `/v${this.#options.version}${requestOptions.path}`,
        headers: this.#buildHeaders(requestOptions),
        signal,
      });

      return this.#handleResponse<T>(response, requestOptions);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    } finally {
      clearTimeout(timeout);
      if (!options.signal) {
        controller.abort();
      }
    }
  }

  get<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Get, path, ...options });
  }

  post<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Post, path, ...options });
  }

  put<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Put, path, ...options });
  }

  patch<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Patch, path, ...options });
  }

  delete<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request<T>({ method: HttpMethod.Delete, path, ...options });
  }

  async destroy(): Promise<void> {
    await this.#pool.destroy();
    await this.#retryAgent.destroy();
    if (this.#globalRateLimitTimer) {
      clearTimeout(this.#globalRateLimitTimer);
    }
    this.#rateLimits.clear();
  }

  async #handleResponse<T>(
    response: Dispatcher.ResponseData,
    request: RequestOptions,
  ): Promise<T> {
    const rateLimitData = this.#extractRateLimitData(
      response.headers as Record<string, string>,
    );

    if (rateLimitData) {
      this.#updateRateLimit(request.path, rateLimitData);
    }

    const decompressedData = await this.#decompressResponse(response);

    if (response.statusCode !== HttpStatusCode.Ok) {
      const error = JSON.parse(
        decompressedData.toString(),
      ) as JsonErrorResponse;
      if (response.statusCode === HttpStatusCode.TooManyRequests) {
        throw new Error(`Rate limited: ${error.message}. Code: ${error.code}`);
      }
      throw new Error(
        `Request failed with status: ${response.statusCode}. ${error.message}`,
      );
    }

    const contentType = response.headers["content-type"];
    if (contentType?.includes("application/json")) {
      return JSON.parse(decompressedData.toString()) as T;
    }

    return decompressedData as T;
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const contentEncoding = response.headers["content-encoding"];
    if (!contentEncoding) {
      return Buffer.from(await response.body.arrayBuffer());
    }

    const buffer = await response.body.arrayBuffer();
    const source = Readable.from(Buffer.from(buffer));

    let decompressor: Gunzip | BrotliDecompress;
    switch (contentEncoding) {
      case "gzip":
        decompressor = new Gunzip({ level: 9 });
        break;
      case "br":
        decompressor = new BrotliDecompress({ level: 11 });
        break;
      default:
        return Buffer.from(buffer);
    }

    const chunks: Buffer[] = [];
    source.pipe(decompressor);

    return new Promise((resolve, reject) => {
      decompressor
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("error", reject)
        .on("end", () => {
          resolve(Buffer.concat(chunks));
        });
    });
  }

  #buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "accept-encoding": "br, gzip",
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      ...options.headers,
    };

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

  #extractRateLimitData(
    headers: Record<string, string>,
  ): Partial<RateLimitData> | null {
    const bucket = headers["x-ratelimit-bucket"];
    if (!bucket) {
      return null;
    }

    return {
      bucket,
      limit: Number(headers["x-ratelimit-limit"]),
      remaining: Number(headers["x-ratelimit-remaining"]),
      reset: Number(headers["x-ratelimit-reset"]),
      resetAfter: Number(headers["x-ratelimit-reset-after"]),
      global: headers["x-ratelimit-global"] === "true",
      scope: (headers["x-ratelimit-scope"] as RateLimitData["scope"]) ?? "user",
    };
  }

  async #prepareMultipartRequest(
    options: RequestOptions,
  ): Promise<RequestOptions> {
    const form = new FormData();
    let files = options.files;
    if (!files) {
      throw new Error("No files provided");
    }

    if (!Array.isArray(files)) {
      files = [files];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        throw new Error("Invalid file provided");
      }

      const buffer = await file.arrayBuffer();
      form.append(
        files.length === 1 ? "file" : `files[${i}]`,
        new Blob([buffer], { type: this.#getContentType(file.name) }),
        file.name,
      );
    }

    if (options.body) {
      form.append("payload_json", JSON.stringify(options.body));
    }

    return {
      ...options,
      body: form,
      headers: {
        ...options.headers,
        "content-type": MimeType.FormData,
      },
    };
  }

  #getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
        return MimeType.Jpeg;
      case "png":
        return MimeType.Png;
      case "gif":
        return MimeType.Gif;
      case "webp":
        return MimeType.Webp;
      default:
        return MimeType.OctetStream;
    }
  }

  #updateRateLimit(path: string, data: Partial<RateLimitData>): void {
    const current = this.#rateLimits.get(path) ?? {};
    this.#rateLimits.set(path, { ...current, ...data } as RateLimitData);

    if (data.global) {
      const resetAfter = Number(data.resetAfter) * 1000;
      if (this.#globalRateLimitTimer) {
        clearTimeout(this.#globalRateLimitTimer);
      }
      this.#globalRateLimitTimer = setTimeout(() => {
        this.#globalRateLimitTimer = null;
      }, resetAfter);
    }
  }

  #shouldWaitForRateLimit(rateLimit: RateLimitData): boolean {
    return rateLimit.remaining <= 0 && Date.now() < rateLimit.reset * 1000;
  }

  async #waitForRateLimit(rateLimit: RateLimitData): Promise<void> {
    const delay = Math.max(0, rateLimit.reset * 1000 - Date.now());
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async #validateFiles(files: File[]): Promise<void> {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > Rest.#MAX_FILE_SIZE) {
      throw new Error(
        `Total file size exceeds ${Rest.#MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (
        !(
          extension &&
          Rest.#ALLOWED_EXTENSIONS.includes(
            extension as "jpg" | "jpeg" | "png" | "webp" | "gif",
          )
        )
      ) {
        throw new Error(
          `Invalid file type: ${extension}. Allowed: ${Rest.#ALLOWED_EXTENSIONS.join(", ")}`,
        );
      }
    }
  }
}
