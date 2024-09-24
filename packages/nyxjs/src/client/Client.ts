import type { GatewayIntents } from "@nyxjs/core";
import { ApiVersions, BitfieldManager } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { EncodingTypes, Gateway } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";

export type ClientOptions = {
    intents: GatewayIntents[];
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};

export class Client extends EventEmitter {
    public ws: Gateway;

    public rest: Rest;

    public constructor(
        public token: string,
        private readonly options: ClientOptions
    ) {
        super();
        this.ws = this.createWs();
        this.rest = this.createRest();
    }

    private get calculateIntents(): number {
        const bitfield = new BitfieldManager(this.options.intents);
        return Number(bitfield.toString());
    }

    public async connect(): Promise<void> {
        try {
            await this.ws.connect();
        } catch (error) {
            this.emit("error", error);
        }
    }

    private createWs(): Gateway {
        return new Gateway(this.token, {
            presence: this.options.presence,
            shard: this.options.shard,
            v: this.options.version ?? ApiVersions.V10,
            intents: this.calculateIntents,
            encoding: this.options.ws?.encoding ?? EncodingTypes.Json,
            compress: this.options.ws?.compress,
            large_threshold: this.options.ws?.large_threshold,
        });
    }

    private createRest(): Rest {
        return new Rest(this.token, {
            auth_type: this.options.rest?.auth_type,
            cache_life_time: this.options.rest?.cache_life_time,
            user_agent: this.options.rest?.user_agent,
            version: this.options.version ?? ApiVersions.V10,
        });
    }
}
