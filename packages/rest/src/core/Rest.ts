import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import type { Float, Integer } from "@nyxjs/core";
import { MimeTypes, RestHttpResponseCodes, RestJsonErrorCodes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import { Gunzip } from "minizlib";
import type { Dispatcher, RetryHandler } from "undici";
import { Pool, RetryAgent } from "undici";
import type { RestOptions, RouteStructure } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure|Rate Limit Response Structure}
 */
type RateLimitResponseStructure = {
    /**
     * An error code for some limits
     */
    code?: RestHttpResponseCodes;
    /**
     * A value indicating if you are being globally rate limited or not
     */
    global: boolean;
    /**
     * A message saying you are being rate limited.
     */
    message: string;
    /**
     * The number of seconds to wait before submitting another request.
     */
    retry_after: Float;
};

type RateLimitInfo = {
    /**
     * The maximum number of requests that can be made in a given time frame.
     */
    bucket: string;
    /**
     * The number of requests remaining in the current time frame.
     */
    limit: Integer;
    /**
     * The time at which the current time frame resets.
     */
    remaining: Integer;
    /**
     * The time at which the current time frame resets.
     */
    reset: Integer;
    /**
     * The time in milliseconds after which the current time frame resets.
     */
    reset_after: Integer;
};

export class Rest {
    #globalRateLimit: number | null = null;

    #token: string;

    readonly #store: Store<string, { data: any; expiry: number }> = new Store();

    readonly #routeRateLimits: Store<string, RateLimitInfo> = new Store();

    readonly #pool: Pool;

    readonly #retryAgent: RetryAgent;

    readonly #options: Readonly<RestOptions>;

    public constructor(token: string, options: RestOptions) {
        this.#token = this.#encryptToken(token);
        this.#pool = this.#initializePool();
        this.#retryAgent = this.#initializeRetryAgent();
        this.#options = Object.freeze({ ...options });
    }

    public setToken(token: string): void {
        this.#token = this.#encryptToken(token);
    }

    public async destroy(): Promise<void> {
        try {
            await this.#pool.destroy();
            this.#store.clear();
            this.#routeRateLimits.clear();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    public async request<T>(request: RouteStructure<T>): Promise<T> {
        const { path, headers, ...options } = request;
        const cacheKey = `${request.method}:${path}`;

        try {
            if (!request.disable_cache) {
                const cachedResponse = this.#store.get(cacheKey);
                if (cachedResponse && cachedResponse.expiry > Date.now()) {
                    return cachedResponse.data as T;
                }
            }

            await this.#wait(path);

            const response = await this.#retryAgent.request({
                path: `/api/v${this.#options.version}${path}`,
                headers: this.#initializeHeaders(headers as Record<string, string>),
                ...options,
            });

            this.#handleRateLimit(path, response.headers as Record<string, string>);

            const responseText = await this.#decompressResponse(response.headers, response.body);
            const data = JSON.parse(responseText);

            if (response.statusCode === RestHttpResponseCodes.TooManyRequests) {
                await this.#handleRateLimitResponse(data);
                return await this.request(request);
            }

            if (response.statusCode >= 200 && response.statusCode < 300 && !request.disable_cache) {
                this.#store.set(cacheKey, {
                    data,
                    expiry: Date.now() + (this.#options.cache_life_time ?? 60_000),
                });
            }

            if (response.statusCode >= 400) {
                throw new Error(`[REST] ${data.message}`);
            }

            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    async #decompressResponse(headers: Record<string, any>, body: Dispatcher.ResponseData["body"]): Promise<string> {
        const responseBuffer = await body.arrayBuffer();

        if (headers["content-encoding"]?.toLowerCase() === "gzip") {
            return new Promise((resolve, reject) => {
                const gunzip = new Gunzip({ level: 9 });
                const chunks: Buffer[] = [];

                gunzip.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
                gunzip.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
                gunzip.on("error", reject);
                gunzip.end(Buffer.from(responseBuffer));
            });
        }

        return Buffer.from(responseBuffer).toString("utf8");
    }

    #initializePool(): Pool {
        const poolOptions: Pool.Options = {
            connections: 10,
            pipelining: 6,
            keepAliveTimeout: 20_000,
            keepAliveMaxTimeout: 30_000,
            connect: { timeout: 30_000 },
            allowH2: true,
        };

        return new Pool("https://discord.com", poolOptions);
    }

    #initializeRetryAgent(): RetryAgent {
        if (!this.#pool) {
            throw new Error("[REST] Pool not initialized");
        }

        const retryAgentOptions: RetryHandler.RetryOptions = {
            retryAfter: true,
            minTimeout: 500,
            maxTimeout: 10_000,
            timeoutFactor: 2,
            methods: ["GET", "DELETE", "PUT", "PATCH", "POST"],
            statusCodes: Object.values(RestHttpResponseCodes).map(Number),
            errorCodes: Object.values(RestJsonErrorCodes).map(String),
        };

        return new RetryAgent(this.#pool, retryAgentOptions);
    }

    #initializeHeaders(additionalHeaders?: Record<string, string>): Readonly<Record<string, string>> {
        const headers: Record<string, string> = {
            Authorization: `${this.#options.auth_type} ${this.#decryptToken(this.#token)}`,
            "Content-Type": MimeTypes.Json,
            "Accept-Encoding": "gzip, deflate",
        };

        if (this.#options.user_agent) {
            headers["User-Agent"] = this.#options.user_agent;
        }

        if (additionalHeaders) {
            Object.assign(headers, additionalHeaders);
        }

        return Object.freeze(headers);
    }

    async #wait(path: string): Promise<void> {
        const now = Date.now();
        if (this.#globalRateLimit && this.#globalRateLimit > now) {
            await setTimeout(this.#globalRateLimit - now);
        }

        const routeLimit = this.#routeRateLimits.get(path);
        if (routeLimit && routeLimit.remaining <= 0 && routeLimit.reset > now) {
            await setTimeout(routeLimit.reset - now);
        }
    }

    #handleRateLimit(path: string, headers: Record<string, string>): void {
        const rateLimitInfo = this.#parseHeaders(headers);
        this.#routeRateLimits.set(path, rateLimitInfo);

        if (headers["x-ratelimit-global"]) {
            this.#globalRateLimit = Date.now() + rateLimitInfo.reset_after;
        }
    }

    async #handleRateLimitResponse(response: RateLimitResponseStructure): Promise<void> {
        if (response.global) {
            this.#globalRateLimit = Date.now() + response.retry_after * 1_000;
        }

        await setTimeout(response.retry_after * 1_000);

        throw new Error(`[REST] Rate limited: ${response.message}`);
    }

    #parseHeaders(headers: Record<string, string>): Readonly<RateLimitInfo> {
        return Object.freeze({
            limit: Number.parseInt(headers["x-ratelimit-limit"] ?? "0", 10),
            remaining: Number.parseInt(headers["x-ratelimit-remaining"] ?? "0", 10),
            reset: Number.parseInt(headers["x-ratelimit-reset"] ?? "0", 10) * 1_000,
            reset_after: Number.parseFloat(headers["x-ratelimit-reset-after"] ?? "0") * 1_000,
            bucket: headers["x-ratelimit-bucket"] ?? "",
        });
    }

    #encryptToken(token: string): string {
        const algorithm = "aes-256-cbc";
        const key = randomBytes(32);
        const iv = randomBytes(16);
        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(token, "utf8", "hex");
        encrypted += cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}:${key.toString("hex")}`;
    }

    #decryptToken(encryptedToken: string): string {
        const [ivHex, encrypted, keyHex] = encryptedToken.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const key = Buffer.from(keyHex, "hex");
        const decipher = createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
}
