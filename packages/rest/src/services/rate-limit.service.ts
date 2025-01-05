import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import { RateLimitConstants } from "../constants/index.js";
import type {
  BucketInfo,
  EmojiRateLimit,
  GlobalRateLimit,
  RateLimitScope,
  RestEvents,
} from "../types/index.js";
import { BucketService } from "./bucket.service.js";

export class RateLimitService extends EventEmitter<RestEvents> {
  readonly #bucketService = new BucketService();
  readonly #emojiLimits = new Store<string, EmojiRateLimit>();

  #global: GlobalRateLimit = {
    remaining: RateLimitConstants.global.requestsPerSeconds,
    reset: null,
    lastReset: Date.now(),
  };

  #invalidRequests = {
    count: 0,
    lastReset: Date.now(),
    windowSize: RateLimitConstants.invalidRequest.windowSize,
    maxRequests: RateLimitConstants.invalidRequest.maxRequests,
  };

  async checkRateLimit(path: string, method: string): Promise<void> {
    this.#checkInvalidRequestLimit();

    if (!this.#isExcludedRoute(path)) {
      await this.#checkGlobalRateLimit();
    }

    if (this.#isEmojiRoute(path)) {
      const guildId = this.#extractGuildId(path);
      if (guildId) {
        await this.#checkEmojiRateLimit(guildId);
      }
    }

    const routeKey = this.#generateRouteKey(path, method);
    const bucket = this.#bucketService.getBucketByRoute(routeKey);

    if (bucket && bucket.remaining <= 0) {
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
        await setTimeout(delay);
      }

      bucket.remaining = bucket.limit;
      this.#bucketService.setBucket(bucket.hash, bucket);
    }

    if (!this.#isExcludedRoute(path)) {
      this.#global.remaining--;
    }
  }

  processHeaders(
    path: string,
    method: string,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    const h = RateLimitConstants.headers;

    if (this.#isErrorStatus(statusCode)) {
      this.#invalidRequests.count++;

      if (statusCode === 429) {
        if (headers[h.global]) {
          const retryAfter = Number(headers[h.retryAfter]) * 1000;
          if (Number.isNaN(retryAfter)) {
            throw new Error("Invalid retry_after value in headers");
          }

          this.#global.reset = Date.now() + retryAfter;
          this.emit(
            "globalRateLimit",
            this.#global.remaining,
            this.#global.reset,
            RateLimitConstants.global.requestsPerSeconds,
          );
          return;
        }

        if (this.#isEmojiRoute(path)) {
          const guildId = this.#extractGuildId(path);
          if (guildId) {
            const retryAfter = Number(headers[h.retryAfter]) * 1000;
            if (Number.isNaN(retryAfter)) {
              throw new Error(
                "Invalid retry_after value in headers for emoji route",
              );
            }

            this.#emojiLimits.set(guildId, {
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

    const routeKey = this.#generateRouteKey(path, method);
    if (!routeKey) {
      throw new Error("Failed to generate route key");
    }

    this.#bucketService.mapRouteToBucket(routeKey, bucketHash);

    const limit = Number(headers[h.limit]);
    const remaining = Number(headers[h.remaining]);
    const reset = Number(headers[h.reset]);
    const resetAfter = Number(headers[h.resetAfter]);

    if (
      [limit, remaining, reset, resetAfter].some((val) => Number.isNaN(val))
    ) {
      throw new Error("Invalid rate limit values in headers");
    }

    const bucketInfo: BucketInfo = {
      hash: bucketHash,
      limit: limit || 0,
      remaining: remaining || 0,
      reset: reset || 0,
      resetAfter: resetAfter || 0,
      scope: (headers[h.scope] as RateLimitScope) || "user",
      isEmoji: this.#isEmojiRoute(path),
      guildId: this.#isEmojiRoute(path)
        ? this.#extractGuildId(path)
        : undefined,
    };

    this.#bucketService.setBucket(bucketHash, bucketInfo);
  }

  destroy(): void {
    this.#bucketService.clear();
    this.#emojiLimits.clear();
    this.#global = {
      remaining: RateLimitConstants.global.requestsPerSeconds,
      reset: null,
      lastReset: Date.now(),
    };
    this.#invalidRequests = {
      count: 0,
      lastReset: Date.now(),
      windowSize: RateLimitConstants.invalidRequest.windowSize,
      maxRequests: RateLimitConstants.invalidRequest.maxRequests,
    };
    this.removeAllListeners();
  }

  #generateRouteKey(path: string, method: string): string {
    for (const pattern of RateLimitConstants.sharedRoutes) {
      if (pattern.test(path)) {
        return `shared:${path}`;
      }
    }

    let routeKey = path;
    for (const { regex, param } of RateLimitConstants.majorParameters) {
      const match = path.match(regex);
      if (match) {
        routeKey = path.replace(String(match[1]), `{${param}}`);
        break;
      }
    }

    return `${method}:${routeKey}`;
  }

  async #checkGlobalRateLimit(): Promise<void> {
    const now = Date.now();

    if (this.#global.reset && now < this.#global.reset) {
      const delay = this.#global.reset - now;
      await setTimeout(delay);
      this.#resetGlobalLimit();
      return;
    }

    if (
      now - this.#global.lastReset >=
      RateLimitConstants.global.resetInterval
    ) {
      this.#resetGlobalLimit();
    }

    if (this.#global.remaining <= 0) {
      const delay = Math.max(
        0,
        RateLimitConstants.global.resetInterval -
          (now - this.#global.lastReset),
      );
      await setTimeout(delay);
      this.#resetGlobalLimit();
    }
  }

  #resetGlobalLimit(): void {
    this.#global = {
      remaining: RateLimitConstants.global.requestsPerSeconds,
      reset: null,
      lastReset: Date.now(),
    };
  }

  async #checkEmojiRateLimit(guildId: string): Promise<void> {
    const limit = this.#emojiLimits.get(guildId);
    const now = Date.now();

    if (!limit) {
      this.#emojiLimits.set(guildId, {
        remaining: RateLimitConstants.emoji.maxRequests - 1,
        reset: now + RateLimitConstants.emoji.resetInterval,
      });
      return;
    }

    if (now >= limit.reset) {
      this.#emojiLimits.set(guildId, {
        remaining: RateLimitConstants.emoji.maxRequests - 1,
        reset: now + RateLimitConstants.emoji.resetInterval,
      });
      return;
    }

    if (limit.remaining <= 0) {
      const delay = limit.reset - now;
      await setTimeout(delay);
      this.#emojiLimits.set(guildId, {
        remaining: RateLimitConstants.emoji.maxRequests - 1,
        reset: now + RateLimitConstants.emoji.resetInterval,
      });
    } else {
      limit.remaining--;
      this.#emojiLimits.set(guildId, limit);
    }
  }

  #checkInvalidRequestLimit(): void {
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

  #isEmojiRoute(path: string): boolean {
    return path.includes("/emojis");
  }

  #isExcludedRoute(path: string): boolean {
    return path.includes("/interactions");
  }

  #isErrorStatus(statusCode: number): boolean {
    return statusCode >= 400;
  }

  #extractGuildId(path: string): string | undefined {
    const match = path.match(/\/guilds\/(\d+)/);
    return match?.[1];
  }
}
