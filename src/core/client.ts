import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { Gateway, GatewayOptions } from "./gateway.js";
import { Rest, RestOptions } from "./rest.js";

export const ClientOptions = z.object({
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export type ClientOptions = z.infer<typeof ClientOptions>;

export class Client extends EventEmitter {
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly #options: ClientOptions;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }

      throw error;
    }

    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.#options);
  }
}
