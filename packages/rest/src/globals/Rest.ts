import { URL } from "node:url";
import { Emitsy } from "@3tatsu/emitsy";
import { Cache } from "@nyxjs/cache";
import { RestHttpResponseCodes } from "@nyxjs/core";
import { Pool, RetryAgent } from "undici";
import type { RestEvents, RestOptions, RestRequestOptions } from "../types/globals";
import { API_BASE_URL, DEFAULT_REST_OPTIONS } from "../utils/constants";
import { RateLimiter } from "./RateLimiter";
import { RestRequestHandler } from "./RestRequestHandler";

export class Rest extends Emitsy<RestEvents> {
    private readonly pool: Pool;

    private readonly retryAgent: RetryAgent;

    private readonly cache: Cache<string, { data: any; expiry: number }>;

    private readonly requestHandler: RestRequestHandler;

    private readonly rateLimiter: RateLimiter;

    public constructor(
        private token: string,
        private readonly options: RestOptions = {}
    ) {
        super();
        this.options = {
            ...DEFAULT_REST_OPTIONS,
            ...options,
        };
        void this.emit("debug", `[REST] Initializing Rest with options: ${JSON.stringify(this.options)}`);

        this.cache = new Cache<string, { data: any; expiry: number }>();
        this.rateLimiter = new RateLimiter();

        try {
            this.pool = this.createPool();
            this.retryAgent = this.createRetryAgent();
            this.requestHandler = new RestRequestHandler(this.token, this, this.retryAgent, this.cache, this.options);
        } catch (error) {
            if (error instanceof Error) {
                void this.emit("error", new Error(`[REST] Error during initialization: ${error.message}`));
            }

            throw error;
        }
    }

    public async request<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            await this.rateLimiter.wait(options.path);
            return await this.requestHandler.handle(options);
        } catch (error) {
            if (error instanceof Error) {
                void this.emit("error", new Error(`[REST] Error during request: ${error.message}`));
            }

            throw error;
        }
    }

    public async destroy(): Promise<void> {
        await this.pool.destroy();
        this.cache.clear();
        void this.emit("debug", "[REST] Rest instance destroyed");
    }

    public setToken(token: string): void {
        this.token = token;
        this.requestHandler.updateToken(token);
        void this.emit("debug", "[REST] Token updated");
    }

    public setOption<K extends keyof RestOptions>(key: K, value: RestOptions[K]): void {
        this.options[key] = value;
        if (key === "auth_type" || key === "user_agent") {
            this.options[key] = value;
        }

        void this.emit("debug", `[REST] Option ${key} updated`);
    }

    private createPool(): Pool {
        const baseUrl = new URL(API_BASE_URL);
        const protocol = baseUrl.protocol;
        const hostname = baseUrl.hostname;
        const port = baseUrl.port || (protocol === "https:" ? "443" : "80");
        const origin = `${protocol}//${hostname}:${port}`;

        void this.emit("debug", `[REST] Creating pool with origin: ${origin}, base URL: ${baseUrl.origin}`);

        try {
            return new Pool(origin, {
                connections: 100,
                pipelining: 10,
                keepAliveTimeout: 30_000,
                keepAliveMaxTimeout: 30_000,
                allowH2: true,
            });
        } catch (error) {
            if (error instanceof Error) {
                void this.emit("error", new Error(`[REST] Error creating Pool: ${error.message}`));
            }

            throw error;
        }
    }

    private createRetryAgent(): RetryAgent {
        return new RetryAgent(this.pool, {
            retryAfter: true,
            statusCodes: [RestHttpResponseCodes.GatewayUnavailable, RestHttpResponseCodes.TooManyRequests],
            maxRetries: 3,
            retry: (error) => {
                void this.emit("error", new Error(`[REST] ${error.message}`));
                return null;
            },
        });
    }
}
