import { Pool } from "undici";
import { z } from "zod";
import { ApiVersion, type HttpResponseCodes } from "../resources/index.js";
import {
  type DiscordErrorResponse,
  type ExtractQueryParams,
  type ExtractRequestBody,
  type ExtractResponseBody,
  formatDiscordError,
  isDiscordErrorResponse,
  sleep,
  type TypedRoute,
} from "../utils/index.js";

interface HttpResponse<T> {
  readonly statusCode: HttpResponseCodes;
  readonly headers: Record<string, string>;
  readonly data: T;
  readonly reason?: string;
}

interface BucketState {
  readonly remaining: number;
  readonly resetAt: number;
  readonly limit: number;
}

interface GlobalTracking {
  count: number;
  windowStart: number;
}

interface CloudflareTracking {
  invalidCount: number;
  windowStart: number;
}

const RATE_LIMIT_HEADERS = {
  LIMIT: "x-ratelimit-limit",
  REMAINING: "x-ratelimit-remaining",
  RESET: "x-ratelimit-reset",
  RESET_AFTER: "x-ratelimit-reset-after",
  BUCKET: "x-ratelimit-bucket",
  GLOBAL: "x-ratelimit-global",
  SCOPE: "x-ratelimit-scope",
  RETRY_AFTER: "retry-after",
} as const;

export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z.object({
  token: z.string(),
  authType: z.enum(["Bot", "Bearer"]).default("Bot"),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"),
  baseUrl: z.url().default("https://discord.com"),
  timeout: z.number().positive().default(15000),
  maxInvalidRequestsPer10Min: z.int().positive().default(10000),
  maxGlobalRequestsPerSecond: z.int().positive().default(50),
  respectRateLimits: z.boolean().default(true),
});

export class Rest {
  private readonly pool: Pool;
  private readonly options: z.infer<typeof RestOptions>;

  private readonly buckets = new Map<string, BucketState>();
  private readonly globalTracking: GlobalTracking = { count: 0, windowStart: Date.now() };
  private readonly cloudflareTracking: CloudflareTracking = {
    invalidCount: 0,
    windowStart: Date.now(),
  };

  constructor(options: z.input<typeof RestOptions>) {
    try {
      this.options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }

    this.pool = new Pool(this.options.baseUrl);
  }

  async request<T>(options: HttpRequestOptions): Promise<T> {
    if (this.options.respectRateLimits) {
      await this.waitForRateLimit(options.path);
    }

    const response = await this.makeHttpRequest<T>(options);

    if (this.options.respectRateLimits) {
      await this.updateRateLimitState(response.headers, response.statusCode);
    }

    return response.data as T;
  }

  get<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path"> & {
      query?: ExtractQueryParams<T["__routeSchema"]["GET"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["GET"]>> {
    return this.request({ ...options, method: "GET", path: path as string });
  }

  post<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["POST"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["POST"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["POST"]>> {
    return this.request({
      ...options,
      method: "POST",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  patch<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["PATCH"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["PATCH"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["PATCH"]>> {
    return this.request({
      ...options,
      method: "PATCH",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  put<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["PUT"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["PUT"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["PUT"]>> {
    return this.request({
      ...options,
      method: "PUT",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  delete<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path"> & {
      query?: ExtractQueryParams<T["__routeSchema"]["DELETE"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["DELETE"]>> {
    return this.request({ ...options, method: "DELETE", path: path as string });
  }

  async destroy(): Promise<void> {
    await this.pool.destroy();
    this.buckets.clear();
    this.globalTracking.count = 0;
    this.globalTracking.windowStart = Date.now();
    this.cloudflareTracking.invalidCount = 0;
    this.cloudflareTracking.windowStart = Date.now();
  }

  private async waitForRateLimit(path: string): Promise<void> {
    const now = Date.now();

    const cloudflareWait = this.checkCloudflareLimit(now);
    if (cloudflareWait > 0) {
      await sleep(cloudflareWait);
      return;
    }

    const bucketHash = path
      .replace(/\/\d+/g, "/:id") // Replace IDs with placeholder
      .replace(/\/\d{17,19}/g, "/:id");
    if (bucketHash) {
      const bucketWait = this.checkBucketLimit(bucketHash, now);
      if (bucketWait > 0) {
        await sleep(bucketWait);
        return;
      }
    }

    if (!this.isGlobalExempt(path)) {
      const globalWait = this.checkGlobalLimit(now);
      if (globalWait > 0) {
        await sleep(globalWait);
      }
    }
  }

  private async updateRateLimitState(
    headers: Record<string, string>,
    statusCode: number,
  ): Promise<void> {
    const now = Date.now();

    this.updateGlobalTracking(now);

    const INVALID_STATUSES = [401, 403, 429];
    if (INVALID_STATUSES.includes(statusCode)) {
      this.updateCloudflareTracking(now);
    }

    this.updateBucketFromHeaders(headers);
    if (statusCode === 429) {
      await this.handle429Response(headers);
    }
  }

  private checkCloudflareLimit(now: number): number {
    const windowDuration = 10 * 60 * 1000;
    if (now - this.cloudflareTracking.windowStart >= windowDuration) {
      this.cloudflareTracking.invalidCount = 0;
      this.cloudflareTracking.windowStart = now;
      return 0;
    }

    if (this.cloudflareTracking.invalidCount >= this.options.maxInvalidRequestsPer10Min) {
      return windowDuration - (now - this.cloudflareTracking.windowStart);
    }

    return 0;
  }

  private checkBucketLimit(bucketHash: string, now: number): number {
    const bucket = this.buckets.get(bucketHash);
    if (!bucket) return 0;

    if (now >= bucket.resetAt) {
      return 0;
    }

    if (bucket.remaining <= 0) {
      return bucket.resetAt - now;
    }

    return 0;
  }

  private checkGlobalLimit(now: number): number {
    const windowDuration = 1000;
    if (now - this.globalTracking.windowStart >= windowDuration) {
      this.globalTracking.count = 0;
      this.globalTracking.windowStart = now;
      return 0;
    }

    if (this.globalTracking.count >= this.options.maxGlobalRequestsPerSecond) {
      return windowDuration - (now - this.globalTracking.windowStart);
    }

    return 0;
  }

  private updateGlobalTracking(now: number): void {
    const windowDuration = 1000;

    if (now - this.globalTracking.windowStart >= windowDuration) {
      this.globalTracking.count = 1;
      this.globalTracking.windowStart = now;
    } else {
      this.globalTracking.count++;
    }
  }

  private updateCloudflareTracking(now: number): void {
    const windowDuration = 10 * 60 * 1000;

    if (now - this.cloudflareTracking.windowStart >= windowDuration) {
      this.cloudflareTracking.invalidCount = 1;
      this.cloudflareTracking.windowStart = now;
    } else {
      this.cloudflareTracking.invalidCount++;
    }
  }

  private updateBucketFromHeaders(headers: Record<string, string>): void {
    const bucketHash = headers[RATE_LIMIT_HEADERS.BUCKET];
    if (!bucketHash) return;

    const remaining = Number.parseInt(headers[RATE_LIMIT_HEADERS.REMAINING] || "1", 10);
    const resetAfter = Number.parseFloat(headers[RATE_LIMIT_HEADERS.RESET_AFTER] || "0");
    const limit = Number.parseInt(headers[RATE_LIMIT_HEADERS.LIMIT] || "1", 10);

    this.buckets.set(bucketHash, {
      remaining: Math.max(0, remaining - 1), // Account for current request
      resetAt: Date.now() + resetAfter * 1000,
      limit,
    });
  }

  private async handle429Response(headers: Record<string, string>): Promise<void> {
    const retryAfterHeader = headers[RATE_LIMIT_HEADERS.RETRY_AFTER];
    const resetAfterHeader = headers[RATE_LIMIT_HEADERS.RESET_AFTER];

    const retryAfterSeconds = retryAfterHeader
      ? Number.parseFloat(retryAfterHeader)
      : Number.parseFloat(resetAfterHeader || "1");

    const retryAfterMs = Math.ceil(retryAfterSeconds * 1000);
    const isGlobal = headers[RATE_LIMIT_HEADERS.GLOBAL] === "true";

    if (isGlobal) {
      this.buckets.clear();
    }

    if (retryAfterMs > 0) {
      await sleep(retryAfterMs + 100);
    }
  }

  private isGlobalExempt(path: string): boolean {
    const GLOBAL_EXEMPT_ROUTES = ["/interactions", "/webhooks"];
    return GLOBAL_EXEMPT_ROUTES.some((route) => path.startsWith(route));
  }

  private async makeHttpRequest<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout);
    const path = `/api/v${this.options.version}/${options.path.replace(/^\/+/, "")}`;
    const headers = this.buildRequestHeaders(options);

    try {
      const response = await this.pool.request<T>({
        path,
        method: options.method,
        body: options.body,
        query: options.query,
        headers: headers,
        signal: controller.signal,
      });

      const result = (await response.body.json()) as T;

      let reason = "";
      if (response.statusCode >= 400 && isDiscordErrorResponse(result)) {
        reason = formatDiscordError(result as DiscordErrorResponse);
      }

      return {
        data: result,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        reason,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequestHeaders(options: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.options.authType} ${this.options.token}`,
      "user-agent": this.options.userAgent,
      "x-ratelimit-precision": "millisecond",
    };

    if (options.body && typeof options.body === "string") {
      headers["content-length"] = Buffer.byteLength(options.body, "utf8").toString();
      headers["content-type"] = "application/json";
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }
}
