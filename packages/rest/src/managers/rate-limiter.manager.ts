import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import type { RestEvents } from "../types/index.js";

type RateLimitScope = "user" | "global" | "shared";

interface BucketInfo {
  hash: string;
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  scope: RateLimitScope;
  isEmoji: boolean;
  guildId?: string;
}

interface MajorParameter {
  regex: RegExp;
  param: string;
}

interface InvalidRequestTracker {
  count: number;
  lastReset: number;
  windowSize: number;
  maxRequests: number;
}

interface EmojiRateLimit {
  remaining: number;
  reset: number;
}

export class RateLimitManager extends EventEmitter<RestEvents> {
  static readonly GLOBAL_LIMIT = 50;
  static readonly INVALID_LIMIT = 10_000;
  static readonly INVALID_WINDOW = 600_000;
  static readonly EMOJI_RATE_LIMIT = 30;
  static readonly EMOJI_RATE_RESET = 60_000;

  static readonly HEADERS = {
    bucket: "x-ratelimit-bucket",
    limit: "x-ratelimit-limit",
    remaining: "x-ratelimit-remaining",
    reset: "x-ratelimit-reset",
    resetAfter: "x-ratelimit-reset-after",
    global: "x-ratelimit-global",
    scope: "x-ratelimit-scope",
    retryAfter: "retry-after",
  } as const;

  readonly #buckets = new Store<string, BucketInfo>();
  readonly #routeToBucket = new Store<string, string>();
  readonly #emojiGuildLimits = new Store<string, EmojiRateLimit>();

  #globalReset: number | null = null;
  #globalRemaining = RateLimitManager.GLOBAL_LIMIT;
  #lastGlobalReset = Date.now();

  readonly #invalidRequests: InvalidRequestTracker = {
    count: 0,
    lastReset: Date.now(),
    windowSize: RateLimitManager.INVALID_WINDOW,
    maxRequests: RateLimitManager.INVALID_LIMIT,
  };

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

    if (this.#isEmojiRoute(path)) {
      const guildId = this.#extractGuildId(path);
      if (guildId) {
        await this.#checkEmojiRateLimit(guildId);
      }
    }

    const routeKey = this.#getRouteKey(path, method);
    const bucketHash = this.#routeToBucket.get(routeKey);

    if (bucketHash) {
      const bucket = this.#buckets.get(bucketHash);
      if (bucket) {
        if (bucket.remaining <= 0) {
          const now = Date.now();
          const delay = Math.max(0, bucket.reset * 1000 - now);

          if (delay > 0) {
            this.emit(
              "rateLimit",
              path,
              method,
              delay,
              bucket.limit,
              bucket.remaining,
            );
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

      if (statusCode === 429) {
        if (headers[h.global]) {
          const retryAfter = Number(headers[h.retryAfter]) * 1000;
          this.#globalReset = Date.now() + retryAfter;

          this.emit(
            "globalRateLimitUpdate",
            this.#globalRemaining,
            this.#globalReset,
            RateLimitManager.GLOBAL_LIMIT,
          );

          return;
        }

        if (this.#isEmojiRoute(path)) {
          const guildId = this.#extractGuildId(path);
          if (guildId) {
            const retryAfter = Number(headers[h.retryAfter]) * 1000;
            this.#emojiGuildLimits.set(guildId, {
              remaining: 0,
              reset: Date.now() + retryAfter,
            });
          }
        }
      }
    }

    const bucketHash = headers[h.bucket];
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#getRouteKey(path, method);
    this.#routeToBucket.set(routeKey, bucketHash);

    this.#buckets.set(bucketHash, {
      hash: bucketHash,
      limit: Number(headers[h.limit]) || 0,
      remaining: Number(headers[h.remaining]) || 0,
      reset: Number(headers[h.reset]) || 0,
      resetAfter: Number(headers[h.resetAfter]) || 0,
      scope: (headers[h.scope] as RateLimitScope) || "user",
      isEmoji: this.#isEmojiRoute(path),
      guildId: this.#isEmojiRoute(path)
        ? this.#extractGuildId(path)
        : undefined,
    });
  }

  destroy(): void {
    this.#buckets.clear();
    this.#routeToBucket.clear();
    this.#globalReset = null;
    this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
    this.#invalidRequests.count = 0;
    this.#invalidRequests.lastReset = Date.now();
    this.#emojiGuildLimits.clear();
    this.removeAllListeners();
  }

  #isEmojiRoute(path: string): boolean {
    return path.includes("/emojis");
  }

  #extractGuildId(path: string): string | undefined {
    const match = path.match(/\/guilds\/(\d+)/);
    return match?.[1];
  }

  async #checkEmojiRateLimit(guildId: string): Promise<void> {
    const limit = this.#emojiGuildLimits.get(guildId);

    if (!limit) {
      this.#emojiGuildLimits.set(guildId, {
        remaining: RateLimitManager.EMOJI_RATE_LIMIT - 1,
        reset: Date.now() + RateLimitManager.EMOJI_RATE_RESET,
      });
      return;
    }

    if (Date.now() >= limit.reset) {
      this.#emojiGuildLimits.set(guildId, {
        remaining: RateLimitManager.EMOJI_RATE_LIMIT - 1,
        reset: Date.now() + RateLimitManager.EMOJI_RATE_RESET,
      });
      return;
    }

    if (limit.remaining <= 0) {
      const delay = limit.reset - Date.now();
      await this.#wait(delay);
      this.#emojiGuildLimits.set(guildId, {
        remaining: RateLimitManager.EMOJI_RATE_LIMIT - 1,
        reset: Date.now() + RateLimitManager.EMOJI_RATE_RESET,
      });
    } else {
      limit.remaining--;
      this.#emojiGuildLimits.set(guildId, limit);
    }
  }

  async #checkGlobalRateLimit(): Promise<void> {
    const now = Date.now();

    if (this.#globalReset && now < this.#globalReset) {
      const delay = this.#globalReset - now;
      await this.#wait(delay);
      this.#globalReset = null;
      this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
      return;
    }

    if (now - this.#lastGlobalReset >= 1000) {
      this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
      this.#lastGlobalReset = now;
    }

    if (this.#globalRemaining <= 0) {
      const delay = Math.max(0, 1000 - (now - this.#lastGlobalReset));
      await this.#wait(delay);
      this.#globalRemaining = RateLimitManager.GLOBAL_LIMIT;
    }
  }

  #checkInvalidLimit(): void {
    const now = Date.now();

    if (
      now - this.#invalidRequests.lastReset >=
      this.#invalidRequests.windowSize
    ) {
      this.#invalidRequests.count = 0;
      this.#invalidRequests.lastReset = now;
      return;
    }

    if (this.#invalidRequests.count >= this.#invalidRequests.maxRequests) {
      throw new Error(
        `Invalid request limit exceeded (${this.#invalidRequests.maxRequests} per ${
          this.#invalidRequests.windowSize / 60000
        } minutes)`,
      );
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

  #isExcludedRoute(path: string): boolean {
    return path.includes("/interactions");
  }

  #isErrorStatusCode(statusCode: number): boolean {
    return statusCode === 401 || statusCode === 403 || statusCode === 429;
  }

  #incrementInvalidCount(): void {
    this.#invalidRequests.count++;
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
