import type { ApiVersions, GatewayIntents, Integer } from "@nyxjs/core";
import { BitfieldManager } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { Gateway } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { DEFAULT_API_VERSION, DEFAULT_ENCODING } from "../helpers/constants";

const options = Symbol("options");

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

    public token: string | null;

    private [options]: ClientOptions;

    public constructor(initialOptions: ClientOptions) {
        super();
        this.token = null;
        this[options] = initialOptions;
        this.ws = new Gateway(this.token!, this.createWsOptions());
        this.rest = new Rest(this.token!, this.createRestOptions());
        this.setupEventListeners();
    }

    public async connect(token: string): Promise<void> {
        if (!token || typeof token !== "string") {
            throw new Error("Invalid token provided");
        }

        try {
            this.token = token;
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
        this.token = null;
    }

    private calculateIntents(intents: GatewayIntents[] | Integer): number {
        if (Array.isArray(intents)) {
            return Number(BitfieldManager.from(intents).valueOf());
        } else {
            return intents;
        }
    }

    private createWsOptions(): GatewayOptions {
        return {
            presence: this[options].presence,
            shard: this[options].shard,
            v: this[options].version ?? DEFAULT_API_VERSION,
            intents: this.calculateIntents(this[options].intents),
            encoding: this[options].ws?.encoding ?? DEFAULT_ENCODING,
            compress: this[options].ws?.compress,
            large_threshold: this[options].ws?.large_threshold,
        };
    }

    private createRestOptions(): RestOptions {
        return {
            auth_type: this[options].rest?.auth_type,
            cache_life_time: this[options].rest?.cache_life_time,
            user_agent: this[options].rest?.user_agent,
            version: this[options].version ?? DEFAULT_API_VERSION,
        };
    }

    private setupEventListeners(): void {
        this.ws.on("error", (error) => this.emit("error", error));
        this.ws.on("warn", (message) => this.emit("warn", message));
        this.ws.on("debug", (message) => this.emit("debug", message));
    }
}
