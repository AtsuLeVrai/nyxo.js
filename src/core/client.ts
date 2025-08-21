import { EventEmitter } from "eventemitter3";
import { Gateway } from "./gateway.js";
import { Rest } from "./rest.js";

export class Client extends EventEmitter {
  readonly rest: Rest;
  readonly gateway: Gateway;

  constructor() {
    super();

    this.rest = new Rest(this);
    this.gateway = new Gateway(this);
  }
}
