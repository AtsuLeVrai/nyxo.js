import { BaseRouter } from "../bases/index.js";

/**
 * Interface for Gateway Session Start Limit object.
 * Provides information about rate limits for WebSocket connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#session-start-limit-object}
 */
export interface SessionStartLimit {
  /**
   * Total number of session starts allowed per reset period.
   * Typically 1000 for most bots.
   */
  total: number;

  /**
   * Remaining number of session starts allowed in the current period.
   * When this reaches 0, wait for reset_after milliseconds.
   */
  remaining: number;

  /**
   * Number of milliseconds after which the limit resets.
   * Typically 24 hours (86,400,000 milliseconds).
   */
  reset_after: number;

  /**
   * Maximum number of concurrent sessions that can be used.
   * Tied to your bot's shard count.
   */
  max_concurrency: number;
}

/**
 * Interface for basic Gateway response.
 * Contains the WebSocket URL for connecting to Discord's gateway.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway}
 */
export interface GatewayResponse {
  /**
   * The WebSocket URL that clients can connect to.
   * Should be used with version and encoding parameters.
   */
  url: string;
}

/**
 * Interface for Gateway Bot response.
 * Extends basic Gateway response with bot-specific information.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot}
 */
export interface GatewayBotResponse extends GatewayResponse {
  /**
   * Recommended number of shards to use when connecting.
   * Based on the number of guilds your bot is in.
   */
  shards: number;

  /**
   * Session start limit information.
   * Contains details about gateway connection rate limits.
   */
  session_start_limit: SessionStartLimit;
}

/**
 * Router for Discord Gateway-related API endpoints.
 * Provides methods to retrieve information for WebSocket connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway}
 */
export class GatewayRouter extends BaseRouter {
  /**
   * API route constants for gateway-related endpoints.
   */
  static readonly GATEWAY_ROUTES = {
    /** Endpoint for getting basic gateway information */
    standardGatewayEndpoint: "/gateway",

    /** Endpoint for getting gateway information for bots */
    botGatewayEndpoint: "/gateway/bot",
  } as const;

  /**
   * Fetches the gateway WebSocket URL.
   * Returns the URL for connecting to Discord's gateway.
   *
   * @returns A promise resolving to a gateway response with the WebSocket URL
   * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway}
   */
  fetchGatewayUrl(): Promise<GatewayResponse> {
    return this.get(GatewayRouter.GATEWAY_ROUTES.standardGatewayEndpoint);
  }

  /**
   * Fetches gateway information for bots.
   * Returns connection details including sharding and rate limits.
   *
   * @returns A promise resolving to a gateway bot response
   * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot}
   */
  fetchBotGatewayInfo(): Promise<GatewayBotResponse> {
    return this.get(GatewayRouter.GATEWAY_ROUTES.botGatewayEndpoint);
  }
}
