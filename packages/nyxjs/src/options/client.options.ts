import { GatewayOptions } from "@nyxjs/gateway";
import { RestOptions } from "@nyxjs/rest";
import { z } from "zod";

/**
 * Options for configuring the cache behavior of the Nyx client.
 *
 * The cache stores frequently accessed Discord entities to reduce API calls
 * and improve performance.
 *
 * @example
 * ```ts
 * const client = new NyxClient({
 *   cache: {
 *     enabled: true,
 *     ttl: 3600000, // 1 hour cache lifetime
 *     userLimit: 5000
 *   }
 * });
 * ```
 */
export const ClientCacheOptions = z
  .object({
    /**
     * Controls whether the client's cache mechanism is active.
     * When disabled, all entities will be fetched directly from the API.
     *
     * @default true
     */
    enabled: z.boolean().default(true),

    /**
     * The time-to-live for cached entities in milliseconds.
     * After this duration, cached entities will be invalidated and refetched.
     *
     * Set to 0 for infinite cache duration (entities remain cached until manually invalidated).
     *
     * @default 0
     */
    ttl: z.number().int().nonnegative().default(0),

    /**
     * Maximum number of user objects to store in the cache.
     * When this limit is reached, least recently used users will be evicted.
     *
     * Higher values increase memory usage but reduce API calls.
     *
     * @default 10000
     */
    userLimit: z.number().int().positive().default(10000),

    /**
     * Maximum number of guild objects to store in the cache.
     * When this limit is reached, least recently used guilds will be evicted.
     *
     * Higher values increase memory usage but reduce API calls.
     *
     * @default 10000
     */
    channelLimit: z.number().int().positive().default(10000),

    /**
     * Maximum number of guild objects to store in the cache.
     * When this limit is reached, least recently used guilds will be evicted.
     *
     * Higher values increase memory usage but reduce API calls.
     *
     * @default 1000
     */
    guildLimit: z.number().int().positive().default(1000),

    /**
     * Maximum number of emoji objects to store in the cache.
     * When this limit is reached, least recently used emojis will be evicted.
     *
     * Higher values increase memory usage but reduce API calls.
     *
     * @default 1000
     */
    emojiLimit: z.number().int().positive().default(1000),
  })
  .readonly();

export type ClientCacheOptions = z.infer<typeof ClientCacheOptions>;

/**
 * Configuration options for the Nyx Discord client.
 *
 * These options control the client's behavior including caching strategy,
 * REST API settings, and gateway connection parameters.
 *
 * @example
 * ```ts
 * const client = new NyxClient({
 *   token: "your-bot-token",
 *   cache: {
 *     enabled: true,
 *     ttl: 1800000 // 30 minutes
 *   },
 *   intents: [Intents.GUILDS, Intents.GUILD_MESSAGES]
 * });
 * ```
 */
export const ClientOptions = z
  .object({
    /**
     * Settings to control the client's caching behavior.
     * Caching reduces API calls by storing frequently accessed entities.
     *
     * @see {@link ClientCacheOptions} for detailed cache configuration.
     */
    cache: ClientCacheOptions.default({}),

    // REST and Gateway options are included from their respective definitions
    ...RestOptions.shape,
    ...GatewayOptions.shape,
  })
  .readonly();

export type ClientOptions = z.infer<typeof ClientOptions>;
