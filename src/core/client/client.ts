import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { Gateway, GatewayOptions, gatewayEventKeys } from "../gateway/index.js";
import { Rest, RestOptions } from "../rest/index.js";
import { CacheManager, CacheOptions } from "./cache.manager.js";
import type { ClientEvents } from "./client.types.js";
import { GatewayEventHandlers } from "./gateway.handler.js";

export const ClientOptions = z.object({
  cache: CacheOptions.prefault({}),
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export class Client extends EventEmitter<ClientEvents> {
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

    for (const events of gatewayEventKeys) {
      this.gateway.on(events, (...args) => this.emit(events, ...args));
    }

    this.gateway.on("dispatch", (event, data) => {
      const mapping = GatewayEventHandlers.find((m) => m.gatewayEvent === event);
      if (!mapping) {
        return;
      }

      const transformedData = mapping.transform(this, data);
      this.emit(mapping.clientEvent, ...transformedData);
    });
  }

  // biome-ignore lint/suspicious/noConfusingVoidType: The Promise.all returns a tuple of voids, which is intentional here to signal that both the gateway and cache have completed their connection/initialization processes.
  connect(): Promise<[void, void]> {
    return Promise.all([this.gateway.connect(), this.cache.initialize()]);
  }

  async destroy(): Promise<void> {
    this.gateway.destroy();
    await this.rest.destroy();
    this.removeAllListeners();
  }
}
