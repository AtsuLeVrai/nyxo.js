import type { Integer } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export interface SessionStartLimitEntity {
  total: Integer;
  remaining: Integer;
  reset_after: Integer;
  max_concurrency: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-example-response}
 */
export interface GatewayResponseEntity {
  url: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response}
 */
export interface GatewayBotResponseEntity extends GatewayResponseEntity {
  shards: Integer;
  session_start_limit: SessionStartLimitEntity;
}

export interface GatewayRoutes {
  readonly gateway: "/gateway";
  readonly gatewayBot: "/gateway/bot";
}

export class GatewayRouter extends BaseRouter {
  static readonly ROUTES: GatewayRoutes = {
    gateway: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponseEntity> {
    return this.get(GatewayRouter.ROUTES.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponseEntity> {
    return this.get(GatewayRouter.ROUTES.gatewayBot);
  }
}
