import type { Client } from "../core/index.js";

export abstract class BaseModal<T> {
  protected client: Client;
  protected data: T;

  constructor(client: Client, data: T) {
    this.client = client;
    this.data = data;
  }
}
