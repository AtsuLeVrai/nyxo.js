import { ApiVersions, GatewayIntents } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway, type GatewayOptions } from "@nyxjs/gateway";
import { Rest, type RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { ClientEventManager, GuildManager, UserManager } from "./managers/index.js";
import type { User } from "./structures/index.js";
import type { ClientEvents, ClientOptions, ClientState } from "./types/index.js";

interface ServiceDependencies {
    rest: Rest;
    gateway: Gateway;
    guilds: GuildManager;
    users: UserManager;
}

export class Client extends EventEmitter<ClientEvents> {
    readonly #token: string;
    readonly #options: Required<ClientOptions>;
    readonly #events: ClientEventManager;
    readonly #state: ClientState;
    readonly #services: Partial<ServiceDependencies> = {};

    #user?: User;

    constructor(token: string, options: ClientOptions) {
        super();
        this.#validateInputs(token, options);

        this.#token = token;
        this.#options = this.#initializeConfig(options);
        this.#state = this.#createInitialState();

        this.#initializeServices();

        this.#events = new ClientEventManager(this);
    }

    get rest(): Rest {
        return this.#getService("rest");
    }

    get gateway(): Gateway {
        return this.#getService("gateway");
    }

    get guilds(): GuildManager {
        return this.#getService("guilds");
    }

    get users(): UserManager {
        return this.#getService("users");
    }

    get user(): User {
        if (!this.#user) {
            throw new Error("User is not initialized.");
        }
        return this.#user;
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
        this.#validateConnectionState();

        try {
            this.#state.isConnecting = true;
            this.#user = await this.users.fetch("@me");
            this.#events.setupListeners();
            await this.gateway.connect();
            this.#state.isConnected = true;
        } catch (error) {
            throw this.#createError("Failed to connect to gateway", error);
        } finally {
            this.#state.isConnecting = false;
        }
    }

    disconnect(): void {
        if (!this.#state.isConnected) {
            throw new Error("Client is not connected.");
        }

        try {
            this.gateway.destroy();
            this.#state.isConnected = false;
        } catch (error) {
            throw this.#createError("Failed to disconnect from gateway", error);
        }
    }

    async reconnect(): Promise<void> {
        this.#validateReconnectionState();

        try {
            this.#state.isReconnecting = true;
            await this.gateway.reconnect();
        } finally {
            this.#state.isReconnecting = false;
        }
    }

    #getService<K extends keyof ServiceDependencies>(name: K): ServiceDependencies[K] {
        if (!this.#services[name]) {
            throw new Error(`${name} service is not initialized.`);
        }
        return this.#services[name] as ServiceDependencies[K];
    }

    #validateInputs(token: string, options: ClientOptions): void {
        this.#validateToken(token);
        this.#validateOptions(options);
    }

    #validateToken(token: string): void {
        if (!token?.trim()) {
            throw new Error("Token cannot be empty or undefined.");
        }

        const tokenRegex = /^[A-Za-z0-9-_.]*$/;
        if (!tokenRegex.test(token)) {
            throw new Error("Invalid token format.");
        }
    }

    #validateOptions(options: ClientOptions): void {
        if (!options?.intents) {
            throw new Error("Intents must be provided in client options.");
        }
    }

    #validateConnectionState(): void {
        if (this.#state.isConnected || this.#state.isConnecting) {
            throw new Error("Client is already connected or connecting.");
        }
    }

    #validateReconnectionState(): void {
        if (!this.#state.isConnected) {
            throw new Error("Client is not connected.");
        }
        if (this.#state.isReconnecting) {
            throw new Error("Client is already reconnecting.");
        }
    }

    #createInitialState(): ClientState {
        return {
            isConnecting: false,
            isConnected: false,
            isReconnecting: false,
        };
    }

    #createError(message: string, error: unknown): Error {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Error(`${message}: ${errorMessage}`);
    }

    #initializeServices(): void {
        try {
            this.#services.rest = this.#initializeRest();
            this.#services.gateway = this.#initializeGateway();
            this.#services.guilds = this.#initializeGuildManager();
            this.#services.users = this.#initializeUserManager();
        } catch (error) {
            throw this.#createError("Failed to initialize services", error);
        }
    }

    #initializeRest(): Rest {
        const options: RestOptions = {
            version: this.#options.version,
            maxRetries: this.#options.rest.maxRetries,
            rateLimitRetries: this.#options.rest.rateLimitRetries,
            userAgent: this.#options.rest.userAgent,
            timeout: this.#options.rest.timeout,
        };

        return new Rest(this.#token, options);
    }

    #initializeGateway(): Gateway {
        if (!this.#services.rest) {
            throw new Error("Rest client must be initialized before gateway.");
        }

        const options: GatewayOptions = {
            shard: this.#options.gateway.shard,
            compress: this.#options.gateway.compress,
            encoding: this.#options.gateway.encoding as EncodingTypes,
            v: this.#options.version,
            largeThreshold: this.#options.gateway.largeThreshold,
            intents: GatewayIntents.resolve(this.#options.intents),
            presence: this.#options.gateway.presence,
        };

        return new Gateway(this.#token, this.#services.rest, options);
    }

    #initializeGuildManager(): GuildManager {
        if (!this.#services.rest) {
            throw new Error("Rest client must be initialized before GuildManager.");
        }

        return new GuildManager(this);
    }

    #initializeUserManager(): UserManager {
        if (!this.#services.rest) {
            throw new Error("Rest client must be initialized before UserManager.");
        }

        return new UserManager(this);
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
                largeThreshold: undefined,
            },
            rest: {
                timeout: undefined,
                userAgent: undefined,
                rateLimitRetries: undefined,
                maxRetries: undefined,
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
                largeThreshold: options.gateway?.largeThreshold,
            },
            rest: {
                timeout: options.rest?.timeout,
                userAgent: options.rest?.userAgent,
                rateLimitRetries: options.rest?.rateLimitRetries,
                maxRetries: options.rest?.maxRetries,
            },
        };
    }
}
