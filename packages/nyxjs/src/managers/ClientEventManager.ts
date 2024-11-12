import type { AuditLogEvents } from "@nyxjs/core";
import type { GatewayEvents, GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { Client } from "../Client.js";
import { Channel, Guild, Ready } from "../structures/index.js";
import type { ClientEvents } from "../types/index.js";

type Constructor<T> = new (...args: never[]) => T;
type EventDataType<T extends keyof GatewayReceiveEvents> = GatewayReceiveEvents[T];
type SerializeResult<T> = [T] | [T, T];
interface ClientEventMappingStructure<T extends keyof GatewayReceiveEvents = keyof GatewayReceiveEvents> {
    readonly auditLogEventType?: AuditLogEvents;
    readonly clientEventName?: keyof Omit<
        ClientEvents,
        "close" | "debug" | "error" | "rateLimit" | "warn" | "raw" | "missedAck"
    >;
    readonly gatewayReceiveEventName: T;
    serialize(client: Client, data: EventDataType<T>): SerializeResult<unknown>;
}

function createInstance<T>(Constructor: Constructor<T>, args: unknown): T {
    // @todo: Add cache system with client.<manager>.cache.get() && set()
    return new Constructor(args as never);
}

type ClientEventMapping = {
    [K in keyof GatewayReceiveEvents]: ClientEventMappingStructure<K>;
}[keyof GatewayReceiveEvents];

const ClientEventMapping: ClientEventMapping[] = [
    {
        clientEventName: "ready",
        gatewayReceiveEventName: "READY",
        serialize: (_, data) => [createInstance(Ready, data)],
    },
    {
        gatewayReceiveEventName: "GUILD_CREATE",
        clientEventName: "guildCreate",
        serialize: (_, data) => [createInstance(Guild, data)],
    },
    {
        gatewayReceiveEventName: "GUILD_UPDATE",
        clientEventName: "guildUpdate",
        serialize: (client, data) => {
            // @todo: Need to be checked if it's correct
            const oldGuild = client.guilds.cache.get(data.id);
            const newGuild = createInstance(Guild, data);
            return [oldGuild, newGuild];
        },
    },
    {
        gatewayReceiveEventName: "CHANNEL_CREATE",
        clientEventName: "channelCreate",
        serialize: (_, data) => [createInstance(Channel, data)],
    },
];

export class ClientEventManager {
    readonly #client: Client;
    readonly #eventMapping: Map<string, ClientEventMappingStructure>;

    constructor(client: Client) {
        this.#client = client;
        this.#eventMapping = new Map(
            ClientEventMapping.map((mapping) => [mapping.gatewayReceiveEventName as string, mapping]),
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
            debug: "debug",
            error: "error",
            rateLimit: "rateLimit",
            warn: "warn",
        } as Record<keyof RestEvents, keyof ClientEvents>;

        for (const [restEvent, clientEvent] of Object.entries(events)) {
            rest.on(restEvent as keyof RestEvents, (...data) => this.#client.emit(clientEvent, ...(data as never)));
        }
    }

    #setupGatewayListeners(): void {
        const { gateway } = this.#client;
        const events = {
            close: "close",
            debug: "debug",
            error: "error",
            warn: "warn",
            missedAck: "missedAck",
            raw: "raw",
        } as Record<keyof GatewayEvents, keyof ClientEvents>;

        for (const [gatewayEvent, clientEvent] of Object.entries(events)) {
            gateway.on(gatewayEvent as keyof GatewayEvents, (...args) =>
                this.#client.emit(clientEvent, ...(args as never)),
            );
        }

        gateway.on("dispatch", this.#handleDispatch.bind(this));
    }

    #handleDispatch<K extends keyof GatewayReceiveEvents>(event: K, data: GatewayReceiveEvents[K]): void {
        const mapping = this.#eventMapping.get(event);

        if (!mapping) {
            this.#client.emit("warn", `No mapping found for event: ${event}`);
            return;
        }

        const { clientEventName, serialize } = mapping;

        if (!clientEventName) {
            this.#client.emit("warn", `No client event found for event: ${event}`);
            return;
        }

        this.#emitClientEvent(clientEventName, data, serialize);
    }

    #emitClientEvent(
        eventName: keyof ClientEvents,
        data: unknown,
        serialize?: ClientEventMappingStructure["serialize"],
    ): void {
        const listeners = this.#client.listeners(eventName);

        if (listeners.length === 0) {
            this.#client.emit("warn", `No listeners found for event: ${eventName}`);
            return;
        }

        try {
            const serializedData = serialize ? serialize(this.#client, data as never) : data;
            this.#client.emit(eventName, ...(serializedData as never));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.#client.emit("error", new Error(`Error serializing data for event ${eventName}: ${errorMessage}`));
        }
    }
}
