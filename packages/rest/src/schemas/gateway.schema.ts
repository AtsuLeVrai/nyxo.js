import type { Integer } from "@nyxjs/core";

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
