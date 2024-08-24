import { setTimeout } from "node:timers";
import { Cache } from "@nyxjs/cache";
import type { Float } from "@nyxjs/core";
import { ApiVersions, RestHttpResponseCodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { Pool, RetryAgent } from "undici";
import { getRandomUserAgent } from "./agents";
import type { AuthTypes, DiscordHeaders } from "./headers";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export type RateLimitResponseStructure = {
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

/**
 * Options for configuring the Rest client.
 */
export type RestOptions = {
	/**
	 * The type of authentication to use (e.g., Bot, Bearer).
	 */
	authType?: AuthTypes;
	/**
	 * The User-Agent string to use for requests.
	 */
	userAgent?: string;
	/**
	 * The API version to use for requests.
	 */
	version?: ApiVersions;
};

/**
 * Events emitted by the Rest client.
 */
export type RestEvents = {
	/**
	 * Emitted for debugging purposes.
	 *
	 * @param message - The debug message.
	 */
	debug: [message: string];
	/**
	 * Emitted when an error occurs.
	 *
	 * @param error - The error that occurred.
	 */
	error: [error: Error];
	/**
	 * Emitted when a global rate limit is encountered.
	 *
	 * @param retryAfter - The number of seconds to wait before retrying.
	 */
	globalRateLimit: [retryAfter: Float];
	/**
	 * Emitted when a rate limit is encountered.
	 *
	 * @param retryAfter - The number of seconds to wait before retrying.
	 */
	rateLimit: [retryAfter: Float];
};

/**
 * Options for making a request with the Rest client.
 *
 * @template T - The type of the response data.
 */
export type RestRequestOptions<T> = Omit<Dispatcher.DispatchOptions, "headers"> & {
	/**
	 * Headers to include in the request.
	 */
	headers?: DiscordHeaders;
	/**
	 * The type of the response data.
	 */
	readonly type?: T;
};

export class Rest extends EventEmitter<RestEvents> {
	private readonly retryAgent = new RetryAgent(this.pool, {
		retryAfter: true,
		statusCodes: [RestHttpResponseCodes.GatewayUnavailable, RestHttpResponseCodes.TooManyRequests],
		maxRetries: 3,
		retry: (error) => {
			this.emit("error", error);
			return null;
		},
	});

	private cache = new Cache<string, { data: any; expiry: number; }>();

	public constructor(private token: string, private readonly options?: RestOptions) {
		super();
	}

	private get pool(): Pool {
		const version = this.options?.version ?? ApiVersions.V10;
		return new Pool(`https://discord.com/api/v${version}`, {
			connections: 100,
			pipelining: 10,
			keepAliveTimeout: 30_000,
			keepAliveMaxTimeout: 30_000,
			allowH2: true,
		});
	}

	public async request<T>(options: RestRequestOptions<T>): Promise<T> {
		const cacheKey = `${options.method}:${options.path}`;
		const cachedResponse = this.cache.get(cacheKey);
		if (cachedResponse && cachedResponse.expiry > Date.now()) {
			return cachedResponse.data as T;
		}

		const headers = {
			Authorization: `${this.options?.authType ?? "Bot"} ${this.token}`,
			"Content-Type": "application/json",
			"User-Agent": this.options?.userAgent ?? getRandomUserAgent(),
			"Accept-Encoding": "gzip, deflate",
		};

		try {
			const response = await this.retryAgent.request({
				path: options.path,
				method: options.method,
				body: options.body,
				query: options.query,
				headers: {
					...headers,
					...options.headers,
				},
			});

			const data = await response.body.json();

			if (response.statusCode === RestHttpResponseCodes.TooManyRequests) {
				await this.handleRateLimit(data as RateLimitResponseStructure);
				return await this.request(options);
			}

			if (response.statusCode >= 200 && response.statusCode < 300) {
				this.cache.set(cacheKey, {
					data,
					expiry: Date.now() + 60_000,
				});
			}

			return data as T;
		} catch (error) {
			this.emit("error", error as Error);
			throw error;
		}
	}

	public destroy(): void {
		void this.pool.destroy();
	}

	public setToken(token: string): void {
		this.token = token;
	}

	public setVersion(version: ApiVersions): void {
		if (this.options) {
			this.options.version = version;
		}
	}

	public setUserAgent(userAgent: string): void {
		if (this.options) {
			this.options.userAgent = userAgent;
		}
	}

	public setAuthType(authType: AuthTypes): void {
		if (this.options) {
			this.options.authType = authType;
		}
	}

	private async handleRateLimit(response: RateLimitResponseStructure): Promise<void> {
		if (response.global) {
			this.emit("globalRateLimit", response.retry_after);
		} else {
			this.emit("rateLimit", response.retry_after);
		}

		await new Promise((resolve) => {
			setTimeout(resolve, response.retry_after);
		});
	}
}
