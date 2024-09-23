import { type ApiVersions, type AuthTypes, HttpResponseCodes, type Integer, MimeTypes } from "@nyxjs/core";
import { Store } from "@nyxjs/store";
import type { Dispatcher } from "undici";
import { Pool, RetryAgent } from "undici";
import { DISCORD_API_URL, POOL_OPTIONS, REST_DEFAULT_OPTIONS, RETRY_AGENT_OPTIONS } from "../common/constants";
import { decompressResponse } from "../common/utils";
import type { RestRequestOptions } from "../types";
import { RestError } from "./RestError";
import { RestRateLimiter } from "./RestRateLimiter";

const pool = Symbol("pool");
const retryAgent = Symbol("retryAgent");
const rateLimiter = Symbol("rateLimiter");
const store = Symbol("store");
const token = Symbol("token");
const options = Symbol("options");

export type RestOptions = Readonly<{
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
}>;

export class Rest {
    private readonly [pool]: Pool;

    private readonly [retryAgent]: RetryAgent;

    private readonly [rateLimiter]: RestRateLimiter;

    private readonly [store]: Store<string, { data: any; expiry: number }>;

    private [token]: string;

    private readonly [options]: RestOptions;

    public constructor(initialToken: string, initialOptions: RestOptions = REST_DEFAULT_OPTIONS) {
        this[token] = initialToken;
        this[options] = Object.freeze({ ...REST_DEFAULT_OPTIONS, ...initialOptions });
        this[store] = new Store();
        this[rateLimiter] = new RestRateLimiter();
        this[pool] = new Pool(DISCORD_API_URL, POOL_OPTIONS);
        this[retryAgent] = new RetryAgent(this[pool], RETRY_AGENT_OPTIONS);
    }

    public async destroy(): Promise<void> {
        await this[pool].destroy();
        this[store].clear();
    }

    public setToken(newToken: string): void {
        if (typeof newToken !== "string" || newToken.length === 0) {
            throw new Error("Invalid token");
        }

        this[token] = newToken;
    }

    public async request<T>(request: RestRequestOptions<T>): Promise<T> {
        try {
            const cacheKey = `${request.method}:${request.path}`;

            if (!request.disable_cache) {
                const cachedResponse = this[store].get(cacheKey);
                if (cachedResponse && cachedResponse.expiry > Date.now()) {
                    return cachedResponse.data as T;
                }
            }

            await this[rateLimiter].wait(request.path);

            const { statusCode, headers, body } = await this.makeRequest(request);

            this[rateLimiter].handleRateLimit(request.path, headers);

            const responseText = await decompressResponse(headers, body);
            const data = JSON.parse(responseText);

            if (statusCode === HttpResponseCodes.TooManyRequests) {
                await this[rateLimiter].handleRateLimitResponse(data);
                return await this.request(request);
            }

            if (statusCode >= 200 && statusCode < 300 && !request.disable_cache) {
                this[store].set(cacheKey, {
                    data,
                    expiry: Date.now() + (this[options].cache_life_time ?? 60_000),
                });
            }

            if (statusCode >= 400) {
                throw new RestError(data.message ?? `HTTP error! status: ${statusCode}`, {
                    code: data.code ?? statusCode,
                    method: request.method,
                    path: request.path,
                    httpStatus: statusCode,
                    requestBody: request.body,
                });
            }

            return data as T;
        } catch (error) {
            if (error instanceof RestError) {
                throw error;
            }

            throw new RestError(error instanceof Error ? error.message : String(error), {
                code: 0,
                method: request.method,
                path: request.path,
                httpStatus: HttpResponseCodes.ServerError,
            });
        }
    }

    private async makeRequest<T>(request: RestRequestOptions<T>): Promise<Dispatcher.ResponseData> {
        const path = `/api/v${this[options].version}${request.path}`;
        const headers = { ...this.createDefaultHeaders(), ...request.headers };
        return this[retryAgent].request({ ...request, path, headers });
    }

    private createDefaultHeaders(): Readonly<Record<string, string>> {
        return Object.freeze({
            Authorization: `${this[options].auth_type ?? "Bot"} ${this[token]}`,
            "Content-Type": MimeTypes.Json,
            "Accept-Encoding": "gzip, deflate",
            ...(this[options].user_agent && { "User-Agent": this[options].user_agent }),
        });
    }
}
