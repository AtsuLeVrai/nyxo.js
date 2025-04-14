import type { Rest } from "../core/index.js";

/**
 * Interface for Gateway Session Start Limit object.
 * This provides information about rate limits for session starts.
 *
 * @remarks
 * These limits control how frequently you can start new gateway sessions.
 * When the remaining count hits 0, you must wait for the reset_after period
 * before starting new sessions.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export interface SessionStartLimitEntity {
  /**
   * Total number of session starts allowed per reset period
   * Must be a positive integer
   */
  total: number;

  /**
   * Remaining number of session starts allowed
   * Must be a non-negative integer
   */
  remaining: number;

  /**
   * Number of milliseconds after which the limit resets
   * Must be a non-negative integer
   */
  reset_after: number;

  /**
   * Maximum number of concurrent sessions that can be used
   * Must be a positive integer
   */
  max_concurrency: number;
}

/**
 * Interface for basic Gateway response.
 * This contains the WebSocket URL for connecting to Discord's gateway.
 *
 * @remarks
 * This URL is used to establish a WebSocket connection to Discord's gateway.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-example-response}
 */
export interface GatewayResponseEntity {
  /**
   * The WebSocket URL that clients can connect to
   */
  url: string;
}

/**
 * Interface for Gateway Bot response.
 * This extends the basic Gateway response with additional information needed by bots.
 *
 * @remarks
 * This response includes sharding information and session start limits,
 * which are essential for bots operating at scale.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response}
 */
export interface GatewayBotResponseEntity extends GatewayResponseEntity {
  /**
   * Recommended number of shards to use when connecting
   * Must be a positive integer
   */
  shards: number;

  /** Session start limit information */
  session_start_limit: SessionStartLimitEntity;
}

/**
 * Router for Discord Gateway-related API endpoints.
 * Provides methods to get information about connecting to Discord's real-time gateway.
 *
 * @remarks
 * The gateway is Discord's real-time WebSocket API that allows applications
 * to receive events about various actions and state changes.
 * These methods provide the necessary information to establish and maintain gateway connections.
 */
export class GatewayRouter {
  /**
   * API route constants for gateway-related endpoints.
   */
  static readonly ROUTES = {
    /** Endpoint for getting basic gateway information */
    gatewayDefault: "/gateway" as const,

    /** Endpoint for getting gateway information for bots, including sharding requirements */
    gatewayBot: "/gateway/bot" as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Gets the gateway WebSocket URL.
   *
   * @returns A promise that resolves to a gateway response containing the WebSocket URL
   * @remarks
   * This endpoint returns the WebSocket URL that clients can use to connect to Discord's gateway.
   * This method does not require authentication.
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponseEntity> {
    return this.#rest.get(GatewayRouter.ROUTES.gatewayDefault);
  }

  /**
   * Gets the gateway WebSocket URL and additional information for bots.
   *
   * @returns A promise that resolves to a gateway bot response containing connection information
   * @remarks
   * This endpoint returns:
   * - The WebSocket URL for connecting to the gateway
   * - The recommended number of shards to use
   * - Session start limit information
   *
   * Bots should use this method instead of getGateway() to get information about:
   * - Sharding requirements based on the bot's guild count
   * - Rate limits on session starts
   * - Maximum concurrent sessions
   *
   * This method requires authentication with a bot token.
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponseEntity> {
    return this.#rest.get(GatewayRouter.ROUTES.gatewayBot);
  }
}
