import { z } from "zod";
import { sleep } from "../../utils/index.js";

export type RateLimitScope = "user" | "global" | "shared";

interface InvalidRequestTracking {
  count: number;
  windowStart: number;
}

interface GlobalRequestTracking {
  count: number;
  windowStart: number;
}

export interface RateLimitResult {
  canProceed: boolean;
  retryAfter?: number;
  limitType?: "global" | "cloudflare";
  reason?: string;
}

export const RATE_LIMIT_CONSTANTS = {
  GLOBAL_EXEMPT_ROUTES: ["/interactions", "/webhooks"],
  INVALID_STATUSES: [401, 403, 429],
  HEADERS: {
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    BUCKET: "x-ratelimit-bucket",
    GLOBAL: "x-ratelimit-global",
    SCOPE: "x-ratelimit-scope",
    RETRY_AFTER: "retry-after",
  },
};

export const RateLimitOptions = z.object({
  maxInvalidRequests: z.int().positive().default(10000),
  maxGlobalRequestsPerSecond: z.int().positive().default(50),
});

export class RateLimitManager {
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  readonly #globalRequests: GlobalRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  readonly #options: z.infer<typeof RateLimitOptions>;

  constructor(options: z.input<typeof RateLimitOptions> = {}) {
    try {
      this.#options = RateLimitOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }
  }

  async checkRateLimit(path: string): Promise<RateLimitResult> {
    const now = Date.now();

    // Check Cloudflare limits first
    const cloudflareCheck = this.#checkCloudflareLimit(now);
    if (!cloudflareCheck.canProceed) {
      if (cloudflareCheck.retryAfter && cloudflareCheck.retryAfter > 0) {
        await sleep(cloudflareCheck.retryAfter);
        return { canProceed: true };
      }
      return cloudflareCheck;
    }

    // Check global limits for non-exempt routes
    const isGlobalExempt = RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES.some((route) =>
      path.startsWith(route),
    );

    if (!isGlobalExempt) {
      const globalCheck = this.#checkGlobalLimit(now);
      if (!globalCheck.canProceed) {
        if (globalCheck.retryAfter && globalCheck.retryAfter > 0) {
          await sleep(globalCheck.retryAfter);
          return { canProceed: true };
        }
        return globalCheck;
      }
    }

    return { canProceed: true };
  }

  async updateRateLimit(
    headers: Record<string, string>,
    statusCode: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();

    this.#updateGlobalCount(now);

    if (RATE_LIMIT_CONSTANTS.INVALID_STATUSES.includes(statusCode)) {
      this.#updateInvalidCount(now);
    }

    if (statusCode === 429) {
      return await this.#handle429Response(headers);
    }

    return { canProceed: true };
  }

  async #handle429Response(headers: Record<string, string>): Promise<RateLimitResult> {
    const retryAfterHeader = headers[RATE_LIMIT_CONSTANTS.HEADERS.RETRY_AFTER];
    const resetAfterHeader = headers[RATE_LIMIT_CONSTANTS.HEADERS.RESET_AFTER];
    const retryAfterSeconds = retryAfterHeader
      ? Number.parseFloat(retryAfterHeader)
      : Number.parseFloat(resetAfterHeader || "1");
    const retryAfterMs = Math.ceil(retryAfterSeconds * 1000);
    const isGlobal = headers[RATE_LIMIT_CONSTANTS.HEADERS.GLOBAL] === "true";

    const scope = headers[RATE_LIMIT_CONSTANTS.HEADERS.SCOPE] as RateLimitScope;
    if (scope !== "shared") {
      this.#updateInvalidCount(Date.now());
    }

    if (retryAfterMs > 0) {
      await sleep(retryAfterMs);
    }

    return {
      canProceed: true,
      retryAfter: retryAfterMs,
      limitType: isGlobal ? "global" : undefined,
    };
  }

  #checkCloudflareLimit(now: number): RateLimitResult {
    const windowDuration = 10 * 60 * 1000;
    if (now - this.#invalidRequests.windowStart >= windowDuration) {
      this.#invalidRequests.count = 0;
      this.#invalidRequests.windowStart = now;
    }

    if (this.#invalidRequests.count >= this.#options.maxInvalidRequests) {
      const retryAfter = windowDuration - (now - this.#invalidRequests.windowStart);
      return {
        canProceed: false,
        retryAfter,
        limitType: "cloudflare",
        reason: "Approaching Cloudflare ban threshold",
      };
    }

    return { canProceed: true };
  }

  #checkGlobalLimit(now: number): RateLimitResult {
    const windowDuration = 1000;
    if (now - this.#globalRequests.windowStart >= windowDuration) {
      this.#globalRequests.count = 0;
      this.#globalRequests.windowStart = now;
    }

    if (this.#globalRequests.count >= this.#options.maxGlobalRequestsPerSecond) {
      const retryAfter = windowDuration - (now - this.#globalRequests.windowStart);
      return {
        canProceed: false,
        retryAfter,
        limitType: "global",
        reason: "Global rate limit exceeded",
      };
    }

    return { canProceed: true };
  }

  #updateInvalidCount(now: number): void {
    const windowDuration = 10 * 60 * 1000;
    if (now - this.#invalidRequests.windowStart >= windowDuration) {
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      this.#invalidRequests.count++;
    }
  }

  #updateGlobalCount(now: number): void {
    const windowDuration = 1000;
    if (now - this.#globalRequests.windowStart >= windowDuration) {
      this.#globalRequests.count = 1;
      this.#globalRequests.windowStart = now;
    } else {
      this.#globalRequests.count++;
    }
  }
}
