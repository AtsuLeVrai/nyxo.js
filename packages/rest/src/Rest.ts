import { EventEmitter } from "eventemitter3";
import { ConnectionManager, RateLimiterManager, RequestManager } from "./managers/index.js";
import type { RestEvents, RestOptions, RouteStructure } from "./types/index.js";

export class Rest extends EventEmitter<RestEvents> {
    readonly #connectionManager: ConnectionManager;
    readonly #requestHandler: RequestManager;
    readonly #rateLimiter: RateLimiterManager;

    constructor(token: string, options: RestOptions) {
        super();
        this.#rateLimiter = new RateLimiterManager();
        this.#connectionManager = new ConnectionManager(options);
        this.#requestHandler = new RequestManager(token, options, this.#rateLimiter, this.#connectionManager, this);
    }

    async manyRequest<T extends readonly RouteStructure<any>[] | []>(
        routes: T
    ): Promise<{ [K in keyof T]: T[K] extends RouteStructure<infer U> ? Awaited<U> : never }> {
        return this.#requestHandler.handleManyRequests(routes);
    }

    async request<T>(route: RouteStructure<T>): Promise<T> {
        return this.#requestHandler.handleRequest(route);
    }
}
