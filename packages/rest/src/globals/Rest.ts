import { URL } from "node:url";
import { RestHttpResponseCodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import { Pool, RetryAgent } from "undici";
import type { RestEvents, RestOptions, RestRequestOptions } from "../types/globals";
import { API_BASE_URL, DEFAULT_REST_OPTIONS } from "../utils/constants";
import { RestRateLimiter } from "./RestRateLimiter";
import { RestRequestHandler } from "./RestRequestHandler";

export class Rest extends EventEmitter<RestEvents> {
    private readonly pool: Pool;

    private readonly retryAgent: RetryAgent;

    private readonly requestHandler: RestRequestHandler;

    private readonly rateLimiter: RestRateLimiter;

    public constructor(
        private token: string,
        private readonly options: RestOptions = {}
    ) {
        super();
        this.options = {
            ...DEFAULT_REST_OPTIONS,
            ...options,
        };
        this.emit("debug", `[REST] Initializing Rest with options: ${JSON.stringify(this.options)}`);

        this.pool = this.createPool();
        this.retryAgent = this.createRetryAgent();
        this.rateLimiter = new RestRateLimiter();
        this.requestHandler = new RestRequestHandler(this.token, this, this.retryAgent, this.options);
    }

    public async request<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            await this.rateLimiter.wait(options.path);
            return await this.requestHandler.handle(options);
        } catch (error) {
            if (error instanceof Error) {
                this.emit("error", new Error(`[REST] Error during request: ${error.message}`));
            }

            throw error;
        }
    }

    public async destroy(): Promise<void> {
        await this.pool.destroy();
        this.requestHandler.destroy();
        this.emit("debug", "[REST] Rest instance destroyed");
    }

    public setToken(token: string): void {
        this.token = token;
        this.requestHandler.updateToken(token);
        this.emit("debug", "[REST] Token updated");
    }

    public setOption<K extends keyof RestOptions>(key: K, value: RestOptions[K]): void {
        this.options[key] = value;
        if (key === "auth_type" || key === "user_agent") {
            this.options[key] = value;
        }

        this.emit("debug", `[REST] Option ${key} updated`);
    }

    private createPool(): Pool {
        const baseUrl = new URL(API_BASE_URL);
        const protocol = baseUrl.protocol;
        const hostname = baseUrl.hostname;
        const port = baseUrl.port || (protocol === "https:" ? "443" : "80");
        const origin = `${protocol}//${hostname}:${port}`;

        this.emit("debug", `[REST] Creating pool with origin: ${origin}, base URL: ${baseUrl.origin}`);

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
                this.emit("error", new Error(`[REST] Error creating Pool: ${error.message}`));
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
                this.emit("error", new Error(`[REST] ${error.message}`));
                return null;
            },
        });
    }
}
