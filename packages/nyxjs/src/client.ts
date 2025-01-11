import {
  Gateway,
  type GatewayEvents,
  GatewayOptions,
  type ReadyEntity,
} from "@nyxjs/gateway";
import { Rest, type RestEvents, RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const ClientOptions = z.intersection(RestOptions, GatewayOptions);

export interface ClientEvents extends RestEvents, GatewayEvents {
  ready: (ready: ReadyEntity) => void;
}

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
    this.gateway = new Gateway(this.rest, this.#options);
  }

  connect(): Promise<void> {
    return this.gateway.connect();
  }
}
