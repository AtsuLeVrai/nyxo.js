import type { ApiVersions, DiscordHeaders, JSONErrorCodes } from "@lunajs/core";
import EventEmitter from "eventemitter3";
import type { Dispatcher } from "undici";
import { request } from "undici";

export type RestRequestOptions<T> = Dispatcher.DispatchOptions & {
	headers?: DiscordHeaders;
	type?: T;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export type RateLimitResponse = {
	/**
	 * An error code for some limits
	 */
	code?: JSONErrorCodes;
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
	retry_after: number;
};

export class REST extends EventEmitter {
	public constructor(public token: string, public options?: {
		version: ApiVersions;
	}) {
		super();
	}

	public get url(): string {
		return `https://discord.com/api/v${this.options?.version ?? 10}`;
	}

	public async request<T>(option: RestRequestOptions<T>): Promise<T> {
		const headers: RestRequestOptions<T>["headers"] = {
			Authorization: `Bot ${this.token}`,
			"Content-Type": "application/json",
		};

		try {
			const response = await request(`${this.url}${option.path}`, {
				headers: {
					...headers,
					...option.headers,
				},
				...Object.fromEntries(Object.entries(option).filter(([key]) => !["path", "headers"].includes(key))),
			});

			return await response.body.json() as T;
		} catch (error) {
			if (error instanceof Error) {
				this.emit("ERROR", error);
				throw error;
			} else {
				const newError = new Error(`Error making request: ${error}`);
				this.emit("ERROR", newError);
				throw newError;
			}
		}
	}
}
