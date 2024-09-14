import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { EncodingTypes } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { WebSocketManager } from "../managers/WebSocketManager";
import type { ClientEvents } from "../types/ClientEvents";

export type ClientOptions = {
    intents: GatewayIntents[];
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};

export class Client extends EventEmitter<ClientEvents> {
    public ws: WebSocketManager;

    public rest: Rest;

    private defaultVersions = ApiVersions.V10;

    public constructor(
        public token: string,
        private readonly options: ClientOptions
    ) {
        super();
        this.ws = this.createWs();
        this.rest = this.createRest();
    }

    public connect(): void {
        void this.ws.connect();
    }

    private calculateIntents(): Integer {
        return this.options.intents.reduce<Integer>((acc, intent) => acc | intent, 0);
    }

    private createWs(): WebSocketManager {
        return new WebSocketManager(this, this.token, {
            intents: this.calculateIntents(),
            presence: this.options.presence,
            shard: this.options.shard,
            v: this.options.version ?? this.defaultVersions,
            compress: this.options.ws?.compress,
            encoding: this.options.ws?.encoding ?? EncodingTypes.Etf,
            large_threshold: this.options.ws?.large_threshold,
        });
    }

    private createRest(): Rest {
        return new Rest(this.token, {
            version: this.options.version ?? this.defaultVersions,
            cache_life_time: this.options.rest?.cache_life_time,
            user_agent: this.options.rest?.user_agent,
            auth_type: this.options.rest?.auth_type,
        });
    }
}
