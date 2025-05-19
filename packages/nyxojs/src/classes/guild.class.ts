import {
  type AnyChannelEntity,
  type AvatarDecorationDataEntity,
  type BanEntity,
  BitField,
  type DefaultMessageNotificationLevel,
  type ExplicitContentFilterLevel,
  type FormattedChannel,
  type GuildEntity,
  GuildFeature,
  type GuildMemberEntity,
  type GuildOnboardingEntity,
  type GuildWidgetEntity,
  type GuildWidgetSettingsEntity,
  type IncidentsDataEntity,
  type IntegrationAccountEntity,
  type IntegrationApplicationEntity,
  type IntegrationEntity,
  type IntegrationExpirationBehavior,
  type IntegrationType,
  type InviteWithMetadataEntity,
  type Locale,
  type MfaLevel,
  type NsfwLevel,
  type OAuth2Scope,
  type PremiumTier,
  type Snowflake,
  SnowflakeUtil,
  type SystemChannelFlags,
  type VerificationLevel,
  type VoiceRegionEntity,
  type VoiceStateEntity,
  type WelcomeScreenEntity,
  formatChannel,
} from "@nyxojs/core";
import type {
  GuildBanEntity,
  GuildCreateEntity,
  PresenceEntity,
} from "@nyxojs/gateway";
import type {
  ChannelPositionsUpdateOptions,
  GetGuildPruneCountQuerySchema,
  GuildBanCreateOptions,
  GuildBansBulkOptions,
  GuildBansBulkResponse,
  GuildBansFetchParams,
  GuildMemberAddOptions,
  GuildMemberUpdateOptions,
  GuildMembersFetchParams,
  GuildMembersSearchParams,
  GuildOnboardingUpdateOptions,
  GuildPruneOptions,
  GuildRoleCreateOptions,
  GuildUpdateOptions,
  GuildWelcomeScreenUpdateOptions,
  GuildWidgetUpdateOptions,
  ImageOptions,
  RolePositionsUpdateOptions,
  WidgetStyle,
} from "@nyxojs/rest";
import { type AnimatedImageOptions, Cdn } from "@nyxojs/rest";
import type { z } from "zod/v4";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import type { AnyChannel, AnyThreadChannel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { Role } from "./role.class.js";
import { ScheduledEvent } from "./scheduled-event.class.js";
import { SoundboardSound } from "./soundboard-sound.class.js";
import { StageInstance } from "./stage-instance.class.js";
import { Sticker } from "./sticker.class.js";
import { User } from "./user.class.js";
import { VoiceState } from "./voice.class.js";

/**
 * Represents a Discord guild ban, providing methods to interact with and manage bans.
 *
 * The Ban class encapsulates information about a user who has been banned from a guild,
 * including the ban reason and methods to manage the ban.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object}
 */
@Cacheable<BanEntity>("bans", (data) => data.user.id)
export class Ban
  extends BaseClass<BanEntity | GuildBanEntity>
  implements Enforce<PropsToCamel<BanEntity & GuildBanEntity>>
{
  /**
   * The cached User object for the banned user.
   * @private
   */
  #user: User | null = null;

  /**
   * Gets the reason for the ban.
   *
   * @returns The ban reason, or null if no reason was provided
   */
  get reason(): string | null {
    return (this.rawData as BanEntity).reason;
  }

  /**
   * Gets the ID of the guild where the ban occurred.
   *
   * @returns The guild's ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return (this.rawData as GuildBanEntity).guild_id;
  }

  /**
   * Gets the User object for the banned user.
   *
   * @returns The User instance
   */
  get user(): User {
    if (!this.#user) {
      this.#user = new User(this.client, this.rawData.user);
    }
    return this.#user;
  }

  /**
   * Gets the ID of the banned user.
   *
   * @returns The user's ID as a Snowflake string
   */
  get userId(): Snowflake {
    return this.user.id;
  }

  /**
   * Removes the ban from the user.
   *
   * @param guildId - The ID of the guild where the user is banned
   * @param reason - Reason for removing the ban (for audit logs)
   * @returns A promise resolving to true if successful, false otherwise
   */
  async remove(guildId = this.guildId, reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.removeGuildBan(
        guildId,
        this.userId,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Represents a Discord guild integration, connecting external services to Discord.
 *
 * The Integration class provides methods to interact with and manage integrations,
 * including external services (like Twitch, YouTube) and Discord applications that
 * are integrated with a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object}
 */
@Cacheable("integrations")
export class Integration
  extends BaseClass<GuildBased<IntegrationEntity>>
  implements Enforce<PropsToCamel<IntegrationEntity>>
{
  /**
   * The cached User object for the integration's user.
   * @private
   */
  #user: User | null = null;

  /**
   * Gets the integration's unique identifier.
   *
   * @returns The integration's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the ID of the guild this integration belongs to.
   *
   * @returns The guild's ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the integration name.
   *
   * @returns The name of the integration
   */
  get name(): string {
    return this.rawData.name;
  }

  /**
   * Gets the integration type.
   *
   * @returns The type of integration (twitch, youtube, discord, guild_subscription)
   */
  get type(): IntegrationType {
    return this.rawData.type;
  }

  /**
   * Checks if this integration is enabled.
   *
   * @returns True if the integration is enabled, false otherwise
   */
  get enabled(): boolean {
    return this.rawData.enabled;
  }

  /**
   * Checks if this integration is syncing.
   *
   * @returns True if the integration is syncing, undefined if unknown
   */
  get syncing(): boolean | undefined {
    return this.rawData.syncing;
  }

  /**
   * Gets the ID of the role that subscribers receive.
   *
   * @returns The role ID, or undefined if not set
   */
  get roleId(): Snowflake | undefined {
    return this.rawData.role_id;
  }

  /**
   * Checks if emoticons should be synced for this integration.
   *
   * @returns True if emoticons should be synced, undefined if not applicable
   */
  get enableEmoticons(): boolean | undefined {
    return this.rawData.enable_emoticons;
  }

  /**
   * Gets the behavior when subscriptions expire.
   *
   * @returns The expiration behavior, or undefined if not set
   */
  get expireBehavior(): IntegrationExpirationBehavior | undefined {
    return this.rawData.expire_behavior;
  }

  /**
   * Gets the grace period (in days) before expiring subscribers.
   *
   * @returns The grace period in days, or undefined if not set
   */
  get expireGracePeriod(): number | undefined {
    return this.rawData.expire_grace_period;
  }

  /**
   * Gets the User object for the integration's user, if available.
   *
   * @returns The User instance, or undefined if not available
   */
  get user(): User | undefined {
    if (!this.rawData.user) {
      return undefined;
    }

    if (!this.#user) {
      this.#user = new User(this.client, this.rawData.user);
    }
    return this.#user;
  }

  /**
   * Gets the IntegrationAccount instance for this integration.
   *
   * @returns The IntegrationAccount instance
   */
  get account(): IntegrationAccountEntity {
    return this.rawData.account;
  }

  /**
   * Gets the ISO8601 timestamp when this integration was last synced.
   *
   * @returns The last synced timestamp, or undefined if not available
   */
  get syncedAt(): string | undefined {
    return this.rawData.synced_at;
  }

  /**
   * Gets the number of subscribers this integration has.
   *
   * @returns The subscriber count, or undefined if not available
   */
  get subscriberCount(): number | undefined {
    return this.rawData.subscriber_count;
  }

  /**
   * Checks if this integration has been revoked.
   *
   * @returns True if the integration has been revoked, undefined if unknown
   */
  get revoked(): boolean | undefined {
    return this.rawData.revoked;
  }

  /**
   * Gets the IntegrationApplication instance for Discord integrations.
   *
   * @returns The IntegrationApplication instance, or undefined if not applicable
   */
  get application(): IntegrationApplicationEntity | undefined {
    return this.rawData.application;
  }

  /**
   * Gets the OAuth2 scopes that the application has been authorized for.
   *
   * @returns Array of OAuth2 scope strings, or undefined if not applicable
   */
  get scopes(): OAuth2Scope[] | undefined {
    return this.rawData.scopes;
  }

  /**
   * Gets the Date object representing when this integration was last synced.
   *
   * @returns The sync Date, or null if not available
   */
  get syncedAtDate(): Date | null {
    return this.syncedAt ? new Date(this.syncedAt) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this integration was last synced.
   *
   * @returns The sync timestamp in milliseconds, or null if not available
   */
  get syncedTimestamp(): number | null {
    return this.syncedAtDate?.getTime() ?? null;
  }

  /**
   * Checks if this is a Discord application integration.
   *
   * @returns True if this is a Discord integration, false otherwise
   */
  get isDiscordIntegration(): boolean {
    return this.type === "discord";
  }

  /**
   * Checks if this is a subscription-based integration.
   *
   * @returns True if this is a subscription integration, false otherwise
   */
  get isSubscriptionIntegration(): boolean {
    return this.type === "guild_subscription";
  }

  /**
   * Gets detailed information about the integration's scopes as an object.
   * Transforms the scopes array into a more user-friendly object with camelCase properties.
   *
   * @returns An object with information about the integration's scopes, or null if not available
   */
  get scopesInfo(): Record<string, boolean> | null {
    if (!this.scopes) {
      return null;
    }

    const scopesInfo: Record<string, boolean> = {};

    for (const scope of this.scopes) {
      const scopeName = scope
        .replace(/\./g, "_")
        .replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
      scopesInfo[scopeName] = true;
    }

    return scopesInfo;
  }

  /**
   * Deletes this integration from the guild.
   *
   * @param reason - Reason for deleting the integration (for audit logs)
   * @returns A promise resolving to true if successful, false otherwise
   */
  async delete(reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.deleteGuildIntegration(
        this.guildId,
        this.id,
        reason,
      );
      this.uncache();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Represents a Discord guild member, providing methods to interact with and manage member data.
 *
 * The GuildMember class encapsulates a user's membership in a specific guild, including:
 * - Member-specific profile data (nickname, roles, joined date, etc.)
 * - Methods to manage the member's roles, voice states, and permissions
 * - Functions for administrative actions (kick, ban, timeout)
 *
 * This class maintains the relationship between a user and a guild, allowing for
 * guild-specific member operations while providing access to the underlying user.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
 */
@Cacheable<GuildBased<GuildMemberEntity>>(
  "members",
  (data) => `${data.guild_id}:${data.user.id}`,
)
export class GuildMember
  extends BaseClass<GuildBased<GuildMemberEntity>>
  implements Enforce<PropsToCamel<GuildMemberEntity>>
{
  /**
   * The guild this member belongs to.
   * @private
   */
  #guild: Guild | null = null;

  /**
   * The user object for this guild member.
   * @private
   */
  #user: User | null = null;

  /**
   * Gets the ID of the guild this member belongs to.
   *
   * @returns The guild's snowflake ID
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the user object for this guild member.
   *
   * @returns The User instance representing this member
   */
  get user(): User {
    if (!this.#user) {
      this.#user = new User(this.client, this.rawData.user);
    }
    return this.#user;
  }

  /**
   * Gets the member's custom nickname in the guild.
   *
   * @returns The member's nickname, or null if not set
   */
  get nick(): string | null {
    return this.rawData.nick ?? null;
  }

  /**
   * Gets the member's guild-specific avatar hash.
   *
   * @returns The avatar hash, or null if using global user avatar
   */
  get avatar(): string | null {
    return this.rawData.avatar ?? null;
  }

  /**
   * Gets the member's guild-specific banner hash.
   *
   * @returns The banner hash, or null if not set
   */
  get banner(): string | null {
    return this.rawData.banner ?? null;
  }

  /**
   * Gets the array of role IDs assigned to this member.
   *
   * @returns Array of role snowflake IDs
   */
  get roles(): Snowflake[] {
    return this.rawData.roles;
  }

  /**
   * Gets the ISO8601 timestamp when the member joined the guild.
   *
   * @returns The join date timestamp string
   */
  get joinedAt(): string {
    return this.rawData.joined_at;
  }

  /**
   * Gets the ISO8601 timestamp when the member started boosting the guild.
   *
   * @returns The boost start timestamp, or null if not boosting
   */
  get premiumSince(): string | null {
    return this.rawData.premium_since ?? null;
  }

  /**
   * Checks if the member is deafened in voice channels.
   *
   * @returns True if the member is deafened, false otherwise
   */
  get deaf(): boolean {
    return this.rawData.deaf;
  }

  /**
   * Checks if the member is muted in voice channels.
   *
   * @returns True if the member is muted, false otherwise
   */
  get mute(): boolean {
    return this.rawData.mute;
  }

  /**
   * Gets the member flags bitfield.
   *
   * @returns The member flags as a number
   */
  get flags(): number {
    return this.rawData.flags;
  }

  /**
   * Checks if the member is pending membership screening.
   *
   * @returns True if the member hasn't passed membership screening, false otherwise
   */
  get pending(): boolean {
    return Boolean(this.rawData.pending);
  }

  /**
   * Gets the total permissions of the member in the guild, including all role permissions.
   *
   * @returns The permissions string, or undefined if not available
   */
  get permissions(): string | undefined {
    return this.rawData.permissions;
  }

  /**
   * Gets the ISO8601 timestamp when the member's timeout will expire.
   *
   * @returns The timeout expiry timestamp, or null if not timed out
   */
  get communicationDisabledUntil(): string | null {
    return this.rawData.communication_disabled_until ?? null;
  }

  /**
   * Gets the member's avatar decoration data.
   *
   * @returns The avatar decoration data, or null if not set
   */
  get avatarDecorationData(): AvatarDecorationDataEntity | null | undefined {
    return this.rawData.avatar_decoration_data;
  }

  /**
   * Gets the Date object representing when this member joined the guild.
   *
   * @returns The join Date
   */
  get joinedAtDate(): Date {
    return new Date(this.joinedAt);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this member joined the guild.
   *
   * @returns The join timestamp in milliseconds
   */
  get joinedTimestamp(): number {
    return this.joinedAtDate.getTime();
  }

  /**
   * Gets the Date object representing when this member started boosting the guild.
   *
   * @returns The boost start Date, or null if not boosting
   */
  get premiumSinceDate(): Date | null {
    return this.premiumSince ? new Date(this.premiumSince) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this member started boosting.
   *
   * @returns The boost start timestamp in milliseconds, or null if not boosting
   */
  get premiumTimestamp(): number | null {
    return this.premiumSinceDate?.getTime() ?? null;
  }

  /**
   * Checks if this member is timing out or communication disabled.
   *
   * @returns True if the member is currently timed out, false otherwise
   */
  get isCommunicationDisabled(): boolean {
    if (!this.communicationDisabledUntil) {
      return false;
    }
    return new Date(this.communicationDisabledUntil).getTime() > Date.now();
  }

  /**
   * Gets the Date object representing when this member's timeout will expire.
   *
   * @returns The timeout expiry Date, or null if not timed out
   */
  get communicationDisabledUntilDate(): Date | null {
    return this.communicationDisabledUntil
      ? new Date(this.communicationDisabledUntil)
      : null;
  }

  /**
   * Gets the member's display name in the guild, prioritizing nickname over username.
   *
   * @returns The nickname if set, otherwise the user's display name
   */
  get displayName(): string {
    return this.nick ?? this.user.displayName;
  }

  /**
   * Calculates the member's guild membership duration in days.
   *
   * @returns The number of days since the member joined the guild
   */
  get membershipDuration(): number {
    return Math.floor(
      (Date.now() - this.joinedTimestamp) / (1000 * 60 * 60 * 24),
    );
  }

  /**
   * Gets the URL for the member's guild-specific avatar with specified options.
   *
   * @param options - Options for the avatar image (size, format, etc.)
   * @returns The URL for the member's guild avatar, or null if using global avatar
   */
  getAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string | null {
    if (!this.avatar) {
      return null;
    }
    return Cdn.guildMemberAvatar(
      this.guildId,
      this.user.id,
      this.avatar,
      options,
    );
  }

  /**
   * Gets the display avatar URL, either guild-specific or global user avatar.
   *
   * @param options - Options for the avatar image (size, format, etc.)
   * @returns The URL for the member's display avatar
   */
  getDisplayAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    return this.getAvatarUrl(options) ?? this.user.getDisplayAvatarUrl(options);
  }

  /**
   * Gets the URL for the member's guild-specific banner with specified options.
   *
   * @param options - Options for the banner image (size, format, etc.)
   * @returns The URL for the member's guild banner, or null if not set
   */
  getBannerUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string | null {
    if (!this.banner) {
      return null;
    }
    return Cdn.guildMemberBanner(
      this.guildId,
      this.user.id,
      this.banner,
      options,
    );
  }

  /**
   * Gets the guild this member belongs to.
   *
   * @returns A promise resolving to the Guild instance
   */
  async getGuild(): Promise<Guild> {
    if (this.#guild) {
      return this.#guild;
    }

    const guildEntity = await this.client.rest.guilds.fetchGuild(this.guildId);
    this.#guild = new Guild(this.client, guildEntity as GuildCreateEntity);
    return this.#guild;
  }

  /**
   * Adds a role to this guild member.
   *
   * @param roleId - The ID of the role to add
   * @param reason - Reason for adding the role (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async addRole(roleId: Snowflake, reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.addRoleToMember(
        this.guildId,
        this.user.id,
        roleId,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes a role from this guild member.
   *
   * @param roleId - The ID of the role to remove
   * @param reason - Reason for removing the role (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async removeRole(roleId: Snowflake, reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.removeRoleFromMember(
        this.guildId,
        this.user.id,
        roleId,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates this guild member's attributes.
   *
   * @param options - New attributes for the guild member
   * @param reason - Reason for the update (for audit logs)
   * @returns A promise resolving to the updated GuildMember instance
   */
  async update(
    options: GuildMemberUpdateOptions,
    reason?: string,
  ): Promise<GuildMember> {
    const updatedMember = await this.client.rest.guilds.updateGuildMember(
      this.guildId,
      this.user.id,
      options,
      reason,
    );

    this.patch({ ...updatedMember, guild_id: this.guildId });
    return this;
  }

  /**
   * Sets the member's nickname.
   *
   * @param nickname - The new nickname, or null to remove
   * @param reason - Reason for changing the nickname (for audit logs)
   * @returns A promise resolving to the updated GuildMember instance
   */
  setNickname(nickname: string | null, reason?: string): Promise<GuildMember> {
    return this.update({ nick: nickname }, reason);
  }

  /**
   * Times out the member for a specified duration.
   *
   * @param duration - The timeout duration in milliseconds, or null to remove timeout
   * @param reason - Reason for the timeout (for audit logs)
   * @returns A promise resolving to the updated GuildMember instance
   */
  timeout(duration: number | null, reason?: string): Promise<GuildMember> {
    const communicationDisabledUntil = duration
      ? new Date(Date.now() + duration).toISOString()
      : undefined;

    return this.update(
      { communication_disabled_until: communicationDisabledUntil },
      reason,
    );
  }

  /**
   * Removes the member from the guild (kick).
   *
   * @param reason - Reason for kicking the member (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async kick(reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.removeGuildMember(
        this.guildId,
        this.user.id,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Bans the member from the guild.
   *
   * @param options - Ban options including message deletion duration
   * @param reason - Reason for the ban (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async ban(options: GuildBanCreateOptions, reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.createGuildBan(
        this.guildId,
        this.user.id,
        options,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if this member has a specific role.
   *
   * @param roleId - The ID of the role to check
   * @returns True if the member has the role, false otherwise
   */
  hasRole(roleId: Snowflake): boolean {
    return this.roles.includes(roleId);
  }

  /**
   * Checks if this member is the owner of the guild.
   *
   * @returns A promise resolving to true if the member is the owner
   */
  async isOwner(): Promise<boolean> {
    const guild = await this.getGuild();
    return this.user.id === guild.ownerId;
  }

  /**
   * Refreshes this member's data from the API.
   *
   * @returns A promise resolving to the updated GuildMember instance
   */
  async refresh(): Promise<GuildMember> {
    const memberData = await this.client.rest.guilds.fetchGuildMember(
      this.guildId,
      this.user.id,
    );

    this.patch({ ...memberData, guild_id: this.guildId });
    return this;
  }
}

/**
 * Represents a Discord guild (server), providing comprehensive functionality for managing
 * guild settings, members, channels, roles, and other guild-related resources.
 *
 * The Guild class serves as a complete wrapper around Discord's guild API, offering:
 * - Access to guild information (name, icon, features, settings)
 * - Methods to manage guild members, roles, and channels
 * - Functionality for moderation, invites, and integrations
 * - Support for guild widgets, welcome screens, and onboarding
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild}
 */
@Cacheable("guilds")
export class Guild
  extends BaseClass<GuildEntity | GuildCreateEntity>
  implements Enforce<PropsToCamel<GuildEntity & GuildCreateEntity>>
{
  /**
   * BitField for system channel flags
   * @private
   */
  #systemChannelFlags: BitField<SystemChannelFlags> | null = null;

  /**
   * Gets the guild's unique identifier (Snowflake).
   *
   * @returns The guild's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the guild's name.
   *
   * @returns The name of the guild
   */
  get name(): string {
    return this.rawData.name;
  }

  /**
   * Gets the guild's icon hash.
   *
   * @returns The icon hash, or null if no icon is set
   */
  get icon(): string | null {
    return this.rawData.icon;
  }

  /**
   * Gets the guild's icon hash from the template object.
   *
   * @returns The icon hash, or null if not available or not set
   */
  get iconHash(): string | null | undefined {
    return this.rawData.icon_hash;
  }

  /**
   * Gets the guild's invite splash background hash.
   *
   * @returns The splash hash, or null if not set
   */
  get splash(): string | null {
    return this.rawData.splash;
  }

  /**
   * Gets the guild's discovery splash hash.
   *
   * @returns The discovery splash hash, or null if not set
   */
  get discoverySplash(): string | null {
    return this.rawData.discovery_splash;
  }

  /**
   * Checks if the current user is the owner of the guild.
   *
   * @returns True if the current user is the owner, undefined if unknown
   */
  get owner(): boolean | undefined {
    return this.rawData.owner;
  }

  /**
   * Gets the ID of the guild owner.
   *
   * @returns The owner's ID as a Snowflake string
   */
  get ownerId(): Snowflake {
    return this.rawData.owner_id;
  }

  /**
   * Gets the permissions of the current user in the guild.
   *
   * @returns The permissions string, or undefined if not available
   */
  get permissions(): string | undefined {
    return this.rawData.permissions;
  }

  /**
   * Gets the guild's voice region ID (deprecated).
   *
   * @returns The region ID, or null if not set
   */
  get region(): string | null | undefined {
    return this.rawData.region;
  }

  /**
   * Gets the ID of the AFK channel.
   *
   * @returns The AFK channel ID, or null if not set
   */
  get afkChannelId(): Snowflake | null {
    return this.rawData.afk_channel_id;
  }

  /**
   * Gets the AFK timeout in seconds.
   *
   * @returns The AFK timeout in seconds
   */
  get afkTimeout(): 60 | 300 | 900 | 1800 | 3600 {
    return this.rawData.afk_timeout;
  }

  /**
   * Checks if the guild widget is enabled.
   *
   * @returns True if enabled, undefined if unknown
   */
  get widgetEnabled(): boolean | undefined {
    return this.rawData.widget_enabled;
  }

  /**
   * Gets the ID of the channel where widget generates invites.
   *
   * @returns The widget channel ID, or null if not set
   */
  get widgetChannelId(): Snowflake | null | undefined {
    return this.rawData.widget_channel_id;
  }

  /**
   * Gets the verification level required for the guild.
   *
   * @returns The verification level
   */
  get verificationLevel(): VerificationLevel {
    return this.rawData.verification_level;
  }

  /**
   * Gets the default message notification level.
   *
   * @returns The default message notification level
   */
  get defaultMessageNotifications(): DefaultMessageNotificationLevel {
    return this.rawData.default_message_notifications;
  }

  /**
   * Gets the explicit content filter level.
   *
   * @returns The explicit content filter level
   */
  get explicitContentFilter(): ExplicitContentFilterLevel {
    return this.rawData.explicit_content_filter;
  }

  /**
   * Gets the array of roles in the guild.
   *
   * @returns Array of role objects
   */
  get roles(): Role[] {
    return this.rawData.roles.map(
      (role) =>
        new Role(this.client, {
          ...role,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Gets the array of custom emojis in the guild.
   *
   * @returns Array of emoji objects
   */
  get emojis(): Emoji[] {
    return this.rawData.emojis.map(
      (emoji) =>
        new Emoji(this.client, {
          ...emoji,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Gets the array of enabled features in the guild.
   *
   * @returns Array of guild feature strings
   */
  get features(): GuildFeature[] {
    return this.rawData.features;
  }

  /**
   * Gets the required MFA level for the guild.
   *
   * @returns The MFA level
   */
  get mfaLevel(): MfaLevel {
    return this.rawData.mfa_level;
  }

  /**
   * Gets the application ID of the guild creator, if bot-created.
   *
   * @returns The application ID, or null if not bot-created
   */
  get applicationId(): Snowflake | null {
    return this.rawData.application_id;
  }

  /**
   * Gets the ID of the system channel.
   *
   * @returns The system channel ID, or null if not set
   */
  get systemChannelId(): Snowflake | null {
    return this.rawData.system_channel_id;
  }

  /**
   * Gets the system channel flags as a BitField.
   *
   * @returns A BitField of system channel flags
   */
  get systemChannelFlags(): BitField<SystemChannelFlags> {
    if (!this.#systemChannelFlags) {
      this.#systemChannelFlags = new BitField<SystemChannelFlags>(
        this.rawData.system_channel_flags,
      );
    }
    return this.#systemChannelFlags;
  }

  /**
   * Gets the ID of the rules channel.
   *
   * @returns The rules channel ID, or null if not set
   */
  get rulesChannelId(): Snowflake | null {
    return this.rawData.rules_channel_id;
  }

  /**
   * Gets the maximum number of presences for the guild.
   *
   * @returns The max presences, or null if not limited
   */
  get maxPresences(): number | null | undefined {
    return this.rawData.max_presences;
  }

  /**
   * Gets the maximum number of members for the guild.
   *
   * @returns The max members
   */
  get maxMembers(): number {
    return this.rawData.max_members;
  }

  /**
   * Gets the vanity URL code for the guild.
   *
   * @returns The vanity URL code, or null if not set
   */
  get vanityUrlCode(): string | null {
    return this.rawData.vanity_url_code;
  }

  /**
   * Gets the description of the guild.
   *
   * @returns The description, or null if not set
   */
  get description(): string | null {
    return this.rawData.description;
  }

  /**
   * Gets the guild's banner hash.
   *
   * @returns The banner hash, or null if not set
   */
  get banner(): string | null {
    return this.rawData.banner;
  }

  /**
   * Gets the premium tier (Server Boost level) of the guild.
   *
   * @returns The premium tier
   */
  get premiumTier(): PremiumTier {
    return this.rawData.premium_tier;
  }

  /**
   * Gets the number of boosts the guild currently has.
   *
   * @returns The number of boosts, or undefined if unknown
   */
  get premiumSubscriptionCount(): number | undefined {
    return this.rawData.premium_subscription_count;
  }

  /**
   * Gets the preferred locale of the guild.
   *
   * @returns The preferred locale
   */
  get preferredLocale(): Locale {
    return this.rawData.preferred_locale;
  }

  /**
   * Gets the ID of the public updates channel.
   *
   * @returns The public updates channel ID, or null if not set
   */
  get publicUpdatesChannelId(): Snowflake | null {
    return this.rawData.public_updates_channel_id;
  }

  /**
   * Gets the maximum number of users in a video channel.
   *
   * @returns The max video channel users, or undefined if unknown
   */
  get maxVideoChannelUsers(): number | undefined {
    return this.rawData.max_video_channel_users;
  }

  /**
   * Gets the maximum number of users in a stage video channel.
   *
   * @returns The max stage video channel users, or undefined if unknown
   */
  get maxStageVideoChannelUsers(): number | undefined {
    return this.rawData.max_stage_video_channel_users;
  }

  /**
   * Gets the approximate number of members in the guild.
   *
   * @returns The approximate member count, or undefined if unknown
   */
  get approximateMemberCount(): number | undefined {
    return this.rawData.approximate_member_count;
  }

  /**
   * Gets the approximate number of online members in the guild.
   *
   * @returns The approximate presence count, or undefined if unknown
   */
  get approximatePresenceCount(): number | undefined {
    return this.rawData.approximate_presence_count;
  }

  /**
   * Gets the welcome screen settings for the guild.
   *
   * @returns The welcome screen object, or undefined if not set
   */
  get welcomeScreen(): WelcomeScreenEntity | undefined {
    return this.rawData.welcome_screen;
  }

  /**
   * Gets the NSFW level of the guild.
   *
   * @returns The NSFW level
   */
  get nsfwLevel(): NsfwLevel {
    return this.rawData.nsfw_level;
  }

  /**
   * Gets the array of custom stickers in the guild.
   *
   * @returns Array of sticker objects, or undefined if unknown
   */
  get stickers(): Sticker[] | undefined {
    return this.rawData.stickers?.map(
      (sticker) =>
        new Sticker(this.client, {
          ...sticker,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Checks if the boost progress bar is enabled.
   *
   * @returns True if enabled, false otherwise
   */
  get premiumProgressBarEnabled(): boolean {
    return this.rawData.premium_progress_bar_enabled;
  }

  /**
   * Gets the ID of the safety alerts channel.
   *
   * @returns The safety alerts channel ID, or null if not set
   */
  get safetyAlertsChannelId(): Snowflake | null {
    return this.rawData.safety_alerts_channel_id;
  }

  /**
   * Gets the incidents data for the guild.
   *
   * @returns The incidents data object, or undefined if not available
   */
  get incidentsData(): IncidentsDataEntity | null | undefined {
    return this.rawData.incidents_data;
  }

  /**
   * Gets the array of voice states for members currently in voice channels.
   * These objects lack the guild_id key since it's redundant in this context.
   *
   * @returns Array of voice state objects, or undefined if not available
   */
  get voiceStates(): VoiceState[] | undefined {
    return (this.rawData as GuildCreateEntity).voice_states?.map(
      (state) => new VoiceState(this.client, state as VoiceStateEntity),
    );
  }

  /**
   * Gets the array of guild member objects for members in the guild.
   * For large guilds, this may not contain all members due to bandwidth constraints.
   *
   * @returns Array of guild member objects, or undefined if not available
   */
  get members(): GuildMember[] | undefined {
    return (this.rawData as GuildCreateEntity).members?.map(
      (member) =>
        new GuildMember(this.client, {
          ...member,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Gets the array of channel objects for all channels in the guild.
   * Provides initial state of the guild's channel structure.
   *
   * @returns Array of channel objects, or undefined if not available
   */
  get channels(): AnyChannel[] | undefined {
    return (this.rawData as GuildCreateEntity).channels?.map((channel) =>
      channelFactory(this.client, channel),
    );
  }

  /**
   * Gets the array of thread channel objects for all active threads in the guild.
   * Supplies initial state of accessible threads without additional API calls.
   *
   * @returns Array of thread channel objects, or undefined if not available
   */
  get threads(): AnyThreadChannel[] | undefined {
    return (this.rawData as GuildCreateEntity).threads?.map(
      (thread) => channelFactory(this.client, thread) as AnyThreadChannel,
    );
  }

  /**
   * Gets the array of partial presence updates for members in the guild.
   * Requires the GUILD_PRESENCES intent to receive meaningful data.
   *
   * @returns Array of presence objects, or undefined if not available
   */
  get presences(): Partial<PresenceEntity>[] | undefined {
    return (this.rawData as GuildCreateEntity).presences;
  }

  /**
   * Gets the array of stage instance objects for active stages in the guild.
   * Provides initial state of current stage channels without additional API calls.
   *
   * @returns Array of stage instance objects, or undefined if not available
   */
  get stageInstances(): StageInstance[] | undefined {
    return (this.rawData as GuildCreateEntity).stage_instances?.map(
      (stageInstance) => new StageInstance(this.client, stageInstance),
    );
  }

  /**
   * Gets the array of scheduled event objects for upcoming events in the guild.
   * Provides initial state of scheduled events without additional API calls.
   *
   * @returns Array of scheduled event objects, or undefined if not available
   */
  get guildScheduledEvents(): ScheduledEvent[] | undefined {
    return (this.rawData as GuildCreateEntity).guild_scheduled_events?.map(
      (event) => new ScheduledEvent(this.client, event),
    );
  }

  /**
   * Gets the array of soundboard sound objects available in the guild.
   * Provides initial state of available soundboard sounds.
   *
   * @returns Array of soundboard sound objects, or undefined if not available
   */
  get soundboardSounds(): SoundboardSound[] | undefined {
    return (this.rawData as GuildCreateEntity).soundboard_sounds?.map(
      (sound) => new SoundboardSound(this.client, sound),
    );
  }

  /**
   * Gets the ISO8601 timestamp of when the current user joined the guild.
   *
   * @returns The joined at timestamp, or undefined if not available
   */
  get joinedAt(): string | undefined {
    return (this.rawData as GuildCreateEntity).joined_at;
  }

  /**
   * Checks if the guild is considered "large".
   *
   * @returns True if the guild is large, undefined if unknown
   */
  get large(): boolean | undefined {
    return (this.rawData as GuildCreateEntity).large;
  }

  /**
   * Checks if the guild is unavailable due to an outage.
   *
   * @returns True if unavailable, undefined if not
   */
  get unavailable(): boolean | undefined {
    return (this.rawData as GuildCreateEntity).unavailable;
  }

  /**
   * Gets the total number of members in the guild.
   *
   * @returns The member count, or undefined if unknown
   */
  get memberCount(): number | undefined {
    return (this.rawData as GuildCreateEntity).member_count;
  }

  /**
   * Gets the Date object representing when the current user joined this guild.
   *
   * @returns The join Date, or null if not available
   */
  get joinedAtDate(): Date | null {
    return this.joinedAt ? new Date(this.joinedAt) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when the current user joined this guild.
   *
   * @returns The join timestamp in milliseconds, or null if not available
   */
  get joinedTimestamp(): number | null {
    return this.joinedAtDate?.getTime() ?? null;
  }

  /**
   * Gets the Date object representing when this guild was created.
   *
   * @returns The Date when this guild was created
   */
  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this guild was created.
   *
   * @returns The creation timestamp in milliseconds
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Gets the full vanity URL for the guild.
   *
   * @returns The vanity URL, or null if not set
   */
  get vanityUrl(): string | null {
    return this.vanityUrlCode
      ? `https://discord.gg/${this.vanityUrlCode}`
      : null;
  }

  /**
   * Gets the guild age in days.
   *
   * @returns The number of days since the guild was created
   */
  get age(): number {
    return Math.floor(
      (Date.now() - this.createdTimestamp) / (1000 * 60 * 60 * 24),
    );
  }

  /**
   * Checks if this guild is community-enabled.
   *
   * @returns True if the guild has the Community feature, false otherwise
   */
  get isCommunity(): boolean {
    return this.hasFeature(GuildFeature.Community);
  }

  /**
   * Checks if this guild is discoverable.
   *
   * @returns True if the guild has the Discoverable feature, false otherwise
   */
  get isDiscoverable(): boolean {
    return this.hasFeature(GuildFeature.Discoverable);
  }

  /**
   * Checks if this guild is partnered.
   *
   * @returns True if the guild has the Partnered feature, false otherwise
   */
  get isPartnered(): boolean {
    return this.hasFeature(GuildFeature.Partnered);
  }

  /**
   * Checks if this guild is verified.
   *
   * @returns True if the guild has the Verified feature, false otherwise
   */
  get isVerified(): boolean {
    return this.hasFeature(GuildFeature.Verified);
  }

  /**
   * Checks if this guild has the welcome screen enabled.
   *
   * @returns True if the guild has the WelcomeScreenEnabled feature, false otherwise
   */
  get hasWelcomeScreen(): boolean {
    return this.hasFeature(GuildFeature.WelcomeScreenEnabled);
  }

  /**
   * Checks if the guild has a specific feature enabled.
   *
   * @param feature - The feature to check
   * @returns True if the feature is enabled, false otherwise
   */
  hasFeature(feature: GuildFeature): boolean {
    return this.features.includes(feature);
  }

  /**
   * Checks if the guild has an icon.
   *
   * @returns True if the guild has an icon, false otherwise
   */
  hasIcon(): boolean {
    return this.icon !== null;
  }

  /**
   * Checks if the guild has a banner.
   *
   * @returns True if the guild has a banner, false otherwise
   */
  hasBanner(): boolean {
    return this.banner !== null;
  }

  /**
   * Checks if the guild has a vanity URL.
   *
   * @returns True if the guild has a vanity URL, false otherwise
   */
  hasVanityUrl(): boolean {
    return this.vanityUrlCode !== null;
  }

  /**
   * Gets the URL for the guild's icon with specified options.
   *
   * @param options - Options for the icon image (size, format, etc.)
   * @returns The URL for the guild's icon, or null if not set
   */
  getIconUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string | null {
    return this.icon ? Cdn.guildIcon(this.id, this.icon, options) : null;
  }

  /**
   * Gets the URL for the guild's splash image with specified options.
   *
   * @param options - Options for the splash image (size, format, etc.)
   * @returns The URL for the guild's splash, or null if not set
   */
  getSplashUrl(options: z.input<typeof ImageOptions> = {}): string | null {
    return this.splash ? Cdn.guildSplash(this.id, this.splash, options) : null;
  }

  /**
   * Gets the URL for the guild's discovery splash image with specified options.
   *
   * @param options - Options for the discovery splash image (size, format, etc.)
   * @returns The URL for the guild's discovery splash, or null if not set
   */
  getDiscoverySplashUrl(
    options: z.input<typeof ImageOptions> = {},
  ): string | null {
    return this.discoverySplash
      ? Cdn.guildDiscoverySplash(this.id, this.discoverySplash, options)
      : null;
  }

  /**
   * Gets the URL for the guild's banner image with specified options.
   *
   * @param options - Options for the banner image (size, format, etc.)
   * @returns The URL for the guild's banner, or null if not set
   */
  getBannerUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string | null {
    return this.banner ? Cdn.guildBanner(this.id, this.banner, options) : null;
  }

  /**
   * Gets the guild's widget image URL.
   *
   * @param style - Style of the widget image
   * @returns The URL for the guild's widget image
   */
  getWidgetImageUrl(style: WidgetStyle = "shield"): string {
    return `https://discord.com/api/guilds/${this.id}/widget.png?style=${style}`;
  }

  /**
   * Fetches a guild member by their ID.
   *
   * @param memberId - The ID of the member to fetch
   * @returns A promise resolving to the GuildMember instance
   */
  async fetchMember(memberId: Snowflake): Promise<GuildMember> {
    const memberData = await this.client.rest.guilds.fetchGuildMember(
      this.id,
      memberId,
    );

    return new GuildMember(this.client, {
      ...memberData,
      guild_id: this.id,
    });
  }

  /**
   * Fetches multiple guild members.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of GuildMember instances
   */
  async fetchMembers(query: GuildMembersFetchParams): Promise<GuildMember[]> {
    const members = await this.client.rest.guilds.fetchGuildMembers(
      this.id,
      query,
    );

    return members.map(
      (member) =>
        new GuildMember(this.client, {
          ...member,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Searches for guild members whose username or nickname starts with the provided string.
   *
   * @param query - Search parameters including the query string
   * @returns A promise resolving to an array of GuildMember instances
   */
  async searchMembers(query: GuildMembersSearchParams): Promise<GuildMember[]> {
    const members = await this.client.rest.guilds.searchGuildMembers(
      this.id,
      query,
    );

    return members.map(
      (member) =>
        new GuildMember(this.client, {
          ...member,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Adds a member to the guild using an OAuth2 access token.
   *
   * @param userId - The ID of the user to add
   * @param options - Configuration including OAuth2 access token and initial settings
   * @returns A promise resolving to the GuildMember instance
   */
  async addMember(
    userId: Snowflake,
    options: GuildMemberAddOptions,
  ): Promise<GuildMember> {
    const memberData = await this.client.rest.guilds.addGuildMember(
      this.id,
      userId,
      options,
    );

    return new GuildMember(this.client, {
      ...memberData,
      guild_id: this.id,
    });
  }

  /**
   * Fetches the guild's channels.
   *
   * @returns A promise resolving to an array of Channel instances
   */
  async fetchChannels(): Promise<AnyChannel[]> {
    const channels = await this.client.rest.guilds.fetchChannels(this.id);
    return channels.map((channel) => channelFactory(this.client, channel));
  }

  /**
   * Creates a new channel in the guild.
   *
   * @param options - Configuration for the new channel
   * @param reason - Reason for creating the channel (for audit logs)
   * @returns A promise resolving to the created Channel instance
   */
  async createChannel(
    options: AnyChannelEntity,
    reason?: string,
  ): Promise<AnyChannel> {
    const channel = await this.client.rest.guilds.createGuildChannel(
      this.id,
      options,
      reason,
    );
    return channelFactory(this.client, channel);
  }

  /**
   * Updates the positions of multiple channels.
   *
   * @param options - Array of position modifications
   * @returns A promise resolving to true if successful
   */
  async updateChannelPositions(
    options: ChannelPositionsUpdateOptions,
  ): Promise<boolean> {
    try {
      await this.client.rest.guilds.updateGuildChannelPositions(
        this.id,
        options,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetches all active threads in the guild.
   *
   * @returns A promise resolving to an object containing arrays of threads and thread members
   */
  // async fetchActiveThreads(): Promise<{
  //   threads: AnyThreadChannel[];
  //   members: ThreadMember[];
  // }> {
  //   const response = await this.client.rest.guilds.fetchActiveGuildThreads(
  //     this.id,
  //   );
  //
  //   const threads = response[0].threads.map(
  //     (thread) => new ThreadChannel(this.client, thread),
  //   );
  //
  //   return {
  //     threads,
  //     members: response[0].members,
  //   };
  // }

  /**
   * Fetches a list of bans for the guild.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of ban objects
   */
  async fetchBans(query?: GuildBansFetchParams): Promise<BanEntity[]> {
    return this.client.rest.guilds.fetchGuildBans(this.id, query);
  }

  /**
   * Fetches information about a ban for a user.
   *
   * @param userId - The ID of the banned user
   * @returns A promise resolving to the ban object
   */
  async fetchBan(userId: Snowflake): Promise<BanEntity> {
    return this.client.rest.guilds.fetchGuildBan(this.id, userId);
  }

  /**
   * Bans a user from the guild.
   *
   * @param userId - The ID of the user to ban
   * @param options - Ban options including message deletion duration
   * @param reason - Reason for the ban (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async banMember(
    userId: Snowflake,
    options: GuildBanCreateOptions = {},
    reason?: string,
  ): Promise<boolean> {
    try {
      await this.client.rest.guilds.createGuildBan(
        this.id,
        userId,
        options,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes a ban for a user.
   *
   * @param userId - The ID of the banned user
   * @param reason - Reason for removing the ban (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async unbanMember(userId: Snowflake, reason?: string): Promise<boolean> {
    try {
      await this.client.rest.guilds.removeGuildBan(this.id, userId, reason);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Bans multiple users from the guild at once.
   *
   * @param options - Bulk ban options including user IDs and message deletion duration
   * @param reason - Reason for the bans (for audit logs)
   * @returns A promise resolving to an object with lists of successfully banned and failed user IDs
   */
  banMembers(
    options: GuildBansBulkOptions,
    reason?: string,
  ): Promise<GuildBansBulkResponse> {
    return this.client.rest.guilds.banUsers(this.id, options, reason);
  }

  /**
   * Fetches a list of all roles in the guild.
   *
   * @returns A promise resolving to an array of Role instances
   */
  async fetchRoles(): Promise<Role[]> {
    const roles = await this.client.rest.guilds.fetchGuildRoles(this.id);
    return roles.map(
      (role) =>
        new Role(this.client, {
          ...role,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Creates a new role for the guild.
   *
   * @param options - Configuration for the new role
   * @param reason - Reason for creating the role (for audit logs)
   * @returns A promise resolving to the created Role instance
   */
  async createRole(
    options: GuildRoleCreateOptions,
    reason?: string,
  ): Promise<Role> {
    const role = await this.client.rest.guilds.createGuildRole(
      this.id,
      options,
      reason,
    );
    return new Role(this.client, {
      ...role,
      guild_id: this.id,
    });
  }

  /**
   * Updates the positions of multiple roles.
   *
   * @param options - Array of position modifications
   * @returns A promise resolving to an array of updated Role instances
   */
  async updateRolePositions(
    options: RolePositionsUpdateOptions,
  ): Promise<Role[]> {
    const roles = await this.client.rest.guilds.updateGuildRolePositions(
      this.id,
      options,
    );
    return roles.map(
      (role) =>
        new Role(this.client, {
          ...role,
          guild_id: this.id,
        }),
    );
  }

  /**
   * Updates guild settings.
   *
   * @param options - New properties for the guild
   * @param reason - Reason for the update (for audit logs)
   * @returns A promise resolving to the updated Guild instance
   */
  async update(options: GuildUpdateOptions, reason?: string): Promise<Guild> {
    const guildData = await this.client.rest.guilds.updateGuild(
      this.id,
      options,
      reason,
    );

    this.patch(guildData);
    return this;
  }

  /**
   * Permanently deletes the guild.
   *
   * @returns A promise resolving to true if successful
   */
  async delete(): Promise<boolean> {
    try {
      await this.client.rest.guilds.deleteGuild(this.id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the number of members that would be removed in a prune operation.
   *
   * @param query - Query parameters including days of inactivity and roles to include
   * @returns A promise resolving to the number of members that would be pruned
   */
  async getPruneCount(query?: GetGuildPruneCountQuerySchema): Promise<number> {
    const response = await this.client.rest.guilds.fetchGuildPruneCount(
      this.id,
      query,
    );
    return response.pruned;
  }

  /**
   * Begins a prune operation to remove inactive members.
   *
   * @param options - Prune options including days of inactivity and roles to include
   * @param reason - Reason for the prune (for audit logs)
   * @returns A promise resolving to the number of members pruned, or null if compute_prune_count is false
   */
  async pruneMembers(
    options: GuildPruneOptions,
    reason?: string,
  ): Promise<number | null> {
    const response = await this.client.rest.guilds.pruneGuildMembers(
      this.id,
      options,
      reason,
    );
    return response.pruned;
  }

  /**
   * Fetches a list of voice regions for the guild.
   *
   * @returns A promise resolving to an array of voice region objects
   */
  async fetchVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.client.rest.guilds.fetchGuildVoiceRegions(this.id);
  }

  /**
   * Fetches a list of invites for the guild.
   *
   * @returns A promise resolving to an array of invite objects with metadata
   */
  async fetchInvites(): Promise<InviteWithMetadataEntity[]> {
    return this.client.rest.guilds.fetchGuildInvites(this.id);
  }

  /**
   * Fetches a list of integrations for the guild.
   *
   * @returns A promise resolving to an array of integration objects
   */
  async fetchIntegrations(): Promise<IntegrationEntity[]> {
    return this.client.rest.guilds.fetchGuildIntegrations(this.id);
  }

  /**
   * Deletes an integration from the guild.
   *
   * @param integrationId - The ID of the integration
   * @param reason - Reason for deleting the integration (for audit logs)
   * @returns A promise resolving to true if successful
   */
  async deleteIntegration(
    integrationId: Snowflake,
    reason?: string,
  ): Promise<boolean> {
    try {
      await this.client.rest.guilds.deleteGuildIntegration(
        this.id,
        integrationId,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetches the guild's widget settings.
   *
   * @returns A promise resolving to the guild widget settings object
   */
  async fetchWidgetSettings(): Promise<GuildWidgetSettingsEntity> {
    return this.client.rest.guilds.fetchGuildWidgetSettings(this.id);
  }

  /**
   * Updates the guild's widget settings.
   *
   * @param options - New widget settings
   * @param reason - Reason for modifying the widget (for audit logs)
   * @returns A promise resolving to the updated guild widget settings object
   */
  async updateWidget(
    options: GuildWidgetUpdateOptions,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.client.rest.guilds.updateGuildWidget(this.id, options, reason);
  }

  /**
   * Fetches the guild's widget.
   *
   * @returns A promise resolving to the guild widget object
   */
  async fetchWidget(): Promise<GuildWidgetEntity> {
    return this.client.rest.guilds.fetchGuildWidget(this.id);
  }

  /**
   * Fetches the guild's vanity URL.
   *
   * @returns A promise resolving to an object with the vanity URL code and usage count
   */
  async fetchVanityUrl(): Promise<
    Pick<InviteWithMetadataEntity, "code" | "uses">
  > {
    return this.client.rest.guilds.fetchGuildVanityUrl(this.id);
  }

  /**
   * Fetches the guild's welcome screen.
   *
   * @returns A promise resolving to the welcome screen object
   */
  async fetchWelcomeScreen(): Promise<WelcomeScreenEntity> {
    return this.client.rest.guilds.fetchGuildWelcomeScreen(this.id);
  }

  /**
   * Updates the guild's welcome screen.
   *
   * @param options - New properties for the welcome screen
   * @param reason - Reason for modifying the welcome screen (for audit logs)
   * @returns A promise resolving to the updated welcome screen object
   */
  async updateWelcomeScreen(
    options: GuildWelcomeScreenUpdateOptions,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.client.rest.guilds.updateGuildWelcomeScreen(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Fetches the guild's onboarding configuration.
   *
   * @returns A promise resolving to the guild onboarding object
   */
  async fetchOnboarding(): Promise<GuildOnboardingEntity> {
    return this.client.rest.guilds.fetchGuildOnboarding(this.id);
  }

  /**
   * Updates the onboarding configuration of the guild.
   *
   * @param options - New onboarding configuration
   * @param reason - Reason for modifying the onboarding (for audit logs)
   * @returns A promise resolving to the updated guild onboarding object
   */
  async updateOnboarding(
    options: GuildOnboardingUpdateOptions,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.client.rest.guilds.updateGuildOnboarding(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Refreshes this guild's data from the API.
   *
   * @param withCounts - Whether to include approximate member and presence counts
   * @returns A promise resolving to the updated Guild instance
   */
  async refresh(withCounts = false): Promise<Guild> {
    const guildData = await this.client.rest.guilds.fetchGuild(
      this.id,
      withCounts,
    );

    this.patch(guildData);
    return this;
  }

  /**
   * Formats the guild's system channel as a mention string.
   *
   * @returns The formatted channel mention, or a string indicating no system channel
   */
  formatSystemChannel(): FormattedChannel | string {
    return this.systemChannelId
      ? formatChannel(this.systemChannelId)
      : "No system channel";
  }

  /**
   * Retrieves a specific role by ID.
   *
   * @param roleId - The ID of the role to retrieve
   * @returns A promise resolving to the Role instance, or null if not found
   */
  async getRole(roleId: Snowflake): Promise<Role | null> {
    try {
      const role = await this.client.rest.guilds.fetchGuildRole(
        this.id,
        roleId,
      );
      return new Role(this.client, {
        ...role,
        guild_id: this.id,
      });
    } catch {
      return null;
    }
  }

  /**
   * Checks if a specific user is a member of this guild.
   *
   * @param userId - The ID of the user to check
   * @returns A promise resolving to true if the user is a member, false otherwise
   */
  async hasMember(userId: Snowflake): Promise<boolean> {
    try {
      await this.fetchMember(userId);
      return true;
    } catch {
      return false;
    }
  }
}
