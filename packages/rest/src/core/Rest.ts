import { type FileHandle, open, stat } from "node:fs/promises";
import { basename } from "node:path";
import { MimeType } from "@nyxjs/core";
import FormData from "form-data";
import { BrotliDecompress, Gunzip, Inflate, type Unzip } from "minizlib";
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
import {
  CompressionMethod,
  HttpMethod,
  HttpStatusCode,
  JsonErrorCode,
} from "../utils/index.js";

export class Rest {
  static readonly #BASE_URL = "https://discord.com";
  static readonly #MAX_FILE_SIZE = 25 * 1024 * 1024;

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
      allowH2: true,
      connectTimeout: 30000,
      keepAliveTimeout: 4000,
      keepAliveMaxTimeout: 600000,
      maxHeaderSize: 16384,
      headersTimeout: 300000,
      bodyTimeout: 300000,
    });

    this.#retryAgent = new RetryAgent(this.#pool, {
      maxRetries: 3,
      maxTimeout: 5000,
      minTimeout: 1000,
      timeoutFactor: 2,
      retryAfter: true,
      methods: Object.values(HttpMethod),
      statusCodes: Object.values(HttpStatusCode).map(Number),
      errorCodes: Object.values(JsonErrorCode).map((code) => code.toString()),
    });
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const signal = options.signal ?? controller.signal;

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
        requestOptions = await this.#prepareMultipartRequest(requestOptions);
      }

      const response = await this.#retryAgent.request({
        ...requestOptions,
        path: `/api/v${this.#options.version}${requestOptions.path}`,
        headers: this.#buildHeaders(requestOptions),
        signal,
      });

      return this.#handleResponse<T>(response, requestOptions);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
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
    const contentEncoding = response.headers["content-encoding"] as
      | CompressionMethod
      | undefined;

    if (
      !(
        contentEncoding && this.#options.compression?.includes(contentEncoding)
      ) ||
      contentEncoding === CompressionMethod.Identity
    ) {
      return Buffer.from(await response.body.arrayBuffer());
    }

    const arrayBuffer = await response.body.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let decompressor: Unzip | Gunzip | Inflate | BrotliDecompress;
    switch (contentEncoding) {
      case CompressionMethod.Gzip:
        decompressor = new Gunzip({ level: 9 });
        break;
      case CompressionMethod.Deflate:
        decompressor = new Inflate({ level: 9 });
        break;
      case CompressionMethod.Brotli:
        decompressor = new BrotliDecompress({ level: 11 });
        break;
      default:
        return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      decompressor
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject)
        .end(buffer);
    });
  }

  #buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      "content-type": MimeType.Json,
      ...options.headers,
    };

    if (this.#options.compression && this.#options.compression.length > 0) {
      headers["accept-encoding"] = this.#options.compression.join(", ");
    }

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

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      if (typeof file === "string") {
        let fileHandle: FileHandle | undefined;
        try {
          const stats = await stat(file);
          if (stats.size > Rest.#MAX_FILE_SIZE) {
            throw new Error(
              `File size exceeds the maximum limit of ${Rest.#MAX_FILE_SIZE} bytes`,
            );
          }

          fileHandle = await open(file);
          buffer = await fileHandle.readFile();
          filename = basename(file);
          contentType = "application/octet-stream";
        } finally {
          await fileHandle?.close();
        }
      } else if (file instanceof File) {
        if (file.size > Rest.#MAX_FILE_SIZE) {
          throw new Error(
            `File size exceeds the maximum limit of ${Rest.#MAX_FILE_SIZE} bytes`,
          );
        }
        buffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
        contentType = file.type;
      } else {
        throw new Error(`Unsupported file type for file at index ${i}`);
      }

      form.append(files.length === 1 ? "file" : `files[${i}]`, buffer, {
        knownLength: buffer.length,
        contentType,
        filename,
      });
    }

    if (options.body) {
      form.append("payload_json", options.body);
    }

    return {
      ...options,
      body: form.getBuffer(),
      headers: form.getHeaders(options.headers),
    };
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
}
