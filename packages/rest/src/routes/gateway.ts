import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class GatewayRouter extends BaseRouter {
  static routes = {
    gateway: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponseEntity> {
    return this.get(GatewayRouter.routes.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponseEntity> {
    return this.get(GatewayRouter.routes.gatewayBot);
  }
}
