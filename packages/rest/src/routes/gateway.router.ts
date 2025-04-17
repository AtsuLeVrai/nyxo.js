import type { Rest } from "../core/index.js";

/**
 * Interface for Gateway Session Start Limit object.
 *
 * This provides critical information about rate limits for WebSocket session starts.
 * Applications must respect these limits to avoid being temporarily banned from
 * connecting to the gateway.
 *
 * @remarks
 * These limits control how frequently you can start new gateway sessions.
 * When the remaining count hits 0, you must wait for the reset_after period
 * before starting new sessions. These limits are particularly important for
 * bots that operate at scale across many shards.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export interface SessionStartLimitEntity {
  /**
   * Total number of session starts allowed per reset period.
   *
   * This value is typically 1000 for most bots, but may vary.
   * Must be a positive integer.
   */
  total: number;

  /**
   * Remaining number of session starts allowed in the current period.
   *
   * When this reaches 0, you must wait for reset_after milliseconds
   * before attempting to start new sessions.
   * Must be a non-negative integer.
   */
  remaining: number;

  /**
   * Number of milliseconds after which the limit resets.
   *
   * After this duration passes, the remaining count will reset to the total.
   * This is typically 24 hours (86,400,000 milliseconds).
   * Must be a non-negative integer.
   */
  reset_after: number;

  /**
   * Maximum number of concurrent sessions that can be used.
   *
   * This indicates how many active WebSocket connections your bot can
   * maintain simultaneously. This value is tied to your bot's shard count.
   * Must be a positive integer.
   */
  max_concurrency: number;
}

/**
 * Interface for basic Gateway response.
 *
 * This contains the WebSocket URL for connecting to Discord's gateway.
 * This is the minimal information needed to establish a connection.
 *
 * @remarks
 * This URL is used to establish a WebSocket connection to Discord's gateway.
 * This base URL should be used with additional query parameters like
 * `v` (API version) and `encoding` (json or etf).
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-example-response}
 */
export interface GatewayResponseEntity {
  /**
   * The WebSocket URL that clients can connect to.
   *
   * Example: "wss://gateway.discord.gg"
   * This URL should be used with the proper version and encoding parameters,
   * such as "wss://gateway.discord.gg/?v=10&encoding=json"
   */
  url: string;
}

/**
 * Interface for Gateway Bot response.
 *
 * This extends the basic Gateway response with additional information needed by bots.
 * This enhanced response includes critical information for bots operating at scale,
 * such as sharding requirements and session start limits.
 *
 * @remarks
 * This response includes sharding information and session start limits,
 * which are essential for bots operating across multiple servers. As your
 * bot joins more guilds, Discord may require you to increase your shard count
 * to distribute the load.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response}
 */
export interface GatewayBotResponseEntity extends GatewayResponseEntity {
  /**
   * Recommended number of shards to use when connecting.
   *
   * Discord calculates this based on the number of guilds your bot is in.
   * You should use at least this many shards when connecting to the gateway.
   * Must be a positive integer.
   */
  shards: number;

  /**
   * Session start limit information.
   *
   * Contains details about how many new gateway sessions your bot can
   * start within the current rate limit period.
   */
  session_start_limit: SessionStartLimitEntity;
}

/**
 * Router for Discord Gateway-related API endpoints.
 *
 * The Gateway router provides methods to retrieve information needed to establish
 * WebSocket connections to Discord's real-time gateway API. These connections are
 * essential for receiving events and maintaining bot state.
 *
 * @remarks
 * The gateway is Discord's real-time WebSocket API that allows applications
 * to receive events about various actions and state changes. Unlike the REST API,
 * which requires polling for updates, the Gateway pushes data to your client as
 * events occur, making it more efficient for maintaining state.
 *
 * There are two types of gateway connections:
 * 1. Standard gateway - Used by regular users
 * 2. Bot gateway - Used by bots, with added information about sharding
 *
 * These methods provide the necessary information to establish and maintain
 * these gateway connections properly.
 */
export class GatewayRouter {
  /**
   * API route constants for gateway-related endpoints.
   */
  static readonly GATEWAY_ROUTES = {
    /**
     * Endpoint for getting basic gateway information.
     * This route does not require authentication.
     */
    standardGatewayEndpoint: "/gateway",

    /**
     * Endpoint for getting gateway information for bots, including sharding requirements.
     * This route requires authentication with a bot token.
     */
    botGatewayEndpoint: "/gateway/bot",
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Gateway Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the gateway WebSocket URL.
   *
   * This method returns the WebSocket URL that clients can use to connect to Discord's
   * gateway. This is primarily used by regular Discord clients, not bots.
   *
   * @returns A promise that resolves to a gateway response containing the WebSocket URL
   *
   * @remarks
   * This endpoint returns the WebSocket URL that clients can use to connect to Discord's gateway.
   * This method does not require authentication and returns only the basic URL without
   * sharding information or session limits.
   *
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  fetchGatewayUrl(): Promise<GatewayResponseEntity> {
    return this.#rest.get(GatewayRouter.GATEWAY_ROUTES.standardGatewayEndpoint);
  }

  /**
   * Fetches the gateway WebSocket URL and additional information for bots.
   *
   * This method returns comprehensive information needed by bots to establish
   * and maintain optimal connections to Discord's gateway, including sharding
   * requirements and session start limits.
   *
   * @returns A promise that resolves to a gateway bot response containing connection information
   *
   * @remarks
   * This endpoint returns:
   * - The WebSocket URL for connecting to the gateway
   * - The recommended number of shards to use
   * - Session start limit information
   *
   * Bots should use this method instead of fetchGatewayUrl() to get information about:
   * - Sharding requirements based on the bot's guild count
   * - Rate limits on session starts
   * - Maximum concurrent sessions
   *
   * This method requires authentication with a bot token.
   *
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  fetchBotGatewayInfo(): Promise<GatewayBotResponseEntity> {
    return this.#rest.get(GatewayRouter.GATEWAY_ROUTES.botGatewayEndpoint);
  }
}
