import { setTimeout } from "node:timers";
import { MimeTypes, RestHttpResponseCodes, RestJsonErrorCodes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { RetryHandler } from "undici";
import { Pool, RetryAgent } from "undici";
import type { RestEvents, RestHttpDiscordHeaders, RestOptions, RouteStructure } from "../types";
import { RestMethods } from "../types";
import { RateLimiter } from "./RateLimiter";

export class Rest extends EventEmitter<RestEvents> {
    readonly #token: string;

    readonly #options: Required<RestOptions>;

    readonly #pool: Pool;

    readonly #retryAgent: RetryAgent;

    readonly #rateLimiter: RateLimiter = new RateLimiter();

    readonly #cache: Store<string, any> = new Store();

    public constructor(token: string, options: RestOptions) {
        super();
        this.#token = token;
        this.#options = {
            version: options.version,
            user_agent: options.user_agent ?? `DiscordBot (https://github.com/3tatsu/nyx.js, ${options.version})`,
            rate_limit_retries: options.rate_limit_retries ?? 5,
            timeout: options.timeout ?? 30_000,
            max_retries: options.max_retries ?? 3,
        };
        this.#pool = this.#initializePool();
        this.#retryAgent = this.#initializeRetryAgent();
    }

    public async request<T>(route: RouteStructure<T>): Promise<T> {
        const { headers, method, body, path, disable_cache, query } = route;

        const cacheKey = `${method}:${path}`;
        if (!disable_cache && method === RestMethods.Get) {
            const cachedResponse = this.#cache.get(cacheKey);
            if (cachedResponse) {
                this.emit("DEBUG", `Cache hit for ${cacheKey}`);
                return cachedResponse as T;
            }
        }

        const requestHeaders: Record<string | keyof RestHttpDiscordHeaders, any> = {
            authorization: `Bot ${this.#token}`,
            ...headers,
        };

        if (headers?.["content-type"]) {
            requestHeaders["content-type"] = headers["content-type"];
        } else {
            requestHeaders["content-type"] = MimeTypes.Json;
        }

        if (this.#options.user_agent) {
            requestHeaders["user-agent"] = this.#options.user_agent;
        }

        const url = `/api/v${this.#options.version}${path}`;

        for (let attempt = 0; attempt <= this.#options.rate_limit_retries!; attempt++) {
            try {
                await this.#rateLimiter.wait(path);

                this.emit("DEBUG", `[REST] Sending ${method} request to ${url}`);

                const response = await this.#retryAgent.request({
                    method,
                    body,
                    query,
                    path: url,
                    headers: requestHeaders,
                });

                const text = await response.body.text();

                this.#rateLimiter.update(path, response.headers as RestHttpDiscordHeaders);

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    const data = JSON.parse(text) as T;
                    if (!disable_cache && method === RestMethods.Get) {
                        this.#cache.set(cacheKey, data);
                        this.emit("DEBUG", `[REST] Cached response for ${cacheKey}`);
                    }

                    return data;
                } else if (response.statusCode === 429) {
                    const retryAfter = Number(response.headers["retry-after"]) * 1_000;
                    this.emit("RATE_LIMIT", {
                        timeout: retryAfter,
                        limit: Number(response.headers["x-ratelimit-limit"]),
                        method,
                        path,
                        route: response.headers["x-ratelimit-bucket"] as string,
                    });
                    this.emit("WARN", `[REST] Rate limited on ${method} ${path}. Retrying after ${retryAfter}ms`);
                    await new Promise((resolve) => {
                        setTimeout(resolve, retryAfter);
                    });
                } else {
                    const errorData = await response.body.text();
                    throw new Error(`HTTP Error ${response.statusCode}: ${JSON.stringify(errorData)}`);
                }
            } catch (error) {
                if (error instanceof Error) {
                    this.emit("ERROR", new Error(`[REST] Request failed: ${error.message}`));
                }

                if (attempt === this.#options.rate_limit_retries) {
                    this.emit("ERROR", new Error(`[REST] Max rate limit retries reached for ${method} ${path}`));
                    throw error;
                } else {
                    this.emit(
                        "WARN",
                        `[REST] Request failed, retrying (${attempt + 1}/${this.#options.rate_limit_retries}): ${String(error)}`
                    );
                }
            }
        }

        throw new Error("Max rate limit retries reached");
    }

    #initializePool(): Pool {
        const options: Pool.Options = {
            connections: 10,
            pipelining: 6,
            keepAliveTimeout: 20e3,
            keepAliveMaxTimeout: 120e3,
            bodyTimeout: 30e3,
            headersTimeout: 30e3,
            maxHeaderSize: 16_384,
            allowH2: true,
            maxConcurrentStreams: 100,
            connectTimeout: 30e3,
        };

        this.emit("DEBUG", `[REST] Initializing connection pool with options: ${JSON.stringify(options)}`);
        return new Pool("https://discord.com", options);
    }

    #initializeRetryAgent(): RetryAgent {
        if (!this.#pool) {
            throw new Error("Pool not initialized.");
        }

        const options: RetryHandler.RetryOptions = {
            maxRetries: this.#options.max_retries,
            minTimeout: 1_000,
            maxTimeout: 60_000,
            timeoutFactor: 2,
            retryAfter: true,
            methods: Object.values(RestMethods),
            statusCodes: Object.values(RestHttpResponseCodes).map(Number),
            errorCodes: Object.values(RestJsonErrorCodes).map(String),
        };

        this.emit("DEBUG", `[REST] Initializing retry agent with options: ${JSON.stringify(options)}`);
        return new RetryAgent(this.#pool, options);
    }
}
