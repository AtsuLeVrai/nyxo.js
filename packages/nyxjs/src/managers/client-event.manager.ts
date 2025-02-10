import type {
  GatewayEventHandlers,
  GatewayReceiveEvents,
} from "@nyxjs/gateway";
import type { RestEventHandlers } from "@nyxjs/rest";
import { camelCase } from "change-case";
import type { CamelCase, Class } from "type-fest";
import { Ready } from "../class/index.js";
import type { Client } from "../core/index.js";
import type { ClientEventHandlers } from "../types/index.js";

interface ClientEvent {
  name: keyof GatewayReceiveEvents;
  camelName: CamelCase<keyof GatewayReceiveEvents>;
  handler: Class<unknown, [data: never]>[];
}

const REST_EVENTS: readonly (keyof RestEventHandlers)[] = [
  "debug",
  "error",
  "requestFinish",
  "retryAttempt",
  "rateLimitExceeded",
  "bucketExpired",
  "bucketCreated",
  "bucketUpdated",
];

const GATEWAY_EVENTS: readonly (keyof GatewayEventHandlers)[] = [
  "sessionState",
  "sessionClose",
  "sessionInvalid",
  "healthStatus",
  "shardSpawn",
  "shardDestroy",
  "shardReady",
  "shardDisconnect",
  "shardReconnect",
  "shardResume",
  "shardRateLimit",
  "debug",
  "error",
  "dispatch",
];

const CLIENT_EVENTS: ClientEvent[] = [
  {
    name: "READY",
    camelName: "ready",
    handler: [Ready],
  },
];

export class ClientEventManager {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  initialize(): void {
    this.#initializeRestEvents();
    this.#initializeGatewayEvents();
  }

  #initializeRestEvents(): void {
    const restHandler =
      (event: keyof RestEventHandlers) =>
      (...args: unknown[]): void => {
        this.#client.emit(event, ...(args as never));
      };

    for (const event of REST_EVENTS) {
      this.#client.rest.on(event, restHandler(event));
    }
  }

  #initializeGatewayEvents(): void {
    const gatewayHandler =
      (event: keyof GatewayEventHandlers) =>
      (...args: unknown[]): void => {
        this.#client.emit(event, ...(args as never));
      };

    for (const event of GATEWAY_EVENTS) {
      this.#client.gateway.on(event, gatewayHandler(event));
    }

    this.#client.gateway.on("dispatch", this.#handleDispatchEvent.bind(this));
  }

  #handleDispatchEvent(event: string, args: unknown): void {
    const handler = CLIENT_EVENTS.find((data) => data.name === event);
    if (!handler) {
      const camelCaseEvent = camelCase(event);
      this.#client.emit(
        camelCaseEvent as keyof ClientEventHandlers,
        args as never,
      );
      return;
    }

    const processedArgs = handler.handler.map(
      (Handler) => new Handler(args as never),
    );
    this.#client.emit(
      handler.camelName as keyof ClientEventHandlers,
      ...(processedArgs as never),
    );
  }
}
