import type { Dispatcher } from "undici";

type RateLimitScope = "user" | "global" | "shared";

interface BucketInfo {
  hash: string;
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  scope: RateLimitScope;
}

interface MajorParameter {
  regex: RegExp;
  param: string;
}

export class RateLimitManager {
  static readonly GLOBAL_LIMIT = 50;
  static readonly INVALID_LIMIT = 10_000;
  static readonly INVALID_WINDOW = 600_000;

  static readonly HEADERS = {
    BUCKET: "x-ratelimit-bucket",
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    GLOBAL: "x-ratelimit-global",
    SCOPE: "x-ratelimit-scope",
    RETRY_AFTER: "retry-after",
  } as const;

  readonly #buckets = new Map<string, BucketInfo>();
  readonly #routeToBucket = new Map<string, string>();

  #globalReset: number | null = null;
  #globalRemaining = RateLimitManager.GLOBAL_LIMIT;
  #lastGlobalReset = Date.now();

  #invalidCount = 0;
  #lastInvalidReset = Date.now();

  get globalReset(): number | null {
    return this.#globalReset;
  }

  async checkRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
  ): Promise<void> {
    this.#checkInvalidLimit();

    if (!this.#isExcludedRoute(path)) {
      await this.#checkGlobalRateLimit();
    }

    const routeKey = this.#getRouteKey(path, method);
    const bucketHash = this.#routeToBucket.get(routeKey);

    if (bucketHash) {
      const bucket = this.#buckets.get(bucketHash);
      if (bucket) {
        if (bucket.remaining <= 0) {
          const delay = bucket.reset * 1000 - Date.now();
          if (delay > 0) {
            await this.#wait(delay);
          }
          bucket.remaining = bucket.limit;
        }

        bucket.remaining--;
        this.#buckets.set(bucketHash, bucket);
      }
    }

    if (!this.#isExcludedRoute(path)) {
      this.#globalRemaining--;
    }
  }

  updateRateLimit(
    path: string,
    method: string,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    const h = RateLimitManager.HEADERS;

    if (this.#isErrorStatusCode(statusCode)) {
      this.#incrementInvalidCount();
      if (statusCode === 429 && headers[h.GLOBAL]) {
        const retryAfter = Number(headers[h.RETRY_AFTER]) * 1000;
        this.#globalReset = Date.now() + retryAfter;
        return;
      }
    }

    const bucketHash = headers[h.BUCKET];
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#getRouteKey(path, method);
    this.#routeToBucket.set(routeKey, bucketHash);

    this.#buckets.set(bucketHash, {
      hash: bucketHash,
      limit: Number(headers[h.LIMIT]) || 0,
      remaining: Number(headers[h.REMAINING]) || 0,
      reset: Number(headers[h.RESET]) || 0,
      resetAfter: Number(headers[h.RESET_AFTER]) || 0,
      scope: (headers[h.SCOPE] as RateLimitScope) || "user",
    });
  }

  destroy(): void {
    this.#buckets.clear();
    this.#routeToBucket.clear();
    this.#globalReset = null;
    this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
    this.#invalidCount = 0;
  }

  async #checkGlobalRateLimit(): Promise<void> {
    if (Date.now() - this.#lastGlobalReset >= 1000) {
      this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
      this.#lastGlobalReset = Date.now();
    }

    if (this.#globalRemaining <= 0) {
      const delay = Math.max(0, 1000 - (Date.now() - this.#lastGlobalReset));
      await this.#wait(delay);
      this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
    }
  }

  #getRouteKey(path: string, method: string): string {
    const SharedRoutes: RegExp[] = [
      /^\/guilds\/\d+\/emojis/,
      /^\/channels\/\d+\/messages\/\d+\/reactions/,
    ];

    for (const pattern of SharedRoutes) {
      if (pattern.test(path)) {
        return `shared:${path}`;
      }
    }

    const MajorParameters: MajorParameter[] = [
      { regex: /^\/channels\/(\d+)/, param: "channel_id" },
      { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
      { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
    ];

    let routeKey = path;
    for (const { regex, param } of MajorParameters) {
      const match = path.match(regex);
      if (match) {
        routeKey = path.replace(String(match[1]), `{${param}}`);
        break;
      }
    }

    return `${method}:${routeKey}`;
  }

  #isExcludedRoute(path: string): path is string {
    return path.includes("/interactions");
  }

  #isErrorStatusCode(statusCode: number): boolean {
    return statusCode === 401 || statusCode === 403 || statusCode === 429;
  }

  #checkInvalidLimit(): void {
    const now = Date.now();
    if (now - this.#lastInvalidReset >= RateLimitManager.INVALID_WINDOW) {
      this.#invalidCount = 0;
      this.#lastInvalidReset = now;
    }

    if (this.#invalidCount >= RateLimitManager.INVALID_LIMIT) {
      throw new Error("Invalid request limit exceeded (10,000 per 10 minutes)");
    }
  }

  #incrementInvalidCount(): void {
    this.#invalidCount++;
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
