import type { Rest } from "../rest/index.js";

export abstract class BaseClass<T extends object> {
  protected readonly rest: Rest;

  protected readonly data: Readonly<T>;

  constructor(rest: Rest, data: T) {
    this.rest = rest;
    this.data = Object.freeze(data);
  }
}
