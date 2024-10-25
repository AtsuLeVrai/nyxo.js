import type { AuditLogEvents } from "@nyxjs/core";
import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import { Ready } from "../structures/index.js";
import type { ClientEvents } from "../types/index.js";
import type { Client } from "./Client.js";

type Constructor<T = unknown> = new (...args: any[]) => T;

type ClientEventMappingStructure = {
    readonly audit_log_event_type?: AuditLogEvents;
    readonly client_event_name?: keyof Omit<ClientEvents, "close" | "debug" | "error" | "rateLimit" | "warn">;
    readonly gateway_receive_event_name?: keyof GatewayReceiveEvents;
    serialize?(...data: unknown[]): unknown | unknown[];
};

const instanceCache = new Map<string, unknown>();

function createInstance<T>(constructors: Constructor<T> | Constructor<T>[], ...args: unknown[]): T[] {
    const constructorsArr = Array.isArray(constructors) ? constructors : [constructors];
    return constructorsArr.map((Constructor) => {
        const cacheKey = Constructor.name + JSON.stringify(args);
        if (instanceCache.has(cacheKey)) {
            return instanceCache.get(cacheKey) as T;
        }

        const instance = new Constructor(...args);
        instanceCache.set(cacheKey, instance);
        return instance;
    });
}

const CLIENT_EVENT_MAPPING: ClientEventMappingStructure[] = [
    {
        gateway_receive_event_name: "READY",
        client_event_name: "ready",
        serialize: (...data) => createInstance(Ready, ...data),
    },
];

export class ClientEventManager {
    readonly #client: Client;

    constructor(client: Client) {
        this.#client = client;
    }

    setupListeners(): void {
        try {
            this.#setupRestListeners();
            this.#setupGatewayListeners();
        } catch (error) {
            this.#client.emit("error", new Error(`An error occurred while setting up listeners: ${error}`));
        }
    }

    #setupRestListeners(): void {
        const { rest } = this.#client;
        rest.on("DEBUG", (message) => this.#client.emit("debug", message));
        rest.on("ERROR", (error) => this.#client.emit("error", error));
        rest.on("RATE_LIMIT", (info) => this.#client.emit("rateLimit", info));
        rest.on("WARN", (message) => this.#client.emit("warn", message));
    }

    #setupGatewayListeners(): void {
        const { gateway } = this.#client;
        gateway.on("CLOSE", (code, reason) => this.#client.emit("close", code, reason));
        gateway.on("DEBUG", (message) => this.#client.emit("debug", message));
        gateway.on("ERROR", (error) => this.#client.emit("error", error));
        gateway.on("WARN", (message) => this.#client.emit("warn", message));
        gateway.on("DISPATCH", this.#handleDispatch.bind(this));
    }

    async #handleDispatch<K extends keyof GatewayReceiveEvents>(
        event: K,
        ...data: GatewayReceiveEvents[K]
    ): Promise<void> {
        const mapping = CLIENT_EVENT_MAPPING.find((mapping) => mapping.gateway_receive_event_name === event);

        if (!mapping) {
            this.#client.emit("warn", `No mapping found for event: ${event}`);
            return;
        }

        const { client_event_name, serialize } = mapping;

        if (client_event_name) {
            const event = client_event_name as keyof ClientEvents;
            const listeners = this.#client.listeners(event);

            if (listeners.length) {
                const serializedData = serialize?.(...data) ?? data;
                this.#client.emit(event, ...(serializedData as ClientEvents[keyof ClientEvents]));

                return;
            }

            this.#client.emit("warn", `No listeners found for event: ${event}`);

            return;
        }

        this.#client.emit("warn", `No client event found for event: ${event}`);
    }
}
