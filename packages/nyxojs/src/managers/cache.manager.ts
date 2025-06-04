import type { Snowflake } from "@nyxojs/core";
import type { PresenceEntity } from "@nyxojs/gateway";
import { Store, StoreOptions } from "@nyxojs/store";
import { z } from "zod/v4";
import type {
  AnyChannel,
  Application,
  AutoModeration,
  Ban,
  Emoji,
  Entitlement,
  Guild,
  GuildMember,
  Integration,
  Invite,
  Message,
  Role,
  ScheduledEvent,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadMember,
  User,
  VoiceState,
  Webhook,
} from "../classes/index.js";
import type { If } from "../types/index.js";

/**
 * Configuration options for a cacheable store in the Nyxo.js client.
 * This defines the structure for each entity type's cache settings.
 */
const CacheableStoreOptions = StoreOptions.extend({
  /**
   * Whether to enable the cache for this entity type.
   * If set to false, the cache will not store this entity type.
   */
  enabled: z.boolean().default(true),
});

/**
 * Configuration options for the cache system of the Nyxo.js client.
 *
 * The cache manager stores frequently accessed Discord entities to reduce API calls,
 * improve performance, and manage memory usage efficiently. Each entity type
 * can be configured separately with different limits and settings.
 */
export const CacheOptions = z.object({
  /**
   * This cache stores Application objects for Discord applications.
   */
  applications: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores AutoModerationRule objects which define automated content filtering.
   * Only relevant for bots that interact with or manage Discord's auto moderation system.
   */
  autoModerationRules: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Ban objects which represent user bans in guilds.
   * Only relevant for bots that interact with bans.
   */
  bans: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores all types of channel objects (text, voice, category, etc.).
   * Channels are frequently accessed for permission checks and message operations.
   */
  channels: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores custom emoji objects from guilds.
   * Consider setting a lower limit if emoji usage is minimal in your bot.
   */
  emojis: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores entitlement objects for premium features and subscriptions.
   * Only relevant for bots that interact with Discord's monetization features.
   */
  entitlements: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Guild objects which contain core information about Discord servers.
   * Guilds are central entities referenced by many operations.
   */
  guilds: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Integration objects which represent third-party integrations in guilds.
   * Only relevant for bots that interact with integrations.
   */
  integrations: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Invite objects which represent server invites.
   * Only relevant for bots that interact with invites.
   */
  invites: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores GuildMember objects for members in guilds.
   * Only relevant for bots that interact with guild members.
   */
  members: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Message objects which are often needed for context
   * in commands, reactions, and other user interactions.
   */
  messages: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Presence objects which represent the online status and activity of users.
   * Only relevant for bots that interact with user presence updates.
   */
  presences: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Role objects which define permissions and settings for users in guilds.
   * Only relevant for bots that interact with roles or permissions.
   */
  roles: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores GuildScheduledEvent objects which define events in guilds.
   * Only relevant for bots that interact with scheduled events.
   */
  scheduledEvents: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores SoundboardSound objects which represent soundboard sounds in guilds.
   * Only relevant for bots that interact with soundboards.
   */
  soundboards: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores StageInstance objects for Discord's Stage channels.
   * Only relevant for bots that interact with Stage channels.
   */
  stageInstances: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Sticker objects which are custom stickers used in messages.
   * Only relevant for bots that interact with stickers.
   */
  stickers: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Subscription objects for premium features.
   * Only relevant for bots that interact with Discord's subscription systems.
   */
  subscriptions: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores ThreadMember objects which represent members of threads in guilds.
   * Only relevant for bots that interact with threads.
   */
  threadMembers: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores User objects retrieved from the API.
   * Users are referenced by many other entities and are frequently accessed.
   */
  users: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores VoiceState objects which represent the voice status of users in guilds.
   * Only relevant for bots that interact with voice channels.
   */
  voiceStates: CacheableStoreOptions.prefault({}),

  /**
   * This cache stores Webhook objects which represent webhooks in guilds.
   * Only relevant for bots that interact with webhooks.
   */
  webhooks: CacheableStoreOptions.prefault({}),
});

export type CacheOptions = z.infer<typeof CacheOptions>;

/**
 * Type representing all possible entity types in the cache
 */
export type CacheEntityType =
  | "applications"
  | "autoModerationRules"
  | "bans"
  | "channels"
  | "emojis"
  | "entitlements"
  | "guilds"
  | "integrations"
  | "invites"
  | "members"
  | "messages"
  | "presences"
  | "roles"
  | "scheduledEvents"
  | "soundboards"
  | "stageInstances"
  | "stickers"
  | "subscriptions"
  | "threadMembers"
  | "users"
  | "voiceStates"
  | "webhooks";

/**
 * Union type of all cacheable entities
 */
export type CacheableEntity =
  | Application
  | AutoModeration
  | AnyChannel
  | Ban
  | Emoji
  | Entitlement
  | Guild
  | GuildMember
  | Integration
  | Invite
  | Message
  | PresenceEntity
  | Role
  | ScheduledEvent
  | SoundboardSound
  | StageInstance
  | Sticker
  | Subscription
  | ThreadMember
  | User
  | VoiceState
  | Webhook;

/**
 * Represents a store that may or may not exist based on configuration.
 * Returns the store type when enabled, null when disabled.
 *
 * @typeParam Enabled - Whether the store is enabled
 * @typeParam StoreType - The type of store when enabled
 */
type ConditionalStore<Enabled extends boolean, StoreType> = If<
  Enabled,
  StoreType,
  null
>;

/**
 * Extracts the enabled flag from a cache configuration object.
 * Returns false if no enabled property is found.
 *
 * @typeParam T - Configuration object type
 */
type IsEnabled<T> = T extends { enabled: infer E extends boolean } ? E : false;

/**
 * A comprehensive cache management system for Discord entities with conditional type safety.
 *
 * The CacheManager provides a centralized way to store, retrieve, and manage
 * different types of Discord entities with configurable caching strategies.
 * It supports automatic expiration, size limits, and various eviction strategies
 * to optimize memory usage and performance.
 *
 * Each entity type (users, guilds, messages, etc.) has its own dedicated cache
 * store with independently configurable settings. When a store is disabled,
 * it returns null instead of an empty store, providing compile-time type safety
 * and eliminating unnecessary runtime checks.
 */
export class CacheManager<T extends CacheOptions = CacheOptions> {
  /**
   * Access the applications cache store.
   * Type: Store<Snowflake, Application> if enabled, null if disabled
   */
  readonly applications: ConditionalStore<
    IsEnabled<T["applications"]>,
    Store<Snowflake, Application>
  >;

  /**
   * Access the auto moderation rules cache store.
   * Type: Store<Snowflake, AutoModeration> if enabled, null if disabled
   */
  readonly autoModerationRules: ConditionalStore<
    IsEnabled<T["autoModerationRules"]>,
    Store<Snowflake, AutoModeration>
  >;

  /**
   * Access the bans cache store.
   * Type: Store<Snowflake, Ban> if enabled, null if disabled
   */
  readonly bans: ConditionalStore<IsEnabled<T["bans"]>, Store<Snowflake, Ban>>;

  /**
   * Access the channels cache store.
   * Type: Store<Snowflake, AnyChannel> if enabled, null if disabled
   */
  readonly channels: ConditionalStore<
    IsEnabled<T["channels"]>,
    Store<Snowflake, AnyChannel>
  >;

  /**
   * Access the emojis cache store.
   * Type: Store<Snowflake, Emoji> if enabled, null if disabled
   */
  readonly emojis: ConditionalStore<
    IsEnabled<T["emojis"]>,
    Store<Snowflake, Emoji>
  >;

  /**
   * Access the entitlements cache store.
   * Type: Store<Snowflake, Entitlement> if enabled, null if disabled
   */
  readonly entitlements: ConditionalStore<
    IsEnabled<T["entitlements"]>,
    Store<Snowflake, Entitlement>
  >;

  /**
   * Access the guilds cache store.
   * Type: Store<Snowflake, Guild> if enabled, null if disabled
   */
  readonly guilds: ConditionalStore<
    IsEnabled<T["guilds"]>,
    Store<Snowflake, Guild>
  >;

  /**
   * Access the integrations cache store.
   * Type: Store<Snowflake, Integration> if enabled, null if disabled
   */
  readonly integrations: ConditionalStore<
    IsEnabled<T["integrations"]>,
    Store<Snowflake, Integration>
  >;

  /**
   * Access the invites cache store.
   * Type: Store<Snowflake, Invite> if enabled, null if disabled
   */
  readonly invites: ConditionalStore<
    IsEnabled<T["invites"]>,
    Store<Snowflake, Invite>
  >;

  /**
   * Access the members cache store.
   * Type: Store<Snowflake, GuildMember> if enabled, null if disabled
   */
  readonly members: ConditionalStore<
    IsEnabled<T["members"]>,
    Store<Snowflake, GuildMember>
  >;

  /**
   * Access the messages cache store.
   * Type: Store<Snowflake, Message> if enabled, null if disabled
   */
  readonly messages: ConditionalStore<
    IsEnabled<T["messages"]>,
    Store<Snowflake, Message>
  >;

  /**
   * Access the presences cache store.
   * Type: Store<Snowflake, PresenceEntity> if enabled, null if disabled
   */
  readonly presences: ConditionalStore<
    IsEnabled<T["presences"]>,
    Store<Snowflake, PresenceEntity>
  >;

  /**
   * Access the roles cache store.
   * Type: Store<Snowflake, Role> if enabled, null if disabled
   */
  readonly roles: ConditionalStore<
    IsEnabled<T["roles"]>,
    Store<Snowflake, Role>
  >;

  /**
   * Access the scheduled events cache store.
   * Type: Store<Snowflake, ScheduledEvent> if enabled, null if disabled
   */
  readonly scheduledEvents: ConditionalStore<
    IsEnabled<T["scheduledEvents"]>,
    Store<Snowflake, ScheduledEvent>
  >;

  /**
   * Access the soundboards cache store.
   * Type: Store<Snowflake, SoundboardSound> if enabled, null if disabled
   */
  readonly soundboards: ConditionalStore<
    IsEnabled<T["soundboards"]>,
    Store<Snowflake, SoundboardSound>
  >;

  /**
   * Access the stage instances cache store.
   * Type: Store<Snowflake, StageInstance> if enabled, null if disabled
   */
  readonly stageInstances: ConditionalStore<
    IsEnabled<T["stageInstances"]>,
    Store<Snowflake, StageInstance>
  >;

  /**
   * Access the stickers cache store.
   * Type: Store<Snowflake, Sticker> if enabled, null if disabled
   */
  readonly stickers: ConditionalStore<
    IsEnabled<T["stickers"]>,
    Store<Snowflake, Sticker>
  >;

  /**
   * Access the subscriptions cache store.
   * Type: Store<Snowflake, Subscription> if enabled, null if disabled
   */
  readonly subscriptions: ConditionalStore<
    IsEnabled<T["subscriptions"]>,
    Store<Snowflake, Subscription>
  >;

  /**
   * Access the thread members cache store.
   * Type: Store<Snowflake, ThreadMember> if enabled, null if disabled
   */
  readonly threadMembers: ConditionalStore<
    IsEnabled<T["threadMembers"]>,
    Store<Snowflake, ThreadMember>
  >;

  /**
   * Access the users cache store.
   * Type: Store<Snowflake, User> if enabled, null if disabled
   */
  readonly users: ConditionalStore<
    IsEnabled<T["users"]>,
    Store<Snowflake, User>
  >;

  /**
   * Access the voice states cache store.
   * Type: Store<Snowflake, VoiceState> if enabled, null if disabled
   */
  readonly voiceStates: ConditionalStore<
    IsEnabled<T["voiceStates"]>,
    Store<Snowflake, VoiceState>
  >;

  /**
   * Access the webhooks cache store.
   * Type: Store<Snowflake, Webhook> if enabled, null if disabled
   */
  readonly webhooks: ConditionalStore<
    IsEnabled<T["webhooks"]>,
    Store<Snowflake, Webhook>
  >;

  /**
   * Map of all cache stores indexed by entity type.
   * Stores can be null when disabled.
   * @internal
   */
  readonly #cache: Map<
    CacheEntityType,
    Store<Snowflake, CacheableEntity> | null
  > = new Map();

  /**
   * Creates a new cache manager with conditional type safety.
   *
   * @param options - Cache configuration options that control caching behavior
   */
  constructor(options: T) {
    // Initialize all stores conditionally based on enabled flag
    this.applications = this.#createStore<Application, "applications">(
      "applications",
      options,
    );
    this.autoModerationRules = this.#createStore<
      AutoModeration,
      "autoModerationRules"
    >("autoModerationRules", options);
    this.bans = this.#createStore<Ban, "bans">("bans", options);
    this.channels = this.#createStore<AnyChannel, "channels">(
      "channels",
      options,
    );
    this.emojis = this.#createStore<Emoji, "emojis">("emojis", options);
    this.entitlements = this.#createStore<Entitlement, "entitlements">(
      "entitlements",
      options,
    );
    this.guilds = this.#createStore<Guild, "guilds">("guilds", options);
    this.integrations = this.#createStore<Integration, "integrations">(
      "integrations",
      options,
    );
    this.invites = this.#createStore<Invite, "invites">("invites", options);
    this.members = this.#createStore<GuildMember, "members">(
      "members",
      options,
    );
    this.messages = this.#createStore<Message, "messages">("messages", options);
    this.presences = this.#createStore<PresenceEntity, "presences">(
      "presences",
      options,
    );
    this.roles = this.#createStore<Role, "roles">("roles", options);
    this.scheduledEvents = this.#createStore<ScheduledEvent, "scheduledEvents">(
      "scheduledEvents",
      options,
    );
    this.soundboards = this.#createStore<SoundboardSound, "soundboards">(
      "soundboards",
      options,
    );
    this.stageInstances = this.#createStore<StageInstance, "stageInstances">(
      "stageInstances",
      options,
    );
    this.stickers = this.#createStore<Sticker, "stickers">("stickers", options);
    this.subscriptions = this.#createStore<Subscription, "subscriptions">(
      "subscriptions",
      options,
    );
    this.threadMembers = this.#createStore<ThreadMember, "threadMembers">(
      "threadMembers",
      options,
    );
    this.users = this.#createStore<User, "users">("users", options);
    this.voiceStates = this.#createStore<VoiceState, "voiceStates">(
      "voiceStates",
      options,
    );
    this.webhooks = this.#createStore<Webhook, "webhooks">("webhooks", options);
  }

  /**
   * Clears all enabled caches in the cache manager.
   * Disabled caches (null stores) are automatically skipped.
   */
  clearAll(): void {
    for (const store of this.#cache.values()) {
      if (store !== null) {
        store.clear();
      }
    }
  }

  /**
   * Clears specific caches in the cache manager.
   * Only clears enabled stores; disabled stores are automatically skipped.
   *
   * @param types - The types of caches to clear
   */
  clear(types: CacheEntityType[]): void {
    for (const type of types) {
      const store = this.#cache.get(type);
      if (store !== null) {
        store?.clear();
      }
    }
  }

  /**
   * Performs a full cleanup of all enabled caches, removing expired items.
   * Disabled caches are automatically skipped.
   */
  cleanup(): void {
    for (const store of this.#cache.values()) {
      if (store !== null) {
        // Force cleanup by accessing all keys
        for (const key of store.keys()) {
          if (store.isExpired(key)) {
            store.delete(key);
          }
        }
      }
    }
  }

  /**
   * Destroys all cache stores, freeing up resources.
   * Should be called when the cache manager is no longer needed.
   */
  destroy(): void {
    for (const store of this.#cache.values()) {
      if (store !== null) {
        store.destroy();
      }
    }
    this.#cache.clear();
  }

  /**
   * Creates a conditional store for a specific entity type and registers it in the cache manager.
   *
   * Returns a Store instance when the entity type is enabled in the configuration,
   * or null when disabled. This eliminates the need for runtime checks and provides
   * compile-time type safety through conditional typing.
   *
   * @template S - The type of entities stored in this cache
   * @template EntityType - The specific entity type key
   * @param type - The entity type for this cache
   * @param options - The cache configuration options
   * @returns ConditionalStore based on the enabled flag
   * @internal
   *
   * @remarks
   * When a store is disabled (enabled: false), this method:
   * - Returns null instead of creating a Store instance
   * - Registers null in the internal cache map
   * - Saves memory by not instantiating unused stores
   * - Provides type-safe access through conditional typing
   *
   * When a store is enabled (enabled: true), this method:
   * - Creates a new Store instance with the provided configuration
   * - Registers the store in the internal cache map
   * - Returns the typed Store instance
   */
  #createStore<S, EntityType extends CacheEntityType>(
    type: EntityType,
    options: T,
  ): ConditionalStore<IsEnabled<T[EntityType]>, Store<Snowflake, S>> {
    const typeConfig = options[type];
    const isEnabled = typeConfig?.enabled ?? false;

    if (!isEnabled) {
      // Store is disabled - register null and return null
      this.#cache.set(type, null);
      return null as ConditionalStore<
        IsEnabled<T[EntityType]>,
        Store<Snowflake, S>
      >;
    }

    // Store is enabled - create and register the actual store
    const store = new Store<Snowflake, S>(typeConfig);
    this.#cache.set(type, store as Store<Snowflake, CacheableEntity>);

    return store as ConditionalStore<
      IsEnabled<T[EntityType]>,
      Store<Snowflake, S>
    >;
  }
}
