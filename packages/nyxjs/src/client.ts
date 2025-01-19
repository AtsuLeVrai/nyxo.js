import {
  GATEWAY_FORWARDED_EVENTS,
  Gateway,
  type GatewayEvents,
  type GatewayIntentsBits,
  GatewayOptions,
  type GatewayReceiveEvents,
} from "@nyxjs/gateway";
import {
  REST_FORWARDED_EVENTS,
  Rest,
  type RestEvents,
  RestOptions,
} from "@nyxjs/rest";
import { camelCase } from "change-case";
import { EventEmitter } from "eventemitter3";
import type { CamelCase } from "type-fest";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const ClientOptions = z.object({
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

type EventHandlerToTuple<T> = T extends (...args: infer P) => void ? P : never;

type ArgumentMap<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => void
    ? EventHandlerToTuple<T[K]>
    : [T[K]];
};

type CamelCaseGatewayEvents = {
  [K in keyof GatewayReceiveEvents as CamelCase<K>]: GatewayReceiveEvents[K];
};

export type ClientEvents = RestEvents & GatewayEvents & CamelCaseGatewayEvents;

export class Client extends EventEmitter<ClientEvents> {
  readonly token: string;
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly #options: z.output<typeof ClientOptions>;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.token = this.#options.token;
    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(
      this.rest,
      // TODO: Remove the type assertion once zod supports recursive types
      this.#options as z.output<typeof GatewayOptions>,
    );

    this.#setupEventListeners();
  }

  get ping(): number {
    return this.gateway.ping;
  }

  get isReady(): boolean {
    return Boolean(this.gateway.sessionId);
  }

  override on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ArgumentMap<ClientEvents>[K]) => void,
  ): this {
    return super.on(event, listener as never);
  }

  hasIntent(intent: GatewayIntentsBits): boolean {
    const intents = this.#options.intents;
    if (Array.isArray(intents)) {
      return intents.includes(intent);
    }

    return (intents & intent) === intent;
  }

  connect(): Promise<void> {
    return this.gateway.connect();
  }

  #setupEventListeners(): void {
    for (const event of REST_FORWARDED_EVENTS) {
      this.rest.on(event, (...args) => this.emit(event, ...args));
    }

    for (const event of GATEWAY_FORWARDED_EVENTS) {
      this.gateway.on(event, (...args) => this.emit(event, ...args));
    }

    this.gateway.on("dispatch", (event, data) =>
      this.emit(camelCase(event) as keyof CamelCaseGatewayEvents, data),
    );
  }
}
