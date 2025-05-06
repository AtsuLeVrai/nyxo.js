import type { Snowflake } from "@nyxojs/core";
import type { PresenceEntity } from "@nyxojs/gateway";
import { Store, StoreOptions } from "@nyxojs/store";
import { z } from "zod";
import type {
  AnyChannel,
  Application,
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

/**
 * Configuration options for the cache system of the Nyxo.js client.
 *
 * The cache manager stores frequently accessed Discord entities to reduce API calls,
 * improve performance, and manage memory usage efficiently. Each entity type
 * can be configured separately with different limits and settings.
 */
export const CacheOptions = z.object({
  /**
   * This cache stores User objects retrieved from the API.
   * Users are referenced by many other entities and are frequently accessed.
   */
  users: z.boolean().default(true),

  /**
   * This cache stores all types of channel objects (text, voice, category, etc.).
   * Channels are frequently accessed for permission checks and message operations.
   */
  channels: z.boolean().default(true),

  /**
   * This cache stores Guild objects which contain core information about Discord servers.
   * Guilds are central entities referenced by many operations.
   */
  guilds: z.boolean().default(true),

  /**
   * This cache stores custom emoji objects from guilds.
   * Consider setting a lower limit if emoji usage is minimal in your bot.
   */
  emojis: z.boolean().default(true),

  /**
   * This cache stores entitlement objects for premium features and subscriptions.
   * Only relevant for bots that interact with Discord's monetization features.
   */
  entitlements: z.boolean().default(true),

  /**
   * This cache stores subscription objects for premium features.
   * Only relevant for bots that interact with Discord's subscription systems.
   */
  subscriptions: z.boolean().default(true),

  /**
   * This cache stores Message objects which are often needed for context
   * in commands, reactions, and other user interactions.
   */
  messages: z.boolean().default(true),

  /**
   * This cache stores AutoModerationRule objects which define automated content filtering.
   * Only relevant for bots that interact with or manage Discord's auto moderation system.
   */
  autoModerationRules: z.boolean().default(true),

  /**
   * This cache stores StageInstance objects for Discord's Stage channels.
   * Only relevant for bots that interact with Stage channels.
   */
  stageInstances: z.boolean().default(true),

  /**
   * This cache stores ThreadMember objects for threads in guilds.
   * Only relevant for bots that interact with threads.
   */
  members: z.boolean().default(true),

  /**
   * This cache stores Role objects which define permissions and settings for users in guilds.
   * Only relevant for bots that interact with roles or permissions.
   */
  roles: z.boolean().default(true),

  /**
   * This cache stores GuildScheduledEvent objects which define events in guilds.
   * Only relevant for bots that interact with scheduled events.
   */
  scheduledEvents: z.boolean().default(true),

  /**
   * This cache stores Sticker objects which are custom stickers used in messages.
   * Only relevant for bots that interact with stickers.
   */
  stickers: z.boolean().default(true),

  /**
   * This cache stores Presence objects which represent the online status and activity of users.
   * Only relevant for bots that interact with user presence updates.
   */
  presences: z.boolean().default(true),

  /**
   * This cache stores Integration objects which represent third-party integrations in guilds.
   * Only relevant for bots that interact with integrations.
   */
  integrations: z.boolean().default(true),

  /**
   * This cache stores Soundboard objects which represent soundboard sounds in guilds.
   * Only relevant for bots that interact with soundboards.
   */
  soundboards: z.boolean().default(true),

  /**
   * This cache stores ThreadMember objects which represent members of threads in guilds.
   * Only relevant for bots that interact with threads.
   */
  threadMembers: z.boolean().default(true),

  /**
   * This cache stores Invite objects which represent server invites.
   * Only relevant for bots that interact with invites.
   */
  invites: z.boolean().default(true),

  /**
   * This cache stores Webhook objects which represent webhooks in guilds.
   * Only relevant for bots that interact with webhooks.
   */
  webhooks: z.boolean().default(true),

  /**
   * This cache stores Ban objects which represent user bans in guilds.
   * Only relevant for bots that interact with bans.
   */
  bans: z.boolean().default(true),

  /**
   * This cache stores Application objects which represent applications in guilds.
   * Only relevant for bots that interact with applications.
   */
  applications: z.boolean().default(true),

  /**
   * Storage options for the cache.
   */
  ...StoreOptions.shape,
});

export type CacheOptions = z.infer<typeof CacheOptions>;

/**
 * Type representing all possible entity types in the cache
 */
export type CacheEntityType =
  | "users"
  | "guilds"
  | "channels"
  | "members"
  | "roles"
  | "messages"
  | "emojis"
  | "stageInstances"
  | "scheduledEvents"
  | "autoModerationRules"
  | "stickers"
  | "entitlements"
  | "subscriptions"
  | "presences"
  | "integrations"
  | "soundboards"
  | "threadMembers"
  | "invites"
  | "webhooks"
  | "bans"
  | "applications";

/**
 * Union type of all cacheable entities
 */
export type CacheableEntity =
  | User
  | Guild
  | AnyChannel
  | GuildMember
  | Role
  | Message
  | Emoji
  | StageInstance
  | GuildScheduledEvent
  | AutoModerationRule
  | Sticker
  | Entitlement
  | Subscription
  | PresenceEntity
  | Integration
  | SoundboardSound
  | ThreadMember
  | Invite
  | Webhook
  | Ban
  | Application;

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
   * Access the applications cache store.
   * Contains Application objects for Discord applications.
   */
  readonly applications: Store<Snowflake, Application>;

  /**
   * Access the auto moderation rules cache store.
   * Contains AutoModerationRule objects for Discord's content filtering.
   */
  readonly autoModerationRules: Store<Snowflake, AutoModerationRule>;

  /**
   * Access the bans cache store.
   * Contains Ban objects for user bans in guilds.
   */
  readonly bans: Store<Snowflake, Ban>;

  /**
   * Access the channels cache store.
   * Contains Channel objects of various types (text, voice, category, etc.).
   */
  readonly channels: Store<Snowflake, AnyChannel>;

  /**
   * Access the emojis cache store.
   * Contains Emoji objects from guilds.
   */
  readonly emojis: Store<Snowflake, Emoji>;

  /**
   * Access the entitlements cache store.
   * Contains Entitlement objects for premium features.
   */
  readonly entitlements: Store<Snowflake, Entitlement>;

  /**
   * Access the guilds cache store.
   * Contains Guild objects which represent Discord servers.
   */
  readonly guilds: Store<Snowflake, Guild>;

  /**
   * Access the integrations cache store.
   * Contains Integration objects for third-party services.
   */
  readonly integrations: Store<Snowflake, Integration>;

  /**
   * Access the invites cache store.
   * Contains Invite objects for server invites.
   */
  readonly invites: Store<Snowflake, Invite>;

  /**
   * Access the members cache store.
   * Contains GuildMember objects which represent users in specific guilds.
   */
  readonly members: Store<Snowflake, GuildMember>;

  /**
   * Access the messages cache store.
   * Contains Message objects sent in channels.
   */
  readonly messages: Store<Snowflake, Message>;

  /**
   * Access the presences cache store.
   * Contains PresenceEntity objects for users' online status.
   */
  readonly presences: Store<Snowflake, PresenceEntity>;

  /**
   * Access the roles cache store.
   * Contains Role objects which define permissions in guilds.
   */
  readonly roles: Store<Snowflake, Role>;

  /**
   * Access the scheduled events cache store.
   * Contains GuildScheduledEvent objects for Discord server events.
   */
  readonly scheduledEvents: Store<Snowflake, GuildScheduledEvent>;

  /**
   * Access the soundboards cache store.
   * Contains SoundboardSound objects for Discord's soundboard feature.
   */
  readonly soundboards: Store<Snowflake, SoundboardSound>;

  /**
   * Access the stage instances cache store.
   * Contains StageInstance objects for Discord's Stage channels.
   */
  readonly stageInstances: Store<Snowflake, StageInstance>;

  /**
   * Access the stickers cache store.
   * Contains Sticker objects from guilds.
   */
  readonly stickers: Store<Snowflake, Sticker>;

  /**
   * Access the subscriptions cache store.
   * Contains Subscription objects for premium features.
   */
  readonly subscriptions: Store<Snowflake, Subscription>;

  /**
   * Access the thread members cache store.
   * Contains ThreadMember objects for users in threads.
   */
  readonly threadMembers: Store<Snowflake, ThreadMember>;

  /**
   * Access the users cache store.
   * Contains User objects which represent Discord users.
   */
  readonly users: Store<Snowflake, User>;

  /**
   * Access the webhooks cache store.
   * Contains Webhook objects for server webhooks.
   */
  readonly webhooks: Store<Snowflake, Webhook>;

  /**
   * Map of all cache stores indexed by entity type
   * @internal
   */
  readonly #cache: Map<CacheEntityType, Store<Snowflake, CacheableEntity>> =
    new Map();

  /**
   * Creates a new cache manager with the specified options.
   *
   * @param options - Cache configuration options that control caching behavior
   */
  constructor(options: CacheOptions) {
    // Initialize all stores, but only enable them based on options
    this.users = this.#createStore<User>("users", options);
    this.guilds = this.#createStore<Guild>("guilds", options);
    this.channels = this.#createStore<AnyChannel>("channels", options);
    this.members = this.#createStore<GuildMember>("members", options);
    this.roles = this.#createStore<Role>("roles", options);
    this.messages = this.#createStore<Message>("messages", options);
    this.emojis = this.#createStore<Emoji>("emojis", options);
    this.stageInstances = this.#createStore<StageInstance>(
      "stageInstances",
      options,
    );
    this.scheduledEvents = this.#createStore<GuildScheduledEvent>(
      "scheduledEvents",
      options,
    );
    this.autoModerationRules = this.#createStore<AutoModerationRule>(
      "autoModerationRules",
      options,
    );
    this.stickers = this.#createStore<Sticker>("stickers", options);
    this.entitlements = this.#createStore<Entitlement>("entitlements", options);
    this.subscriptions = this.#createStore<Subscription>(
      "subscriptions",
      options,
    );
    this.presences = this.#createStore<PresenceEntity>("presences", options);
    this.integrations = this.#createStore<Integration>("integrations", options);
    this.soundboards = this.#createStore<SoundboardSound>(
      "soundboards",
      options,
    );
    this.threadMembers = this.#createStore<ThreadMember>(
      "threadMembers",
      options,
    );
    this.invites = this.#createStore<Invite>("invites", options);
    this.webhooks = this.#createStore<Webhook>("webhooks", options);
    this.bans = this.#createStore<Ban>("bans", options);
    this.applications = this.#createStore<Application>("applications", options);
  }

  /**
   * Clears all caches in the cache manager.
   * This removes all items from all enabled caches.
   */
  clearAll(): void {
    for (const store of this.#cache.values()) {
      store.clear();
    }
  }

  /**
   * Clears specific caches in the cache manager.
   *
   * @param types - The types of caches to clear
   */
  clear(types: CacheEntityType[]): void {
    for (const type of types) {
      const store = this.#cache.get(type);
      if (store) {
        store.clear();
      }
    }
  }

  /**
   * Performs a full cleanup of all caches, removing expired items.
   */
  cleanup(): void {
    for (const store of this.#cache.values()) {
      // Force cleanup by accessing all keys
      for (const key of store.keys()) {
        if (store.isExpired(key)) {
          store.delete(key);
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
      store.destroy();
    }
    this.#cache.clear();
  }

  /**
   * Creates a store for a specific entity type and registers it in the cache manager.
   *
   * @template T - The type of entities stored in this cache
   * @param type - The entity type for this cache
   * @param options - The cache options
   * @returns A new store instance
   * @internal
   */
  #createStore<T>(
    type: CacheEntityType,
    options: CacheOptions,
  ): Store<Snowflake, T> {
    // Create store with default options if not enabled
    const isEnabled = options[type];

    const storeOptions: StoreOptions = {
      ...options,
      maxSize: isEnabled ? options.maxSize : 0, // Set maxSize to 0 to effectively disable the cache
    };

    const store = new Store<Snowflake, T>(storeOptions);
    this.#cache.set(type, store as Store<Snowflake, CacheableEntity>);

    return store;
  }
}
