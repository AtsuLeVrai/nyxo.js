import type { ApiVersions, GatewayIntents, Integer } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";

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
    public constructor(options: ClientOptions) {
        super();
    }
}
