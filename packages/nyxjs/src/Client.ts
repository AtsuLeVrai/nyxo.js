import { ApiVersions, BitfieldManager, type GatewayIntents, type Integer } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway, type GatewayOptions } from "@nyxjs/gateway";
import { Rest, type RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { ClientEventManager } from "./managers/index.js";
import type { ClientEvents, ClientOptions, ClientState } from "./types/index.js";

export class Client extends EventEmitter<ClientEvents> {
    readonly #token: string;
    readonly #options: Required<ClientOptions>;
    readonly #events: ClientEventManager;
    readonly #state: ClientState;

    #rest?: Rest;
    #gateway?: Gateway;

    constructor(token: string, options: ClientOptions) {
        super();

        this.#validateToken(token);
        this.#validateOptions(options);

        this.#token = token;
        this.#options = this.#initializeConfig(options);
        this.#state = {
            isConnecting: false,
            isConnected: false,
            isReconnecting: false,
        };

        this.#initializeServices();
        this.#events = new ClientEventManager(this);
    }

    get token(): string {
        return this.#token;
    }

    get rest(): Rest {
        if (!this.#rest) {
            throw new Error("Rest client is not initialized.");
        }
        return this.#rest;
    }

    get gateway(): Gateway {
        if (!this.#gateway) {
            throw new Error("Gateway is not initialized.");
        }
        return this.#gateway;
    }

    get isConnected(): boolean {
        return this.#state.isConnected;
    }

    get isConnecting(): boolean {
        return this.#state.isConnecting;
    }

    get isReconnecting(): boolean {
        return this.#state.isReconnecting;
    }

    async connect(): Promise<void> {
        if (this.#state.isConnected || this.#state.isConnecting) {
            throw new Error("Client is already connected or connecting.");
        }

        try {
            this.#state.isConnecting = true;
            this.#events.setupListeners();
            await this.gateway.connect();
            this.#state.isConnected = true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to connect to gateway: ${errorMessage}`);
        } finally {
            this.#state.isConnecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.#state.isConnected) {
            throw new Error("Client is not connected.");
        }

        try {
            this.gateway.destroy();
            this.#state.isConnected = false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to disconnect from gateway: ${errorMessage}`);
        }
    }

    async reconnect(): Promise<void> {
        if (!this.#state.isConnected) {
            throw new Error("Client is not connected.");
        }

        if (this.#state.isReconnecting) {
            throw new Error("Client is already reconnecting.");
        }

        try {
            this.#state.isReconnecting = true;
            this.gateway.reconnect();
        } finally {
            this.#state.isReconnecting = false;
        }
    }

    #validateToken(token: string): void {
        if (!token?.trim()) {
            throw new Error("Token cannot be empty or undefined.");
        }

        if (!/^[A-Za-z0-9-_.]*$/.test(token)) {
            throw new Error("Invalid token format.");
        }
    }

    #validateOptions(options: ClientOptions): void {
        if (!options?.intents) {
            throw new Error("Intents must be provided in client options.");
        }
    }

    #initializeConfig(options: ClientOptions): Required<ClientOptions> {
        const defaultConfig: Required<ClientOptions> = {
            version: ApiVersions.V10,
            intents: [],
            gateway: {
                encoding: EncodingTypes.Json,
                compress: CompressTypes.ZlibStream,
                shard: undefined,
                presence: undefined,
                large_threshold: undefined,
            },
            rest: {
                timeout: undefined,
                user_agent: undefined,
                rate_limit_retries: undefined,
                max_retries: undefined,
            },
        };

        return {
            version: options.version ?? defaultConfig.version,
            intents: options.intents,
            gateway: {
                encoding: options.gateway?.encoding ?? defaultConfig.gateway.encoding,
                compress: options.gateway?.compress ?? defaultConfig.gateway.compress,
                shard: options.gateway?.shard,
                presence: options.gateway?.presence,
                large_threshold: options.gateway?.large_threshold,
            },
            rest: {
                timeout: options.rest?.timeout,
                user_agent: options.rest?.user_agent,
                rate_limit_retries: options.rest?.rate_limit_retries,
                max_retries: options.rest?.max_retries,
            },
        };
    }

    #initializeServices(): void {
        try {
            this.#rest = this.#initializeRest();
            this.#gateway = this.#initializeGateway();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize services: ${errorMessage}`);
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

        return new Rest(this.#token, options);
    }

    #initializeGateway(): Gateway {
        if (!this.#rest) {
            throw new Error("Rest client must be initialized before gateway.");
        }

        const options: GatewayOptions = {
            shard: this.#options.gateway.shard,
            compress: this.#options.gateway.compress,
            encoding: this.#options.gateway.encoding as EncodingTypes,
            v: this.#options.version,
            large_threshold: this.#options.gateway.large_threshold,
            intents: this.#resolveIntents(this.#options.intents),
            presence: this.#options.gateway.presence,
        };

        return new Gateway(this.#token, this.#rest, options);
    }

    #resolveIntents(intents: GatewayIntents[] | Integer): Integer {
        if (!Array.isArray(intents)) {
            return intents;
        }

        try {
            return Number(BitfieldManager.from(intents).valueOf());
        } catch (error) {
            throw new Error(`Failed to resolve intents: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
