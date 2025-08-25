import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { User } from "../../resources/index.js";
import { Gateway, GatewayOptions } from "../gateway/index.js";
import { Rest, RestOptions } from "../rest/index.js";

export const ClientOptions = z.object({
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export class Client extends EventEmitter {
  // @ts-expect-error - will be initialized after `connect` is called
  user: User;
  readonly rest: Rest;
  readonly gateway: Gateway;

  readonly #options: z.infer<typeof ClientOptions>;

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
    this.gateway = new Gateway(this.rest, this.#options);
  }

  async connect(): Promise<void> {
    const [_, user] = await Promise.all([
      this.gateway.connect(),
      this.rest.user.fetchCurrentUser(),
    ]);

    this.user = new User(this, user);
  }
}
