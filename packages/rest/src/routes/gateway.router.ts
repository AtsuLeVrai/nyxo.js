import type { Rest } from "../core/index.js";
import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../schemas/index.js";

export class GatewayRouter {
  static readonly ROUTES = {
    gatewayDefault: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponseEntity> {
    return this.#rest.get(GatewayRouter.ROUTES.gatewayDefault);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponseEntity> {
    return this.#rest.get(GatewayRouter.ROUTES.gatewayBot);
  }
}
