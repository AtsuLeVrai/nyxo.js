import { EventEmitter } from "eventemitter3";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Rest } from "../src/core/rest.js";
import {
  RATE_LIMIT_CONSTANTS,
  type RateLimitBucket,
  RateLimitManager,
  RateLimitOptions,
} from "../src/managers/rate-limit.manager.js";
import type { RestEvents } from "../src/types/index.js";

class MockRest extends EventEmitter<RestEvents> {
  override emit<K extends keyof RestEvents>(
    event: K,
    ...args: RestEvents[K]
  ): boolean {
    // biome-ignore lint/suspicious/noExplicitAny: This is a mock class for testing purposes.
    return super.emit(event as any, ...(args as any));
  }
}

describe("RateLimitManager", () => {
  let mockRest: MockRest;
  let rateLimitManager: RateLimitManager;
  let defaultOptions: ReturnType<typeof RateLimitOptions.parse>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRest = new MockRest();
    defaultOptions = RateLimitOptions.parse({});
    rateLimitManager = new RateLimitManager(mockRest as Rest, defaultOptions);
  });

  afterEach(() => {
    rateLimitManager.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("RATE_LIMIT_CONSTANTS", () => {
    test("should have correct emoji route pattern", () => {
      expect(
        RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test(
          "/guilds/123456789/emojis",
        ),
      ).toBe(true);
      expect(
        RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test(
          "/guilds/123456789/emojis/456",
        ),
      ).toBe(true);
      expect(
        RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test("/channels/123/messages"),
      ).toBe(false);
      expect(
        RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test("/guilds/abc/emojis"),
      ).toBe(false);
    });

    test("should have correct global exempt routes", () => {
      expect(RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES).toContain(
        "/interactions",
      );
      expect(RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES).toContain("/webhooks");
      expect(RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES).toHaveLength(2);
    });

    test("should have correct invalid status codes", () => {
      expect(RATE_LIMIT_CONSTANTS.INVALID_STATUSES).toContain(401);
      expect(RATE_LIMIT_CONSTANTS.INVALID_STATUSES).toContain(403);
      expect(RATE_LIMIT_CONSTANTS.INVALID_STATUSES).toContain(429);
      expect(RATE_LIMIT_CONSTANTS.INVALID_STATUSES).toHaveLength(3);
    });

    test("should have all required header constants", () => {
      const headers = RATE_LIMIT_CONSTANTS.HEADERS;
      expect(headers.LIMIT).toBe("x-ratelimit-limit");
      expect(headers.REMAINING).toBe("x-ratelimit-remaining");
      expect(headers.RESET).toBe("x-ratelimit-reset");
      expect(headers.RESET_AFTER).toBe("x-ratelimit-reset-after");
      expect(headers.BUCKET).toBe("x-ratelimit-bucket");
      expect(headers.SCOPE).toBe("x-ratelimit-scope");
      expect(headers.GLOBAL).toBe("x-ratelimit-global");
      expect(headers.RETRY_AFTER).toBe("retry-after");
    });
  });

  describe("RateLimitOptions schema", () => {
    test("should parse valid options with defaults", () => {
      const options = RateLimitOptions.parse({});
      expect(options.safetyMargin).toBe(100);
      expect(options.maxInvalidRequests).toBe(10000);
      expect(options.maxGlobalRequestsPerSecond).toBe(50);
      expect(options.cleanupInterval).toBe(300000);
    });

    test("should parse custom options", () => {
      const options = RateLimitOptions.parse({
        safetyMargin: 200,
        maxInvalidRequests: 5000,
        maxGlobalRequestsPerSecond: 30,
        cleanupInterval: 60000,
      });
      expect(options.safetyMargin).toBe(200);
      expect(options.maxInvalidRequests).toBe(5000);
      expect(options.maxGlobalRequestsPerSecond).toBe(30);
      expect(options.cleanupInterval).toBe(60000);
    });

    test("should reject invalid options", () => {
      expect(() => RateLimitOptions.parse({ safetyMargin: -1 })).toThrow();
      expect(() => RateLimitOptions.parse({ maxInvalidRequests: 0 })).toThrow();
      expect(() =>
        RateLimitOptions.parse({ maxInvalidRequests: 20000 }),
      ).toThrow();
      expect(() =>
        RateLimitOptions.parse({ maxGlobalRequestsPerSecond: 0 }),
      ).toThrow();
      expect(() => RateLimitOptions.parse({ cleanupInterval: -1 })).toThrow();
    });
  });

  describe("BucketStore", () => {
    test("should store and retrieve buckets", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-1",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      expect(rateLimitManager.buckets.get("bucket-1")).toEqual(bucket);
      expect(rateLimitManager.buckets.has("bucket-1")).toBe(true);
      expect(rateLimitManager.buckets.size).toBe(1);
    });

    test("should return undefined for non-existent buckets", () => {
      expect(rateLimitManager.buckets.get("non-existent")).toBeUndefined();
      expect(rateLimitManager.buckets.has("non-existent")).toBe(false);
    });

    test("should delete buckets", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-1",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      expect(rateLimitManager.buckets.delete("bucket-1")).toBe(true);
      expect(rateLimitManager.buckets.has("bucket-1")).toBe(false);
      expect(rateLimitManager.buckets.delete("bucket-1")).toBe(false);
    });

    test("should clear all buckets", () => {
      const bucket1: RateLimitBucket = {
        requestId: "req-1",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      const bucket2: RateLimitBucket = {
        requestId: "req-2",
        hash: "bucket-2",
        limit: 20,
        remaining: 15,
        reset: Date.now() + 120000,
        resetAfter: 120000,
        scope: "global",
      };

      rateLimitManager.buckets.set("bucket-1", bucket1);
      rateLimitManager.buckets.set("bucket-2", bucket2);
      expect(rateLimitManager.buckets.size).toBe(2);

      rateLimitManager.buckets.clear();
      expect(rateLimitManager.buckets.size).toBe(0);
    });

    test("should handle expired buckets", () => {
      const expiredBucket: RateLimitBucket = {
        requestId: "req-1",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() - 1000,
        resetAfter: -1000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", expiredBucket);
      expect(rateLimitManager.buckets.get("bucket-1")).toBeUndefined();
      expect(rateLimitManager.buckets.has("bucket-1")).toBe(false);
    });

    test("should auto-cleanup expired buckets with timeout", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-1",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 1000,
        resetAfter: 1000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      expect(rateLimitManager.buckets.has("bucket-1")).toBe(true);

      vi.advanceTimersByTime(62000);
      expect(rateLimitManager.buckets.has("bucket-1")).toBe(false);
    });
  });

  describe("getRouteKey", () => {
    test("should generate standard route keys", () => {
      expect(rateLimitManager.getRouteKey("GET", "/channels/123")).toBe(
        "GET:/channels/123",
      );
      expect(rateLimitManager.getRouteKey("POST", "/guilds/456/members")).toBe(
        "POST:/guilds/456/members",
      );
      expect(rateLimitManager.getRouteKey("DELETE", "/users/@me")).toBe(
        "DELETE:/users/@me",
      );
    });

    test("should generate special emoji route keys", () => {
      expect(
        rateLimitManager.getRouteKey("GET", "/guilds/123456789/emojis"),
      ).toBe("emoji:123456789:GET");
      expect(
        rateLimitManager.getRouteKey("POST", "/guilds/987654321/emojis"),
      ).toBe("emoji:987654321:POST");
      expect(
        rateLimitManager.getRouteKey("DELETE", "/guilds/111222333/emojis/444"),
      ).toBe("emoji:111222333:DELETE");
    });

    test("should not treat non-emoji routes as emoji routes", () => {
      expect(rateLimitManager.getRouteKey("GET", "/channels/123/emojis")).toBe(
        "GET:/channels/123/emojis",
      );
      expect(rateLimitManager.getRouteKey("POST", "/emojis")).toBe(
        "POST:/emojis",
      );
    });
  });

  describe("checkRateLimit", () => {
    test("should allow requests when no rate limits exist", () => {
      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
      expect(result.limitType).toBeUndefined();
    });

    test("should exempt global rate limit for interaction routes", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 60,
        windowStartTime: Date.now(),
      };

      const result = rateLimitManager.checkRateLimit(
        "/interactions/123/callback",
        "POST",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });

    test("should exempt global rate limit for webhook routes", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 60,
        windowStartTime: Date.now(),
      };

      const result = rateLimitManager.checkRateLimit(
        "/webhooks/123/456",
        "POST",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });

    test("should block when global rate limit exceeded", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 60,
        windowStartTime: Date.now(),
      };

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("global");
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test("should block when invalid request limit exceeded", () => {
      (rateLimitManager as any)["#invalidRequests"] = {
        count: 15000,
        windowStart: Date.now(),
      };

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("cloudflare");
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test("should allow requests when bucket has remaining capacity", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "bucket-1",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "bucket-1");

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });

    test("should block when bucket is exhausted", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "bucket-1",
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "bucket-1");

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("bucket");
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.bucketHash).toBe("bucket-1");
    });

    test("should handle emoji routes with special rate limiting", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "emoji-bucket",
        limit: 10,
        remaining: 1,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
        isEmojiRoute: true,
      };

      rateLimitManager.buckets.set("emoji-bucket", bucket);
      rateLimitManager.routeBuckets.set("emoji:123456789:GET", "emoji-bucket");

      const result = rateLimitManager.checkRateLimit(
        "/guilds/123456789/emojis",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("emoji");
    });

    test("should reset global rate tracker after time window", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 60,
        windowStartTime: Date.now() - 2000,
      };

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
      expect((rateLimitManager as any)["#globalRateTracker"].requestCount).toBe(
        1,
      );
    });

    test("should reset invalid request tracker after time window", () => {
      (rateLimitManager as any)["#invalidRequests"] = {
        count: 15000,
        windowStart: Date.now() - 700000,
      };

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(1);
    });
  });

  describe("checkAndWaitIfNeeded", () => {
    test("should proceed immediately when no rate limits", async () => {
      const start = Date.now();
      const result = await rateLimitManager.checkAndWaitIfNeeded(
        "/channels/123",
        "GET",
        "req-1",
      );
      const elapsed = Date.now() - start;

      expect(result.canProceed).toBe(true);
      expect(elapsed).toBeLessThan(10);
    });

    test("should wait when rate limited", async () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "bucket-1",
        limit: 10,
        remaining: 0,
        reset: Date.now() + 1000,
        resetAfter: 1000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "bucket-1");

      const promise = rateLimitManager.checkAndWaitIfNeeded(
        "/channels/123",
        "GET",
        "req-1",
      );

      vi.advanceTimersByTime(1100);
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result.canProceed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test("should handle zero or negative retry after values", async () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "bucket-1",
        limit: 10,
        remaining: 0,
        reset: Date.now() - 1000,
        resetAfter: -1000,
        scope: "user",
      };

      rateLimitManager.buckets.set("bucket-1", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "bucket-1");

      const result = await rateLimitManager.checkAndWaitIfNeeded(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
    });
  });

  describe("updateRateLimit", () => {
    test("should update global request count on success", () => {
      const headers = {
        "x-ratelimit-limit": "10",
        "x-ratelimit-remaining": "9",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
        "x-ratelimit-bucket": "bucket-1",
      };

      const initialCount = (rateLimitManager as any)["#globalRateTracker"]
        .requestCount;
      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        200,
        "req-1",
      );
      expect((rateLimitManager as any)["#globalRateTracker"].requestCount).toBe(
        initialCount + 1,
      );
    });

    test("should track invalid requests on error status codes", () => {
      const initialCount = (rateLimitManager as any)["#invalidRequests"].count;

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        401,
        "req-1",
      );
      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(
        initialCount + 1,
      );

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        403,
        "req-2",
      );
      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(
        initialCount + 2,
      );

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        429,
        "req-3",
      );
      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(
        initialCount + 3,
      );
    });

    test("should not track valid status codes as invalid", () => {
      const initialCount = (rateLimitManager as any)["#invalidRequests"].count;

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        200,
        "req-1",
      );
      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        201,
        "req-2",
      );
      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        204,
        "req-3",
      );
      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        404,
        "req-4",
      );

      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(
        initialCount,
      );
    });

    test("should create and store new bucket from headers", () => {
      const resetTime = Date.now() + 60000;
      const headers = {
        "x-ratelimit-limit": "10",
        "x-ratelimit-remaining": "9",
        "x-ratelimit-reset": String(resetTime / 1000),
        "x-ratelimit-reset-after": "60",
        "x-ratelimit-bucket": "new-bucket",
        "x-ratelimit-scope": "user",
      };

      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        200,
        "req-1",
      );

      expect(result.canProceed).toBe(true);
      expect(rateLimitManager.buckets.has("new-bucket")).toBe(true);
      expect(rateLimitManager.routeBuckets.get("GET:/channels/123")).toBe(
        "new-bucket",
      );

      const bucket = rateLimitManager.buckets.get("new-bucket");
      expect(bucket).toBeDefined();
      if (bucket) {
        expect(bucket.limit).toBe(10);
        expect(bucket.remaining).toBe(9);
        expect(bucket.scope).toBe("user");
      }
    });

    test("should update existing bucket", () => {
      const existingBucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "existing-bucket",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("existing-bucket", existingBucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "existing-bucket");

      const headers = {
        "x-ratelimit-limit": "10",
        "x-ratelimit-remaining": "4",
        "x-ratelimit-reset": String((Date.now() + 55000) / 1000),
        "x-ratelimit-bucket": "existing-bucket",
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        200,
        "req-1",
      );

      const updatedBucket = rateLimitManager.buckets.get("existing-bucket");
      expect(updatedBucket).toBeDefined();
      if (updatedBucket) {
        expect(updatedBucket.remaining).toBe(4);
        expect(updatedBucket.requestId).toBe("req-1");
      }
    });

    test("should handle 429 response with retry-after", () => {
      const headers = {
        "retry-after": "30",
        "x-ratelimit-global": "true",
      };

      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );

      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("global");
      expect(result.retryAfter).toBe(30000);
    });

    test("should handle 429 response with x-ratelimit-reset-after", () => {
      const headers = {
        "x-ratelimit-reset-after": "45",
        "x-ratelimit-bucket": "bucket-429",
      };

      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );

      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("bucket");
      expect(result.retryAfter).toBe(45000);
      expect(result.bucketHash).toBe("bucket-429");
    });

    test("should emit rate limit hit event on 429", () => {
      const eventSpy = vi.spyOn(mockRest, "emit");

      const headers = {
        "retry-after": "30",
        "x-ratelimit-global": "true",
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );

      expect(eventSpy).toHaveBeenCalledWith(
        "rateLimitHit",
        expect.objectContaining({
          requestId: "req-1",
          bucketId: "global",
          resetAfter: 30000,
          global: true,
          route: "/channels/123",
          method: "GET",
        }),
      );
    });

    test("should handle emoji routes correctly", () => {
      const headers = {
        "x-ratelimit-limit": "5",
        "x-ratelimit-remaining": "4",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
        "x-ratelimit-bucket": "emoji-bucket",
      };

      rateLimitManager.updateRateLimit(
        "/guilds/123456789/emojis",
        "GET",
        headers,
        200,
        "req-1",
      );

      const bucket = rateLimitManager.buckets.get("emoji-bucket");
      expect(bucket).toBeDefined();
      if (bucket) {
        expect(bucket.isEmojiRoute).toBe(true);
      }
      expect(rateLimitManager.routeBuckets.get("emoji:123456789:GET")).toBe(
        "emoji-bucket",
      );
    });

    test("should handle missing rate limit headers gracefully", () => {
      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        200,
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });

    test("should handle malformed header values", () => {
      const headers = {
        "x-ratelimit-limit": "invalid",
        "x-ratelimit-remaining": "also-invalid",
        "x-ratelimit-reset": "not-a-number",
        "x-ratelimit-bucket": "valid-bucket",
      };

      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        200,
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });
  });

  describe("updateRateLimitAndWaitIfNeeded", () => {
    test("should update and proceed immediately on success", async () => {
      const headers = {
        "x-ratelimit-limit": "10",
        "x-ratelimit-remaining": "9",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
        "x-ratelimit-bucket": "bucket-1",
      };

      const result = await rateLimitManager.updateRateLimitAndWaitIfNeeded(
        "/channels/123",
        "GET",
        headers,
        200,
        "req-1",
      );

      expect(result.canProceed).toBe(true);
    });

    test("should update and wait on 429 response", async () => {
      const headers = {
        "retry-after": "1",
        "x-ratelimit-bucket": "bucket-429",
      };

      const promise = rateLimitManager.updateRateLimitAndWaitIfNeeded(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );

      vi.advanceTimersByTime(1100);
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result.canProceed).toBe(false);
      expect(result.retryAfter).toBe(1000);
    });

    test("should not wait for zero or negative retry after", async () => {
      const headers = {
        "retry-after": "0",
        "x-ratelimit-bucket": "bucket-429",
      };

      const result = await rateLimitManager.updateRateLimitAndWaitIfNeeded(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );

      expect(result.canProceed).toBe(false);
    });
  });

  describe("edge cases and error scenarios", () => {
    test("should handle bucket expiration during operation", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "expiring-bucket",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 100,
        resetAfter: 100,
        scope: "user",
      };

      rateLimitManager.buckets.set("expiring-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "expiring-bucket");

      vi.advanceTimersByTime(200);

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(true);
    });

    test("should handle concurrent access safely", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "concurrent-bucket",
        limit: 2,
        remaining: 1,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("concurrent-bucket", bucket);
      rateLimitManager.routeBuckets.set(
        "GET:/channels/123",
        "concurrent-bucket",
      );

      const result1 = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      const result2 = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-2",
      );

      expect(result1.canProceed).toBe(true);
      expect(result2.canProceed).toBe(false);
    });

    test("should handle very long retry after values", () => {
      const headers = {
        "retry-after": "3600",
        "x-ratelimit-bucket": "long-bucket",
      };

      const result = rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-1",
      );
      expect(result.retryAfter).toBe(3600000);
    });

    test("should handle bucket hash changes for same route", () => {
      const headers1 = {
        "x-ratelimit-bucket": "bucket-1",
        "x-ratelimit-limit": "10",
        "x-ratelimit-remaining": "9",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
      };

      const headers2 = {
        "x-ratelimit-bucket": "bucket-2",
        "x-ratelimit-limit": "15",
        "x-ratelimit-remaining": "14",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers1,
        200,
        "req-1",
      );
      expect(rateLimitManager.routeBuckets.get("GET:/channels/123")).toBe(
        "bucket-1",
      );

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers2,
        200,
        "req-2",
      );
      expect(rateLimitManager.routeBuckets.get("GET:/channels/123")).toBe(
        "bucket-2",
      );
    });

    test("should handle safety margin calculations correctly", () => {
      const customOptions = RateLimitOptions.parse({ safetyMargin: 500 });
      const customManager = new RateLimitManager(
        mockRest as Rest,
        customOptions,
      );

      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "safety-bucket",
        limit: 10,
        remaining: 1,
        reset: Date.now() + 400,
        resetAfter: 400,
        scope: "user",
      };

      customManager.buckets.set("safety-bucket", bucket);
      customManager.routeBuckets.set("GET:/channels/123", "safety-bucket");

      const result = customManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("bucket");

      customManager.destroy();
    });

    test("should handle global rate tracking window transitions", () => {
      const now = Date.now();
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 30,
        windowStartTime: now - 1500,
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        200,
        "req-1",
      );
      expect((rateLimitManager as any)["#globalRateTracker"].requestCount).toBe(
        1,
      );
      expect(
        (rateLimitManager as any)["#globalRateTracker"].windowStartTime,
      ).toBeGreaterThanOrEqual(now);
    });

    test("should handle invalid request tracking window transitions", () => {
      const now = Date.now();
      (rateLimitManager as any)["#invalidRequests"] = {
        count: 5000,
        windowStart: now - 700000,
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        {},
        401,
        "req-1",
      );
      expect((rateLimitManager as any)["#invalidRequests"].count).toBe(1);
      expect(
        (rateLimitManager as any)["#invalidRequests"].windowStart,
      ).toBeGreaterThanOrEqual(now);
    });
  });

  describe("destroy and cleanup", () => {
    test("should clear all data on destroy", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "test-bucket",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("test-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/test", "test-bucket");

      expect(rateLimitManager.buckets.size).toBe(1);
      expect(rateLimitManager.routeBuckets.size).toBe(1);

      rateLimitManager.destroy();

      expect(rateLimitManager.buckets.size).toBe(0);
      expect(rateLimitManager.routeBuckets.size).toBe(0);
    });

    test("should handle multiple destroy calls gracefully", () => {
      expect(() => {
        rateLimitManager.destroy();
        rateLimitManager.destroy();
        rateLimitManager.destroy();
      }).not.toThrow();
    });

    test("should cleanup expired route mappings periodically", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "cleanup-bucket",
        limit: 10,
        remaining: 5,
        reset: Date.now() + 1000,
        resetAfter: 1000,
        scope: "user",
      };

      rateLimitManager.buckets.set("cleanup-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/cleanup", "cleanup-bucket");

      expect(rateLimitManager.routeBuckets.size).toBe(1);

      vi.advanceTimersByTime(62000);

      expect(rateLimitManager.buckets.size).toBe(0);

      vi.advanceTimersByTime(300000);

      expect(rateLimitManager.routeBuckets.size).toBe(0);
    });
  });

  describe("performance and memory management", () => {
    test("should handle large numbers of buckets efficiently", () => {
      const bucketCount = 1000;
      const baseTime = Date.now();

      for (let i = 0; i < bucketCount; i++) {
        const bucket: RateLimitBucket = {
          requestId: `req-${i}`,
          hash: `bucket-${i}`,
          limit: 10,
          remaining: Math.floor(Math.random() * 10),
          reset: baseTime + i * 1000,
          resetAfter: i * 1000,
          scope: "user",
        };

        rateLimitManager.buckets.set(`bucket-${i}`, bucket);
        rateLimitManager.routeBuckets.set(`GET:/route-${i}`, `bucket-${i}`);
      }

      expect(rateLimitManager.buckets.size).toBe(bucketCount);
      expect(rateLimitManager.routeBuckets.size).toBe(bucketCount);

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        rateLimitManager.checkRateLimit(`/route-${i}`, "GET", `check-${i}`);
      }
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    test("should not leak memory with bucket auto-cleanup", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let batch = 0; batch < 10; batch++) {
        for (let i = 0; i < 100; i++) {
          const bucket: RateLimitBucket = {
            requestId: `req-${batch}-${i}`,
            hash: `bucket-${batch}-${i}`,
            limit: 10,
            remaining: 5,
            reset: Date.now() + 1000,
            resetAfter: 1000,
            scope: "user",
          };

          rateLimitManager.buckets.set(`bucket-${batch}-${i}`, bucket);
        }

        vi.advanceTimersByTime(62000);
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe("complex integration scenarios", () => {
    test("should handle rapid sequential requests correctly", async () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "rapid-bucket",
        limit: 5,
        remaining: 5,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("rapid-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "rapid-bucket");

      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = rateLimitManager.checkRateLimit(
          "/channels/123",
          "GET",
          `req-${i}`,
        );
        results.push(result);
      }

      const allowedRequests = results.filter((r) => r.canProceed).length;
      const blockedRequests = results.filter((r) => !r.canProceed).length;

      expect(allowedRequests).toBe(5);
      expect(blockedRequests).toBe(5);
    });

    test("should handle mixed route types in rapid succession", () => {
      const regularBucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "regular-bucket",
        limit: 10,
        remaining: 2,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      const emojiBucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "emoji-bucket",
        limit: 5,
        remaining: 2,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
        isEmojiRoute: true,
      };

      rateLimitManager.buckets.set("regular-bucket", regularBucket);
      rateLimitManager.buckets.set("emoji-bucket", emojiBucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "regular-bucket");
      rateLimitManager.routeBuckets.set("emoji:123456789:GET", "emoji-bucket");

      const regularResult1 = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      const emojiResult1 = rateLimitManager.checkRateLimit(
        "/guilds/123456789/emojis",
        "GET",
        "req-2",
      );
      const regularResult2 = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-3",
      );
      const emojiResult2 = rateLimitManager.checkRateLimit(
        "/guilds/123456789/emojis",
        "GET",
        "req-4",
      );

      expect(regularResult1.canProceed).toBe(true);
      expect(emojiResult1.canProceed).toBe(false);
      expect(regularResult2.canProceed).toBe(true);
      expect(emojiResult2.canProceed).toBe(false);
    });

    test("should handle complete rate limit lifecycle", async () => {
      const eventSpy = vi.spyOn(mockRest, "emit");

      const headers429 = {
        "retry-after": "1",
        "x-ratelimit-bucket": "lifecycle-bucket",
        "x-ratelimit-limit": "5",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String((Date.now() + 1000) / 1000),
      };

      const update429 = await rateLimitManager.updateRateLimitAndWaitIfNeeded(
        "/channels/123",
        "POST",
        headers429,
        429,
        "req-1",
      );

      expect(update429.canProceed).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith("rateLimitHit", expect.any(Object));

      const checkBlocked = rateLimitManager.checkRateLimit(
        "/channels/123",
        "POST",
        "req-2",
      );
      expect(checkBlocked.canProceed).toBe(false);

      vi.advanceTimersByTime(2000);

      const checkAfterReset = rateLimitManager.checkRateLimit(
        "/channels/123",
        "POST",
        "req-3",
      );
      expect(checkAfterReset.canProceed).toBe(true);

      const headersSuccess = {
        "x-ratelimit-bucket": "lifecycle-bucket",
        "x-ratelimit-limit": "5",
        "x-ratelimit-remaining": "4",
        "x-ratelimit-reset": String((Date.now() + 60000) / 1000),
      };

      const updateSuccess = rateLimitManager.updateRateLimit(
        "/channels/123",
        "POST",
        headersSuccess,
        200,
        "req-4",
      );

      expect(updateSuccess.canProceed).toBe(true);

      const bucket = rateLimitManager.buckets.get("lifecycle-bucket");
      expect(bucket).toBeDefined();
      if (bucket) {
        expect(bucket.remaining).toBe(4);
      }
    });

    test("should handle global and bucket rate limits simultaneously", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 60,
        windowStartTime: Date.now(),
      };

      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "dual-bucket",
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        resetAfter: 60000,
        scope: "user",
      };

      rateLimitManager.buckets.set("dual-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/channels/123", "dual-bucket");

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("global");
    });

    test("should prioritize more restrictive rate limits", () => {
      (rateLimitManager as any)["#globalRateTracker"] = {
        requestCount: 45,
        windowStartTime: Date.now(),
      };

      (rateLimitManager as any)["#invalidRequests"] = {
        count: 15000,
        windowStart: Date.now(),
      };

      const result = rateLimitManager.checkRateLimit(
        "/channels/123",
        "GET",
        "req-1",
      );
      expect(result.canProceed).toBe(false);
      expect(result.limitType).toBe("cloudflare");
    });
  });

  describe("event emission and monitoring", () => {
    test("should emit comprehensive rate limit hit events", () => {
      const eventSpy = vi.spyOn(mockRest, "emit");

      const headers = {
        "retry-after": "30",
        "x-ratelimit-bucket": "monitored-bucket",
        "x-ratelimit-scope": "user",
      };

      rateLimitManager.updateRateLimit(
        "/guilds/123/members",
        "POST",
        headers,
        429,
        "req-monitor",
      );

      expect(eventSpy).toHaveBeenCalledWith(
        "rateLimitHit",
        expect.objectContaining({
          timestamp: expect.any(String),
          requestId: "req-monitor",
          bucketId: "monitored-bucket",
          resetAfter: 30000,
          global: false,
          route: "/guilds/123/members",
          method: "POST",
        }),
      );
    });

    test("should emit global rate limit events", () => {
      const eventSpy = vi.spyOn(mockRest, "emit");

      const headers = {
        "retry-after": "15",
        "x-ratelimit-global": "true",
      };

      rateLimitManager.updateRateLimit(
        "/channels/123",
        "GET",
        headers,
        429,
        "req-global",
      );

      expect(eventSpy).toHaveBeenCalledWith(
        "rateLimitHit",
        expect.objectContaining({
          bucketId: "global",
          global: true,
          method: "GLOBAL",
        }),
      );
    });

    test("should include proper timestamps in events", () => {
      const eventSpy = vi.spyOn(mockRest, "emit");
      const testTime = new Date("2023-01-01T12:00:00.000Z");
      vi.setSystemTime(testTime);

      const headers = {
        "retry-after": "10",
        "x-ratelimit-bucket": "timestamp-bucket",
      };

      rateLimitManager.updateRateLimit(
        "/test",
        "GET",
        headers,
        429,
        "req-time",
      );

      expect(eventSpy).toHaveBeenCalledWith(
        "rateLimitHit",
        expect.objectContaining({
          timestamp: testTime.toISOString(),
        }),
      );
    });
  });

  describe("configuration validation and edge cases", () => {
    test("should respect custom configuration values", () => {
      const customOptions = RateLimitOptions.parse({
        safetyMargin: 250,
        maxInvalidRequests: 5000,
        maxGlobalRequestsPerSecond: 30,
        cleanupInterval: 120000,
      });

      const customManager = new RateLimitManager(
        mockRest as Rest,
        customOptions,
      );

      (rateLimitManager as any)["#globalRateTracker"].requestCount = 35;
      const result1 = rateLimitManager.checkRateLimit("/test", "GET", "req-1");
      expect(result1.canProceed).toBe(true);

      (customManager as any)["#globalRateTracker"].requestCount = 35;
      const result2 = customManager.checkRateLimit("/test", "GET", "req-2");
      expect(result2.canProceed).toBe(false);

      customManager.destroy();
    });

    test("should handle extreme configuration values", () => {
      const extremeOptions = RateLimitOptions.parse({
        safetyMargin: 1,
        maxInvalidRequests: 1,
        maxGlobalRequestsPerSecond: 1,
        cleanupInterval: 1000,
      });

      const extremeManager = new RateLimitManager(
        mockRest as Rest,
        extremeOptions,
      );

      (extremeManager as any)["#globalRateTracker"].requestCount = 2;
      const result = extremeManager.checkRateLimit("/test", "GET", "req-1");
      expect(result.canProceed).toBe(false);

      extremeManager.destroy();
    });

    test("should handle bucket reset edge cases", () => {
      const bucket: RateLimitBucket = {
        requestId: "req-0",
        hash: "edge-bucket",
        limit: 10,
        remaining: 0,
        reset: Date.now() + 50,
        resetAfter: 50,
        scope: "user",
      };

      rateLimitManager.buckets.set("edge-bucket", bucket);
      rateLimitManager.routeBuckets.set("GET:/edge", "edge-bucket");

      const result1 = rateLimitManager.checkRateLimit("/edge", "GET", "req-1");
      expect(result1.canProceed).toBe(false);

      vi.advanceTimersByTime(100);

      const result2 = rateLimitManager.checkRateLimit("/edge", "GET", "req-2");
      expect(result2.canProceed).toBe(true);
    });
  });
});
