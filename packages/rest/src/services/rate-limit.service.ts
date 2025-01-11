import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { RestCloudflareBanError, RestRateLimitError } from "../errors/index.js";
import { RateLimitOptions } from "../options/index.js";
import type {
  CloudflareAnalytics,
  HttpStatusCode,
  RateLimitBucket,
  RateLimitScope,
  RestEvents,
} from "../types/index.js";

export class RateLimitService extends EventEmitter<RestEvents> {
  #buckets = new Store<string, RateLimitBucket>();
  #routesToBuckets = new Store<string, string>();
  #invalidRequestsCount = 0;
  #invalidRequestsResetTime = Date.now();
  #globalReset: number | null = null;
  #cloudflareAnalytics: CloudflareAnalytics[] = [];

  readonly #options: z.output<typeof RateLimitOptions>;

  constructor(options: z.input<typeof RateLimitOptions> = {}) {
    super();
    try {
      this.#options = RateLimitOptions.parse(options);
    } catch (error) {
      const validationError = fromError(error);
      throw new Error(validationError.message);
    }
  }

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
      const analytics = {
        total: this.#cloudflareAnalytics.length,
        errors: this.#cloudflareAnalytics.filter((d) => d.status >= 400).length,
        lastMinute: this.#cloudflareAnalytics.filter(
          (d) => Date.now() - d.timestamp < 60_000,
        ).length,
        mostAffectedRoutes: this.#getMostAffectedRoutes(),
      };

      const error = new RestCloudflareBanError(
        this.#options.timeouts.cloudflareWindow,
        path,
        analytics,
      );

      this.emit("cloudflareBan", {
        path,
        analytics,
        recommendedWaitTime: this.#options.timeouts.cloudflareWindow,
      });

      throw error;
    }

    if (status === 429) {
      const retryAfter =
        Number(headers[this.#options.headers.retryAfter]) * 1000;
      const isGlobal = headers[this.#options.headers.global] === "true";
      const scope =
        (headers[this.#options.headers.scope] as RateLimitScope) || "user";

      if (isGlobal) {
        this.#globalReset = Date.now() + retryAfter;
      }

      const error = new RestRateLimitError(
        retryAfter,
        isGlobal,
        scope,
        method,
        path,
        retryAfter,
        -1,
        0,
      );

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

      throw error;
    }

    const bucketId = headers[this.#options.headers.bucket];
    if (!bucketId) {
      return;
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketId,
      limit: Number(headers[this.#options.headers.limit]),
      remaining: Number(headers[this.#options.headers.remaining]),
      reset: Number(headers[this.#options.headers.reset]),
      resetAfter: Number(headers[this.#options.headers.resetAfter]),
      scope: (headers[this.#options.headers.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
    };

    this.#buckets.set(bucketId, bucket);
    this.#routesToBuckets.set(routeKey, bucketId);
  }

  async checkRateLimit(method: string, path: string): Promise<void> {
    if (this.#isCloudflareBlocked()) {
      throw new RestCloudflareBanError(
        this.#options.timeouts.cloudflareBlockWindow,
        path,
        {
          total: this.#cloudflareAnalytics.length,
          errors: this.#cloudflareAnalytics.filter((d) => d.status >= 400)
            .length,
          lastMinute: this.#cloudflareAnalytics.filter(
            (d) => Date.now() - d.timestamp < 60_000,
          ).length,
          mostAffectedRoutes: this.#getMostAffectedRoutes(),
        },
      );
    }

    if (this.#globalReset && Date.now() < this.#globalReset) {
      const timeToReset = this.#globalReset - Date.now();
      throw new RestRateLimitError(timeToReset, true, "global", method, path);
    }

    if (this.#isInvalidRequestLimitExceeded()) {
      throw new RestRateLimitError(
        this.#options.timeouts.invalidRequestWindow,
        false,
        "user",
        method,
        path,
      );
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
        const error = new RestRateLimitError(
          timeToReset,
          false,
          bucket.scope,
          method,
          path,
          undefined,
          bucket.limit,
          bucket.remaining,
          bucket.hash,
        );

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
        throw error;
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
      (data) => now - data.timestamp < this.#options.timeouts.cloudflareWindow,
    );

    this.#cloudflareAnalytics.push({
      status,
      timestamp: now,
      path,
    });

    const errorCount = this.#cloudflareAnalytics.filter(
      (data) => data.status === 403 || data.status === 429,
    ).length;

    if (errorCount >= this.#options.timeouts.cloudflareErrorThreshold) {
      this.emit("cloudflareWarning", {
        errorCount,
        timeWindow: this.#options.timeouts.cloudflareWindow,
        mostAffectedRoutes: this.#getMostAffectedRoutes(),
      });
    }
  }

  #isCloudflareBlocked(): boolean {
    const now = Date.now();
    const recentErrors = this.#cloudflareAnalytics
      .filter(
        (data) =>
          now - data.timestamp < this.#options.timeouts.cloudflareBlockWindow,
      )
      .filter((data) => data.status === 403 || data.status === 429).length;

    return recentErrors >= this.#options.timeouts.cloudflareBlockThreshold;
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

  #generateRouteKey(method: string, path: string): string {
    for (const [pattern, identifier] of Object.entries(
      this.#options.sharedRoutes,
    )) {
      if (new RegExp(pattern).test(path)) {
        return `shared:${identifier}`;
      }
    }

    let normalizedPath = path;
    for (const { regex, param } of this.#options.majorParams) {
      const match = path.match(new RegExp(regex));
      if (match) {
        normalizedPath = normalizedPath.replace(String(match[1]), `{${param}}`);
      }
    }

    return `${method}:${normalizedPath}`;
  }

  #trackInvalidRequest(): void {
    const now = Date.now();

    if (
      now - this.#invalidRequestsResetTime >=
      this.#options.timeouts.invalidRequestWindow
    ) {
      this.#invalidRequestsCount = 0;
      this.#invalidRequestsResetTime = now;
    }

    this.#invalidRequestsCount++;

    if (
      this.#invalidRequestsCount >=
      this.#options.timeouts.invalidRequestWarningThreshold
    ) {
      this.emit("invalidRequestWarning", {
        count: this.#invalidRequestsCount,
        max: this.#options.timeouts.invalidRequestMaxLimit,
      });
    }
  }

  #isInvalidRequestLimitExceeded(): boolean {
    const now = Date.now();

    if (
      now - this.#invalidRequestsResetTime >=
      this.#options.timeouts.invalidRequestWindow
    ) {
      this.#invalidRequestsCount = 0;
      this.#invalidRequestsResetTime = now;
      return false;
    }

    return (
      this.#invalidRequestsCount >=
      this.#options.timeouts.invalidRequestMaxLimit
    );
  }

  #getSharedRoute(path: string): string | undefined {
    for (const [pattern, identifier] of Object.entries(
      this.#options.sharedRoutes,
    )) {
      if (new RegExp(pattern).test(path)) {
        return identifier;
      }
    }
    return undefined;
  }
}
