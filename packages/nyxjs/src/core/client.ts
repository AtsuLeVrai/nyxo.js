import { Gateway } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { ClientEventManager } from "../managers/index.js";
import { ClientOptions } from "../options/index.js";
import type { ClientEventHandlers } from "../types/index.js";

export class Client extends EventEmitter<ClientEventHandlers> {
  readonly rest: Rest;
  readonly gateway: Gateway;

  readonly #options: ClientOptions;
  readonly #events: ClientEventManager;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#events = new ClientEventManager(this);
    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);

    this.#events.initialize();
  }
}
