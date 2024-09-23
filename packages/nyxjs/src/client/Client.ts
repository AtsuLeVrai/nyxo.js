import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions, BitfieldManager } from "@nyxjs/core";
import { Rest } from "@nyxjs/rest";
import { EncodingTypes } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { WebSocketManager } from "../managers/WebSocketManager";
import type { ClientOptions } from "../types/Client";
import type { ClientEvents } from "../types/ClientEvents";

export class Client extends EventEmitter<ClientEvents> {
    public readonly rest: Rest;

    public readonly ws: WebSocketManager;

    private defaultVersions = ApiVersions.V10;

    public constructor(
        public token: string,
        private readonly options: ClientOptions
    ) {
        super();
        this.rest = this.createRest();
        this.ws = this.createWebSocket();
    }

    public async connect(): Promise<void> {
        await this.ws.connect();
    }

    private calculateIntents(): Integer {
        return Number(BitfieldManager.from<GatewayIntents>(this.options.intents).valueOf());
    }

    private createRest(): Rest {
        return new Rest(this.token, {
            auth_type: this.options.rest?.auth_type,
            version: this.options.version ?? this.defaultVersions,
            user_agent: this.options.rest?.user_agent,
            cache_life_time: this.options.rest?.cache_life_time,
        });
    }

    private createWebSocket(): WebSocketManager {
        return new WebSocketManager(this, this.token, {
            intents: this.calculateIntents(),
            encoding: this.options.ws?.encoding ?? EncodingTypes.Json,
            compress: this.options.ws?.compress,
            v: this.options.version ?? this.defaultVersions,
            shard: this.options.shard,
            presence: this.options.presence,
            large_threshold: this.options.ws?.large_threshold,
        });
    }
}
