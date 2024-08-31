import { Buffer } from "node:buffer";
import type { Cache } from "@nyxjs/cache";
import type { Integer } from "@nyxjs/core";
import { RestHttpResponseCodes } from "@nyxjs/core";
import { Gunzip } from "minizlib";
import type { RetryAgent } from "undici";
import type { RateLimitResponseStructure, RestOptions, RestRequestOptions } from "../types/globals";
import { getRandomUserAgent } from "../utils/agents";
import { RateLimiter } from "./RateLimiter";
import type { Rest } from "./Rest";

export class RestRequestHandler {
	private defaultHeaders: Record<string, string>;

	private readonly rateLimiter: RateLimiter;

	public constructor(
		private token: string,
		private readonly rest: Rest,
		private readonly retryAgent: RetryAgent,
		private readonly cache: Cache<
		string,
		{
			data: any;
			expiry: Integer;
		}
		>,
		private readonly options: RestOptions = {},
	) {
		this.defaultHeaders = this.createDefaultHeaders();
		this.rateLimiter = new RateLimiter();
		this.rest.emit("debug", `[REST] RestRequestHandler initialized with options: ${JSON.stringify(this.options)}`);
	}

	public async handle<T>(options: RestRequestOptions<T>): Promise<T> {
		try {
			const cacheKey = `${options.method}:${options.path}`;

			if (!options.disableCache) {
				const cachedResponse = this.cache.get(cacheKey);
				if (cachedResponse && cachedResponse.expiry > Date.now()) {
					this.rest.emit("debug", `[REST] Returning cached response for: ${cacheKey}`);
					return cachedResponse.data as T;
				}
			}

			await this.rateLimiter.wait(options.path);

			const path = `/api/v${this.options.version ?? 10}${options.path}`;
			const headers = {
				...this.defaultHeaders,
				...options.headers,
			};

			this.rest.emit("debug", `[REST] Making request to: ${path}`);
			this.rest.emit("debug", `[REST] Request headers: ${JSON.stringify(headers)}`);

			const response = await this.retryAgent.request({
				path,
				method: options.method,
				body: options.body,
				query: options.query,
				headers,
			});

			this.rest.emit("debug", `[REST] Response status: ${response.statusCode}`);
			this.rest.emit("debug", `[REST] Response headers: ${JSON.stringify(response.headers)}`);

			this.rateLimiter.handleRateLimit(options.path, response.headers);

			const responseText = await this.decompressResponse(response);
			this.rest.emit("debug", `[REST] Raw response: ${responseText}`);

			const data = this.parseResponse(responseText);
			this.rest.emit("debug", `[REST] Parsed response data: ${JSON.stringify(data)}`);

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

			if (response.statusCode >= 400) {
				throw new Error(`[REST] HTTP error! status: ${response.statusCode}, body: ${JSON.stringify(data)}`);
			}

			return data as T;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			} else {
				throw new TypeError("[REST] An unknown error occurred.");
			}
		}
	}

	public updateToken(token: string): void {
		this.token = token;
		this.updateHeaders();
		this.rest.emit("debug", "[REST] Token updated in RestRequestHandler");
	}

	public updateHeaders(): void {
		this.defaultHeaders = this.createDefaultHeaders();
		this.rest.emit("debug", "[REST] Default headers updated in RestRequestHandler");
	}

	private async decompressResponse(response: any): Promise<string> {
		const responseBuffer = await response.body.arrayBuffer();

		if (response.headers["content-encoding"] === "gzip") {
			const gunzip = new Gunzip({ level: 9 });
			const chunks: Buffer[] = [];

			gunzip.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

			await new Promise<void>((resolve, reject) => {
				gunzip.on("end", resolve);
				gunzip.on("error", reject);
				gunzip.end(Buffer.from(responseBuffer));
			});

			return Buffer.concat(chunks).toString("utf8");
		} else {
			return Buffer.from(responseBuffer).toString("utf8");
		}
	}

	private parseResponse(responseText: string): any {
		try {
			return responseText ? JSON.parse(responseText) : null;
		} catch (error) {
			if (error instanceof Error) {
				this.rest.emit("error", new Error(`[REST] Error parsing JSON: ${error.message}`));
			}

			throw error;
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
