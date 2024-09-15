import { setTimeout } from "node:timers/promises";
import type { DiscordHeaders, Integer } from "@nyxjs/core";
import type { RateLimitResponseStructure } from "../types/rest";
import type { Rest } from "./Rest";

type RateLimitInfo = {
    bucket: string;
    limit: Integer;
    remaining: Integer;
    reset: Integer;
    resetAfter: Integer;
};

export class RestRateLimiter {
    private globalRateLimit: number | null;

    private readonly routeRateLimits: Map<string, RateLimitInfo>;

    public constructor(private readonly rest: Rest) {
        this.globalRateLimit = null;
        this.routeRateLimits = new Map<string, RateLimitInfo>();
    }

    public async wait(path: string): Promise<void> {
        const now = Date.now();
        if (this.globalRateLimit && this.globalRateLimit > now) {
            await setTimeout(this.globalRateLimit - now);
        }

        const routeLimit = this.routeRateLimits.get(path);
        if (routeLimit && routeLimit.remaining <= 0 && routeLimit.reset > now) {
            await setTimeout(routeLimit.reset - now);
        }
    }

    public handleRateLimit(path: string, headers: DiscordHeaders): void {
        const { limit, remaining, reset, resetAfter, bucket } = this.parseHeaders(headers);

        this.routeRateLimits.set(path, { limit, remaining, reset, resetAfter, bucket });

        if (headers["X-RateLimit-Global"]) {
            this.globalRateLimit = Date.now() + resetAfter;
            this.rest.emit("globalRateLimit", resetAfter / 1_000);
        } else {
            this.rest.emit("rateLimit", path, resetAfter / 1_000);
        }
    }

    public async handleRateLimitResponse(response: RateLimitResponseStructure): Promise<void> {
        if (response.global) {
            this.globalRateLimit = Date.now() + response.retry_after * 1_000;
            this.rest.emit("globalRateLimit", response.retry_after);
        }

        await setTimeout(response.retry_after * 1_000);
    }

    private parseHeaders(headers: DiscordHeaders): RateLimitInfo {
        return {
            limit: Number.parseInt(headers["X-RateLimit-Limit"] ?? "0", 10),
            remaining: Number.parseInt(headers["X-RateLimit-Remaining"] ?? "0", 10),
            reset: Number.parseInt(headers["X-RateLimit-Reset"] ?? "0", 10) * 1_000,
            resetAfter: Number.parseFloat(headers["X-RateLimit-Reset-After"] ?? "0") * 1_000,
            bucket: headers["X-RateLimit-Bucket"] ?? "",
        };
    }
}
