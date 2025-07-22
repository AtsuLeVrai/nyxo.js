import type {
  AnyChannelEntity,
  ApplicationEntity,
  AutoModerationRuleEntity,
  BanEntity,
  EmojiEntity,
  EntitlementEntity,
  GuildMemberEntity,
  GuildScheduledEventEntity,
  IntegrationEntity,
  InviteWithMetadataEntity,
  RoleEntity,
  Snowflake,
  SoundboardSoundEntity,
  StageInstanceEntity,
  StickerEntity,
  SubscriptionEntity,
  ThreadMemberEntity,
  UserEntity,
  VoiceStateEntity,
  WebhookEntity,
} from "@nyxojs/core";
import type {
  GuildBanEntity,
  GuildCreateEntity,
  InviteCreateEntity,
  MessageCreateEntity,
  PresenceEntity,
} from "@nyxojs/gateway";
import { Store, StoreOptions } from "@nyxojs/store";
import { z } from "zod";
import type { GuildBased } from "../types/index.js";

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
  | ApplicationEntity
  | AutoModerationRuleEntity
  | AnyChannelEntity
  | (BanEntity & GuildBanEntity)
  | GuildBased<EmojiEntity>
  | EntitlementEntity
  | GuildCreateEntity
  | GuildBased<GuildMemberEntity>
  | GuildBased<IntegrationEntity>
  | (InviteWithMetadataEntity & InviteCreateEntity)
  | MessageCreateEntity
  | PresenceEntity
  | GuildBased<RoleEntity>
  | GuildScheduledEventEntity
  | SoundboardSoundEntity
  | StageInstanceEntity
  | StickerEntity
  | SubscriptionEntity
  | GuildBased<ThreadMemberEntity>
  | UserEntity
  | VoiceStateEntity
  | WebhookEntity;

/**
 * Mapping of cache entity types to their corresponding cacheable entities.
 */
export interface CacheEntityMapping {
  applications: ApplicationEntity;
  autoModerationRules: AutoModerationRuleEntity;
  bans: BanEntity & GuildBanEntity;
  channels: AnyChannelEntity;
  emojis: GuildBased<EmojiEntity>;
  entitlements: EntitlementEntity;
  guilds: GuildCreateEntity;
  integrations: GuildBased<IntegrationEntity>;
  invites: InviteWithMetadataEntity & InviteCreateEntity;
  members: GuildBased<GuildMemberEntity>;
  messages: MessageCreateEntity;
  presences: PresenceEntity;
  roles: GuildBased<RoleEntity>;
  scheduledEvents: GuildScheduledEventEntity;
  soundboards: SoundboardSoundEntity;
  stageInstances: StageInstanceEntity;
  stickers: StickerEntity;
  subscriptions: SubscriptionEntity;
  threadMembers: GuildBased<ThreadMemberEntity>;
  users: UserEntity;
  voiceStates: VoiceStateEntity;
  webhooks: WebhookEntity;
}

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
export class CacheManager {
  /**
   * Access the applications cache store.
   * Type: Store<Snowflake, ApplicationEntity> if enabled, null if disabled
   */
  readonly applications: Store<Snowflake, ApplicationEntity> | null;

  /**
   * Access the auto moderation rules cache store.
   * Type: Store<Snowflake, AutoModerationRuleEntity> if enabled, null if disabled
   */
  readonly autoModerationRules: Store<
    Snowflake,
    AutoModerationRuleEntity
  > | null;

  /**
   * Access the bans cache store.
   * Type: Store<Snowflake, BanEntity & GuildBanEntity> if enabled, null if disabled
   */
  readonly bans: Store<Snowflake, BanEntity & GuildBanEntity> | null;

  /**
   * Access the channels cache store.
   * Type: Store<Snowflake, AnyChannelEntity> if enabled, null if disabled
   */
  readonly channels: Store<Snowflake, AnyChannelEntity> | null;

  /**
   * Access the emojis cache store.
   * Type: Store<Snowflake, GuildBased<EmojiEntity>> if enabled, null if disabled
   */
  readonly emojis: Store<Snowflake, GuildBased<EmojiEntity>> | null;

  /**
   * Access the entitlements cache store.
   * Type: Store<Snowflake, EntitlementEntity> if enabled, null if disabled
   */
  readonly entitlements: Store<Snowflake, EntitlementEntity> | null;

  /**
   * Access the guilds cache store.
   * Type: Store<Snowflake, GuildCreateEntity> if enabled, null if disabled
   */
  readonly guilds: Store<Snowflake, GuildCreateEntity> | null;

  /**
   * Access the integrations cache store.
   * Type: Store<Snowflake, GuildBased<IntegrationEntity>> if enabled, null if disabled
   */
  readonly integrations: Store<Snowflake, GuildBased<IntegrationEntity>> | null;

  /**
   * Access the invites cache store.
   * Type: Store<Snowflake, InviteWithMetadataEntity & InviteCreateEntity> if enabled, null if disabled
   */
  readonly invites: Store<
    Snowflake,
    InviteWithMetadataEntity & InviteCreateEntity
  > | null;

  /**
   * Access the members cache store.
   * Type: Store<Snowflake, GuildBased<GuildMemberEntity>> if enabled, null if disabled
   */
  readonly members: Store<Snowflake, GuildBased<GuildMemberEntity>> | null;

  /**
   * Access the messages cache store.
   * Type: Store<Snowflake, MessageCreateEntity> if enabled, null if disabled
   */
  readonly messages: Store<Snowflake, MessageCreateEntity> | null;

  /**
   * Access the presences cache store.
   * Type: Store<Snowflake, PresenceEntity> if enabled, null if disabled
   */
  readonly presences: Store<Snowflake, PresenceEntity> | null;

  /**
   * Access the roles cache store.
   * Type: Store<Snowflake, GuildBased<RoleEntity>> if enabled, null if disabled
   */
  readonly roles: Store<Snowflake, GuildBased<RoleEntity>> | null;

  /**
   * Access the scheduled events cache store.
   * Type: Store<Snowflake, GuildScheduledEventEntity> if enabled, null if disabled
   */
  readonly scheduledEvents: Store<Snowflake, GuildScheduledEventEntity> | null;

  /**
   * Access the soundboards cache store.
   * Type: Store<Snowflake, SoundboardSoundEntity> if enabled, null if disabled
   */
  readonly soundboards: Store<Snowflake, SoundboardSoundEntity> | null;

  /**
   * Access the stage instances cache store.
   * Type: Store<Snowflake, StageInstanceEntity> if enabled, null if disabled
   */
  readonly stageInstances: Store<Snowflake, StageInstanceEntity> | null;

  /**
   * Access the stickers cache store.
   * Type: Store<Snowflake, StickerEntity> if enabled, null if disabled
   */
  readonly stickers: Store<Snowflake, StickerEntity> | null;

  /**
   * Access the subscriptions cache store.
   * Type: Store<Snowflake, SubscriptionEntity> if enabled, null if disabled
   */
  readonly subscriptions: Store<Snowflake, SubscriptionEntity> | null;

  /**
   * Access the thread members cache store.
   * Type: Store<Snowflake, GuildBased<ThreadMemberEntity>> if enabled, null if disabled
   */
  readonly threadMembers: Store<
    Snowflake,
    GuildBased<ThreadMemberEntity>
  > | null;

  /**
   * Access the users cache store.
   * Type: Store<Snowflake, UserEntity> if enabled, null if disabled
   */
  readonly users: Store<Snowflake, UserEntity> | null;

  /**
   * Access the voice states cache store.
   * Type: Store<Snowflake, VoiceStateEntity> if enabled, null if disabled
   */
  readonly voiceStates: Store<Snowflake, VoiceStateEntity> | null;

  /**
   * Access the webhooks cache store.
   * Type: Store<Snowflake, WebhookEntity> if enabled, null if disabled
   */
  readonly webhooks: Store<Snowflake, WebhookEntity> | null;

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
  constructor(options: CacheOptions) {
    // Initialize all stores conditionally based on enabled flag
    this.applications = this.#createStore("applications", options);
    this.autoModerationRules = this.#createStore(
      "autoModerationRules",
      options,
    );
    this.bans = this.#createStore("bans", options);
    this.channels = this.#createStore("channels", options);
    this.emojis = this.#createStore("emojis", options);
    this.entitlements = this.#createStore("entitlements", options);
    this.guilds = this.#createStore("guilds", options);
    this.integrations = this.#createStore("integrations", options);
    this.invites = this.#createStore("invites", options);
    this.members = this.#createStore("members", options);
    this.messages = this.#createStore("messages", options);
    this.presences = this.#createStore("presences", options);
    this.roles = this.#createStore("roles", options);
    this.scheduledEvents = this.#createStore("scheduledEvents", options);
    this.soundboards = this.#createStore("soundboards", options);
    this.stageInstances = this.#createStore("stageInstances", options);
    this.stickers = this.#createStore("stickers", options);
    this.subscriptions = this.#createStore("subscriptions", options);
    this.threadMembers = this.#createStore("threadMembers", options);
    this.users = this.#createStore("users", options);
    this.voiceStates = this.#createStore("voiceStates", options);
    this.webhooks = this.#createStore("webhooks", options);
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
   * @typeParam T - The type of entities stored in this cache
   * @param type - The entity type for this cache
   * @param options - The cache configuration options
   * @return A Store instance for the specified entity type, or null if disabled
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
  #createStore<K extends CacheEntityType>(
    type: K,
    options: CacheOptions,
  ): Store<Snowflake, CacheEntityMapping[K]> | null {
    const typeConfig = options[type];
    const isEnabled = typeConfig?.enabled ?? false;

    if (!isEnabled) {
      // Store is disabled - register null and return null
      this.#cache.set(type, null);
      return null;
    }

    // Store is enabled - create and register the actual store
    const store = new Store<Snowflake, CacheEntityMapping[K]>(
      typeConfig as StoreOptions,
    );
    this.#cache.set(type, store as Store<Snowflake, CacheableEntity>);
    return store;
  }
}
