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
   *
   * @positive
   * @integer
   */
  total: number;

  /**
   * Remaining number of session starts allowed
   *
   * @nonnegative
   * @integer
   */
  remaining: number;

  /**
   * Number of milliseconds after which the limit resets
   *
   * @nonnegative
   * @integer
   */
  reset_after: number;

  /**
   * Maximum number of concurrent sessions that can be used
   *
   * @positive
   * @integer
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
   *
   * @format url
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
   *
   * @positive
   * @integer
   */
  shards: number;

  /** Session start limit information */
  session_start_limit: SessionStartLimitEntity;
}
