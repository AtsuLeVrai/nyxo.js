import type { Snowflake } from "@nyxjs/core";
import type { PresenceEntity } from "@nyxjs/gateway";
import { Store } from "@nyxjs/store";
import {
  type AnyChannel,
  type AutoModerationRule,
  type Emoji,
  type Entitlement,
  type Guild,
  type GuildMember,
  type GuildScheduledEvent,
  type Integration,
  type Message,
  type Role,
  type SoundboardSound,
  type StageInstance,
  type Sticker,
  type Subscription,
  type User,
  type VoiceState,
} from "../classes/index.js";
import type {
  ClientCacheEntityOptions,
  ClientCacheOptions,
} from "../options/index.js";

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
 *
 * @example
 * ```typescript
 * // Create with default options
 * const cacheManager = new CacheManager({
 *   enabled: true,
 *   sweepInterval: 300000
 * });
 *
 * // Create with custom options
 * const cacheManager = new CacheManager({
 *   enabled: true,
 *   sweepInterval: 300000,
 *   guilds: { maxSize: 500, ttl: 3600000 },
 *   messages: { maxSize: 10000, ttl: 1800000 }
 * });
 *
 * // Store a guild
 * cacheManager.guilds.set(guild.id, guild);
 *
 * // Retrieve a guild
 * const guild = cacheManager.guilds.get(guildId);
 *
 * // Find guilds by a predicate
 * const smallGuilds = cacheManager.guilds.filter(guild => guild.memberCount < 100);
 * ```
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
   * Store for voice states
   * @private
   */
  readonly #voiceStates: Store<Snowflake, VoiceState>;

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
    this.#voiceStates = this.#createStore(
      "voiceStates",
      this.#options.voiceStates,
    );
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

    // Start sweeping if enabled
    if (this.#options.enabled && this.#options.sweepInterval > 0) {
      this.#startSweeping();
    }
  }

  /**
   * Access the users cache store.
   * Contains User objects which represent Discord users.
   *
   * @example
   * ```typescript
   * // Get a user by ID
   * const user = cacheManager.users.get('1234567890');
   *
   * // Find users by predicate
   * const adminUsers = cacheManager.users.filter(user => user.isAdmin);
   *
   * // Add or update user data
   * cacheManager.users.add('1234567890', { username: 'NewUsername' });
   * ```
   */
  get users(): Store<Snowflake, User> {
    return this.#users;
  }

  /**
   * Access the guilds cache store.
   * Contains Guild objects which represent Discord servers.
   *
   * @example
   * ```typescript
   * // Get a guild by ID
   * const guild = cacheManager.guilds.get('1234567890');
   *
   * // Find guilds with specific features
   * const communityGuilds = cacheManager.guilds.filter(guild =>
   *   guild.features.includes('COMMUNITY')
   * );
   * ```
   */
  get guilds(): Store<Snowflake, Guild> {
    return this.#guilds;
  }

  /**
   * Access the channels cache store.
   * Contains Channel objects of various types (text, voice, category, etc.).
   *
   * @example
   * ```typescript
   * // Get a channel by ID
   * const channel = cacheManager.channels.get('1234567890');
   *
   * // Find text channels
   * const textChannels = cacheManager.channels.filter(channel =>
   *   channel.type === ChannelType.GuildText
   * );
   * ```
   */
  get channels(): Store<Snowflake, AnyChannel> {
    return this.#channels;
  }

  /**
   * Access the members cache store.
   * Contains GuildMember objects which represent users in specific guilds.
   *
   * @example
   * ```typescript
   * // Get a member by ID
   * const member = cacheManager.members.get('1234567890');
   *
   * // Find members with a specific role
   * const moderators = cacheManager.members.filter(member =>
   *   member.roles.cache.has('moderatorRoleId')
   * );
   * ```
   */
  get members(): Store<Snowflake, GuildMember> {
    return this.#members;
  }

  /**
   * Access the roles cache store.
   * Contains Role objects which define permissions in guilds.
   *
   * @example
   * ```typescript
   * // Get a role by ID
   * const role = cacheManager.roles.get('1234567890');
   *
   * // Find administrative roles
   * const adminRoles = cacheManager.roles.filter(role =>
   *   role.permissions.has(PermissionFlagsBits.Administrator)
   * );
   * ```
   */
  get roles(): Store<Snowflake, Role> {
    return this.#roles;
  }

  /**
   * Access the messages cache store.
   * Contains Message objects sent in channels.
   *
   * @example
   * ```typescript
   * // Get a message by ID
   * const message = cacheManager.messages.get('1234567890');
   *
   * // Find messages with embeds
   * const messagesWithEmbeds = cacheManager.messages.filter(message =>
   *   message.embeds.length > 0
   * );
   * ```
   */
  get messages(): Store<Snowflake, Message> {
    return this.#messages;
  }

  /**
   * Access the emojis cache store.
   * Contains Emoji objects from guilds.
   *
   * @example
   * ```typescript
   * // Get an emoji by ID
   * const emoji = cacheManager.emojis.get('1234567890');
   *
   * // Find animated emojis
   * const animatedEmojis = cacheManager.emojis.filter(emoji => emoji.animated);
   * ```
   */
  get emojis(): Store<Snowflake, Emoji> {
    return this.#emojis;
  }

  /**
   * Access the voice states cache store.
   * Contains VoiceState objects tracking users in voice channels.
   *
   * @example
   * ```typescript
   * // Get a voice state by user ID
   * const voiceState = cacheManager.voiceStates.get('1234567890');
   *
   * // Find users who are streaming
   * const streamingUsers = cacheManager.voiceStates.filter(state => state.streaming);
   * ```
   */
  get voiceStates(): Store<Snowflake, VoiceState> {
    return this.#voiceStates;
  }

  /**
   * Access the stage instances cache store.
   * Contains StageInstance objects for Discord's Stage channels.
   *
   * @example
   * ```typescript
   * // Get a stage instance by ID
   * const stageInstance = cacheManager.stageInstances.get('1234567890');
   *
   * // Find public stage instances
   * const publicStages = cacheManager.stageInstances.filter(
   *   stage => stage.privacyLevel === StagePrivacyLevel.Public
   * );
   * ```
   */
  get stageInstances(): Store<Snowflake, StageInstance> {
    return this.#stageInstances;
  }

  /**
   * Access the scheduled events cache store.
   * Contains GuildScheduledEvent objects for Discord server events.
   *
   * @example
   * ```typescript
   * // Get a scheduled event by ID
   * const event = cacheManager.scheduledEvents.get('1234567890');
   *
   * // Find upcoming events
   * const upcomingEvents = cacheManager.scheduledEvents.filter(
   *   event => event.status === GuildScheduledEventStatus.Scheduled
   * );
   * ```
   */
  get scheduledEvents(): Store<Snowflake, GuildScheduledEvent> {
    return this.#scheduledEvents;
  }

  /**
   * Access the auto moderation rules cache store.
   * Contains AutoModerationRule objects for Discord's content filtering.
   *
   * @example
   * ```typescript
   * // Get a rule by ID
   * const rule = cacheManager.autoModerationRules.get('1234567890');
   *
   * // Find keyword filter rules
   * const keywordRules = cacheManager.autoModerationRules.filter(
   *   rule => rule.triggerType === AutoModerationRuleTriggerType.Keyword
   * );
   * ```
   */
  get autoModerationRules(): Store<Snowflake, AutoModerationRule> {
    return this.#autoModerationRules;
  }

  /**
   * Access the stickers cache store.
   * Contains Sticker objects from guilds.
   *
   * @example
   * ```typescript
   * // Get a sticker by ID
   * const sticker = cacheManager.stickers.get('1234567890');
   *
   * // Find animated stickers
   * const animatedStickers = cacheManager.stickers.filter(
   *   sticker => sticker.format === StickerFormatType.Animated
   * );
   * ```
   */
  get stickers(): Store<Snowflake, Sticker> {
    return this.#stickers;
  }

  /**
   * Access the entitlements cache store.
   * Contains Entitlement objects for premium features.
   *
   * @example
   * ```typescript
   * // Get an entitlement by ID
   * const entitlement = cacheManager.entitlements.get('1234567890');
   *
   * // Find active entitlements
   * const activeEntitlements = cacheManager.entitlements.filter(
   *   entitlement => !entitlement.ended_at
   * );
   * ```
   */
  get entitlements(): Store<Snowflake, Entitlement> {
    return this.#entitlements;
  }

  /**
   * Access the subscriptions cache store.
   * Contains Subscription objects for premium features.
   *
   * @example
   * ```typescript
   * // Get a subscription by ID
   * const subscription = cacheManager.subscriptions.get('1234567890');
   *
   * // Find active subscriptions
   * const activeSubscriptions = cacheManager.subscriptions.filter(
   *   subscription => subscription.status === SubscriptionStatus.Active
   * );
   * ```
   */
  get subscriptions(): Store<Snowflake, Subscription> {
    return this.#subscriptions;
  }

  /**
   * Access the presences cache store.
   * Contains PresenceEntity objects for users' online status.
   *
   * @example
   * ```typescript
   * // Get a presence by user ID
   * const presence = cacheManager.presences.get('1234567890');
   *
   * // Find users who are online
   * const onlineUsers = cacheManager.presences.filter(
   *  presence => presence.status === PresenceStatus.Online
   * );
   * ```
   */
  get presences(): Store<Snowflake, PresenceEntity> {
    return this.#presences;
  }

  /**
   * Access the integrations cache store.
   * Contains Integration objects for third-party services.
   *
   * @example
   * ```typescript
   * // Get an integration by ID
   * const integration = cacheManager.integrations.get('1234567890');
   *
   * // Find integrations with specific features
   * const specificIntegrations = cacheManager.integrations.filter(
   *  integration => integration.type === IntegrationType.Specific
   * );
   * ```
   */
  get integrations(): Store<Snowflake, Integration> {
    return this.#integrations;
  }

  /**
   * Access the soundboards cache store.
   * Contains SoundboardSound objects for Discord's soundboard feature.
   *
   * @example
   * ```typescript
   * // Get a soundboard sound by ID
   * const sound = cacheManager.soundboards.get('1234567890');
   *
   * // Find sounds with specific properties
   * const specificSounds = cacheManager.soundboards.filter(
   *  sound => sound.volume > 0.5
   * );
   * ```
   */
  get soundboards(): Store<Snowflake, SoundboardSound> {
    return this.#soundboards;
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
   *
   * @example
   * ```typescript
   * // Manually trigger a cache sweep
   * cacheManager.sweep();
   * ```
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
      } catch (error) {
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
   *
   * @example
   * ```typescript
   * // Find all entities containing "discord" in their name
   * const results = cacheManager.findAcrossStores(
   *   entity => entity.name?.toLowerCase().includes('discord')
   * );
   *
   * // Find users and messages matching a criterion
   * const results = cacheManager.findAcrossStores(
   *   entity => entity.timestamp > yesterday,
   *   ['users', 'messages']
   * );
   * ```
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
   *
   * @example
   * ```typescript
   * // Clear all caches
   * cacheManager.clear();
   *
   * // Clear only the messages cache
   * cacheManager.clear('messages');
   * ```
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
   *
   * @example
   * ```typescript
   * // Clean up resources when shutting down
   * cacheManager.dispose();
   * ```
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
   *
   * @example
   * ```typescript
   * // Log the total number of cached entities
   * console.log(`Total cached entities: ${cacheManager.getTotalSize()}`);
   * ```
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
   *
   * @example
   * ```typescript
   * // Get and log cache usage statistics
   * const stats = cacheManager.getStats();
   * console.log(`Users cached: ${stats.users}`);
   * console.log(`Guilds cached: ${stats.guilds}`);
   * ```
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
