import type { Rest } from "../rest.js";
import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class GatewayRouter {
  static readonly ROUTES = {
    gateway: "/gateway" as const,
    gatewayBot: "/gateway/bot" as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<HttpResponse<GatewayResponseEntity>> {
    return this.#rest.get(GatewayRouter.ROUTES.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<HttpResponse<GatewayBotResponseEntity>> {
    return this.#rest.get(GatewayRouter.ROUTES.gatewayBot);
  }
}
