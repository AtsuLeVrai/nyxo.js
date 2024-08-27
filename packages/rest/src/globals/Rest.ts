import { Cache } from "@nyxjs/cache";
import { RestHttpResponseCodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import { Pool, RetryAgent } from "undici";
import type { RestEvents, RestOptions, RestRequestOptions } from "../types/globals";
import { API_BASE_URL, DEFAULT_REST_OPTIONS } from "../utils/constants";
import { RateLimiter } from "./RateLimiter";
import { RestRequestHandler } from "./RestRequestHandler";

export class Rest extends EventEmitter<RestEvents> {
	private readonly pool = this.createPool();

	private readonly retryAgent = this.createRetryAgent();

	private readonly cache = new Cache<string, { data: any; expiry: number; }>();

	private readonly requestHandler: RestRequestHandler;

	private readonly rateLimiter = new RateLimiter();

	public constructor(private token: string, private readonly options: RestOptions = {}) {
		super();
		this.options = {
			...DEFAULT_REST_OPTIONS,
			...options,
		};
		this.requestHandler = new RestRequestHandler(token, this.retryAgent, this.cache, this.options);
	}

	public async request<T>(options: RestRequestOptions<T>): Promise<T> {
		try {
			await this.rateLimiter.wait(options.path);
			return await this.requestHandler.handle(options);
		} catch (error) {
			if (error instanceof Error) {
				this.emit("error", error);
			}

			throw new Error("An unknown error occurred.");
		}
	}

	public destroy(): void {
		void this.pool.destroy();
		this.cache.clear();
	}

	public setToken(token: string): void {
		this.token = token;
	}

	public setOption<K extends keyof RestOptions>(key: K, value: RestOptions[K]): void {
		this.options[key] = value;
		if (key === "authType" || key === "userAgent") {
			this.options[key] = value;
		}
	}

	private createPool(): Pool {
		return new Pool(`${API_BASE_URL}/v${this.options.version}`, {
			connections: 100,
			pipelining: 10,
			keepAliveTimeout: 30_000,
			keepAliveMaxTimeout: 30_000,
			allowH2: true,
		});
	}

	private createRetryAgent(): RetryAgent {
		return new RetryAgent(this.pool, {
			retryAfter: true,
			statusCodes: [RestHttpResponseCodes.GatewayUnavailable, RestHttpResponseCodes.TooManyRequests],
			maxRetries: 3,
			retry: (error) => {
				this.emit("error", error);
				return null;
			},
		});
	}
}
