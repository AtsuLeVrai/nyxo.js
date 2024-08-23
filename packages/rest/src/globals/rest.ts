import { setTimeout } from "node:timers";
import type { Float } from "@nyxjs/core";
import { ApiVersions, RestHttpResponseCodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import type { Dispatcher } from "undici";
import { Client } from "undici";
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

export type RestOptions = {
	authType?: AuthTypes;
	userAgent?: string;
	version?: ApiVersions;
};

export type RestEvents = {
	debug: [message: string];
	error: [error: Error];
	globalRateLimit: [retryAfter: Float];
	rateLimit: [retryAfter: Float];
};

export type RestRequestOptions<T> = Omit<Dispatcher.DispatchOptions, "headers"> & {
	headers?: DiscordHeaders;
};

export class Rest extends EventEmitter<RestEvents> {
	public constructor(private token: string, private readonly options?: RestOptions) {
		super();
	}

	private get client(): Client {
		const version = this.options?.version ?? ApiVersions.V10;
		return new Client(`https://discord.com/api/v${version}`);
	}

	public async request<T>(options: RestRequestOptions<T>): Promise<T> {
		const headers: DiscordHeaders = {
			Authorization: `${this.options?.authType ?? "Bot"} ${this.token}`,
			"Content-Type": "application/json",
			"User-Agent": this.options?.userAgent ?? getRandomUserAgent(),
		};

		const response = await this.client.request({
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
			return this.request(options);
		}

		return data as T;
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
