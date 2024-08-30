import type { Cache } from "@nyxjs/cache";
import type { Integer } from "@nyxjs/core";
import { RestHttpResponseCodes } from "@nyxjs/core";
import type { RetryAgent } from "undici";
import type { RateLimitResponseStructure, RestOptions, RestRequestOptions } from "../types/globals";
import { getRandomUserAgent } from "../utils/agents";
import { RateLimiter } from "./RateLimiter";

export class RestRequestHandler {
	private readonly defaultHeaders = this.createDefaultHeaders();

	private readonly rateLimiter = new RateLimiter();

	public constructor(private readonly token: string, private readonly retryAgent: RetryAgent, private readonly cache: Cache<string, {
		data: any;
		expiry: Integer;
	}>, private readonly options: RestOptions = {}) {}

	public async handle<T>(options: RestRequestOptions<T>): Promise<T> {
		try {
			const cacheKey = `${options.method}:${options.path}`;

			if (!options.disableCache) {
				const cachedResponse = this.cache.get(cacheKey);
				if (cachedResponse && cachedResponse.expiry > Date.now()) {
					return cachedResponse.data as T;
				}
			}

			await this.rateLimiter.wait(options.path);

			const response = await this.retryAgent.request({
				...options,
				headers: {
					...this.defaultHeaders,
					...options.headers,
				},
			});

			this.rateLimiter.handleRateLimit(options.path, response.headers);

			const data = await response.body.json();

			if (response.statusCode === RestHttpResponseCodes.TooManyRequests) {
				const rateLimitData = data as RateLimitResponseStructure;
				await this.rateLimiter.handleRateLimitResponse(rateLimitData);
				return await this.handle(options);
			}

			if (response.statusCode >= 200 && response.statusCode < 300 && !options.disableCache) {
				this.cache.set(cacheKey, {
					data,
					expiry: Date.now() + (this.options.cache_life_time ?? 60_000),
				});
			}

			return data as T;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			} else {
				throw new TypeError("An unknown error occurred.");
			}
		}
	}

	private createDefaultHeaders(): Record<string, string> {
		return {
			Authorization: `${this.options.auth_type ?? "Bot"} ${this.token}`,
			"Content-Type": "application/json",
			"User-Agent": this.options.user_agent ?? getRandomUserAgent(),
			"Accept-Encoding": "gzip, deflate",
		};
	}
}
