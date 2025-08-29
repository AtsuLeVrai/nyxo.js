import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { Gateway, GatewayOptions } from "../gateway/index.js";
import { Rest, RestOptions } from "../rest/index.js";
import { CacheManager, CacheOptions } from "./cache.manager.js";

export const ClientOptions = z.object({
  cache: CacheOptions.prefault({}),
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export class Client extends EventEmitter {
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly cache: CacheManager;

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
    this.cache = new CacheManager(this.rest, this.#options.cache);
  }

  async connect(): Promise<void> {
    await Promise.all([this.gateway.connect(), this.cache.initialize()]);
  }

  async destroy(): Promise<void> {
    this.gateway.destroy();
    await this.rest.destroy();
  }
}
