import { HttpCodes, JsonErrorCodes, MimeTypes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import { Gunzip } from "minizlib";
import type { Dispatcher } from "undici";
import { Pool, RetryAgent } from "undici";
import { DISCORD_API_URL, REST_DEFAULT_OPTIONS } from "../libs/constants";
import type { RestEvents, RestOptions, RestRequestOptions } from "../types";
import { RestRateLimiter } from "./RestRateLimiter";

export class Rest extends EventEmitter<RestEvents> {
    private readonly pool: Pool;

    private readonly retryAgent: RetryAgent;

    private readonly rateLimiter: RestRateLimiter;

    private readonly store: Store<string, { data: any; expiry: number }>;

    public constructor(
        private token: string,
        private options: RestOptions = REST_DEFAULT_OPTIONS
    ) {
        super();
        this.store = new Store();
        this.rateLimiter = new RestRateLimiter();
        this.pool = this.createPool();
        this.retryAgent = this.createRetryAgent();
    }

    public async request<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            return await this.handle(options);
        } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    public async destroy(): Promise<void> {
        await this.pool.destroy();
        this.store.clear();
        this.emit("debug", "[REST] Rest instance destroyed");
    }

    public setToken(token: string): void {
        this.token = token;
    }

    private async handle<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            const cacheKey = `${options.method}:${options.path}`;

            if (!options.disableCache) {
                const cachedResponse = this.store.get(cacheKey);
                if (cachedResponse && cachedResponse.expiry > Date.now()) {
                    return cachedResponse.data as T;
                }
            }

            await this.rateLimiter.wait(options.path);

            const { statusCode, headers, body } = await this.makeRequest(options);

            this.rateLimiter.handleRateLimit(options.path, headers);

            const responseText = await this.decompressResponse(headers, body);
            const data = this.parseResponse(responseText);

            if (statusCode === HttpCodes.TooManyRequests) {
                await this.rateLimiter.handleRateLimitResponse(data);
                return await this.handle(options);
            }

            if (statusCode >= 200 && statusCode < 300 && !options.disableCache) {
                this.store.set(cacheKey, {
                    data,
                    expiry: Date.now() + (this.options.cache_life_time ?? 60_000),
                });
            }

            if (statusCode >= 400) {
                throw new Error(`[REST] HTTP error! status: ${statusCode}, body: ${JSON.stringify(data)}`);
            }

            return data as T;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    private async makeRequest<T>(options: RestRequestOptions<T>): Promise<Dispatcher.ResponseData> {
        const path = `/api/v${this.options.version}${options.path}`;
        const headers = { ...this.createDefaultHeaders(), ...options.headers };
        return this.retryAgent.request({
            path,
            method: options.method,
            body: options.body,
            query: options.query,
            headers,
        });
    }

    private async decompressResponse(headers: any, body: any): Promise<string> {
        const responseBuffer = await body.arrayBuffer();

        if (headers["content-encoding"] === "gzip") {
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

    private parseResponse(responseText: string): any {
        try {
            return responseText ? JSON.parse(responseText) : null;
        } catch (error) {
            throw new Error(
                `[REST] Failed to parse response: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    private createDefaultHeaders(): Record<string, string> {
        return {
            Authorization: `${this.options.auth_type ?? "Bot"} ${this.token}`,
            "Content-Type": MimeTypes.Json,
            "Accept-Encoding": "gzip, deflate",
            ...(this.options.user_agent && { "User-Agent": this.options.user_agent }),
        };
    }

    private createPool(): Pool {
        return new Pool(DISCORD_API_URL, {
            connections: 10,
            pipelining: 6,
            keepAliveTimeout: 20_000,
            keepAliveMaxTimeout: 30_000,
            connect: {
                timeout: 30_000,
            },
            allowH2: true,
        });
    }

    private createRetryAgent(): RetryAgent {
        return new RetryAgent(this.pool, {
            retryAfter: true,
            minTimeout: 500,
            maxTimeout: 10_000,
            timeoutFactor: 2,
            methods: ["GET", "DELETE", "PUT", "PATCH", "POST"],
            statusCodes: Object.values(HttpCodes).map(Number),
            errorCodes: Object.values(JsonErrorCodes).map(String),
        });
    }
}
