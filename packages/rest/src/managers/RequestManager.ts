import { ApiVersions, MimeTypes } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import type { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header.js";
import type { RestEvents, RestHttpDiscordHeaders, RestOptions, RouteStructure } from "../types/index.js";
import type { ConnectionManager } from "./ConnectionManager.js";
import type { RateLimiterManager } from "./RateLimiterManager.js";

export enum RequestErrorCode {
    ConnectionError = "REQUEST_CONNECTION_ERROR",
    RateLimitError = "REQUEST_RATE_LIMIT_ERROR",
    ParseError = "REQUEST_PARSE_ERROR",
    InvalidStateError = "REQUEST_INVALID_STATE",
    HttpError = "REQUEST_HTTP_ERROR",
    TimeoutError = "REQUEST_TIMEOUT_ERROR",
}

export class RequestError extends Error {
    code: RequestErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: RequestErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "RequestError";
        this.code = code;
        this.details = details;
        this.cause = cause;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class RequestManager {
    readonly #eventEmitter: EventEmitter<RestEvents>;
    readonly #token: string;
    readonly #options: Required<RestOptions>;
    readonly #rateLimiter: RateLimiterManager;
    readonly #connectionManager: ConnectionManager;
    readonly #requestCache = new Map<string, Promise<unknown>>();

    constructor(
        eventEmitter: EventEmitter<RestEvents>,
        token: string,
        options: RestOptions,
        rateLimiter: RateLimiterManager,
        connectionManager: ConnectionManager,
    ) {
        this.#eventEmitter = eventEmitter;
        this.#token = token;
        this.#options = this.#normalizeOptions(options);
        this.#rateLimiter = rateLimiter;
        this.#connectionManager = connectionManager;
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
                this.#emitDebug(`Sending ${method} request to ${url}`);

                const response = await this.#connectionManager.retryAgent.request({
                    method,
                    body,
                    query,
                    path: url,
                    headers: requestHeaders,
                });

                return await this.#handleResponse(response, method, path);
            } catch (error) {
                if (error instanceof RequestError) {
                    throw error;
                }

                const requestError = new RequestError("Failed to execute request", RequestErrorCode.ConnectionError, {
                    method,
                    path,
                    attempt,
                    maxRetries: this.#options.rateLimitRetries,
                    error,
                });

                if (!this.#shouldRetry(requestError, attempt)) {
                    throw requestError;
                }
            }
        }

        throw new RequestError("Max rate limit retries reached", RequestErrorCode.RateLimitError, {
            method,
            path,
            maxRetries: this.#options.rateLimitRetries,
        });
    }

    #normalizeOptions(options: RestOptions): Required<RestOptions> {
        return {
            version: options.version ?? ApiVersions.V6,
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
        let text: string;
        try {
            text = await response.body.text();
            this.#rateLimiter.update(path, response.headers as RestHttpDiscordHeaders);
        } catch (error) {
            throw new RequestError("Failed to read response body", RequestErrorCode.ParseError, {
                method,
                path,
                statusCode: response.statusCode,
                error,
            });
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
            this.#emitDebug(`Received ${response.statusCode} response from ${method} ${path}`, {
                headers: JSON.stringify(response.headers),
                body: text,
            });

            try {
                return JSON.parse(text);
            } catch (error) {
                throw new RequestError("Failed to parse JSON response", RequestErrorCode.ParseError, {
                    method,
                    path,
                    responseText: text,
                    error,
                });
            }
        }

        if (response.statusCode === 429) {
            await this.#handleRateLimit(response, method, path);
            throw new RequestError("Rate limit exceeded", RequestErrorCode.RateLimitError, {
                method,
                path,
                retryAfter: response.headers["retry-after"],
                limit: response.headers["x-ratelimit-limit"],
                bucket: response.headers["x-ratelimit-bucket"],
            });
        }

        throw new RequestError(`HTTP Error ${response.statusCode}`, RequestErrorCode.HttpError, {
            method,
            path,
            statusCode: response.statusCode,
            response: text,
        });
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
        this.#emitWarn(`Rate limited on ${method} ${path}. Retrying after ${retryAfter}ms`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }

    #shouldRetry(error: RequestError, attempt: number): boolean {
        this.#emitError(error);

        if (attempt === this.#options.rateLimitRetries) {
            this.#emitDebug("Max rate limit retries reached", {
                maxRetries: this.#options.rateLimitRetries,
                error: error.message,
            });
            return false;
        }

        this.#emitDebug("Request failed, retrying", {
            attempt: attempt + 1,
            maxRetries: this.#options.rateLimitRetries,
            errorCode: error.code,
            errorMessage: error.message,
        });
        return true;
    }

    #emitDebug(message: string, details?: Record<string, unknown>): void {
        this.#eventEmitter.emit(
            "debug",
            Logger.debug(message, {
                component: "RequestManager",
                details,
            }),
        );
    }

    #emitError(error: RequestError): void {
        this.#eventEmitter.emit(
            "error",
            Logger.error(error.message, {
                component: "RequestManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitWarn(message: string, details?: Record<string, unknown>): void {
        this.#eventEmitter.emit(
            "warn",
            Logger.warn(message, {
                component: "RequestManager",
                details,
            }),
        );
    }
}
