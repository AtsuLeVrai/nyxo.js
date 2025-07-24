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
 * A predicate function for finding or filtering entities across cache stores.
 *
 * Receives both the entity value and its key, allowing filtering based on data content
 * or key patterns across different entity types.
 *
 * @typeParam T - The type of entity being tested
 *
 * @param entity - The cached entity to evaluate
 * @param key - The Snowflake ID associated with the entity
 * @returns `true` if the entity matches the criteria, `false` otherwise
 *
 * @example
 * ```typescript
 * // Filter users by status
 * const activePredicate: CachePredicate<UserEntity> = (user) => user.bot === false;
 *
 * // Filter by key pattern
 * const keyPredicate: CachePredicate<any> = (_, key) => key.startsWith('123');
 *
 * // Combined filtering
 * const complexPredicate: CachePredicate<GuildMemberEntity> = (member, key) =>
 *   member.roles.length > 0 && key.includes(member.user.id);
 * ```
 *
 * @public
 */
export type CachePredicate<T> = (entity: T, key: Snowflake) => boolean;

/**
 * Statistics information for cache store performance monitoring.
 *
 * Provides comprehensive metrics about cache usage, performance,
 * and memory consumption for operational monitoring and optimization.
 *
 * @public
 */
export interface CacheStats {
  /**
   * Current number of items stored in the cache.
   */
  size: number;

  /**
   * Maximum number of items allowed before eviction triggers.
   * Returns 0 if no size limit is configured.
   */
  maxSize: number;

  /**
   * Estimated memory usage in bytes.
   * Calculated based on approximate entity sizes and overhead.
   */
  memoryUsage: number;

  /**
   * Cache hit rate as a percentage (0-100).
   * Only available if the underlying store tracks access statistics.
   */
  hitRate?: number;
}

/**
 * Comprehensive cache statistics for all entity types.
 *
 * Maps each cache entity type to its performance statistics,
 * providing a complete overview of cache system health and usage patterns.
 *
 * @public
 */
export type CacheMetrics = {
  /**
   * Statistics for each enabled cache store, indexed by entity type.
   * Disabled stores are excluded from the metrics.
   */
  [K in CacheEntityType]?: CacheStats;
};

/**
 * Configuration options for a cacheable store in the Nyxo.js client.
 *
 * Extends the base Store options with cache-specific settings for controlling
 * entity-specific caching behavior, memory management, and performance tuning.
 *
 * @internal
 */
const CacheableStoreOptions = StoreOptions.extend({
  /**
   * Whether to enable the cache for this entity type.
   *
   * When set to `false`, the cache manager will return `null` instead of creating
   * a Store instance, providing compile-time type safety and memory efficiency.
   *
   * @default true
   */
  enabled: z.boolean().default(true),
});

/**
 * Configuration options for the cache system of the Nyxo.js client.
 *
 * The cache manager stores frequently accessed Discord entities to reduce API calls,
 * improve performance, and manage memory usage efficiently. Each entity type
 * can be configured independently with different limits, TTL settings, and strategies.
 *
 * @example
 * ```typescript
 * const cacheConfig: CacheOptions = {
 *   users: { enabled: true, maxSize: 10000, ttl: 300000 },
 *   messages: { enabled: true, maxSize: 5000, ttl: 600000 },
 *   guilds: { enabled: true, maxSize: 100, ttl: 0 }, // No expiration
 *   presences: { enabled: false } // Disabled entirely
 * };
 * ```
 *
 * @public
 */
export const CacheOptions = z.object({
  /**
   * Cache for Discord Application entities.
   *
   * Stores application information including bot details, commands,
   * and application-specific metadata. Useful for bots that interact
   * with multiple applications or need application context.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  applications: CacheableStoreOptions.prefault({}),

  /**
   * Cache for AutoModerationRule entities.
   *
   * Stores Discord's auto-moderation rules for guilds. Only relevant
   * for bots that manage or interact with Discord's built-in content
   * filtering and automated moderation systems.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  autoModerationRules: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Ban entities representing user bans in guilds.
   *
   * Stores information about banned users including ban reasons and metadata.
   * Useful for moderation bots and ban management systems.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  bans: CacheableStoreOptions.prefault({}),

  /**
   * Cache for all types of Channel entities (text, voice, category, thread, etc.).
   *
   * Channels are frequently accessed for permission checks, message operations,
   * and navigation. This is one of the most commonly used caches and should
   * typically remain enabled with adequate size limits.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  channels: CacheableStoreOptions.prefault({}),

  /**
   * Cache for custom Emoji entities from guilds.
   *
   * Stores guild-specific emojis used in messages and reactions.
   * Consider setting lower limits if emoji usage is minimal or memory is constrained.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  emojis: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Entitlement entities related to premium features and subscriptions.
   *
   * Stores information about user entitlements, premium subscriptions,
   * and monetization features. Only relevant for bots using Discord's
   * premium and monetization systems.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  entitlements: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Guild entities containing core server information.
   *
   * Guilds are central entities referenced by many operations including
   * permissions, members, channels, and settings. This cache is crucial
   * for performance and should typically remain enabled.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  guilds: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Integration entities representing third-party services.
   *
   * Stores information about bot integrations, webhooks, and connected
   * services within guilds. Only relevant for bots that manage or
   * interact with guild integrations.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  integrations: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Invite entities representing server invitations.
   *
   * Stores invite links, usage statistics, and metadata. Useful for
   * bots that manage server growth, invite tracking, or moderation.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  invites: CacheableStoreOptions.prefault({}),

  /**
   * Cache for GuildMember entities representing users within guilds.
   *
   * Stores member information including roles, permissions, join dates,
   * and user data within guild contexts. Critical for permission checks
   * and user management in servers.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  members: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Message entities from channels.
   *
   * Messages are frequently accessed for context in commands, reactions,
   * editing, and user interactions. Consider setting TTL values to prevent
   * unbounded growth in high-traffic channels.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  messages: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Presence entities showing user activity and status.
   *
   * Stores user online status, activities, and rich presence information.
   * Can generate high memory usage in large servers and may benefit
   * from shorter TTL values or being disabled entirely.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  presences: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Role entities defining permissions and user groups.
   *
   * Stores role information including permissions, colors, hierarchy,
   * and settings. Essential for permission calculations and user management.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  roles: CacheableStoreOptions.prefault({}),

  /**
   * Cache for GuildScheduledEvent entities representing planned events.
   *
   * Stores information about server events, meetings, and scheduled activities.
   * Only relevant for bots that interact with Discord's event system.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  scheduledEvents: CacheableStoreOptions.prefault({}),

  /**
   * Cache for SoundboardSound entities representing audio clips.
   *
   * Stores soundboard sounds available in voice channels. Only relevant
   * for bots that interact with Discord's soundboard features.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  soundboards: CacheableStoreOptions.prefault({}),

  /**
   * Cache for StageInstance entities representing Stage channel sessions.
   *
   * Stores information about active Stage channel instances, speakers,
   * and topics. Only relevant for bots that interact with Stage channels.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  stageInstances: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Sticker entities representing custom message stickers.
   *
   * Stores guild and global stickers used in messages. Consider lower
   * limits if sticker usage is minimal in your bot's use case.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  stickers: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Subscription entities related to premium features.
   *
   * Stores subscription information for Discord's premium and monetization
   * systems. Only relevant for bots using premium subscription features.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  subscriptions: CacheableStoreOptions.prefault({}),

  /**
   * Cache for ThreadMember entities representing thread participants.
   *
   * Stores information about users participating in thread channels.
   * Useful for bots that manage or interact with threaded conversations.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  threadMembers: CacheableStoreOptions.prefault({}),

  /**
   * Cache for User entities retrieved from the Discord API.
   *
   * Users are referenced by many other entities and are frequently accessed
   * for display names, avatars, and user information. This is a fundamental
   * cache that should typically remain enabled.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  users: CacheableStoreOptions.prefault({}),

  /**
   * Cache for VoiceState entities representing voice channel participation.
   *
   * Stores information about users in voice channels including mute states,
   * channel connections, and voice settings. Only relevant for bots that
   * interact with voice functionality.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  voiceStates: CacheableStoreOptions.prefault({}),

  /**
   * Cache for Webhook entities representing message webhooks.
   *
   * Stores webhook information including tokens, channels, and settings.
   * Only relevant for bots that create, manage, or interact with webhooks.
   *
   * @default { enabled: true, maxSize: 10000, ttl: 0 }
   */
  webhooks: CacheableStoreOptions.prefault({}),
});

export type CacheOptions = z.infer<typeof CacheOptions>;

/**
 * Union type representing all possible entity types that can be cached.
 *
 * Used for type-safe access to cache stores and configuration options.
 * Each type corresponds to a specific Discord API entity and its associated cache store.
 *
 * @public
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
 * Union type of all cacheable entity types with their associated guild metadata.
 *
 * Represents the actual entity types that can be stored in the cache system,
 * including both standalone entities and guild-based entities with additional context.
 *
 * @public
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
 * Type mapping between cache entity type names and their corresponding entity types.
 *
 * Provides compile-time type safety when accessing cache stores by ensuring
 * the correct entity type is returned for each cache store key.
 *
 * @public
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
 * Comprehensive cache management system for Discord entities with conditional type safety.
 *
 * The CacheManager provides centralized storage, retrieval, and management of Discord API entities
 * with configurable caching strategies, automatic expiration, intelligent eviction policies,
 * and advanced querying capabilities. Each entity type has its own dedicated cache store
 * with independently configurable settings for optimal performance and memory usage.
 *
 * **Key Features:**
 * - **Conditional Type Safety**: Disabled stores return `null` instead of empty stores
 * - **Memory Management**: Configurable size limits and eviction strategies per entity type
 * - **Automatic Expiration**: TTL support with background cleanup for stale data
 * - **Advanced Querying**: Built-in search, filtering, and relationship traversal
 * - **Performance Monitoring**: Comprehensive statistics and metrics collection
 * - **Resource Management**: Proper cleanup and disposal methods
 *
 * @example
 * ```typescript
 * // Basic setup with default configuration
 * const cache = new CacheManager({});
 *
 * // Advanced configuration for high-performance applications
 * const optimizedCache = new CacheManager({
 *   users: { enabled: true, maxSize: 50000, ttl: 300000 },
 *   messages: { enabled: true, maxSize: 10000, ttl: 600000 },
 *   presences: { enabled: false }, // Disable memory-intensive caches
 *   guilds: { enabled: true, maxSize: 1000, ttl: 0 } // No expiration for guilds
 * });
 *
 * // Access cache stores with type safety
 * const user = cache.users?.get("123456789"); // UserEntity | undefined
 * const guild = cache.guilds?.get("987654321"); // GuildCreateEntity | undefined
 * ```
 *
 * @public
 */
export class CacheManager {
  /**
   * Cache store for Discord Application entities.
   *
   * Contains application information, bot details, commands, and application-specific
   * metadata. Returns `null` when disabled in configuration for memory efficiency.
   *
   * @example
   * ```typescript
   * const app = cache.applications?.get("123456789");
   * if (app) {
   *   console.log(`Application: ${app.name}`);
   * }
   * ```
   */
  readonly applications: Store<Snowflake, ApplicationEntity> | null;

  /**
   * Cache store for AutoModerationRule entities.
   *
   * Contains Discord's auto-moderation rules for content filtering and automated
   * moderation. Returns `null` when disabled for bots not using auto-moderation.
   *
   * @example
   * ```typescript
   * const rules = cache.autoModerationRules?.filter(rule => rule.enabled);
   * console.log(`Active moderation rules: ${rules?.length || 0}`);
   * ```
   */
  readonly autoModerationRules: Store<
    Snowflake,
    AutoModerationRuleEntity
  > | null;

  /**
   * Cache store for Ban entities representing user bans in guilds.
   *
   * Contains ban information including reasons, timestamps, and banned user data.
   * Returns `null` when disabled for bots not handling moderation.
   *
   * @example
   * ```typescript
   * const ban = cache.bans?.get("banned-user-id");
   * if (ban) {
   *   console.log(`Ban reason: ${ban.reason || 'No reason provided'}`);
   * }
   * ```
   */
  readonly bans: Store<Snowflake, BanEntity & GuildBanEntity> | null;

  /**
   * Cache store for all Channel entity types (text, voice, category, thread, etc.).
   *
   * Contains channel information, permissions, settings, and metadata. This is one
   * of the most frequently accessed caches and should typically remain enabled.
   *
   * @example
   * ```typescript
   * const channel = cache.channels?.get("channel-id");
   * if (channel?.type === ChannelType.GuildText) {
   *   console.log(`Text channel: ${channel.name}`);
   * }
   * ```
   */
  readonly channels: Store<Snowflake, AnyChannelEntity> | null;

  /**
   * Cache store for custom Emoji entities from guilds.
   *
   * Contains guild-specific emojis, animated emojis, and emoji metadata.
   * Returns `null` when disabled to save memory if emoji usage is minimal.
   *
   * @example
   * ```typescript
   * const emoji = cache.emojis?.find(e => e.name === "custom_emoji");
   * if (emoji) {
   *   console.log(`Found emoji: <:${emoji.name}:${emoji.id}>`);
   * }
   * ```
   */
  readonly emojis: Store<Snowflake, GuildBased<EmojiEntity>> | null;

  /**
   * Cache store for Entitlement entities related to premium features.
   *
   * Contains subscription information, premium entitlements, and monetization data.
   * Returns `null` when disabled for bots not using Discord's premium features.
   *
   * @example
   * ```typescript
   * const entitlements = cache.entitlements?.filter(e => e.type === EntitlementType.Premium);
   * console.log(`Premium entitlements: ${entitlements?.length || 0}`);
   * ```
   */
  readonly entitlements: Store<Snowflake, EntitlementEntity> | null;

  /**
   * Cache store for Guild entities containing core server information.
   *
   * Contains guild settings, features, member counts, and configuration data.
   * This is a fundamental cache that should typically remain enabled.
   *
   * @example
   * ```typescript
   * const guild = cache.guilds?.get("guild-id");
   * if (guild) {
   *   console.log(`Guild: ${guild.name} (${guild.member_count} members)`);
   * }
   * ```
   */
  readonly guilds: Store<Snowflake, GuildCreateEntity> | null;

  /**
   * Cache store for Integration entities representing third-party services.
   *
   * Contains bot integrations, connected services, and webhook configurations.
   * Returns `null` when disabled for bots not managing integrations.
   *
   * @example
   * ```typescript
   * const integrations = cache.integrations?.filter(i => i.enabled);
   * console.log(`Active integrations: ${integrations?.length || 0}`);
   * ```
   */
  readonly integrations: Store<Snowflake, GuildBased<IntegrationEntity>> | null;

  /**
   * Cache store for Invite entities representing server invitations.
   *
   * Contains invite links, usage statistics, expiration data, and creator information.
   * Returns `null` when disabled for bots not tracking invites.
   *
   * @example
   * ```typescript
   * const invite = cache.invites?.get("invite-code");
   * if (invite) {
   *   console.log(`Invite uses: ${invite.uses}/${invite.max_uses || '∞'}`);
   * }
   * ```
   */
  readonly invites: Store<
    Snowflake,
    InviteWithMetadataEntity & InviteCreateEntity
  > | null;

  /**
   * Cache store for GuildMember entities representing users within guilds.
   *
   * Contains member information including roles, permissions, join dates, and user data.
   * Critical for permission checks and user management operations.
   *
   * @example
   * ```typescript
   * const member = cache.members?.get("user-id");
   * if (member) {
   *   console.log(`Member: ${member.user?.username} (${member.roles.length} roles)`);
   * }
   * ```
   */
  readonly members: Store<Snowflake, GuildBased<GuildMemberEntity>> | null;

  /**
   * Cache store for Message entities from channels.
   *
   * Contains message content, metadata, attachments, and interaction data.
   * Frequently accessed for command context and message operations.
   *
   * @example
   * ```typescript
   * const message = cache.messages?.get("message-id");
   * if (message) {
   *   console.log(`Message from ${message.author.username}: ${message.content}`);
   * }
   * ```
   */
  readonly messages: Store<Snowflake, MessageCreateEntity> | null;

  /**
   * Cache store for Presence entities showing user activity and status.
   *
   * Contains user online status, activities, rich presence, and platform information.
   * Can be memory-intensive in large servers and may benefit from being disabled.
   *
   * @example
   * ```typescript
   * const presence = cache.presences?.get("user-id");
   * if (presence?.status === "online") {
   *   console.log(`User is online with ${presence.activities.length} activities`);
   * }
   * ```
   */
  readonly presences: Store<Snowflake, PresenceEntity> | null;

  /**
   * Cache store for Role entities defining permissions and user groups.
   *
   * Contains role permissions, colors, hierarchy, mentionability, and settings.
   * Essential for permission calculations and role management.
   *
   * @example
   * ```typescript
   * const role = cache.roles?.get("role-id");
   * if (role) {
   *   console.log(`Role: ${role.name} (position: ${role.position})`);
   * }
   * ```
   */
  readonly roles: Store<Snowflake, GuildBased<RoleEntity>> | null;

  /**
   * Cache store for GuildScheduledEvent entities representing planned events.
   *
   * Contains event information, scheduling data, participant lists, and metadata.
   * Returns `null` when disabled for bots not using Discord's event system.
   *
   * @example
   * ```typescript
   * const event = cache.scheduledEvents?.get("event-id");
   * if (event) {
   *   console.log(`Event: ${event.name} at ${new Date(event.scheduled_start_time)}`);
   * }
   * ```
   */
  readonly scheduledEvents: Store<Snowflake, GuildScheduledEventEntity> | null;

  /**
   * Cache store for SoundboardSound entities representing audio clips.
   *
   * Contains soundboard sounds, audio metadata, and voice channel integration data.
   * Returns `null` when disabled for bots not using soundboard features.
   *
   * @example
   * ```typescript
   * const sound = cache.soundboards?.get("sound-id");
   * if (sound) {
   *   console.log(`Sound: ${sound.name} (${sound.volume}% volume)`);
   * }
   * ```
   */
  readonly soundboards: Store<Snowflake, SoundboardSoundEntity> | null;

  /**
   * Cache store for StageInstance entities representing Stage channel sessions.
   *
   * Contains Stage channel topics, speakers, privacy settings, and session data.
   * Returns `null` when disabled for bots not interacting with Stage channels.
   *
   * @example
   * ```typescript
   * const stage = cache.stageInstances?.get("stage-id");
   * if (stage) {
   *   console.log(`Stage topic: ${stage.topic}`);
   * }
   * ```
   */
  readonly stageInstances: Store<Snowflake, StageInstanceEntity> | null;

  /**
   * Cache store for Sticker entities representing custom message stickers.
   *
   * Contains guild and global stickers, sticker metadata, and usage information.
   * Returns `null` when disabled to save memory if sticker usage is minimal.
   *
   * @example
   * ```typescript
   * const sticker = cache.stickers?.get("sticker-id");
   * if (sticker) {
   *   console.log(`Sticker: ${sticker.name} (${sticker.format_type})`);
   * }
   * ```
   */
  readonly stickers: Store<Snowflake, StickerEntity> | null;

  /**
   * Cache store for Subscription entities related to premium features.
   *
   * Contains subscription information, billing data, and premium feature access.
   * Returns `null` when disabled for bots not using subscription features.
   *
   * @example
   * ```typescript
   * const sub = cache.subscriptions?.get("subscription-id");
   * if (sub) {
   *   console.log(`Subscription status: ${sub.status}`);
   * }
   * ```
   */
  readonly subscriptions: Store<Snowflake, SubscriptionEntity> | null;

  /**
   * Cache store for ThreadMember entities representing thread participants.
   *
   * Contains thread membership information, join timestamps, and notification settings.
   * Returns `null` when disabled for bots not managing threaded conversations.
   *
   * @example
   * ```typescript
   * const threadMember = cache.threadMembers?.get("user-id");
   * if (threadMember) {
   *   console.log(`Thread member joined: ${new Date(threadMember.join_timestamp)}`);
   * }
   * ```
   */
  readonly threadMembers: Store<
    Snowflake,
    GuildBased<ThreadMemberEntity>
  > | null;

  /**
   * Cache store for User entities from the Discord API.
   *
   * Contains user profiles, avatars, account information, and public user data.
   * This is a fundamental cache referenced by many other entities.
   *
   * @example
   * ```typescript
   * const user = cache.users?.get("user-id");
   * if (user) {
   *   console.log(`User: ${user.username}#${user.discriminator}`);
   * }
   * ```
   */
  readonly users: Store<Snowflake, UserEntity> | null;

  /**
   * Cache store for VoiceState entities representing voice channel participation.
   *
   * Contains voice connection data, mute states, channel information, and audio settings.
   * Returns `null` when disabled for bots not using voice functionality.
   *
   * @example
   * ```typescript
   * const voiceState = cache.voiceStates?.get("user-id");
   * if (voiceState) {
   *   console.log(`User in voice channel: ${voiceState.channel_id}`);
   * }
   * ```
   */
  readonly voiceStates: Store<Snowflake, VoiceStateEntity> | null;

  /**
   * Cache store for Webhook entities representing message webhooks.
   *
   * Contains webhook configurations, tokens, channel associations, and metadata.
   * Returns `null` when disabled for bots not creating or managing webhooks.
   *
   * @example
   * ```typescript
   * const webhook = cache.webhooks?.get("webhook-id");
   * if (webhook) {
   *   console.log(`Webhook: ${webhook.name} in channel ${webhook.channel_id}`);
   * }
   * ```
   */
  readonly webhooks: Store<Snowflake, WebhookEntity> | null;

  /**
   * Internal map of all cache stores indexed by entity type.
   *
   * Stores can be `null` when disabled through configuration, providing
   * memory efficiency and compile-time type safety.
   *
   * @internal
   */
  readonly #stores: Map<
    CacheEntityType,
    Store<Snowflake, CacheableEntity> | null
  > = new Map();

  /**
   * Creates a new cache manager with comprehensive entity caching capabilities.
   *
   * Initializes all cache stores based on the provided configuration, creating
   * stores only for enabled entity types and setting `null` for disabled types.
   * This approach provides both memory efficiency and type safety.
   *
   * @param options - Cache configuration controlling behavior for each entity type
   *
   * @throws {Error} Configuration validation fails or contains invalid values
   *
   * @example
   * ```typescript
   * // Minimal configuration with defaults
   * const cache = new CacheManager({});
   *
   * // Production configuration with optimized settings
   * const productionCache = new CacheManager({
   *   users: { enabled: true, maxSize: 100000, ttl: 300000 },
   *   guilds: { enabled: true, maxSize: 5000, ttl: 0 },
   *   messages: { enabled: true, maxSize: 50000, ttl: 1800000 },
   *   presences: { enabled: false }, // Disable for memory savings
   *   voiceStates: { enabled: false } // Not needed for text-only bots
   * });
   *
   * // Memory-constrained configuration
   * const lightweightCache = new CacheManager({
   *   users: { enabled: true, maxSize: 1000 },
   *   guilds: { enabled: true, maxSize: 100 },
   *   channels: { enabled: true, maxSize: 500 },
   *   // Disable all other caches for minimal memory footprint
   *   messages: { enabled: false },
   *   members: { enabled: false },
   *   presences: { enabled: false }
   * });
   * ```
   *
   * @see {@link destroy} - For proper resource cleanup
   * @see {@link getStats} - For monitoring cache performance
   *
   * @public
   */
  constructor(options: CacheOptions) {
    // Initialize all cache stores with conditional creation based on enabled flag
    // This provides both memory efficiency and compile-time type safety
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
   * Retrieves comprehensive performance and usage statistics for all enabled cache stores.
   *
   * Provides detailed metrics including current size, memory usage estimates,
   * hit rates (where available), and configuration limits. Disabled stores
   * are automatically excluded from the statistics.
   *
   * @returns Object containing statistics for each enabled cache store
   *
   * @example
   * ```typescript
   * const stats = cache.getStats();
   *
   * console.log(`Users cache: ${stats.users?.size}/${stats.users?.maxSize} items`);
   * console.log(`Messages cache: ${Math.round(stats.messages?.memoryUsage / 1024)}KB`);
   *
   * // Find most memory-intensive cache
   * const heaviest = Object.entries(stats)
   *   .sort(([,a], [,b]) => (b?.memoryUsage || 0) - (a?.memoryUsage || 0))[0];
   * console.log(`Heaviest cache: ${heaviest[0]} (${heaviest[1]?.memoryUsage} bytes)`);
   * ```
   *
   * @see {@link getTotalSize} - For aggregate size information
   * @see {@link getStats} - For monitoring individual store performance
   *
   * @public
   */
  getStats(): CacheMetrics {
    const metrics: CacheMetrics = {};

    // Iterate through all stores and collect statistics for enabled ones
    for (const [type, store] of this.#stores.entries()) {
      if (store !== null) {
        metrics[type] = {
          size: store.size,
          maxSize: (store as any).maxSize || 0, // Access private field if available
          memoryUsage: this.#estimateMemoryUsage(store),
          // hitRate could be added if Store class tracks access statistics
        };
      }
    }

    return metrics;
  }

  /**
   * Calculates the total number of items stored across all enabled cache stores.
   *
   * Provides a quick overview of overall cache utilization without the overhead
   * of detailed statistics. Useful for monitoring and resource planning.
   *
   * @returns Total count of cached items across all enabled stores
   *
   * @example
   * ```typescript
   * const totalItems = cache.getTotalSize();
   * console.log(`Total cached items: ${totalItems.toLocaleString()}`);
   *
   * // Monitor cache growth
   * setInterval(() => {
   *   const size = cache.getTotalSize();
   *   if (size > 50000) {
   *     console.warn(`High cache usage: ${size} items`);
   *   }
   * }, 60000);
   * ```
   *
   * @see {@link getStats} - For detailed per-store statistics
   * @see {@link sweep} - For cleaning up cached data
   *
   * @public
   */
  getTotalSize(): number {
    return Array.from(this.#stores.values())
      .filter((store) => store !== null)
      .reduce((total, store) => total + store.size, 0);
  }

  /**
   * Searches for the first entity across all enabled cache stores that matches the predicate.
   *
   * Performs a cross-store search to find entities by content or key patterns.
   * Searches in store creation order and returns immediately upon finding the first match.
   *
   * @typeParam T - The expected type of the found entity (must be a valid cacheable entity)
   * @param predicate - Function to test each entity for matching criteria
   * @returns The first matching entity of the specified type, or `undefined` if none found
   *
   * @throws {Error} Predicate function throws an error during evaluation
   *
   * @example
   * ```typescript
   * // Find user by username across all caches
   * const user = cache.find<UserEntity>((entity, key) =>
   *   'username' in entity && entity.username === 'alice'
   * );
   *
   * // Find entity by ID pattern
   * const entity = cache.find((_, key) => key.startsWith('123456'));
   *
   * // Find guild by name
   * const guild = cache.find<GuildCreateEntity>((entity) =>
   *   'name' in entity && entity.name.includes('Gaming')
   * );
   * ```
   *
   * @see {@link filter} - For finding all matching entities
   * @see {@link findInStore} - For searching within a specific store
   *
   * @public
   */
  find<T extends CacheableEntity = CacheableEntity>(
    predicate: CachePredicate<CacheableEntity>,
  ): T | undefined {
    // Search through all enabled stores in order
    for (const store of this.#stores.values()) {
      if (store !== null) {
        // Use the store's find method for efficient searching
        const result = store.find((entity, key) => predicate(entity, key));
        if (result !== undefined) {
          return result as T;
        }
      }
    }

    return undefined;
  }

  /**
   * Searches for entities within a specific cache store that match the predicate.
   *
   * Provides type-safe searching within a single entity type's cache store
   * with automatic type inference based on the store key.
   *
   * @typeParam K - The cache entity type to search within
   * @param storeType - The type of cache store to search
   * @param predicate - Function to test each entity for matching criteria
   * @returns The first matching entity, or `undefined` if none found or store is disabled
   *
   * @example
   * ```typescript
   * // Find user by discriminator
   * const user = cache.findInStore('users', (user) =>
   *   user.discriminator === '0001'
   * );
   *
   * // Find channel by name
   * const channel = cache.findInStore('channels', (channel) =>
   *   'name' in channel && channel.name === 'general'
   * );
   *
   * // Find role with specific permission
   * const adminRole = cache.findInStore('roles', (role) =>
   *   role.permissions.includes('ADMINISTRATOR')
   * );
   * ```
   *
   * @see {@link find} - For cross-store searching
   * @see {@link filterStore} - For finding all matches in a specific store
   *
   * @public
   */
  findInStore<K extends CacheEntityType>(
    storeType: K,
    predicate: CachePredicate<CacheEntityMapping[K]>,
  ): CacheEntityMapping[K] | undefined {
    const store = this.#stores.get(storeType);
    if (!store) {
      return undefined;
    }

    return store.find((entity, key) =>
      predicate(entity as CacheEntityMapping[K], key),
    ) as CacheEntityMapping[K] | undefined;
  }

  /**
   * Retrieves all entities across all enabled cache stores that match the predicate.
   *
   * Performs a comprehensive search across all cache stores and returns all matching
   * entities. Results are returned in store iteration order with no deduplication.
   *
   * @typeParam T - The expected type of the found entities (must be a valid cacheable entity)
   * @param predicate - Function to test each entity for inclusion
   * @returns Array of all matching entities (empty array if no matches)
   *
   * @example
   * ```typescript
   * // Find all bot users
   * const bots = cache.filter<UserEntity>((entity) =>
   *   'bot' in entity && entity.bot === true
   * );
   *
   * // Find all entities belonging to a specific guild
   * const guildEntities = cache.filter((entity) =>
   *   'guild_id' in entity && entity.guild_id === '123456789'
   * );
   *
   * // Find all entities modified recently
   * const recentEntities = cache.filter((entity) => {
   *   const timestamp = 'edited_timestamp' in entity ? entity.edited_timestamp : null;
   *   return timestamp && Date.now() - new Date(timestamp).getTime() < 3600000; // 1 hour
   * });
   * ```
   *
   * @see {@link find} - For finding only the first matching entity
   * @see {@link filterStore} - For filtering within a specific store type
   *
   * @public
   */
  filter<T extends CacheableEntity = CacheableEntity>(
    predicate: CachePredicate<CacheableEntity>,
  ): T[] {
    const results: T[] = [];

    // Search through all enabled stores
    for (const store of this.#stores.values()) {
      if (store !== null) {
        // Use the store's filter method and add results
        const storeResults = store.filter((entity, key) =>
          predicate(entity, key),
        );
        results.push(...(storeResults as T[]));
      }
    }

    return results;
  }

  /**
   * Retrieves all entities from a specific cache store that match the predicate.
   *
   * Provides type-safe filtering within a single entity type's cache store
   * with automatic type inference and validation.
   *
   * @typeParam K - The cache entity type to filter within
   * @param storeType - The type of cache store to search
   * @param predicate - Function to test each entity for inclusion
   * @returns Array of all matching entities from the specified store
   *
   * @example
   * ```typescript
   * // Get all online users (if presence cache is enabled)
   * const onlineUsers = cache.filterStore('presences', (presence) =>
   *   presence.status === 'online'
   * );
   *
   * // Get all text channels in a guild
   * const textChannels = cache.filterStore('channels', (channel) =>
   *   'type' in channel && channel.type === ChannelType.GuildText
   * );
   *
   * // Get all members with a specific role
   * const admins = cache.filterStore('members', (member) =>
   *   member.roles.includes('admin-role-id')
   * );
   * ```
   *
   * @see {@link filter} - For cross-store filtering
   * @see {@link findInStore} - For finding single entities in a specific store
   *
   * @public
   */
  filterStore<K extends CacheEntityType>(
    storeType: K,
    predicate: CachePredicate<CacheEntityMapping[K]>,
  ): CacheEntityMapping[K][] {
    const store = this.#stores.get(storeType);
    if (!store) {
      return [];
    }

    return store.filter((entity, key) =>
      predicate(entity as CacheEntityMapping[K], key),
    ) as CacheEntityMapping[K][];
  }

  /**
   * Removes all cached data from all enabled cache stores.
   *
   * Performs a complete cache flush while keeping all stores functional and ready
   * for new data. This is useful for memory cleanup or forcing fresh data retrieval.
   *
   * @example
   * ```typescript
   * // Clear all caches during maintenance
   * cache.clear();
   * console.log(`Cache cleared. Total size now: ${cache.getTotalSize()}`);
   *
   * // Selective clearing based on conditions
   * if (cache.getTotalSize() > 100000) {
   *   cache.clear();
   *   console.log('Cache cleared due to high memory usage');
   * }
   * ```
   *
   * @see {@link clearTypes} - For selective cache clearing
   * @see {@link destroy} - For complete resource cleanup
   * @see {@link sweep} - For expired item cleanup
   *
   * @public
   */
  clear(): void {
    // Clear all enabled stores while keeping them functional
    for (const store of this.#stores.values()) {
      if (store !== null) {
        store.clear();
      }
    }
  }

  /**
   * Removes cached data from specific cache store types.
   *
   * Allows selective cache clearing for targeted memory management or data refresh.
   * Only clears enabled stores; disabled stores are automatically skipped.
   *
   * @param types - Array of cache entity types to clear
   *
   * @example
   * ```typescript
   * // Clear volatile data but keep core entities
   * cache.clearTypes(['messages', 'presences', 'voiceStates']);
   *
   * // Clear all user-related data
   * cache.clearTypes(['users', 'members', 'presences']);
   *
   * // Clear specific cache after configuration change
   * cache.clearTypes(['roles']);
   * ```
   *
   * @see {@link clear} - For clearing all cache stores
   * @see {@link invalidateGuild} - For clearing guild-related data
   *
   * @public
   */
  clearTypes(types: CacheEntityType[]): void {
    for (const type of types) {
      const store = this.#stores.get(type);
      if (store) {
        store.clear();
      }
    }
  }

  /**
   * Removes all cached entities related to a specific guild.
   *
   * Performs intelligent cleanup of guild-related data across multiple cache stores
   * including members, channels, roles, and other guild-specific entities.
   *
   * @param guildId - The Snowflake ID of the guild to invalidate
   *
   * @example
   * ```typescript
   * // Clean up after leaving a guild
   * client.on('guildDelete', (guild) => {
   *   cache.invalidateGuild(guild.id);
   *   console.log(`Cleaned up cache for guild: ${guild.name}`);
   * });
   *
   * // Force refresh of guild data
   * cache.invalidateGuild('123456789');
   * // Fresh data will be cached on next API call
   * ```
   *
   * @see {@link clearTypes} - For clearing specific cache types
   * @see {@link clear} - For complete cache clearing
   *
   * @public
   */
  invalidateGuild(guildId: Snowflake): void {
    // Remove guild-specific entities from various caches
    const guildRelatedTypes: CacheEntityType[] = [
      "members",
      "channels",
      "roles",
      "emojis",
      "stickers",
      "scheduledEvents",
      "integrations",
      "bans",
      "invites",
      "voiceStates",
    ];

    for (const type of guildRelatedTypes) {
      const store = this.#stores.get(type);
      if (store) {
        // Filter and remove guild-related entities
        const toDelete: Snowflake[] = [];
        for (const [key, entity] of store) {
          if ("guild_id" in entity && entity.guild_id === guildId) {
            toDelete.push(key);
          }
        }

        // Delete identified entities
        for (const key of toDelete) {
          store.delete(key);
        }
      }
    }

    // Also remove the guild itself
    this.guilds?.delete(guildId);
  }

  /**
   * Performs maintenance sweep to remove expired items from all enabled cache stores.
   *
   * Triggers background cleanup processes to remove expired data and free memory.
   * This is automatically handled by individual stores but can be manually triggered
   * for immediate cleanup or memory pressure situations.
   *
   * @example
   * ```typescript
   * // Manual cleanup during low-activity periods
   * setInterval(() => {
   *   cache.sweep();
   *   console.log(`Post-sweep cache size: ${cache.getTotalSize()}`);
   * }, 300000); // Every 5 minutes
   *
   * // Cleanup during memory pressure
   * process.on('SIGTERM', () => {
   *   cache.sweep();
   *   cache.destroy();
   * });
   * ```
   *
   * @see {@link clear} - For immediate data removal
   * @see {@link destroy} - For complete resource cleanup
   *
   * @public
   */
  sweep(): void {
    // Trigger sweep on all enabled stores to clean up expired items
    for (const store of this.#stores.values()) {
      if (store !== null) {
        // Force cleanup by checking expiration on all keys
        // This triggers the store's internal cleanup mechanisms
        for (const key of store.keys()) {
          if ((store as any).isExpired?.(key)) {
            store.delete(key);
          }
        }
      }
    }
  }

  /**
   * Completely destroys the cache manager and cleans up all associated resources.
   *
   * Performs comprehensive cleanup including stopping background processes,
   * clearing all data, and disposing of store instances. The cache manager
   * becomes unusable after destruction.
   *
   * @example
   * ```typescript
   * // Proper cleanup in application shutdown
   * process.on('SIGINT', async () => {
   *   console.log('Shutting down...');
   *   cache.destroy();
   *   await client.destroy();
   *   process.exit(0);
   * });
   *
   * // Cleanup after testing
   * afterEach(() => {
   *   cache.destroy();
   * });
   * ```
   *
   * @see {@link clear} - For data removal without destruction
   * @see {@link Symbol.dispose} - For automatic resource management
   *
   * @public
   */
  destroy(): void {
    // Destroy all store instances and clean up resources
    for (const store of this.#stores.values()) {
      if (store !== null) {
        store.destroy();
      }
    }

    // Clear the store map to prevent further access
    this.#stores.clear();
  }

  /**
   * Symbol.dispose implementation for automatic resource management.
   *
   * Enables automatic cleanup when used with `using` declarations in environments
   * that support explicit resource management. Automatically calls destroy()
   * when the cache manager goes out of scope.
   *
   * @example
   * ```typescript
   * {
   *   using cache = new CacheManager({ users: { enabled: true } });
   *   // Use the cache normally
   *   const user = cache.users?.get('123456789');
   *   // Cache is automatically destroyed when leaving this scope
   * }
   * ```
   *
   * @see {@link destroy} - For manual resource cleanup
   *
   * @public
   */
  [Symbol.dispose](): void {
    this.destroy();
  }

  /**
   * Creates a conditional store for a specific entity type and registers it in the cache manager.
   *
   * Returns a Store instance when the entity type is enabled in the configuration,
   * or null when disabled. This eliminates runtime checks and provides compile-time
   * type safety through conditional typing.
   *
   * @typeParam K - The cache entity type to create a store for
   * @param type - The entity type identifier for this cache store
   * @param options - The complete cache configuration options
   * @returns A Store instance for the specified entity type, or null if disabled
   *
   * @internal
   *
   * @remarks
   * When a store is disabled (enabled: false):
   * - Returns null instead of creating a Store instance
   * - Registers null in the internal store map
   * - Saves memory by not instantiating unused stores
   * - Provides type-safe access through conditional typing
   *
   * When a store is enabled (enabled: true):
   * - Creates a new Store instance with the provided configuration
   * - Registers the store in the internal store map for management
   * - Returns the fully typed Store instance ready for use
   */
  #createStore<K extends CacheEntityType>(
    type: K,
    options: CacheOptions,
  ): Store<Snowflake, CacheEntityMapping[K]> | null {
    const typeConfig = options[type];
    const isEnabled = typeConfig?.enabled ?? false;

    if (!isEnabled) {
      // Store is disabled - register null and return null for type safety
      this.#stores.set(type, null);
      return null;
    }

    // Store is enabled - create and register the actual store instance
    const store = new Store<Snowflake, CacheEntityMapping[K]>(
      typeConfig as StoreOptions,
    );

    // Register in the internal map for management operations
    this.#stores.set(type, store as Store<Snowflake, CacheableEntity>);

    return store;
  }

  /**
   * Estimates the memory usage of a cache store based on its contents.
   *
   * Provides approximate memory consumption calculations for monitoring and
   * optimization purposes. Estimates include both data and metadata overhead.
   *
   * @param store - The cache store to analyze for memory usage
   * @returns Estimated memory usage in bytes
   *
   * @internal
   *
   * @remarks
   * Memory estimation includes:
   * - Base object overhead (approximately 24 bytes per object)
   * - String properties (2 bytes per character)
   * - Numeric properties (8 bytes each)
   * - Array properties (24 bytes base + element overhead)
   * - Map/Set overhead for internal data structures
   *
   * This is an approximation and actual memory usage may vary based on
   * JavaScript engine implementation and object optimization.
   */
  #estimateMemoryUsage(store: Store<Snowflake, CacheableEntity>): number {
    let totalBytes = 0;

    // Base overhead per entry (Map overhead + key storage)
    const baseOverheadPerEntry = 32; // Approximate Map overhead per entry

    for (const [key, entity] of store) {
      // Add base overhead
      totalBytes += baseOverheadPerEntry;

      // Add key size (Snowflake is typically 17-19 characters)
      totalBytes += key.length * 2; // 2 bytes per character for strings

      // Estimate entity size
      totalBytes += this.#estimateEntitySize(entity);
    }

    return totalBytes;
  }

  /**
   * Estimates the memory footprint of a single cached entity.
   *
   * Analyzes entity properties to calculate approximate memory usage including
   * strings, numbers, arrays, and nested objects with reasonable overhead estimates.
   *
   * @param entity - The cached entity to analyze
   * @returns Estimated memory usage in bytes for the entity
   *
   * @internal
   */
  #estimateEntitySize(entity: CacheableEntity): number {
    let size = 24; // Base object overhead

    for (const [key, value] of Object.entries(entity)) {
      // Add key size
      size += key.length * 2;

      // Add value size based on type
      if (typeof value === "string") {
        size += value.length * 2; // 2 bytes per character
      } else if (typeof value === "number") {
        size += 8; // 64-bit number
      } else if (typeof value === "boolean") {
        size += 1;
      } else if (Array.isArray(value)) {
        size += 24; // Array overhead
        size += value.length * 8; // Rough estimate for array elements
      } else if (value && typeof value === "object") {
        size += 24; // Nested object overhead
        size += JSON.stringify(value).length * 2; // Rough content estimate
      }
    }

    return size;
  }
}
