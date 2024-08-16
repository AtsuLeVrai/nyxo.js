import { setTimeout } from "node:timers";
import type { Float, RESTJSONErrorCodes } from "@nyxjs/core";
import { ApiVersions, RESTHTTPResponseCodes } from "@nyxjs/core";
import Emittery from "emittery";
import type { Dispatcher } from "undici";
import { request } from "undici";
import type { AuthTypes, DiscordHeaders } from "./headers";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export type RateLimitResponseStructure = {
	/**
	 * An error code for some limits
	 */
	code?: RESTJSONErrorCodes;
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
	debug: string;
	error: Error;
	globalRateLimit: Float;
	rateLimit: Float;
};

export type RestRequestOptions<T> = Dispatcher.DispatchOptions & {
	T?: T;
	headers?: DiscordHeaders;
};

export class Rest extends Emittery<RestEvents> {
	public constructor(public token: string, public options?: RestOptions) {
		super();
	}

	public get url(): string {
		const version = this.options?.version ?? ApiVersions.V10;
		return `https://discord.com/api/v${version}`;
	}

	public async request<T>(options: RestRequestOptions<T>): Promise<T> {
		const headers: DiscordHeaders = {
			Authorization: `${this.options?.authType ?? "Bot"} ${this.token}`,
			"Content-Type": "application/json",
			"User-Agent": this.options?.userAgent ?? "DiscordBot ()",
		};

		const finalOptions: Dispatcher.DispatchOptions = {
			method: options.method,
			path: `${this.url}${options.path}`,
			headers: {
				...headers,
				...options.headers,
			},
			...Object.fromEntries(Object.entries(options).filter(([key]) => !["method", "path", "headers"].includes(key))),
		};

		const response = await request(finalOptions);
		const data = await response.body.json();

		if (response.statusCode === RESTHTTPResponseCodes.TooManyRequests) {
			await this.handleRateLimit(data as RateLimitResponseStructure);
			return this.request(options);
		}

		return data as T;
	}

	private async handleRateLimit(response: RateLimitResponseStructure): Promise<void> {
		if (response.global) {
			await this.emit("globalRateLimit", response.retry_after);
		} else {
			await this.emit("rateLimit", response.retry_after);
		}

		await new Promise((resolve) => {
			setTimeout(resolve, response.retry_after);
		});
	}
}
