import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import { calculateIntents, safeError } from "@nyxjs/utils";
import type { GatewayOptions } from "@nyxjs/ws";
import { EncodingTypes, Gateway } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import type { ClientEvents } from "./ClientEvents";
import { GATEWAY_EVENTS } from "./ClientEvents";

const options = Symbol("options");

export type ClientOptions = {
    intents: GatewayIntents[] | Integer;
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};

export class Client extends EventEmitter<ClientEvents> {
    public token: string | null = null;

    public rest: Rest | null = null;

    public ws: Gateway | null = null;

    private [options]: ClientOptions;

    public constructor(initialOptions: ClientOptions) {
        super();
        this[options] = initialOptions;
    }

    public async login(token: string): Promise<void> {
        try {
            this.token = token;
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
            this.token = null;
            this.rest = null;
            this.ws = null;
        }
    }

    private setupListeners(): void {
        if (!this.ws) {
            return;
        }

        for (const [gatewayEvent, clientEvent] of GATEWAY_EVENTS) {
            this.ws.on("dispatch", (eventName, ...args) => {
                if (eventName === gatewayEvent) {
                    this.emit(clientEvent as keyof ClientEvents, ...(args as ClientEvents[keyof ClientEvents]));
                }
            });
        }

        this.ws.on("debug", (message: string) => this.emit("debug", message));
        this.ws.on("error", (error: Error) => this.emit("error", error));
        this.ws.on("warn", (message: string) => this.emit("warn", message));
        this.ws.on("close", (code: string, reason: string) => this.emit("close", code, reason));
    }

    private createRest(): Rest {
        if (!this.token) {
            throw new Error("No token provided");
        }

        return new Rest(this.token, {
            auth_type: this[options].rest?.auth_type,
            cache_life_time: this[options].rest?.cache_life_time,
            user_agent: this[options].rest?.user_agent,
            version: this[options].version ?? ApiVersions.V10,
        });
    }

    private createWs(): Gateway {
        if (!this.token) {
            throw new Error("No token provided");
        }

        if (!this.rest) {
            throw new Error("No rest client provided");
        }

        return new Gateway(this.token, this.rest, {
            presence: this[options].presence,
            compress: this[options].ws?.compress,
            encoding: this[options].ws?.encoding ?? EncodingTypes.Json,
            shard: this[options].shard,
            intents: calculateIntents(this[options].intents),
            v: this[options].version ?? ApiVersions.V10,
            large_threshold: this[options].ws?.large_threshold,
        });
    }
}
