import { Gateway, GatewayOptions } from "@nyxjs/gateway";
import { Rest, RestOptions } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const ClientOptions = z.object({
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export class Client extends EventEmitter {
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly #options: z.infer<typeof ClientOptions>;

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
}
