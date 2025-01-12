import {
  Gateway,
  type GatewayIntentsBits,
  GatewayOptions,
} from "@nyxjs/gateway";
import { Rest, RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const ClientOptions = z.intersection(RestOptions, GatewayOptions);

export class Client extends EventEmitter {
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
    this.gateway = new Gateway(this.rest, this.#options);
  }

  get ping(): number {
    return this.gateway.ping;
  }

  get isReady(): boolean {
    return Boolean(this.gateway.sessionId);
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
}
