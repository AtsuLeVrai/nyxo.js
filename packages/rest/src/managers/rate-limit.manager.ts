import { Store } from "@nyxjs/store";
import type { Rest } from "../core/index.js";
import { RateLimitError } from "../errors/index.js";
import type { RateLimitOptions } from "../options/index.js";
import type { RateLimitBucket, RateLimitScope } from "../types/index.js";

const WEBHOOK_REGEX = /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/;
const EMOJI_REGEX = /^\/guilds\/(\d+)\/emojis/;
const EXEMPT_ROUTES = new Set(["/interactions", "/webhooks"]);

const HEADERS = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

const GLOBAL_LIMIT = {
  REQUESTS_PER_SECOND: 50,
  INVALID_REQUESTS_LIMIT: 10_000,
  INVALID_REQUESTS_WINDOW: 600_000,
};

interface InvalidRequestTracking {
  count: number;
  windowStart: number;
}

export class RateLimitManager {
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #routeBuckets = new Store<string, string>();
  readonly #cleanupInterval: NodeJS.Timeout;
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  readonly #globalRequestTimes: number[] = [];

  readonly #rest: Rest;
  readonly #options: RateLimitOptions;

  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;
    this.#cleanupInterval = setInterval(
      () => this.#cleanupExpiredBuckets(),
      this.#options.cleanupInterval,
    );
  }

  checkRateLimit(path: string, method: string): void {
    this.#checkGlobalRateLimit();

    this.#checkInvalidRequestLimit();

    if (EXEMPT_ROUTES.has(path)) {
      return;
    }

    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routeBuckets.get(routeKey);
    if (!bucketHash) {
      return;
    }

    const bucket = this.#buckets.get(bucketHash);
    if (bucket) {
      if (this.#isEmojiRoute(path)) {
        this.#checkEmojiBucketLimit(bucket, path, method);
        return;
      }
      this.#checkBucketLimit(bucket, path, method);
    }
  }

  getRouteKey(method: string, path: string): string {
    const webhookMatch = path.match(WEBHOOK_REGEX);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    const emojiMatch = path.match(EMOJI_REGEX);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    return `${method}:${path}`;
  }

  updateRateLimit(
    path: string,
    method: string,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    this.#trackGlobalRequest();

    if (this.#isInvalidStatus(statusCode)) {
      this.#trackInvalidRequest();
    }

    if (EXEMPT_ROUTES.has(path)) {
      return;
    }

    const routeKey = this.getRouteKey(method, path);

    if (statusCode === 429) {
      this.#handleRateLimitExceeded(path, method, headers);
      return;
    }

    const bucketHash = headers[HEADERS.bucket];
    if (!bucketHash) {
      return;
    }

    this.#updateBucket(bucketHash, headers, routeKey, path);
  }

  destroy(): void {
    clearInterval(this.#cleanupInterval);
    this.#buckets.clear();
    this.#routeBuckets.clear();
    this.#globalRequestTimes.length = 0;
  }

  #isInvalidStatus(statusCode: number): boolean {
    return statusCode === 401 || statusCode === 403 || statusCode === 429;
  }

  #trackInvalidRequest(): void {
    const now = Date.now();
    if (
      now - this.#invalidRequests.windowStart >=
      GLOBAL_LIMIT.INVALID_REQUESTS_WINDOW
    ) {
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      this.#invalidRequests.count++;
    }
  }

  #checkInvalidRequestLimit(): void {
    const now = Date.now();
    if (
      now - this.#invalidRequests.windowStart <
        GLOBAL_LIMIT.INVALID_REQUESTS_WINDOW &&
      this.#invalidRequests.count >= GLOBAL_LIMIT.INVALID_REQUESTS_LIMIT
    ) {
      throw new RateLimitError({
        method: "ANY",
        path: "ANY",
        retryAfter:
          (this.#invalidRequests.windowStart +
            GLOBAL_LIMIT.INVALID_REQUESTS_WINDOW -
            now) /
          1000,
        scope: "global",
        global: true,
        reason: "Cloudflare invalid requests limit exceeded",
      });
    }
  }

  #trackGlobalRequest(): void {
    const now = Date.now();
    this.#globalRequestTimes.push(now);

    while (
      this.#globalRequestTimes.length > 0 &&
      this.#globalRequestTimes[0] &&
      this.#globalRequestTimes[0] < now - 1000
    ) {
      this.#globalRequestTimes.shift();
    }
  }

  #checkGlobalRateLimit(): void {
    if (this.#globalRequestTimes.length >= GLOBAL_LIMIT.REQUESTS_PER_SECOND) {
      const oldestRequest = this.#globalRequestTimes[0];
      if (!oldestRequest) {
        return;
      }

      const now = Date.now();
      const waitTime = 1000 - (now - oldestRequest);

      if (waitTime > 0) {
        throw new RateLimitError({
          method: "ANY",
          path: "ANY",
          retryAfter: waitTime / 1000,
          scope: "global",
          global: true,
          reason: "Global rate limit exceeded",
        });
      }
    }
  }

  #isEmojiRoute(path: string): boolean {
    return EMOJI_REGEX.test(path);
  }

  #handleRateLimitExceeded(
    path: string,
    method: string,
    headers: Record<string, string>,
  ): void {
    const retryAfter = Number(headers[HEADERS.retryAfter]);
    const scope = (headers[HEADERS.scope] as RateLimitScope) ?? "user";
    const isGlobal = headers[HEADERS.global] === "true";

    this.#rest.emit("rateLimitExceeded", retryAfter, headers[HEADERS.bucket]);

    throw new RateLimitError({
      method,
      path,
      retryAfter,
      scope,
      global: isGlobal,
    });
  }

  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
  ): void {
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.limit]),
      remaining: Number(headers[HEADERS.remaining]),
      reset: Number(headers[HEADERS.reset]) * 1000,
      resetAfter: Number(headers[HEADERS.resetAfter]) * 1000,
      scope: (headers[HEADERS.scope] as RateLimitScope) ?? "user",
      isEmojiRoute: this.#isEmojiRoute(path),
    };

    this.#buckets.set(bucketHash, bucket);
    this.#routeBuckets.set(routeKey, bucketHash);

    this.#rest.emit(
      "bucketUpdated",
      bucketHash,
      bucket.remaining,
      bucket.resetAfter,
    );
  }

  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: string,
  ): void {
    const now = Date.now();

    if (bucket.remaining <= 0 && bucket.reset > now) {
      throw new RateLimitError({
        method,
        path,
        retryAfter: bucket.reset - now,
        scope: bucket.scope,
        bucketHash: bucket.hash,
      });
    }

    if (
      bucket.remaining === 1 &&
      bucket.reset - now < this.#options.safetyMargin
    ) {
      throw new RateLimitError({
        method,
        path,
        retryAfter: this.#options.safetyMargin,
        scope: bucket.scope,
        bucketHash: bucket.hash,
      });
    }
  }

  // Gestion spéciale pour les routes d'emoji avec un rate limit plus strict
  #checkEmojiBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: string,
  ): void {
    const now = Date.now();

    // Pour les emojis, on est plus conservateur avec les limites
    if (bucket.remaining <= 1 && bucket.reset > now) {
      throw new RateLimitError({
        method,
        path,
        retryAfter: bucket.reset - now,
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Emoji rate limit",
      });
    }
  }

  #cleanupExpiredBuckets(): void {
    const now = Date.now();

    // Nettoyage des buckets expirés
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);
        this.#rest.emit("bucketExpired", hash);
      }
    }

    // Nettoyage des routes orphelines
    for (const [route, hash] of this.#routeBuckets.entries()) {
      if (!this.#buckets.has(hash)) {
        this.#routeBuckets.delete(route);
      }
    }
  }
}
