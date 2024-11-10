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
        this.#requestHandler = new RequestManager(token, options, this.#rateLimiter, this.#connectionManager);

        this.#setupEventListeners();
    }

    manyRequest<T extends readonly RouteStructure<unknown>[] | []>(
        routes: T,
    ): Promise<{ [K in keyof T]: T[K] extends RouteStructure<infer U> ? Awaited<U> : never }> {
        return this.#requestHandler.handleManyRequests(routes);
    }

    request<T>(route: RouteStructure<T>): Promise<T> {
        return this.#requestHandler.handleRequest(route);
    }

    #setupEventListeners(): void {
        this.#requestHandler.on("rateLimit", (route) => this.emit("rateLimit", route));
        this.#requestHandler.on("error", (error) => this.emit("error", error));
        this.#requestHandler.on("debug", (message) => this.emit("debug", message));
        this.#requestHandler.on("warn", (message) => this.emit("warn", message));
    }
}
