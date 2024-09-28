import { type ApiVersions, type AuthTypes, HttpResponseCodes, type Integer, MimeTypes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import { safeError } from "@nyxjs/utils";
import type { Dispatcher } from "undici";
import { Pool, RetryAgent } from "undici";
import { decompressResponse } from "../helpers/compress";
import { DISCORD_API_URL, POOL_OPTIONS, RETRY_AGENT_OPTIONS } from "../helpers/constants";
import type { RestRequestOptions } from "../types";
import { RestRateLimiter } from "./RestRateLimiter";

export type RestOptions = {
    /**
     * The type of authentication to use.
     */
    auth_type?: AuthTypes;
    /**
     * The time-to-live (in milliseconds) of the cache.
     */
    cache_life_time?: Integer;
    /**
     * The user agent to use.
     */
    user_agent?: string;
    /**
     * The version of the API to use.
     */
    version: ApiVersions;
};

export class Rest {
    readonly #token: string;

    readonly #store: Store<string, { data: any; expiry: number }>;

    readonly #rateLimiter: RestRateLimiter;

    readonly #pool: Pool;

    readonly #retryAgent: RetryAgent;

    readonly #options: RestOptions;

    public constructor(token: string, options: RestOptions) {
        this.#token = token;
        this.#store = new Store();
        this.#rateLimiter = new RestRateLimiter();
        this.#pool = new Pool(DISCORD_API_URL, POOL_OPTIONS);
        this.#retryAgent = new RetryAgent(this.#pool, RETRY_AGENT_OPTIONS);
        this.#options = Object.freeze({ ...options });
    }

    public async destroy(): Promise<void> {
        await this.#pool.destroy();
        this.#store.clear();
    }

    public async request<T>(request: RestRequestOptions<T>): Promise<T> {
        try {
            const cacheKey = `${request.method}:${request.path}`;

            if (!request.disable_cache) {
                const cachedResponse = this.#store.get(cacheKey);
                if (cachedResponse && cachedResponse.expiry > Date.now()) {
                    return cachedResponse.data as T;
                }
            }

            await this.#rateLimiter.wait(request.path);

            const { statusCode, headers, body } = await this.makeRequest(request);

            this.#rateLimiter.handleRateLimit(request.path, headers);

            const responseText = await decompressResponse(headers, body);
            const data = JSON.parse(responseText);

            if (statusCode === HttpResponseCodes.TooManyRequests) {
                await this.#rateLimiter.handleRateLimitResponse(data);
                return await this.request(request);
            }

            if (statusCode >= 200 && statusCode < 300 && !request.disable_cache) {
                this.#store.set(cacheKey, {
                    data,
                    expiry: Date.now() + (this.#options.cache_life_time ?? 60_000),
                });
            }

            if (statusCode >= 400) {
                throw new Error(`[REST] ${statusCode} ${JSON.stringify(data)}`);
            }

            return data as T;
        } catch (error) {
            throw safeError(error);
        }
    }

    private async makeRequest<T>(request: RestRequestOptions<T>): Promise<Dispatcher.ResponseData> {
        const path = `/api/v${this.#options.version}${request.path}`;
        const headers = { ...this.createDefaultHeaders(), ...request.headers };
        return this.#retryAgent.request({ ...request, path, headers });
    }

    private createDefaultHeaders(): Readonly<Record<string, string>> {
        return Object.freeze({
            Authorization: `${this.#options.auth_type ?? "Bot"} ${this.#token}`,
            "Content-Type": MimeTypes.Json,
            "Accept-Encoding": "gzip, deflate",
            ...(this.#options.user_agent && { "User-Agent": this.#options.user_agent }),
        });
    }
}
