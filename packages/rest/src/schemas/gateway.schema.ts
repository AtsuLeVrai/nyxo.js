import { z } from "zod";

/**
 * Schema for Gateway Session Start Limit object.
 * This provides information about rate limits for session starts.
 *
 * @remarks
 * These limits control how frequently you can start new gateway sessions.
 * When the remaining count hits 0, you must wait for the reset_after period
 * before starting new sessions.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure}
 */
export const SessionStartLimitEntity = z.object({
  /** Total number of session starts allowed per reset period */
  total: z.number().int().positive(),

  /** Remaining number of session starts allowed */
  remaining: z.number().int().nonnegative(),

  /** Number of milliseconds after which the limit resets */
  reset_after: z.number().int().nonnegative(),

  /** Maximum number of concurrent sessions that can be used */
  max_concurrency: z.number().int().positive(),
});

export type SessionStartLimitEntity = z.infer<typeof SessionStartLimitEntity>;

/**
 * Schema for basic Gateway response.
 * This contains the WebSocket URL for connecting to Discord's gateway.
 *
 * @remarks
 * This URL is used to establish a WebSocket connection to Discord's gateway.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-example-response}
 */
export const GatewayResponseEntity = z.object({
  /** The WebSocket URL that clients can connect to */
  url: z.string().url(),
});

export type GatewayResponseEntity = z.infer<typeof GatewayResponseEntity>;

/**
 * Schema for Gateway Bot response.
 * This extends the basic Gateway response with additional information needed by bots.
 *
 * @remarks
 * This response includes sharding information and session start limits,
 * which are essential for bots operating at scale.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response}
 */
export const GatewayBotResponseEntity = GatewayResponseEntity.extend({
  /** Recommended number of shards to use when connecting */
  shards: z.number().int().positive(),

  /** Session start limit information */
  session_start_limit: SessionStartLimitEntity,
});

export type GatewayBotResponseEntity = z.infer<typeof GatewayBotResponseEntity>;
