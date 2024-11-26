import type { Integer } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export interface SessionStartLimit {
  total: Integer;
  remaining: Integer;
  reset_after: Integer;
  max_concurrency: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-example-response}
 */
export interface GatewayResponse {
  url: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response}
 */
export interface GatewayBotResponse extends GatewayResponse {
  shards: Integer;
  session_start_limit: SessionStartLimit;
}

export class GatewayRouter {
  static routes = {
    gateway: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponse> {
    return this.#rest.get(GatewayRouter.routes.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponse> {
    return this.#rest.get(GatewayRouter.routes.gatewayBot);
  }
}
