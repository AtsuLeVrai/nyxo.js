import { GatewayIntents } from "@nyxjs/core";
import { Gateway, type GatewayOptions } from "@nyxjs/gateway";
import { Rest, type RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { ClientEventManager, GuildManager, UserManager } from "./managers/index.js";
import type { User } from "./structures/index.js";
import type { ClientEvents, ClientOptions, ClientState } from "./types/index.js";

export class Client extends EventEmitter<ClientEvents> {
    readonly #token: string;
    readonly #options: Readonly<ClientOptions>;
    readonly #events: ClientEventManager;
    readonly #state: ClientState;

    #user?: User;
    readonly #rest?: Rest;
    readonly #gateway?: Gateway;
    readonly #guilds?: GuildManager;
    readonly #users?: UserManager;

    constructor(token: string, options: ClientOptions) {
        super();
        this.#token = this.#validateToken(token);
        this.#options = Object.freeze(options);
        this.#state = this.#createInitialState();
        this.#rest = this.#initializeRest();
        this.#gateway = this.#initializeGateway();
        this.#guilds = this.#initializeGuildManager();
        this.#users = this.#initializeUserManager();

        this.#events = new ClientEventManager(this);
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

    get guilds(): GuildManager {
        if (!this.#guilds) {
            throw new Error("Guild manager is not initialized.");
        }

        return this.#guilds;
    }

    get users(): UserManager {
        if (!this.#users) {
            throw new Error("User manager is not initialized.");
        }

        return this.#users;
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

    #validateToken(token: string): string {
        if (!token?.trim()) {
            throw new Error("Token cannot be empty or undefined.");
        }

        const tokenRegex = /^[A-Za-z0-9-_.]*$/;
        if (!tokenRegex.test(token)) {
            throw new Error("Invalid token format.");
        }

        return token;
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

    #initializeRest(): Rest {
        const options: RestOptions = {
            version: this.#options.version,
            maxRetries: this.#options.maxRetries,
            rateLimitRetries: this.#options.rateLimitRetries,
            userAgent: this.#options.userAgent,
            timeout: this.#options.timeout,
        };

        return new Rest(this.#token, options);
    }

    #initializeGateway(): Gateway {
        if (!this.#rest) {
            throw new Error("Rest client must be initialized before gateway.");
        }

        const options: GatewayOptions = {
            shard: this.#options.shard,
            compress: this.#options.compress,
            encoding: this.#options.encoding,
            version: this.#options.version,
            largeThreshold: this.#options.largeThreshold,
            intents: GatewayIntents.resolve(this.#options.intents),
            presence: this.#options.presence,
        };

        return new Gateway(this.#token, this.#rest, options);
    }

    #initializeGuildManager(): GuildManager {
        if (!this.#rest) {
            throw new Error("Rest client must be initialized before GuildManager.");
        }

        return new GuildManager(this);
    }

    #initializeUserManager(): UserManager {
        if (!this.#rest) {
            throw new Error("Rest client must be initialized before UserManager.");
        }

        return new UserManager(this);
    }
}
