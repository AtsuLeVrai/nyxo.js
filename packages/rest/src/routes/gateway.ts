import type { Integer } from "@nyxjs/core";
import { Router } from "./router.js";

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

export class GatewayRouter extends Router {
  static routes = {
    gateway: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponse> {
    return this.get(GatewayRouter.routes.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponse> {
    return this.get(GatewayRouter.routes.gatewayBot);
  }
}
