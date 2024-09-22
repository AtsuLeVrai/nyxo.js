import type { GatewayOptions } from "@nyxjs/ws";
import { Gateway } from "@nyxjs/ws";
import type { Client } from "../client/Client";

export class WebSocketManager extends Gateway {
    public constructor(
        private readonly client: Client,
        token: string,
        options: GatewayOptions
    ) {
        super(token, options);
        this.init();
    }

    private init(): void {
        this.on("warn", (message) => this.client.emit("warn", message));
        this.on("error", (error) => this.client.emit("error", error));
        this.on("debug", (message) => this.client.emit("debug", message));
    }
}
