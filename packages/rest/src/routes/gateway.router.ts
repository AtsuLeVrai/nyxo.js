import { BaseRouter } from "../base/index.js";
import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../schemas/index.js";

export class GatewayRouter extends BaseRouter {
  static readonly ROUTES = {
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
