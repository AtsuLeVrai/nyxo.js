import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { Client } from "../client/Client";

export class RestManager extends Rest {
    public constructor(
        private readonly client: Client,
        token: string,
        options?: RestOptions
    ) {
        super(token, options);
    }

    public init(): void {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.on("debug", (message) => this.client.emit("debug", message));
        this.on("error", (error) => this.client.emit("error", error));
        this.on("globalRateLimit", (retryAfter) =>
            this.client.emit("warn", `[REST] Rate limited, retrying in ${retryAfter}ms`)
        );
        this.on("rateLimit", (route, retryAfter) =>
            this.client.emit("warn", `[REST] Rate limited on route ${route}, retrying in ${retryAfter}ms`)
        );
    }
}
