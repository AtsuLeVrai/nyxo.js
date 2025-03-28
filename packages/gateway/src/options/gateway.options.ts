import { ApiVersion, BitFieldManager } from "@nyxjs/core";
import { z } from "zod";
import {
  GatewayIntentsBits,
  type UpdatePresenceEntity,
} from "../types/index.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ShardOptions } from "./shard.options.js";

/**
 * Supported Gateway payload encoding types
 *
 * - json: Standard JSON encoding (most compatible)
 * - etf: Erlang Term Format (more efficient, requires erlpack)
 */
export const EncodingType = z.enum(["json", "etf"]);

/**
 * Type definition for EncodingType
 */
export type EncodingType = z.infer<typeof EncodingType>;

/**
 * Supported Gateway payload compression types
 *
 * - zlib-stream: Zlib compression with streaming
 * - zstd-stream: Zstandard compression with streaming
 */
export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);

/**
 * Type definition for CompressionType
 */
export type CompressionType = z.infer<typeof CompressionType>;

/**
 * Main configuration options for the Discord Gateway client
 *
 * These options control the behavior of the WebSocket connection to Discord's
 * Gateway API, including authentication, sharding, compression, and more.
 */
export const GatewayOptions = z.object({
  /**
   * Discord bot token for authentication
   *
   * This token is required for connecting to the Gateway.
   *
   * @see {@link https://discord.com/developers/docs/reference#authentication}
   */
  token: z.string().optional(),

  /**
   * Gateway intents to request
   *
   * Intents determine which events the bot will receive from Discord.
   * Can be specified as an array of intent flags or a precalculated bit field.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
   */
  intents: z
    .union([
      z
        .nativeEnum(GatewayIntentsBits)
        .array()
        .transform((value) => {
          return BitFieldManager.combine(value).toNumber();
        }),
      z.number().int().positive(),
    ])
    .describe("Gateway intents to request"),

  /**
   * Discord API version to use
   *
   * Currently only v10 is supported.
   */
  version: z
    .literal(ApiVersion.V10)
    .default(ApiVersion.V10)
    .describe("Discord API version to use"),

  /**
   * Number of members in a guild before the members are no longer returned in the guild create event
   *
   * Used to limit the initial payload size for large guilds.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   */
  largeThreshold: z
    .number()
    .int()
    .min(50)
    .max(250)
    .default(50)
    .describe("Member threshold for large guild optimizations"),

  /**
   * Payload encoding format to use
   *
   * Defaults to JSON for maximum compatibility.
   */
  encodingType: EncodingType.default("json").describe(
    "Payload encoding format to use",
  ),

  /**
   * Payload compression format to use
   *
   * Optional. When not specified, no compression is used.
   */
  compressionType: CompressionType.optional().describe(
    "Payload compression format to use",
  ),

  /**
   * Backoff schedule for reconnection attempts in milliseconds
   *
   * These values determine the wait time between reconnection attempts
   * in case of connection failures.
   */
  backoffSchedule: z
    .array(z.number().positive())
    .default([1000, 5000, 10000])
    .describe("Backoff schedule for reconnection attempts in milliseconds"),

  /**
   * Initial presence data to set upon connecting
   *
   * Optional. When specified, this presence will be set immediately after connection.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence}
   */
  presence: z
    .custom<UpdatePresenceEntity>()
    .optional()
    .describe("Initial presence data to set upon connecting"),

  /**
   * Heartbeat configuration options
   *
   * Controls the behavior of the connection heartbeat system.
   */
  heartbeat: HeartbeatOptions.default({}).describe(
    "Heartbeat configuration options",
  ),

  /**
   * Sharding configuration options
   *
   * Controls how the client is sharded across multiple gateway connections.
   */
  shard: ShardOptions.default({}).describe("Sharding configuration options"),
});

/**
 * Type definition for GatewayOptions
 */
export type GatewayOptions = z.infer<typeof GatewayOptions>;
