import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions } from "@nyxjs/core";
import { EncodingTypes } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { BitFieldManager } from "../managers/BitFieldManager";
import { RestManager } from "../managers/RestManager";
import { WebSocketManager } from "../managers/WebSocketManager";
import type { ClientOptions } from "../types/Client";
import type { ClientEvents } from "../types/ClientEvents";

export class BaseClient extends EventEmitter<ClientEvents> {
    public ws: WebSocketManager;

    public rest: RestManager;

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
        this.rest.init();
        this.ws.init();
    }

    private calculateIntents(): Integer {
        return Number(BitFieldManager.resolve<GatewayIntents>(this.options.intents));
    }

    private createWs(): WebSocketManager {
        return new WebSocketManager(this, this.token, {
            intents: this.calculateIntents(),
            presence: this.options.presence,
            shard: this.options.shard,
            v: this.options.version ?? this.defaultVersions,
            compress: this.options.ws?.compress,
            encoding: this.options.ws?.encoding ?? EncodingTypes.Json,
            large_threshold: this.options.ws?.large_threshold,
        });
    }

    private createRest(): RestManager {
        return new RestManager(this, this.token, {
            version: this.options.version ?? this.defaultVersions,
            cache_life_time: this.options.rest?.cache_life_time,
            user_agent: this.options.rest?.user_agent,
            auth_type: this.options.rest?.auth_type,
        });
    }
}
