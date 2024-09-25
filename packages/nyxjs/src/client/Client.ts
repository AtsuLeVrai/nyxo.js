import type { ApiVersions, GatewayIntents, Integer } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { Gateway } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { restOptions, wsOptions } from "../helpers/utils";

export type ClientOptions = {
    intents: GatewayIntents[] | Integer;
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};

export type ClientEvents = {
    debug: [message: string];
    error: [error: Error];
    warn: [message: string];
};

export class Client extends EventEmitter<ClientEvents> {
    public ws: Gateway;

    public rest: Rest;

    public token!: string;

    public constructor(options: ClientOptions) {
        super();
        this.ws = new Gateway(this.token, wsOptions(options));
        this.rest = new Rest(this.token, restOptions(options));
    }

    public async connect(token: string): Promise<void> {
        try {
            this.token = token;
            this.ws.on("error", (error) => this.emit("error", error));
            this.ws.on("warn", (message) => this.emit("warn", message));
            this.ws.on("debug", (message) => this.emit("debug", message));
            await this.ws.connect();
        } catch (error) {
            await this.destroy();
            if (error instanceof Error) {
                this.emit("error", error);
            }

            this.emit("error", new Error(String(error)));
        }
    }

    public async destroy(): Promise<void> {
        this.ws.disconnect();
        await this.rest.destroy();
        this.removeAllListeners();
    }
}
