import type { Client } from "./client.js";

export class Gateway {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;

    // TODO: Initialize the gateway connection
    this.#client.gateway;
  }
}
