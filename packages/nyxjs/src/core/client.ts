import {
  Gateway,
  type GatewayEventHandlers,
  GatewayOptions,
  type GatewayReceiveEvents,
} from "@nyxjs/gateway";
import { Rest, type RestEventHandlers, RestOptions } from "@nyxjs/rest";
import { camelCase } from "change-case";
import { EventEmitter } from "eventemitter3";
import type { CamelCase } from "type-fest";
import { z } from "zod";
import { fromError } from "zod-validation-error";

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

export const ClientOptions = z
  .object({
    ...RestOptions.unwrap().shape,
    ...GatewayOptions.unwrap().shape,
  })
  .readonly();

export type ClientOptions = z.infer<typeof ClientOptions>;

type CamelCaseGatewayReceiveEvents = {
  [K in keyof GatewayReceiveEvents as CamelCase<K>]: (
    data: GatewayReceiveEvents[K],
  ) => void;
};

export type ClientEventHandlers = RestEventHandlers &
  GatewayEventHandlers &
  CamelCaseGatewayReceiveEvents;

export class Client extends EventEmitter<ClientEventHandlers> {
  readonly rest: Rest;
  readonly gateway: Gateway;

  readonly #options: ClientOptions;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);

    for (const event of REST_EVENTS) {
      this.rest.on(event, (...args) => {
        this.emit(event, ...args);
      });
    }

    for (const event of GATEWAY_EVENTS) {
      this.gateway.on(event, (...args) => {
        this.emit(event, ...args);
      });
    }

    this.gateway.on("dispatch", (event, ...args) => {
      this.emit(
        camelCase(event) as keyof ClientEventHandlers,
        ...(args as never),
      );
    });
  }

  async connect(): Promise<void> {
    await this.gateway.connect();
  }
}
