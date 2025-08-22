import type { EndpointFactory } from "../utils/index.js";

export interface GatewayResponse {
  url: string;
}

export interface SessionStartLimitObject {
  total: number;
  remaining: number;
  reset_after: number;
  max_concurrency: number;
}

export interface GatewayBotResponse {
  url: string;
  shards: number;
  session_start_limit: SessionStartLimitObject;
}

export const GatewayRoutes = {
  // GET /gateway - Get Gateway
  getGateway: (() => "/gateway") as EndpointFactory<"/gateway", ["GET"], GatewayResponse>,

  // GET /gateway/bot - Get Gateway Bot
  getGatewayBot: (() => "/gateway/bot") as EndpointFactory<
    "/gateway/bot",
    ["GET"],
    GatewayBotResponse
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
