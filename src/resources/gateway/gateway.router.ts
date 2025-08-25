import type { Rest } from "../../core/index.js";

export interface SessionStartLimit {
  total: number;
  remaining: number;
  reset_after: number;
  max_concurrency: number;
}

export interface GatewayResponse {
  url: string;
}

export interface GatewayBotResponse extends GatewayResponse {
  shards: number;
  session_start_limit: SessionStartLimit;
}

export class GatewayRouter {
  static readonly Routes = {
    standardGatewayEndpoint: () => "/gateway",
    botGatewayEndpoint: () => "/gateway/bot",
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchGatewayUrl(): Promise<GatewayResponse> {
    return this.#rest.get(GatewayRouter.Routes.standardGatewayEndpoint());
  }
  fetchBotGatewayInfo(): Promise<GatewayBotResponse> {
    return this.#rest.get(GatewayRouter.Routes.botGatewayEndpoint());
  }
}
