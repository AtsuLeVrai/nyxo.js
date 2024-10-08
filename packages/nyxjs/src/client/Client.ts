import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions, BitfieldManager } from "@nyxjs/core";
import type { GatewayOptions } from "@nyxjs/gateway";
import { CompressTypes, EncodingTypes, Gateway } from "@nyxjs/gateway";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type { ClientEvents } from "./ClientEventEmitter";
import { ClientEventEmitter } from "./ClientEventEmitter";

export type ClientOptions = {
    intents: GatewayIntents[] | Integer;
    rest?: Omit<RestOptions, "version">;
    version?: ApiVersions;
    ws?: Omit<GatewayOptions, "intents" | "v">;
};

export class Client extends EventEmitter<ClientEvents> {
    public rest: Rest;

    public gateway: Gateway;

    readonly #options: Required<ClientOptions>;

    readonly #events: ClientEventEmitter;

    public constructor(
        public token: string,
        options: ClientOptions
    ) {
        super();
        this.#options = {
            intents: options.intents,
            version: options.version ?? ApiVersions.V10,
            rest: options.rest ?? {},
            ws: options.ws ?? {
                encoding: EncodingTypes.Etf,
                compress: CompressTypes.ZlibStream,
            },
        };
        this.rest = this.#initializeRest();
        this.gateway = this.#initializeGateway();
        this.#events = new ClientEventEmitter(this);
    }

    public async connect(): Promise<void> {
        try {
            this.#events.setupListeners();
            await this.gateway.connect();
        } catch (error) {
            this.emit("error", new Error(`Failed to connect to gateway: ${error}`));
        }
    }

    #initializeRest(): Rest {
        const options: RestOptions = {
            version: this.#options.version,
            max_retries: this.#options.rest.max_retries,
            rate_limit_retries: this.#options.rest.rate_limit_retries,
            user_agent: this.#options.rest.user_agent,
            timeout: this.#options.rest.timeout,
        };

        return new Rest(this.token, options);
    }

    #initializeGateway(): Gateway {
        if (!this.rest) {
            throw new Error("Rest client is not initialized.");
        }

        const options: GatewayOptions = {
            shard: this.#options.ws.shard,
            compress: this.#options.ws.compress,
            encoding: this.#options.ws.encoding,
            v: this.#options.version,
            large_threshold: this.#options.ws.large_threshold,
            intents: this.#resolveIntents(this.#options.intents),
            presence: this.#options.ws.presence,
        };

        return new Gateway(this.token, this.rest, options);
    }

    #resolveIntents(intents: GatewayIntents[] | Integer): Integer {
        if (Array.isArray(intents)) {
            return Number(BitfieldManager.from(intents).valueOf());
        }

        return intents;
    }
}
