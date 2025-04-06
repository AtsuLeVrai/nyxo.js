import type {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  AuditLogChangeEntity,
  AuditLogEntryInfoEntity,
  AuditLogEvent,
  BanEntity,
  GuildMemberEntity,
  GuildScheduledEventEntity,
  IntegrationAccountEntity,
  IntegrationApplicationEntity,
  IntegrationExpirationBehavior,
  OAuth2Scope,
  Snowflake,
  SoundboardSoundEntity,
  StageInstanceEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type GuildMemberFlags,
  type UserEntity,
} from "@nyxjs/core";
import type {
  GuildAuditLogEntryCreateEntity,
  GuildCreateEntity,
  GuildMemberAddEntity,
  IntegrationCreateEntity,
  PresenceEntity,
} from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a GUILD_CREATE event dispatched when a guild becomes available.
 *
 * This event can be sent in three different scenarios:
 * 1. When a user is initially connecting, to lazily load and backfill information for all unavailable guilds sent in the Ready event.
 * 2. When a Guild becomes available again to the client.
 * 3. When the current user joins a new Guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create}
 */
export class Guild extends BaseClass<GuildCreateEntity> {
  /**
   * Guild ID
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Guild name
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * Icon hash
   */
  get icon(): string | null {
    return this.data.icon;
  }

  /**
   * Icon hash, returned when in the template object
   */
  get iconHash(): string | null {
    return this.data.icon_hash || null;
  }

  /**
   * Splash hash
   */
  get splash(): string | null {
    return this.data.splash;
  }

  /**
   * Discovery splash hash
   */
  get discoverySplash(): string | null {
    return this.data.discovery_splash;
  }

  /**
   * True if the user is the owner of the guild
   */
  get owner(): boolean {
    return Boolean(this.data.owner);
  }

  /**
   * ID of owner
   */
  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  /**
   * Total permissions for the user in the guild (excludes overwrites)
   */
  get permissions(): string | null {
    return this.data.permissions || null;
  }

  /**
   * When this guild was joined at
   */
  get joinedAt(): string {
    return this.data.joined_at;
  }

  /**
   * true if this is considered a large guild
   */
  get large(): boolean {
    return Boolean(this.data.large);
  }

  /**
   * true if this guild is unavailable due to an outage
   */
  get unavailable(): boolean {
    return Boolean(this.data.unavailable);
  }

  /**
   * Total number of members in this guild
   */
  get memberCount(): number {
    return this.data.member_count;
  }

  /**
   * States of members currently in voice channels; lacks the guild_id key
   */
  get voiceStates(): Partial<VoiceStateEntity>[] {
    return this.data.voice_states || [];
  }

  /**
   * Users in the guild
   */
  get members(): GuildMemberEntity[] {
    return this.data.members || [];
  }

  /**
   * Channels in the guild
   */
  get channels(): AnyChannelEntity[] {
    return this.data.channels || [];
  }

  /**
   * All active threads in the guild that current user has permission to view
   */
  get threads(): AnyThreadChannelEntity[] {
    return this.data.threads || [];
  }

  /**
   * Presences of the members in the guild
   */
  get presences(): Partial<PresenceEntity>[] {
    return this.data.presences || [];
  }

  /**
   * Stage instances in the guild
   */
  get stageInstances(): StageInstanceEntity[] {
    return this.data.stage_instances || [];
  }

  /**
   * Scheduled events in the guild
   */
  get guildScheduledEvents(): GuildScheduledEventEntity[] {
    return this.data.guild_scheduled_events || [];
  }

  /**
   * Soundboard sounds in the guild
   */
  get soundboardSounds(): SoundboardSoundEntity[] {
    return this.data.soundboard_sounds || [];
  }
}

/**
 * Represents a GUILD_MEMBER_ADD event dispatched when a new user joins a guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add}
 */
export class GuildMember extends BaseClass<GuildMemberAddEntity> {
  /**
   * ID of the guild
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * The user this guild member represents
   */
  get user(): UserEntity {
    return this.data.user;
  }

  /**
   * This user's guild nickname
   */
  get nick(): string | null {
    return this.data.nick || null;
  }

  /**
   * The member's guild avatar hash
   */
  get avatar(): string | null {
    return this.data.avatar || null;
  }

  /**
   * The member's guild banner hash
   */
  get banner(): string | null {
    return this.data.banner || null;
  }

  /**
   * Array of role IDs
   */
  get roles(): Snowflake[] {
    return this.data.roles || [];
  }

  /**
   * When the user joined the guild
   */
  get joinedAt(): string {
    return this.data.joined_at;
  }

  /**
   * When the user started boosting the guild
   */
  get premiumSince(): string | null {
    return this.data.premium_since || null;
  }

  /**
   * Whether the user is deafened in voice channels
   */
  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  /**
   * Whether the user is muted in voice channels
   */
  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  /**
   * Guild member flags
   */
  get flags(): BitFieldManager<GuildMemberFlags> {
    return new BitFieldManager<GuildMemberFlags>(this.data.flags || 0n);
  }

  /**
   * Whether the user has not yet passed the guild's Membership Screening requirements
   */
  get pending(): boolean {
    return Boolean(this.data.pending);
  }

  /**
   * Total permissions of the member in the channel, including overwrites
   */
  get permissions(): string | null {
    return this.data.permissions || null;
  }

  /**
   * When the user's timeout will expire and the user will be able to communicate in the guild again
   */
  get communicationDisabledUntil(): string | null {
    return this.data.communication_disabled_until || null;
  }

  /**
   * Data for the member's guild avatar decoration
   */
  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.data.avatar_decoration_data || null;
  }
}

/**
 * Represents a guild ban event.
 * Contains information about a user who was banned from a guild.
 */
export class GuildBan extends BaseClass<BanEntity & { guild_id: Snowflake }> {
  /**
   * ID of the guild where the ban occurred
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Reason for the ban, if provided
   */
  get reason(): string | null {
    return this.data.reason;
  }

  /**
   * The user who was banned
   */
  get user(): User {
    return new User(this.client, this.data.user);
  }

  /**
   * Whether a reason was provided for the ban
   */
  get hasReason(): boolean {
    return Boolean(this.data.reason);
  }
}

/**
 * Represents a guild integration.
 * An integration is a connection between a guild and an external service like Twitch, YouTube, or Discord.
 */
export class Integration extends BaseClass<IntegrationCreateEntity> {
  /**
   * Integration ID
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * ID of the guild this integration belongs to
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Integration name
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * Integration type (twitch, youtube, discord, guild_subscription)
   */
  get type(): "twitch" | "youtube" | "discord" | "guild_subscription" {
    return this.data.type;
  }

  /**
   * Whether this integration is enabled
   */
  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  /**
   * Whether this integration is syncing
   */
  get syncing(): boolean {
    return Boolean(this.data.syncing);
  }

  /**
   * ID of the role that this integration uses for "subscribers"
   */
  get roleId(): Snowflake | undefined {
    return this.data.role_id;
  }

  /**
   * Whether emoticons should be synced for this integration
   */
  get enableEmoticons(): boolean {
    return Boolean(this.data.enable_emoticons);
  }

  /**
   * The behavior of expiring subscribers
   */
  get expireBehavior(): IntegrationExpirationBehavior | undefined {
    return this.data.expire_behavior;
  }

  /**
   * The grace period (in days) before expiring subscribers
   */
  get expireGracePeriod(): number | undefined {
    return this.data.expire_grace_period;
  }

  /**
   * Integration account information
   */
  get account(): IntegrationAccountEntity {
    return this.data.account;
  }

  /**
   * When this integration was last synced
   */
  get syncedAt(): string | undefined {
    return this.data.synced_at;
  }

  /**
   * How many subscribers this integration has
   */
  get subscriberCount(): number | undefined {
    return this.data.subscriber_count;
  }

  /**
   * Whether this integration has been revoked
   */
  get revoked(): boolean {
    return Boolean(this.data.revoked);
  }

  /**
   * The bot/OAuth2 application for discord integrations
   */
  get application(): IntegrationApplicationEntity | undefined {
    return this.data.application;
  }

  /**
   * The scopes the application has been authorized for
   */
  get scopes(): OAuth2Scope[] | undefined {
    return this.data.scopes;
  }

  /**
   * Whether this integration is for Twitch
   */
  get isTwitch(): boolean {
    return this.data.type === "twitch";
  }

  /**
   * Whether this integration is for YouTube
   */
  get isYouTube(): boolean {
    return this.data.type === "youtube";
  }

  /**
   * Whether this integration is for Discord
   */
  get isDiscord(): boolean {
    return this.data.type === "discord";
  }

  /**
   * Whether this integration is for guild subscriptions
   */
  get isGuildSubscription(): boolean {
    return this.data.type === "guild_subscription";
  }

  /**
   * Whether this integration has application data
   */
  get hasApplication(): boolean {
    return Boolean(this.data.application);
  }

  /**
   * Whether this integration has a connected user
   */
  get hasUser(): boolean {
    return Boolean(this.data.user);
  }
}

/**
 * Represents a guild audit log entry.
 * Audit logs keep track of administrative actions taken in a guild.
 */
export class GuildAuditLogEntry extends BaseClass<GuildAuditLogEntryCreateEntity> {
  /**
   * ID of the affected entity (webhook, user, role, etc.)
   */
  get targetId(): string | null {
    return this.data.target_id;
  }

  /**
   * Changes made to the target_id
   */
  get changes(): AuditLogChangeEntity[] | undefined {
    return this.data.changes;
  }

  /**
   * User or app that made the changes
   */
  get userId(): Snowflake | null {
    return this.data.user_id;
  }

  /**
   * ID of the entry
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Type of action that occurred
   */
  get actionType(): AuditLogEvent {
    return this.data.action_type;
  }

  /**
   * Additional info for certain action types
   */
  get options(): AuditLogEntryInfoEntity | undefined {
    return this.data.options;
  }

  /**
   * Reason for the change (0-512 characters)
   */
  get reason(): string | undefined {
    return this.data.reason;
  }

  /**
   * ID of the guild where this audit log entry was created
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Whether this audit log entry has a reason
   */
  get hasReason(): boolean {
    return Boolean(this.data.reason);
  }

  /**
   * Whether this audit log entry has additional options
   */
  get hasOptions(): boolean {
    return Boolean(this.data.options);
  }
}
