import type { Rest } from "../core/index.js";

export abstract class BaseRouter {
  protected rest: Rest;

  constructor(rest: Rest) {
    this.rest = rest;
  }
}
