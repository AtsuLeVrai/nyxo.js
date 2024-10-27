import { MimeTypes } from "@nyxjs/core";
import type { EventEmitter } from "eventemitter3";
import type { RestEvents, RestHttpDiscordHeaders, RestOptions, RouteStructure } from "../types/index.js";
import type { ConnectionManager } from "./ConnectionManager.js";
import type { RateLimiterManager } from "./RateLimiterManager.js";

export class RequestManager {
    readonly #token: string;
    readonly #options: Required<RestOptions>;
    readonly #rateLimiter: RateLimiterManager;
    readonly #connectionManager: ConnectionManager;
    readonly #eventEmitter: EventEmitter<RestEvents>;
    readonly #requestCache = new Map<string, Promise<any>>();

    constructor(
        token: string,
        options: RestOptions,
        rateLimiter: RateLimiterManager,
        connectionManager: ConnectionManager,
        eventEmitter: EventEmitter<RestEvents>
    ) {
        this.#token = token;
        this.#options = this.#normalizeOptions(options);
        this.#rateLimiter = rateLimiter;
        this.#connectionManager = connectionManager;
        this.#eventEmitter = eventEmitter;
    }

    async handleManyRequests<T extends readonly RouteStructure<any>[] | []>(
        routes: T
    ): Promise<{ [K in keyof T]: T[K] extends RouteStructure<infer U> ? Awaited<U> : never }> {
        const chunkSize = 5;
        const results = [];

        for (let i = 0; i < routes.length; i += chunkSize) {
            const chunk = routes.slice(i, i + chunkSize);
            const chunkResults = await Promise.all(chunk.map((route) => this.handleRequest(route)));
            results.push(...chunkResults);
        }

        return results as any;
    }

    async handleRequest<T>(route: RouteStructure<T>): Promise<T> {
        const cacheKey = this.#generateCacheKey(route);

        const existingRequest = this.#requestCache.get(cacheKey);
        if (existingRequest) {
            return existingRequest;
        }

        const requestPromise = this.#executeRequest(route);
        this.#requestCache.set(cacheKey, requestPromise);

        try {
            return await requestPromise;
        } finally {
            this.#requestCache.delete(cacheKey);
        }
    }

    #generateCacheKey(route: RouteStructure<any>): string {
        return `${route.method}:${route.path}:${JSON.stringify(route.query)}`;
    }

    async #executeRequest<T>(route: RouteStructure<T>): Promise<T> {
        const { headers, method, body, path, query } = route;
        const requestHeaders = this.#prepareHeaders(headers);
        const url = `/api/v${this.#options.version}${path}`;

        for (let attempt = 0; attempt <= this.#options.rate_limit_retries; attempt++) {
            try {
                await this.#rateLimiter.wait(path);
                this.#eventEmitter.emit("DEBUG", `[REST] Sending ${method} request to ${url}`);

                const response = await this.#connectionManager.retryAgent.request({
                    method,
                    body,
                    query,
                    path: url,
                    headers: requestHeaders,
                });

                return await this.#handleResponse(response, method, path);
            } catch (error) {
                if (!this.#shouldRetry(error, attempt)) {
                    throw error;
                }
            }
        }

        throw new Error("Max rate limit retries reached");
    }

    #normalizeOptions(options: RestOptions): Required<RestOptions> {
        return {
            version: options.version,
            user_agent: options.user_agent ?? `DiscordBot (https://github.com/3tatsu/nyx.js, ${options.version})`,
            rate_limit_retries: options.rate_limit_retries ?? 5,
            timeout: options.timeout ?? 30_000,
            max_retries: options.max_retries ?? 3,
        };
    }

    #prepareHeaders(headers?: Record<string, any>): Record<string | keyof RestHttpDiscordHeaders, any> {
        return {
            authorization: `Bot ${this.#token}`,
            "content-type": headers?.["content-type"] ?? MimeTypes.Json,
            "user-agent": this.#options.user_agent,
            ...headers,
        };
    }

    async #handleResponse(response: any, method: string, path: string): Promise<any> {
        const text = await response.body.text();
        this.#rateLimiter.update(path, response.headers as RestHttpDiscordHeaders);

        if (response.statusCode >= 200 && response.statusCode < 300) {
            this.#eventEmitter.emit("DEBUG", `[REST] Request successful: ${text}`);
            return JSON.parse(text);
        }

        if (response.statusCode === 429) {
            return await this.#handleRateLimit(response, method, path);
        }

        throw new Error(`HTTP Error ${response.statusCode}: ${text}`);
    }

    async #handleRateLimit(response: any, method: string, path: string): Promise<void> {
        const retryAfter = Number(response.headers["retry-after"]) * 1_000;
        this.#eventEmitter.emit("RATE_LIMIT", {
            timeout: retryAfter,
            limit: Number(response.headers["x-ratelimit-limit"]),
            method,
            path,
            route: response.headers["x-ratelimit-bucket"] as string,
        });
        this.#eventEmitter.emit("WARN", `[REST] Rate limited on ${method} ${path}. Retrying after ${retryAfter}ms`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }

    #shouldRetry(error: any, attempt: number): boolean {
        if (error instanceof Error) {
            this.#eventEmitter.emit("ERROR", new Error(`[REST] Request failed: ${error.message}`));
        }

        if (attempt === this.#options.rate_limit_retries) {
            this.#eventEmitter.emit("ERROR", new Error(`[REST] Max rate limit retries reached`));
            return false;
        }

        this.#eventEmitter.emit(
            "WARN",
            `[REST] Request failed, retrying (${attempt + 1}/${this.#options.rate_limit_retries}): ${String(error)}`
        );
        return true;
    }
}
