import type { Rest } from "../core/index.js";

interface SessionStartLimit {
  total: number;
  remaining: number;
  reset_after: number;
  max_concurrency: number;
}

interface GatewayResponse {
  url: string;
}

interface GatewayBotResponse extends GatewayResponse {
  shards: number;
  session_start_limit: SessionStartLimit;
}

export interface ShardIdentifyParams {
  token: string;
  properties: {
    os: string;
    browser: string;
    device: string;
  };
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: unknown;
  intents: number;
}

export class GatewayRoutes {
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
    return this.#rest.get(GatewayRoutes.routes.gateway);
  }

  /**
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponse> {
    return this.#rest.get(GatewayRoutes.routes.gatewayBot);
  }
}
