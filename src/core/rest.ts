import type { Client } from "./client.js";

export class Rest {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;

    // TODO: Initialize the REST client
    this.#client.rest;
  }
}
