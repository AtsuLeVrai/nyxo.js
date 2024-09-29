import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import { calculateIntents, safeError } from "@nyxjs/utils";
import type { GatewayOptions } from "@nyxjs/ws";
import { EncodingTypes, WebSocketManager } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import type { ClientEvents } from "./ClientEvents";
import { GATEWAY_EVENTS } from "./ClientEvents";

export type ClientOptions = {
    intents: GatewayIntents[] | Integer;
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};

export class Client extends EventEmitter<ClientEvents> {
    public rest: Rest | null = null;

    public ws: WebSocketManager | null = null;

    readonly #options: ClientOptions;

    public constructor(
        public token: string,
        options: ClientOptions
    ) {
        super();
        this.#options = options;
    }

    public async login(): Promise<void> {
        try {
            this.rest = this.createRest();
            this.ws = this.createWs();
            this.setupListeners();
            await this.ws.connect();
        } catch (error) {
            this.emit("error", safeError(error));
        }
    }

    public async destroy(): Promise<void> {
        try {
            this.removeAllListeners();
            this.ws?.disconnect();
            await this.rest?.destroy();
        } catch (error) {
            this.emit("error", safeError(error));
        } finally {
            this.rest = null;
            this.ws = null;
        }
    }

    private setupListeners(): void {
        if (!this.ws) {
            return;
        }

        this.ws.on("dispatch", (eventName, ...args) => {
            for (const [gatewayEvent, clientEvent] of GATEWAY_EVENTS) {
                if (eventName === gatewayEvent) {
                    this.emit(clientEvent as keyof ClientEvents, ...(args as ClientEvents[keyof ClientEvents]));
                }
            }
        });

        this.ws.on("debug", (message) => this.emit("debug", message));
        this.ws.on("error", (error) => this.emit("error", error));
        this.ws.on("warn", (message) => this.emit("warn", message));
        this.ws.on("close", (code, reason) => this.emit("close", code, reason));
    }

    private createRest(): Rest {
        return new Rest(this.token, {
            auth_type: this.#options.rest?.auth_type,
            cache_life_time: this.#options.rest?.cache_life_time,
            user_agent: this.#options.rest?.user_agent,
            version: this.#options.version ?? ApiVersions.V10,
        });
    }

    private createWs(): WebSocketManager {
        if (!this.rest) {
            throw new Error("No rest client provided");
        }

        return new WebSocketManager(this.token, this.rest, {
            presence: this.#options.presence,
            compress: this.#options.ws?.compress,
            encoding: this.#options.ws?.encoding ?? EncodingTypes.Json,
            shard: this.#options.shard,
            intents: calculateIntents(this.#options.intents),
            v: this.#options.version ?? ApiVersions.V10,
            large_threshold: this.#options.ws?.large_threshold,
        });
    }
}
