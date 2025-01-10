import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "eventemitter3";
import type {
  CloudflareAnalytics,
  HttpStatusCode,
  RateLimitBucket,
  RateLimitScope,
  RestEvents,
} from "../types/index.js";

export class RateLimitService extends EventEmitter<RestEvents> {
  #buckets = new Map<string, RateLimitBucket>();
  #routesToBuckets = new Map<string, string>();
  #invalidRequestsCount = 0;
  #invalidRequestsResetTime = Date.now();
  #globalReset: number | null = null;
  #cloudflareAnalytics: CloudflareAnalytics[] = [];
  readonly #cloudflareWindow = 600_000;
  readonly #headers = {
    limit: "x-ratelimit-limit",
    remaining: "x-ratelimit-remaining",
    reset: "x-ratelimit-reset",
    resetAfter: "x-ratelimit-reset-after",
    bucket: "x-ratelimit-bucket",
    scope: "x-ratelimit-scope",
    global: "x-ratelimit-global",
    retryAfter: "retry-after",
  } as const;

  readonly #sharedRoutes = new Map<RegExp, string>([
    [/^\/guilds\/\d+\/emojis/, "emoji"],
    [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
    [/^\/guilds\/\d+\/channels/, "guild-channels"],
    [/^\/guilds\/\d+\/members/, "guild-members"],
  ]);

  readonly #majorParams = [
    { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
    { regex: /^\/channels\/(\d+)/, param: "channel_id" },
    { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
  ];

  processHeaders(
    method: string,
    path: string,
    headers: Record<string, string>,
    status: HttpStatusCode,
  ): void {
    this.#trackCloudflareAnalytics(status, path);

    if (status === 401 || status === 403 || status === 429) {
      this.#trackInvalidRequest();
    }

    if (status === 403 && headers["cf-ray"]) {
      this.emit("cloudflareBan", {
        path,
        analytics: this.#getCloudflareAnalytics(),
        recommendedWaitTime: 600_000,
      });
      return;
    }

    if (status === 429) {
      const retryAfter = Number(headers[this.#headers.retryAfter]) * 1000;
      const isGlobal = headers[this.#headers.global] === "true";
      const scope = (headers[this.#headers.scope] as RateLimitScope) || "user";

      if (isGlobal) {
        this.#globalReset = Date.now() + retryAfter;
      }

      this.emit("rateLimited", {
        timeToReset: retryAfter,
        limit: -1,
        remaining: 0,
        method,
        path,
        global: isGlobal,
        scope,
        retryAfter,
      });

      return;
    }

    const bucketId = headers[this.#headers.bucket];
    if (!bucketId) {
      return;
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketId,
      limit: Number(headers[this.#headers.limit]),
      remaining: Number(headers[this.#headers.remaining]),
      reset: Number(headers[this.#headers.reset]),
      resetAfter: Number(headers[this.#headers.resetAfter]),
      scope: (headers[this.#headers.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
    };

    this.#buckets.set(bucketId, bucket);
    this.#routesToBuckets.set(routeKey, bucketId);
  }

  async checkRateLimit(method: string, path: string): Promise<void> {
    if (this.#isCloudflareBlocked()) {
      throw new Error(
        "Currently banned by Cloudflare. Please wait before retrying.",
      );
    }

    if (this.#globalReset && Date.now() < this.#globalReset) {
      const timeToReset = this.#globalReset - Date.now();
      throw new Error(`Global rate limit, retry in ${timeToReset}ms`);
    }

    if (this.#isInvalidRequestLimitExceeded()) {
      throw new Error("Invalid request limit exceeded (10,000 per 10 minutes)");
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucketId = this.#routesToBuckets.get(routeKey);
    if (!bucketId) {
      return;
    }

    const bucket = this.#buckets.get(bucketId);
    if (!bucket) {
      return;
    }

    if (bucket.remaining <= 0) {
      const now = Date.now();
      const reset = bucket.reset * 1000;
      const timeToReset = Math.max(0, reset - now);

      if (timeToReset > 0) {
        this.emit("rateLimited", {
          bucketHash: bucket.hash,
          timeToReset,
          limit: bucket.limit,
          remaining: bucket.remaining,
          method,
          path,
          global: false,
          scope: bucket.scope,
        });

        await setTimeout(timeToReset);
      }
    }
  }

  destroy(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#invalidRequestsCount = 0;
    this.#globalReset = null;
    this.#cloudflareAnalytics = [];
    this.removeAllListeners();
  }

  #trackCloudflareAnalytics(status: number, path: string): void {
    const now = Date.now();

    this.#cloudflareAnalytics = this.#cloudflareAnalytics.filter(
      (data) => now - data.timestamp < this.#cloudflareWindow,
    );

    this.#cloudflareAnalytics.push({
      status,
      timestamp: now,
      path,
    });

    const errorCount = this.#cloudflareAnalytics.filter(
      (data) => data.status === 403 || data.status === 429,
    ).length;

    if (errorCount >= 50) {
      this.emit("cloudflareWarning", {
        errorCount,
        timeWindow: this.#cloudflareWindow,
        mostAffectedRoutes: this.#getMostAffectedRoutes(),
      });
    }
  }

  #isCloudflareBlocked(): boolean {
    const now = Date.now();
    const recentErrors = this.#cloudflareAnalytics
      .filter((data) => now - data.timestamp < 60_000)
      .filter((data) => data.status === 403 || data.status === 429).length;

    return recentErrors >= 10;
  }

  #getMostAffectedRoutes(): Array<{ path: string; count: number }> {
    const routeCounts = new Map<string, number>();

    for (const data of this.#cloudflareAnalytics) {
      const count = (routeCounts.get(data.path) || 0) + 1;
      routeCounts.set(data.path, count);
    }

    return Array.from(routeCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  #getCloudflareAnalytics(): {
    total: number;
    errors: number;
    lastMinute: number;
    mostAffectedRoutes: Array<{ path: string; count: number }>;
  } {
    const now = Date.now();
    return {
      total: this.#cloudflareAnalytics.length,
      errors: this.#cloudflareAnalytics.filter((d) => d.status >= 400).length,
      lastMinute: this.#cloudflareAnalytics.filter(
        (d) => now - d.timestamp < 60_000,
      ).length,
      mostAffectedRoutes: this.#getMostAffectedRoutes(),
    };
  }

  #generateRouteKey(method: string, path: string): string {
    for (const [pattern, identifier] of this.#sharedRoutes) {
      if (pattern.test(path)) {
        return `shared:${identifier}`;
      }
    }

    let normalizedPath = path;
    for (const { regex, param } of this.#majorParams) {
      const match = path.match(regex);
      if (match) {
        normalizedPath = normalizedPath.replace(String(match[1]), `{${param}}`);
      }
    }

    return `${method}:${normalizedPath}`;
  }

  #trackInvalidRequest(): void {
    const now = Date.now();

    if (now - this.#invalidRequestsResetTime >= 600_000) {
      this.#invalidRequestsCount = 0;
      this.#invalidRequestsResetTime = now;
    }

    this.#invalidRequestsCount++;

    if (this.#invalidRequestsCount >= 8000) {
      this.emit("invalidRequestWarning", {
        count: this.#invalidRequestsCount,
        max: 10000,
      });
    }
  }

  #isInvalidRequestLimitExceeded(): boolean {
    const now = Date.now();

    if (now - this.#invalidRequestsResetTime >= 600_000) {
      this.#invalidRequestsCount = 0;
      this.#invalidRequestsResetTime = now;
      return false;
    }

    return this.#invalidRequestsCount >= 10_000;
  }

  #getSharedRoute(path: string): string | undefined {
    for (const [pattern, identifier] of this.#sharedRoutes) {
      if (pattern.test(path)) {
        return identifier;
      }
    }
    return undefined;
  }
}
