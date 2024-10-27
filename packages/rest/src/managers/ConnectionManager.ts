import { RestHttpResponseCodes, RestJsonErrorCodes } from "@nyxjs/core";
import { Pool, RetryAgent, type RetryHandler } from "undici";
import { RestMethods, type RestOptions } from "../types/index.js";

export class ConnectionManager {
    readonly #pool: Pool;
    readonly #retryAgent: RetryAgent;

    constructor(options: RestOptions) {
        this.#pool = this.#initializePool();
        this.#retryAgent = this.#initializeRetryAgent(options);
    }

    get retryAgent(): RetryAgent {
        return this.#retryAgent;
    }

    #initializePool(): Pool {
        const options: Pool.Options = {
            connections: 20,
            pipelining: 10,
            keepAliveTimeout: 30e3,
            keepAliveMaxTimeout: 300e3,
            bodyTimeout: 20e3,
            headersTimeout: 20e3,
            maxHeaderSize: 16_384,
            allowH2: true,
            maxConcurrentStreams: 200,
            connectTimeout: 15e3,
        };

        return new Pool("https://discord.com", options);
    }

    #initializeRetryAgent(options: RestOptions): RetryAgent {
        if (!this.#pool) {
            throw new Error("Pool not initialized.");
        }

        const retryOptions: RetryHandler.RetryOptions = {
            maxRetries: options.max_retries,
            minTimeout: 500,
            maxTimeout: 30_000,
            timeoutFactor: 1.5,
            retryAfter: true,
            methods: Object.values(RestMethods),
            statusCodes: Object.values(RestHttpResponseCodes).map(Number),
            errorCodes: Object.values(RestJsonErrorCodes).map(String),
        };

        return new RetryAgent(this.#pool, retryOptions);
    }
}
