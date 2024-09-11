import { Buffer } from "node:buffer";
import { Cache } from "@nyxjs/cache";
import { ContentTypes, RestHttpResponseCodes } from "@nyxjs/core";
import { Gunzip } from "minizlib";
import type { RetryAgent } from "undici";
import type { RateLimitResponseStructure, RestOptions, RestRequestOptions } from "../types/globals";
import type { Rest } from "./Rest";
import { RestRateLimiter } from "./RestRateLimiter";

export class RestRequestHandler {
    private defaultHeaders: Record<string, string>;

    private readonly rateLimiter: RestRateLimiter;

    private readonly cache: Cache<string, { data: any; expiry: number }>;

    public constructor(
        private token: string,
        private readonly rest: Rest,
        private readonly retryAgent: RetryAgent,
        private readonly options: RestOptions = {}
    ) {
        this.defaultHeaders = this.createDefaultHeaders();
        this.rateLimiter = new RestRateLimiter();
        this.cache = new Cache<string, { data: any; expiry: number }>();
        this.rest.emit("debug", `[REST] RestRequestHandler initialized with options: ${JSON.stringify(this.options)}`);
    }

    public async handle<T>(options: RestRequestOptions<T>): Promise<T> {
        const cacheKey = `${options.method}:${options.path}`;

        if (!options.disableCache) {
            const cachedResponse = this.cache.get(cacheKey);
            if (cachedResponse && cachedResponse.expiry > Date.now()) {
                this.rest.emit("debug", `[REST] Returning cached response for: ${cacheKey}`);
                return cachedResponse.data as T;
            }
        }

        await this.rateLimiter.wait(options.path);

        const { statusCode, headers, body } = await this.makeRequest(options);

        this.rateLimiter.handleRateLimit(options.path, headers);

        const responseText = await this.decompressResponse(headers, body);
        this.rest.emit("debug", `[REST] Raw response: ${responseText}`);

        const data = this.parseResponse(responseText);
        this.rest.emit("debug", `[REST] Parsed response data: ${JSON.stringify(data)}`);

        if (statusCode === RestHttpResponseCodes.TooManyRequests) {
            await this.rateLimiter.handleRateLimitResponse(data as RateLimitResponseStructure);
            return this.handle(options);
        }

        if (statusCode >= 200 && statusCode < 300 && !options.disableCache) {
            this.cache.set(cacheKey, {
                data,
                expiry: Date.now() + (this.options.cache_life_time ?? 60_000),
            });
        }

        if (statusCode >= 400) {
            throw new Error(`[REST] HTTP error! status: ${statusCode}, body: ${JSON.stringify(data)}`);
        }

        return data as T;
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

    public destroy(): void {
        this.cache.clear();
        this.rest.emit("debug", "[REST] RestRequestHandler destroyed");
    }

    private async makeRequest(options: RestRequestOptions<any>) {
        const path = `/api/v${this.options.version ?? 10}${options.path}`;
        const headers = { ...this.defaultHeaders, ...options.headers };

        this.rest.emit("debug", `[REST] Making request to: ${path}`);
        this.rest.emit("debug", `[REST] Request headers: ${JSON.stringify(headers)}`);

        return this.retryAgent.request({
            path,
            method: options.method,
            body: options.body,
            query: options.query,
            headers,
        });
    }

    private async decompressResponse(headers: any, body: any): Promise<string> {
        const responseBuffer = await body.arrayBuffer();

        if (headers["content-encoding"] === "gzip") {
            return new Promise((resolve, reject) => {
                const gunzip = new Gunzip({ level: 9 });
                const chunks: Buffer[] = [];

                gunzip.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
                gunzip.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
                gunzip.on("error", reject);
                gunzip.end(Buffer.from(responseBuffer));
            });
        }

        return Buffer.from(responseBuffer).toString("utf8");
    }

    private parseResponse(responseText: string): any {
        try {
            return responseText ? JSON.parse(responseText) : null;
        } catch (error) {
            this.rest.emit("error", error instanceof Error ? error : new Error("[REST] Error parsing JSON"));
            throw error;
        }
    }

    private createDefaultHeaders(): Record<string, string> {
        return {
            Authorization: `${this.options.auth_type ?? "Bot"} ${this.token}`,
            "Content-Type": ContentTypes.Json,
            "Accept-Encoding": "gzip, deflate",
            ...(this.options.user_agent && { "User-Agent": this.options.user_agent }),
        };
    }
}
