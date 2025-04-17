import { GatewayOptions } from "@nyxjs/gateway";
import { RestOptions } from "@nyxjs/rest";
import { StoreOptions } from "@nyxjs/store";
import { z } from "zod";

export const ClientCacheEntityOptions = z
  .object({
    /**
     * Controls whether the client's cache mechanism is active.
     * When disabled, all entities will be fetched directly from the API.
     *
     * @default true
     */
    enabled: z.boolean().default(true),

    /**
     * Time-to-live (TTL) for cached entities in milliseconds.
     * This determines how long entities remain in the cache before being considered stale.
     *
     * @default true
     */
    sweepInterval: z.boolean().default(true),

    /**
     * Storage options for the cache.
     */
    ...StoreOptions.shape,
  })
  .readonly();

export type ClientCacheEntityOptions = z.infer<typeof ClientCacheEntityOptions>;

/**
 * Configuration options for the cache system of the Nyx.js client.
 *
 * The cache manager stores frequently accessed Discord entities to reduce API calls,
 * improve performance, and manage memory usage efficiently. Each entity type
 * can be configured separately with different limits and settings.
 */
export const ClientCacheOptions = z.object({
  /**
   * Controls whether the entire cache system is active.
   * When disabled, all entities will be fetched directly from the API.
   *
   * Disabling the cache improves memory usage at the cost of increased API requests.
   * This can be useful for memory-constrained environments.
   *
   * @default true
   */
  enabled: z.boolean().default(true),

  /**
   * Interval in milliseconds for the cache manager to check for and remove expired items.
   *
   * Lower values ensure more accurate TTL enforcement but increase CPU usage.
   * Higher values reduce performance impact but may keep expired items longer.
   * Set to 0 to disable periodic sweeping entirely.
   *
   * @default 300000 (5 minutes)
   */
  sweepInterval: z.number().int().positive().default(300000),

  /**
   * Configuration for the users cache.
   *
   * This cache stores User objects retrieved from the API.
   * Users are referenced by many other entities and are frequently accessed.
   *
   * Recommended to set a higher limit for bots in many guilds.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  users: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the channels cache.
   *
   * This cache stores all types of channel objects (text, voice, category, etc.).
   * Channels are frequently accessed for permission checks and message operations.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  channels: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the guilds cache.
   *
   * This cache stores Guild objects which contain core information about Discord servers.
   * Guilds are central entities referenced by many operations.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  guilds: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the emojis cache.
   *
   * This cache stores custom emoji objects from guilds.
   * Consider setting a lower limit if emoji usage is minimal in your bot.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  emojis: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the entitlements cache.
   *
   * This cache stores entitlement objects for premium features and subscriptions.
   * Only relevant for bots that interact with Discord's monetization features.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  entitlements: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the subscriptions cache.
   *
   * This cache stores subscription objects for premium features.
   * Only relevant for bots that interact with Discord's subscription systems.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  subscriptions: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the messages cache.
   *
   * This cache stores Message objects which are often needed for context
   * in commands, reactions, and other user interactions.
   *
   * Consider using a shorter TTL for messages as they become less relevant over time.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  messages: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the auto moderation rules cache.
   *
   * This cache stores AutoModerationRule objects which define automated content filtering.
   * Only relevant for bots that interact with or manage Discord's auto moderation system.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  autoModerationRules: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the stage instances cache.
   *
   * This cache stores StageInstance objects for Discord's Stage channels.
   * Only relevant for bots that interact with Stage channels.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  stageInstances: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the thread members cache.
   *
   * This cache stores ThreadMember objects for threads in guilds.
   * Only relevant for bots that interact with threads.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  members: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the roles cache.
   *
   * This cache stores Role objects which define permissions and settings for users in guilds.
   * Only relevant for bots that interact with roles or permissions.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  roles: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the scheduled events cache.
   *
   * This cache stores GuildScheduledEvent objects which define events in guilds.
   * Only relevant for bots that interact with scheduled events.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  scheduledEvents: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the stickers cache.
   *
   * This cache stores Sticker objects which are custom stickers used in messages.
   * Only relevant for bots that interact with stickers.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  stickers: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the presences cache.
   *
   * This cache stores Presence objects which represent the online status and activity of users.
   * Only relevant for bots that interact with user presence updates.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  presences: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the integrations cache.
   *
   * This cache stores Integration objects which represent third-party integrations in guilds.
   * Only relevant for bots that interact with integrations.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  integrations: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the soundboards cache.
   *
   * This cache stores Soundboard objects which represent soundboard sounds in guilds.
   * Only relevant for bots that interact with soundboards.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  soundboards: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the thread members cache.
   *
   * This cache stores ThreadMember objects which represent members of threads in guilds.
   * Only relevant for bots that interact with threads.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  threadMembers: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the invites cache.
   *
   * This cache stores Invite objects which represent server invites.
   * Only relevant for bots that interact with invites.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  invites: ClientCacheEntityOptions.default({}),

  /**
   * Configuration for the webhooks cache.
   *
   * This cache stores Webhook objects which represent webhooks in guilds.
   * Only relevant for bots that interact with webhooks.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  webhooks: ClientCacheEntityOptions.default({}),
});

export type ClientCacheOptions = z.infer<typeof ClientCacheOptions>;

/**
 * Configuration options for the Nyx.js Discord client.
 *
 * These options control the client's behavior including caching strategy,
 * REST API settings, and gateway connection parameters.
 */
export const ClientOptions = z.object({
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
});

export type ClientOptions = z.infer<typeof ClientOptions>;
