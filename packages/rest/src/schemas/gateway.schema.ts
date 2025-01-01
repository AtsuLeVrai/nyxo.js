/**
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export interface SessionStartLimitEntity {
  total: number;
  remaining: number;
  reset_after: number;
  max_concurrency: number;
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
  shards: number;
  session_start_limit: SessionStartLimitEntity;
}
