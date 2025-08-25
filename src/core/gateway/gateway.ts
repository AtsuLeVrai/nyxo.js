import { EventEmitter } from "eventemitter3";
import type { Rest } from "../rest/index.js";

export class Gateway extends EventEmitter {
  readonly #rest: Rest;

  constructor(rest: Rest) {
    super();
    this.#rest = rest;
    this.#rest.removeAllListeners();
  }
}
