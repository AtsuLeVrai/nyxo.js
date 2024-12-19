import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

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
