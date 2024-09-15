import { URL } from "node:url";
import { RestHttpResponseCodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import { Pool, RetryAgent } from "undici";
import { API_BASE_URL, DEFAULT_REST_OPTIONS } from "../libs/constants";
import type { RestEvents, RestOptions, RestRequestOptions } from "../types/rest";
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
        this.rateLimiter = new RestRateLimiter(this);
        this.requestHandler = new RestRequestHandler(this.token, this, this.retryAgent, this.options);
    }

    public async request<T>(options: RestRequestOptions<T>): Promise<T> {
        try {
            return await this.requestHandler.handle(options);
        } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
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
        this.emit("debug", `[REST] Option ${key} updated`);
        if (key === "auth_type" || key === "user_agent") {
            this.requestHandler.updateHeaders();
        }
    }

    private createPool(): Pool {
        const { protocol, hostname, port } = new URL(API_BASE_URL);
        const origin = `${protocol}//${hostname}:${port || (protocol === "https:" ? "443" : "80")}`;

        this.emit("debug", `[REST] Creating pool with origin: ${origin}`);

        try {
            return new Pool(origin, {
                connections: 100,
                pipelining: 10,
                keepAliveTimeout: 30_000,
                keepAliveMaxTimeout: 30_000,
                allowH2: false,
            });
        } catch (error) {
            throw new Error(`[REST] Failed to create pool: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private createRetryAgent(): RetryAgent {
        return new RetryAgent(this.pool, {
            retryAfter: true,
            statusCodes: [RestHttpResponseCodes.GatewayUnavailable, RestHttpResponseCodes.TooManyRequests],
            maxRetries: 3,
            retry: (error) => {
                throw new Error(`[REST] Retry failed: ${error.message}`);
            },
        });
    }
}
