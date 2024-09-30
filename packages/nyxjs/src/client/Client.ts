import { ApiVersions, BitfieldManager } from "@nyxjs/core";
import type { GatewayOptions } from "@nyxjs/gateway";
import { EncodingTypes, GatewayManager } from "@nyxjs/gateway";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { ClientEventManager } from "../managers/ClientEventManager";
import type { ClientEvents, ClientOptions } from "../types/Client";

export class Client extends EventEmitter<ClientEvents> {
    public readonly rest: Rest;

    public readonly ws: GatewayManager;

    readonly #options: Readonly<ClientOptions>;

    readonly #events: ClientEventManager;

    #token: string;

    public constructor(token: string, options: ClientOptions) {
        super();

        if (!token || typeof token !== "string") {
            throw new Error("Invalid token provided");
        }

        this.#token = token;
        this.#options = Object.freeze({ ...options });
        this.#events = new ClientEventManager(this);

        this.rest = this.initializeRest();
        this.ws = this.initializeWs();
    }

    public get token(): string {
        return this.#token;
    }

    public async login(): Promise<void> {
        try {
            this.#events.setupListeners();
            await this.ws.connect();
        } catch (error) {
            if (error instanceof Error) {
                this.emit("error", error);
                throw error;
            }

            this.emit("error", new Error(String(error)));
            throw new Error(String(error));
        }
    }

    public async destroy(): Promise<void> {
        try {
            this.removeAllListeners();
            this.ws.disconnect();
            await this.rest.destroy();
        } catch (error) {
            if (error instanceof Error) {
                this.emit("error", error);
                throw error;
            }

            this.emit("error", new Error(String(error)));
            throw new Error(String(error));
        } finally {
            this.#token = "";
        }
    }

    private initializeRest(): Rest {
        const restOptions: RestOptions = {
            auth_type: this.#options.auth_type ?? "Bot",
            cache_life_time: this.#options.rest?.cache_life_time,
            user_agent: this.#options.rest?.user_agent,
            version: this.#options.version ?? ApiVersions.V10,
        };

        return new Rest(this.#token, restOptions);
    }

    private initializeWs(): GatewayManager {
        const wsOptions: GatewayOptions = {
            presence: this.#options.presence,
            compress: this.#options.ws?.compress,
            encoding: this.#options.ws?.encoding ?? EncodingTypes.Json,
            shard: this.#options.shard,
            intents: this.calculateIntents(this.#options.intents),
            v: this.#options.version ?? ApiVersions.V10,
            large_threshold: this.#options.ws?.large_threshold,
        };

        return new GatewayManager(this.#token, this.rest, wsOptions);
    }

    private calculateIntents<T extends number>(intents: T | T[]): number {
        if (Array.isArray(intents)) {
            return Number(BitfieldManager.from(intents).valueOf());
        } else {
            return intents;
        }
    }
}
