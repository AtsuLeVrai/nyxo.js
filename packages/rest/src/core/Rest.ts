import { HttpCodes, MimeTypes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { Pool, RetryAgent } from "undici";
import { DISCORD_API_URL, POOL_OPTIONS, REST_DEFAULT_OPTIONS, RETRY_AGENT_OPTIONS } from "../libs/constants";
import { decompressResponse } from "../libs/utils";
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
        this.pool = new Pool(DISCORD_API_URL, POOL_OPTIONS);
        this.retryAgent = new RetryAgent(this.pool, RETRY_AGENT_OPTIONS);
    }

    public async destroy(): Promise<void> {
        await this.pool.destroy();
        this.store.clear();
    }

    public setToken(token: string): void {
        this.token = token;
    }

    public async request<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            const cacheKey = `${options.method}:${options.path}`;

            if (!options.disable_cache) {
                const cachedResponse = this.store.get(cacheKey);
                if (cachedResponse && cachedResponse.expiry > Date.now()) {
                    return cachedResponse.data as T;
                }
            }

            await this.rateLimiter.wait(options.path);

            const { statusCode, headers, body } = await this.makeRequest(options);

            this.rateLimiter.handleRateLimit(options.path, headers);

            const responseText = await decompressResponse(headers, body);
            const data = JSON.parse(responseText);

            if (statusCode === HttpCodes.TooManyRequests) {
                await this.rateLimiter.handleRateLimitResponse(data);
                return await this.request(options);
            }

            if (statusCode >= 200 && statusCode < 300 && !options.disable_cache) {
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
        return this.retryAgent.request({ ...options, path, headers });
    }

    private createDefaultHeaders(): Record<string, string> {
        return {
            Authorization: `${this.options.auth_type ?? "Bot"} ${this.token}`,
            "Content-Type": MimeTypes.Json,
            "Accept-Encoding": "gzip, deflate",
            ...(this.options.user_agent && { "User-Agent": this.options.user_agent }),
        };
    }
}
