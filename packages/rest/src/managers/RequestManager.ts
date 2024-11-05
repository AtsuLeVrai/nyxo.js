import { MimeTypes } from "@nyxjs/core";
import type { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header.js";
import type { RestEvents, RestHttpDiscordHeaders, RestOptions, RouteStructure } from "../types/index.js";
import type { ConnectionManager } from "./ConnectionManager.js";
import type { RateLimiterManager } from "./RateLimiterManager.js";

export class RequestManager {
    readonly #token: string;
    readonly #options: Required<RestOptions>;
    readonly #rateLimiter: RateLimiterManager;
    readonly #connectionManager: ConnectionManager;
    readonly #eventEmitter: EventEmitter<RestEvents>;
    readonly #requestCache = new Map<string, Promise<unknown>>();

    constructor(
        token: string,
        options: RestOptions,
        rateLimiter: RateLimiterManager,
        connectionManager: ConnectionManager,
        eventEmitter: EventEmitter<RestEvents>,
    ) {
        this.#token = token;
        this.#options = this.#normalizeOptions(options);
        this.#rateLimiter = rateLimiter;
        this.#connectionManager = connectionManager;
        this.#eventEmitter = eventEmitter;
    }

    async handleManyRequests<T extends readonly RouteStructure<unknown>[] | []>(
        routes: T,
    ): Promise<{ [K in keyof T]: T[K] extends RouteStructure<infer U> ? Awaited<U> : never }> {
        const chunkSize = 5;
        const results = [] as unknown[];

        for (let i = 0; i < routes.length; i += chunkSize) {
            const chunk = routes.slice(i, i + chunkSize);
            const chunkResults = await Promise.all(chunk.map((route) => this.handleRequest(route)));
            results.push(...chunkResults);
        }

        return results as { [K in keyof T]: T[K] extends RouteStructure<infer U> ? Awaited<U> : never };
    }

    async handleRequest<T>(route: RouteStructure<T>): Promise<T> {
        const cacheKey = this.#generateCacheKey(route);

        const existingRequest = this.#requestCache.get(cacheKey);
        if (existingRequest) {
            return existingRequest as Promise<T>;
        }

        const requestPromise = this.#executeRequest(route);
        this.#requestCache.set(cacheKey, requestPromise);

        try {
            return await requestPromise;
        } finally {
            this.#requestCache.delete(cacheKey);
        }
    }

    #generateCacheKey(route: RouteStructure<unknown>): string {
        return `${route.method}:${route.path}:${JSON.stringify(route.query)}`;
    }

    async #executeRequest<T>(route: RouteStructure<T>): Promise<T> {
        const { headers, method, body, path, query } = route;
        const requestHeaders = this.#prepareHeaders(headers);
        const url = `/api/v${this.#options.version}${path}`;

        for (let attempt = 0; attempt <= this.#options.rateLimitRetries; attempt++) {
            try {
                await this.#rateLimiter.wait(path);
                this.#eventEmitter.emit("debug", `[REST] Sending ${method} request to ${url}`);

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
            userAgent: options.userAgent ?? `DiscordBot (https://github.com/3tatsu/nyx.js, ${options.version})`,
            rateLimitRetries: options.rateLimitRetries ?? 5,
            timeout: options.timeout ?? 30_000,
            maxRetries: options.maxRetries ?? 3,
        };
    }

    #prepareHeaders(headers?: IncomingHttpHeaders): IncomingHttpHeaders {
        return {
            authorization: `Bot ${this.#token}`,
            "content-type": headers?.["content-type"] ?? MimeTypes.Json,
            "user-agent": this.#options.userAgent,
            ...headers,
        };
    }

    async #handleResponse<T>(response: Dispatcher.ResponseData, method: string, path: string): Promise<T> {
        const text = await response.body.text();
        this.#rateLimiter.update(path, response.headers as RestHttpDiscordHeaders);

        if (response.statusCode >= 200 && response.statusCode < 300) {
            this.#eventEmitter.emit("debug", `[REST] Request successful: ${text}`);
            return JSON.parse(text);
        }

        if (response.statusCode === 429) {
            await this.#handleRateLimit(response, method, path);
        }

        throw new Error(`HTTP Error ${response.statusCode}: ${text}`);
    }

    async #handleRateLimit(response: Dispatcher.ResponseData, method: string, path: string): Promise<void> {
        const retryAfter = Number(response.headers["retry-after"]) * 1_000;
        this.#eventEmitter.emit("rateLimit", {
            timeout: retryAfter,
            limit: Number(response.headers["x-ratelimit-limit"]),
            method,
            path,
            route: response.headers["x-ratelimit-bucket"] as string,
        });
        this.#eventEmitter.emit("warn", `[REST] Rate limited on ${method} ${path}. Retrying after ${retryAfter}ms`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }

    #shouldRetry(error: unknown, attempt: number): boolean {
        if (error instanceof Error) {
            this.#eventEmitter.emit("error", new Error(`[REST] Request failed: ${error.message}`));
        }

        if (attempt === this.#options.rateLimitRetries) {
            this.#eventEmitter.emit("error", new Error("[REST] Max rate limit retries reached"));
            return false;
        }

        this.#eventEmitter.emit(
            "warn",
            `[REST] Request failed, retrying (${attempt + 1}/${this.#options.rateLimitRetries}): ${String(error)}`,
        );
        return true;
    }
}
