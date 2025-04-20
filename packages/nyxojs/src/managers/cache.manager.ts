import type { Snowflake } from "@nyxojs/core";
import type { PresenceEntity } from "@nyxojs/gateway";
import { Store, StoreOptions } from "@nyxojs/store";
import { z } from "zod";
import type {
  AnyChannel,
  AutoModerationRule,
  Ban,
  Emoji,
  Entitlement,
  Guild,
  GuildMember,
  GuildScheduledEvent,
  Integration,
  Invite,
  Message,
  Role,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadMember,
  User,
  Webhook,
} from "../classes/index.js";

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
 * Configuration options for the cache system of the Nyxo.js client.
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

  /**
   * Configuration for the bans cache.
   *
   * This cache stores Ban objects which represent user bans in guilds.
   * Only relevant for bots that interact with bans.
   *
   * @default { enabled: true, maxSize: 1000, ttl: 0 }
   */
  bans: ClientCacheEntityOptions.default({}),
});

export type ClientCacheOptions = z.infer<typeof ClientCacheOptions>;

/**
 * A comprehensive cache management system for Discord entities.
 *
 * The CacheManager provides a centralized way to store, retrieve, and manage
 * different types of Discord entities with configurable caching strategies.
 * It supports automatic expiration, size limits, and various eviction strategies
 * to optimize memory usage and performance.
 *
 * Each entity type (users, guilds, messages, etc.) has its own dedicated cache
 * store with independently configurable settings.
 */
export class CacheManager {
  /**
   * Validated configuration options
   * @private
   */
  readonly #options: ClientCacheOptions;

  /**
   * Stores for each entity type
   * @private
   */
  readonly #stores: Map<string, Store<Snowflake, unknown>> = new Map();

  /**
   * Sweep interval timer
   * @private
   */
  #sweepTimer: NodeJS.Timeout | null = null;

  /**
   * Store for Discord users
   * @private
   */
  readonly #users: Store<Snowflake, User>;

  /**
   * Store for Discord guilds
   * @private
   */
  readonly #guilds: Store<Snowflake, Guild>;

  /**
   * Store for Discord channels
   * @private
   */
  readonly #channels: Store<Snowflake, AnyChannel>;

  /**
   * Store for guild members
   * @private
   */
  readonly #members: Store<Snowflake, GuildMember>;

  /**
   * Store for guild roles
   * @private
   */
  readonly #roles: Store<Snowflake, Role>;

  /**
   * Store for channel messages
   * @private
   */
  readonly #messages: Store<Snowflake, Message>;

  /**
   * Store for guild emojis
   * @private
   */
  readonly #emojis: Store<Snowflake, Emoji>;

  /**
   * Store for stage instances
   * @private
   */
  readonly #stageInstances: Store<Snowflake, StageInstance>;

  /**
   * Store for scheduled events
   * @private
   */
  readonly #scheduledEvents: Store<Snowflake, GuildScheduledEvent>;

  /**
   * Store for auto moderation rules
   * @private
   */
  readonly #autoModerationRules: Store<Snowflake, AutoModerationRule>;

  /**
   * Store for guild stickers
   * @private
   */
  readonly #stickers: Store<Snowflake, Sticker>;

  /**
   * Store for application entitlements
   * @private
   */
  readonly #entitlements: Store<Snowflake, Entitlement>;

  /**
   * Store for application subscriptions
   * @private
   */
  readonly #subscriptions: Store<Snowflake, Subscription>;

  /**
   * Store for presence entities
   * @private
   */
  readonly #presences: Store<Snowflake, PresenceEntity>;

  /**
   * Store for integrations
   * @private
   */
  readonly #integrations: Store<Snowflake, Integration>;

  /**
   * Store for soundboard sounds
   * @private
   */
  readonly #soundboards: Store<Snowflake, SoundboardSound>;

  /**
   * Store for thread members
   * @private
   */
  readonly #threadMembers: Store<Snowflake, ThreadMember>;

  /**
   * Store for invites
   * @private
   */
  readonly #invites: Store<Snowflake, Invite>;

  /**
   * Store for webhooks
   * @private
   */
  readonly #webhooks: Store<Snowflake, Webhook>;

  /**
   * Store for bans
   * @private
   */
  readonly #bans: Store<Snowflake, Ban>;

  /**
   * Creates a new cache manager with the specified options.
   *
   * @param options - Cache configuration options that control caching behavior
   */
  constructor(options: ClientCacheOptions) {
    this.#options = options;

    // Initialize all caches
    this.#users = this.#createStore("users", this.#options.users);
    this.#guilds = this.#createStore("guilds", this.#options.guilds);
    this.#channels = this.#createStore("channels", this.#options.channels);
    this.#members = this.#createStore("members", this.#options.members);
    this.#roles = this.#createStore("roles", this.#options.roles);
    this.#messages = this.#createStore("messages", this.#options.messages);
    this.#emojis = this.#createStore("emojis", this.#options.emojis);
    this.#stageInstances = this.#createStore(
      "stageInstances",
      this.#options.stageInstances,
    );
    this.#scheduledEvents = this.#createStore(
      "scheduledEvents",
      this.#options.scheduledEvents,
    );
    this.#autoModerationRules = this.#createStore(
      "autoModerationRules",
      this.#options.autoModerationRules,
    );
    this.#stickers = this.#createStore("stickers", this.#options.stickers);
    this.#entitlements = this.#createStore(
      "entitlements",
      this.#options.entitlements,
    );
    this.#subscriptions = this.#createStore(
      "subscriptions",
      this.#options.subscriptions,
    );
    this.#presences = this.#createStore("presences", this.#options.presences);
    this.#integrations = this.#createStore(
      "integrations",
      this.#options.integrations,
    );
    this.#soundboards = this.#createStore(
      "soundboards",
      this.#options.soundboards,
    );
    this.#threadMembers = this.#createStore(
      "threadMembers",
      this.#options.threadMembers,
    );
    this.#invites = this.#createStore("invites", this.#options.invites);
    this.#webhooks = this.#createStore("webhooks", this.#options.webhooks);
    this.#bans = this.#createStore("bans", this.#options.bans);

    // Start sweeping if enabled
    if (this.#options.enabled && this.#options.sweepInterval > 0) {
      this.#startSweeping();
    }
  }

  /**
   * Access the users cache store.
   * Contains User objects which represent Discord users.
   */
  get users(): Store<Snowflake, User> {
    return this.#users;
  }

  /**
   * Access the guilds cache store.
   * Contains Guild objects which represent Discord servers.
   */
  get guilds(): Store<Snowflake, Guild> {
    return this.#guilds;
  }

  /**
   * Access the channels cache store.
   * Contains Channel objects of various types (text, voice, category, etc.).
   */
  get channels(): Store<Snowflake, AnyChannel> {
    return this.#channels;
  }

  /**
   * Access the members cache store.
   * Contains GuildMember objects which represent users in specific guilds.
   */
  get members(): Store<Snowflake, GuildMember> {
    return this.#members;
  }

  /**
   * Access the roles cache store.
   * Contains Role objects which define permissions in guilds.
   */
  get roles(): Store<Snowflake, Role> {
    return this.#roles;
  }

  /**
   * Access the messages cache store.
   * Contains Message objects sent in channels.
   */
  get messages(): Store<Snowflake, Message> {
    return this.#messages;
  }

  /**
   * Access the emojis cache store.
   * Contains Emoji objects from guilds.
   */
  get emojis(): Store<Snowflake, Emoji> {
    return this.#emojis;
  }

  /**
   * Access the stage instances cache store.
   * Contains StageInstance objects for Discord's Stage channels.
   */
  get stageInstances(): Store<Snowflake, StageInstance> {
    return this.#stageInstances;
  }

  /**
   * Access the scheduled events cache store.
   * Contains GuildScheduledEvent objects for Discord server events.
   */
  get scheduledEvents(): Store<Snowflake, GuildScheduledEvent> {
    return this.#scheduledEvents;
  }

  /**
   * Access the auto moderation rules cache store.
   * Contains AutoModerationRule objects for Discord's content filtering.
   */
  get autoModerationRules(): Store<Snowflake, AutoModerationRule> {
    return this.#autoModerationRules;
  }

  /**
   * Access the stickers cache store.
   * Contains Sticker objects from guilds.
   */
  get stickers(): Store<Snowflake, Sticker> {
    return this.#stickers;
  }

  /**
   * Access the entitlements cache store.
   * Contains Entitlement objects for premium features.
   */
  get entitlements(): Store<Snowflake, Entitlement> {
    return this.#entitlements;
  }

  /**
   * Access the subscriptions cache store.
   * Contains Subscription objects for premium features.
   */
  get subscriptions(): Store<Snowflake, Subscription> {
    return this.#subscriptions;
  }

  /**
   * Access the presences cache store.
   * Contains PresenceEntity objects for users' online status.
   */
  get presences(): Store<Snowflake, PresenceEntity> {
    return this.#presences;
  }

  /**
   * Access the integrations cache store.
   * Contains Integration objects for third-party services.
   */
  get integrations(): Store<Snowflake, Integration> {
    return this.#integrations;
  }

  /**
   * Access the soundboards cache store.
   * Contains SoundboardSound objects for Discord's soundboard feature.
   */
  get soundboards(): Store<Snowflake, SoundboardSound> {
    return this.#soundboards;
  }

  /**
   * Access the thread members cache store.
   * Contains ThreadMember objects for users in threads.
   */
  get threadMembers(): Store<Snowflake, ThreadMember> {
    return this.#threadMembers;
  }

  /**
   * Access the invites cache store.
   * Contains Invite objects for server invites.
   */
  get invites(): Store<Snowflake, Invite> {
    return this.#invites;
  }

  /**
   * Access the webhooks cache store.
   * Contains Webhook objects for server webhooks.
   */
  get webhooks(): Store<Snowflake, Webhook> {
    return this.#webhooks;
  }

  /**
   * Access the bans cache store.
   * Contains Ban objects for user bans in guilds.
   */
  get bans(): Store<Snowflake, Ban> {
    return this.#bans;
  }

  /**
   * Performs a sweep operation on all caches to remove expired items.
   * This helps ensure memory usage remains optimized by removing stale entries.
   *
   * The sweep operation leverages the Store's built-in expiration mechanisms
   * and respects the configuration for each individual store.
   *
   * @remarks
   * The sweep operation is automatically called on the interval specified
   * in the configuration options. It can also be manually triggered.
   */
  sweep(): void {
    if (!this.#options.enabled) {
      return;
    }

    for (const [name, store] of this.#stores.entries()) {
      try {
        const storeOptions = (
          this.#options as unknown as Record<string, ClientCacheEntityOptions>
        )[name];

        // Skip if sweep is disabled for this store
        if (!(storeOptions?.enabled && storeOptions?.sweepInterval)) {
          continue;
        }

        const expiredKeys: Snowflake[] = [];

        // Find expired items using the Store's isExpired method
        store.forEach((_value, key) => {
          // The Store has an isExpired method, but we need to cast to access it
          if (
            (
              store as unknown as { isExpired(key: Snowflake): boolean }
            ).isExpired(key)
          ) {
            expiredKeys.push(key);
          }
        });

        // Remove expired items
        for (const key of expiredKeys) {
          store.delete(key);
        }
      } catch (_error) {
        // Silent fail to prevent cascade failures
      }
    }
  }

  /**
   * Finds entities across multiple stores that match a predicate.
   * This is useful for searching across different entity types.
   *
   * @param predicate - Function to test each entity
   * @param storeNames - Optional array of store names to search in (defaults to all stores)
   * @returns Object grouping results by store name
   */
  findAcrossStores<T = unknown>(
    predicate: (value: unknown, key: Snowflake) => boolean,
    storeNames?: string[],
  ): Record<string, T[]> {
    const results: Record<string, T[]> = {};
    const storesToSearch = storeNames
      ? (storeNames
          .map((name) => [name, this.#stores.get(name)])
          .filter(([_, store]) => store) as [
          string,
          Store<Snowflake, unknown>,
        ][])
      : [...this.#stores.entries()];

    for (const [name, store] of storesToSearch) {
      results[name] = [];
      store.forEach((value, key) => {
        if (predicate(value, key)) {
          (results[name] as unknown[]).push(value);
        }
      });
    }

    return results;
  }

  /**
   * Clears all caches or a specific cache.
   * This is useful for resetting the state or freeing memory.
   *
   * @param cacheName - Optional name of the specific cache to clear
   * @returns The cache manager instance for method chaining
   */
  clear(cacheName?: string): this {
    if (cacheName) {
      const store = this.#stores.get(cacheName);
      if (store) {
        store.clear();
      }
    } else {
      // Clear all caches
      for (const store of this.#stores.values()) {
        store.clear();
      }
    }

    return this;
  }

  /**
   * Disposes the cache manager, clearing all caches and stopping the sweep interval.
   * Call this when the cache manager is no longer needed to free resources.
   */
  dispose(): void {
    // Stop the sweep interval
    if (this.#sweepTimer) {
      clearInterval(this.#sweepTimer);
      this.#sweepTimer = null;
    }

    // Clear all caches and destroy their cleanup timers
    for (const store of this.#stores.values()) {
      // Call destroy to clear any internal timers in the Store
      (store as unknown as { destroy(): void }).destroy();
    }

    // Clear all caches
    this.clear();

    // Clear the stores map
    this.#stores.clear();
  }

  /**
   * Returns the total size of all caches.
   * This provides an overview of how many entities are currently stored.
   *
   * @returns The total number of cached entities across all stores
   */
  getTotalSize(): number {
    let total = 0;
    for (const store of this.#stores.values()) {
      total += store.size;
    }
    return total;
  }

  /**
   * Returns the current memory usage statistics for all stores.
   *
   * @returns Object containing counts for each store type
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const [name, store] of this.#stores.entries()) {
      stats[name] = store.size;
    }

    return stats;
  }

  /**
   * Creates a store with the specified options.
   *
   * @param name - The name of the store
   * @param options - Configuration options for this store
   * @returns A configured Store instance
   * @private
   */
  #createStore<K extends Snowflake, V>(
    name: string,
    options: ClientCacheEntityOptions,
  ): Store<K, V> {
    // Skip if cache is globally disabled or this specific cache is disabled
    if (!(this.#options.enabled && options.enabled)) {
      return new Store<K, V>(null, { maxSize: 0, ttl: 0 });
    }

    // Create the store with the specified options
    const store = new Store<K, V>(null, {
      maxSize: options.maxSize,
      ttl: options.ttl,
      evictionStrategy: options.evictionStrategy,
    });

    // Store the store in our map
    this.#stores.set(name, store);

    return store;
  }

  /**
   * Starts the sweep interval to remove expired items automatically.
   * @private
   */
  #startSweeping(): void {
    if (this.#sweepTimer) {
      clearInterval(this.#sweepTimer);
    }

    this.#sweepTimer = setInterval(() => {
      this.sweep();
    }, this.#options.sweepInterval);
  }
}
