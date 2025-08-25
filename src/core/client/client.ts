import { EventEmitter } from "eventemitter3";
import { Gateway } from "../gateway/index.js";
import { Rest } from "../rest/index.js";

export class Client extends EventEmitter {
  readonly rest: Rest;
  readonly gateway: Gateway;

  constructor() {
    super();
    this.rest = new Rest();
    this.gateway = new Gateway(this.rest);
  }
}
