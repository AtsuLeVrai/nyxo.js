import { Gateway, GatewayOptions } from "@nyxjs/gateway";
import { Rest, RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { type ClientEvents, EventHandler } from "../handlers/index.js";

export const ClientOptions = z.object({
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export type ClientOptions = z.infer<typeof ClientOptions>;

export class Client extends EventEmitter<ClientEvents> {
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly #options: ClientOptions;

  readonly #events = new EventHandler(this);

  constructor(options: z.input<typeof ClientOptions>) {
    super();
    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);
  }

  connect(): Promise<void> {
    this.#events.initializeEvents();
    return this.gateway.connect();
  }
}
