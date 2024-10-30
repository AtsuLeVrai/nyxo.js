import type { AuditLogEvents } from "@nyxjs/core";
import type { GatewayEvents, GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { Client } from "../Client.js";
import { Guild, Ready } from "../structures/index.js";
import type { ClientEvents } from "../types/index.js";

type Constructor<T = unknown> = new (...args: any[]) => T;

type ClientEventMappingStructure = {
    readonly auditLogEventType?: AuditLogEvents;
    readonly clientEventName?: keyof Omit<ClientEvents, "close" | "debug" | "error" | "rateLimit" | "warn">;
    readonly gatewayReceiveEventName?: keyof GatewayReceiveEvents;
    serialize?(...data: unknown[]): unknown | unknown[];
};

class InstanceCache {
    private static instance: InstanceCache;
    private cache = new Map<string, unknown>();

    private constructor() {}

    static getInstance(): InstanceCache {
        if (!InstanceCache.instance) {
            InstanceCache.instance = new InstanceCache();
        }
        return InstanceCache.instance;
    }

    get<T>(key: string): T | undefined {
        return this.cache.get(key) as T | undefined;
    }

    set<T>(key: string, value: T): void {
        this.cache.set(key, value);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

function createInstance<T>(constructors: Constructor<T> | Constructor<T>[], ...args: unknown[]): T[] {
    const cache = InstanceCache.getInstance();
    const constructorsArr = Array.isArray(constructors) ? constructors : [constructors];

    return constructorsArr.map((Constructor) => {
        const cacheKey = `${Constructor.name}:${JSON.stringify(args)}`;

        const cachedInstance = cache.get<T>(cacheKey);
        if (cachedInstance) {
            return cachedInstance;
        }

        const instance = new Constructor(...args);
        cache.set(cacheKey, instance);
        return instance;
    });
}

const ClientEventMapping: ClientEventMappingStructure[] = [
    {
        gatewayReceiveEventName: "READY",
        clientEventName: "ready",
        serialize: (...data) => createInstance(Ready, ...data),
    },
    {
        gatewayReceiveEventName: "GUILD_CREATE",
        clientEventName: "guildCreate",
        serialize: (...data) => createInstance(Guild, ...data),
    },
];

export class ClientEventManager {
    readonly #client: Client;
    readonly #eventMapping: Map<string, ClientEventMappingStructure>;

    constructor(client: Client) {
        this.#client = client;
        this.#eventMapping = new Map(
            ClientEventMapping.map((mapping) => [mapping.gatewayReceiveEventName as string, mapping])
        );
    }

    setupListeners(): void {
        try {
            this.#setupRestListeners();
            this.#setupGatewayListeners();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.#client.emit("error", new Error(`An error occurred while setting up listeners: ${errorMessage}`));
        }
    }

    #setupRestListeners(): void {
        const { rest } = this.#client;

        const events = {
            DEBUG: "debug",
            ERROR: "error",
            RATE_LIMIT: "rateLimit",
            WARN: "warn",
        } as Record<keyof RestEvents, keyof ClientEvents>;

        for (const [restEvent, clientEvent] of Object.entries(events)) {
            rest.on(restEvent as keyof RestEvents, (data) => this.#client.emit(clientEvent, ...(data as never)));
        }
    }

    #setupGatewayListeners(): void {
        const { gateway } = this.#client;
        const events = {
            CLOSE: "close",
            DEBUG: "debug",
            ERROR: "error",
            WARN: "warn",
        } as Record<keyof GatewayEvents<keyof GatewayReceiveEvents>, keyof ClientEvents>;

        for (const [gatewayEvent, clientEvent] of Object.entries(events)) {
            gateway.on(gatewayEvent as keyof GatewayEvents<keyof GatewayReceiveEvents>, (...args) =>
                this.#client.emit(clientEvent, ...(args as never))
            );
        }

        gateway.on("DISPATCH", this.#handleDispatch.bind(this));
    }

    async #handleDispatch<K extends keyof GatewayReceiveEvents>(
        event: K,
        ...data: GatewayReceiveEvents[K]
    ): Promise<void> {
        const mapping = this.#eventMapping.get(event);

        if (!mapping) {
            this.#emitWarning(`No mapping found for event: ${event}`);
            return;
        }

        const { clientEventName, serialize } = mapping;

        if (!clientEventName) {
            this.#emitWarning(`No client event found for event: ${event}`);
            return;
        }

        await this.#emitClientEvent(clientEventName, data, serialize);
    }

    #emitWarning(message: string): void {
        this.#client.emit("warn", message);
    }

    async #emitClientEvent(
        eventName: keyof ClientEvents,
        data: unknown[],
        serialize?: (...args: unknown[]) => unknown | unknown[]
    ): Promise<void> {
        const listeners = this.#client.listeners(eventName);

        if (!listeners.length) {
            this.#emitWarning(`No listeners found for event: ${eventName}`);
            return;
        }

        try {
            const serializedData = serialize ? await Promise.resolve(serialize(...data)) : data;
            this.#client.emit(
                eventName,
                ...((Array.isArray(serializedData) ? serializedData : [serializedData]) as never)
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.#client.emit("error", new Error(`Error serializing data for event ${eventName}: ${errorMessage}`));
        }
    }
}
