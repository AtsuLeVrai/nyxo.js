import type { Rest } from "../core/index.js";

export abstract class BaseRouter {
  protected rest: Rest;
  protected sessionId?: string;

  constructor(rest: Rest, sessionId?: string) {
    this.rest = rest;
    this.sessionId = sessionId;
  }

  withSession(sessionId: string): this {
    const RouterClass = this.constructor as new (
      rest: Rest,
      sessionId?: string,
    ) => this;
    return new RouterClass(this.rest, sessionId);
  }

  withDefaultSession(): this {
    const RouterClass = this.constructor as new (rest: Rest) => this;
    return new RouterClass(this.rest);
  }
}
