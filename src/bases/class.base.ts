import type { Client } from "../core/index.js";

export abstract class BaseClass<T extends object> {
  protected readonly client: Client;
  protected readonly rawData: T;

  constructor(client: Client, data: T) {
    this.client = client;
    this.rawData = data;
  }

  toJson(): Readonly<T> {
    return Object.freeze({ ...this.rawData });
  }
}
