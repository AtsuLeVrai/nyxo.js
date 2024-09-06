import { setTimeout } from "node:timers";
import type { DiscordHeaders, Integer } from "@nyxjs/core";
import type { RateLimitResponseStructure } from "../types/globals";

type RateLimitInfo = {
    bucket: string;
    limit: Integer;
    remaining: Integer;
    reset: Integer;
    resetAfter: Integer;
};

export class RateLimiter {
    private globalRateLimit: number | null;

    private readonly routeRateLimits: Map<string, RateLimitInfo>;

    public constructor() {
        this.globalRateLimit = null;
        this.routeRateLimits = new Map();
    }

    public async wait(path: string): Promise<void> {
        try {
            if (this.globalRateLimit && this.globalRateLimit > Date.now()) {
                const delay = this.globalRateLimit - Date.now();
                await this.sleep(delay);
            }

            const routeLimit = this.routeRateLimits.get(path);
            if (routeLimit && routeLimit.remaining <= 0 && routeLimit.reset > Date.now()) {
                const delay = routeLimit.reset - Date.now();
                await this.sleep(delay);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
        }
    }

    public handleRateLimit(path: string, headers: DiscordHeaders): void {
        const limit = Number.parseInt(headers["X-RateLimit-Limit"] ?? "0", 10);
        const remaining = Number.parseInt(headers["X-RateLimit-Remaining"] ?? "0", 10);
        const reset = Number.parseInt(headers["X-RateLimit-Reset"] ?? "0", 10) * 1_000;
        const resetAfter = Number.parseFloat(headers["X-RateLimit-Reset-After"] ?? "0") * 1_000;
        const bucket = headers["X-RateLimit-Bucket"] ?? "";

        this.routeRateLimits.set(path, {
            limit,
            remaining,
            reset,
            resetAfter,
            bucket,
        });

        if (headers["X-RateLimit-Global"]) {
            this.globalRateLimit = Date.now() + resetAfter;
        }
    }

    public async handleRateLimitResponse(response: RateLimitResponseStructure): Promise<void> {
        if (response.global) {
            this.globalRateLimit = Date.now() + response.retry_after * 1_000;
        }

        await this.sleep(response.retry_after * 1_000);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
