import {
  type AnyChannelEntity,
  type ApplicationEntity,
  type GuildEntity,
  type GuildScheduledEventEntity,
  InviteTargetType,
  InviteType,
  type InviteWithMetadataEntity,
  type UserEntity,
} from "@nyxojs/core";
import type { InviteCreateEntity } from "@nyxojs/gateway";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import { Application } from "./application.class.js";
import { Guild } from "./guild.class.js";
import { ScheduledEvent } from "./scheduled-event.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Invite, providing methods to interact with and manage invites.
 *
 * The Invite class serves as a comprehensive wrapper around Discord's Invite API, offering:
 * - Access to invite information (code, creator, guild, channel, etc.)
 * - Methods to delete or retrieve detailed invite data
 * - Utilities for tracking invite usage and metadata
 * - Support for specialized invite types (voice channels, scheduled events, etc.)
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite}
 */
@Cacheable<InviteWithMetadataEntity & InviteCreateEntity>(
  "invites",
  (invite) => invite.code,
)
export class Invite
  extends BaseClass<InviteWithMetadataEntity | InviteCreateEntity>
  implements
    Enforce<PropsToCamel<InviteWithMetadataEntity & InviteCreateEntity>>
{
  /**
   * Gets the stage instance associated with this invite.
   *
   * This is only available if the invite is for a stage channel.
   *
   * @returns The stage instance data, or undefined if not applicable
   * @deprecated This field is deprecated according to Discord documentation
   * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-stage-instance}
   */
  readonly stageInstance =
    "stage_instance" in this.rawData ? this.rawData.stage_instance : undefined;

  /**
   * Gets the channel ID this invite is for.
   *
   * This is the ID of the channel where this invite was created.
   *
   * @returns The channel ID as a string, or undefined if not applicable
   * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-channel-id}
   */
  readonly channelId =
    "channel_id" in this.rawData ? this.rawData.channel_id : undefined;

  /**
   * Gets the guild ID this invite is for.
   *
   * This is the ID of the guild (server) where this invite was created.
   *
   * @returns The guild ID as a string, or undefined if not applicable
   * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-guild-id}
   */
  readonly guildId =
    "guild_id" in this.rawData ? this.rawData.guild_id : undefined;

  /**
   * Gets the type of this invite.
   *
   * Indicates what kind of destination this invite leads to (guild, group DM, etc.).
   *
   * @returns The invite type enum value
   * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
   */
  readonly type = "type" in this.rawData ? this.rawData.type : InviteType.Guild;

  /**
   * Gets the unique invite code for this invite.
   *
   * This is the code that appears in invite links (discord.gg/{code}).
   *
   * @returns The invite code as a string
   */
  readonly code = this.rawData.code;

  /**
   * Gets the guild this invite is for.
   *
   * Contains partial information about the server this invite leads to.
   *
   * @returns The Guild object, or undefined if this is a non-guild invite
   */
  readonly guild =
    "guild" in this.rawData
      ? new Guild(this.client, this.rawData.guild as GuildEntity)
      : undefined;

  /**
   * Gets the channel this invite is for.
   *
   * Contains information about the specific channel this invite leads to.
   *
   * @returns The Channel object, or null if the channel is no longer available
   */
  readonly channel =
    "channel" in this.rawData
      ? channelFactory(this.client, this.rawData.channel as AnyChannelEntity)
      : undefined;

  /**
   * Gets the user who created the invite.
   *
   * Contains information about the user who generated this invite.
   *
   * @returns The User object, or undefined if the creator is not available
   */
  readonly inviter = this.rawData.inviter
    ? new User(this.client, this.rawData.inviter as UserEntity)
    : undefined;

  /**
   * Gets the type of target for this voice channel invite.
   *
   * For voice channel invites, specifies if it's for a stream or embedded application.
   *
   * @returns The target type enum value, or undefined if not applicable
   * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
   */
  readonly targetType = this.rawData.target_type;

  /**
   * Gets the user whose stream to display for this voice channel stream invite.
   *
   * For stream invites, contains information about the user who is streaming.
   *
   * @returns The User object, or undefined if not applicable
   */
  readonly targetUser = this.rawData.target_user
    ? new User(this.client, this.rawData.target_user as UserEntity)
    : undefined;

  /**
   * Gets the embedded application for this invite.
   *
   * For embedded application invites, contains information about the application.
   *
   * @returns The Application object, or undefined if not applicable
   */
  readonly targetApplication = this.rawData.target_application
    ? new Application(
        this.client,
        this.rawData.target_application as ApplicationEntity,
      )
    : undefined;

  /**
   * Gets the approximate count of online members in the guild.
   *
   * @returns The online member count, or undefined if not available
   */
  readonly approximatePresenceCount =
    "approximate_presence_count" in this.rawData
      ? this.rawData.approximate_presence_count
      : undefined;

  /**
   * Gets the approximate total member count of the guild.
   *
   * @returns The total member count, or undefined if not available
   */
  readonly approximateMemberCount =
    "approximate_member_count" in this.rawData
      ? this.rawData.approximate_member_count
      : undefined;

  /**
   * Gets the expiration date of this invite.
   *
   * @returns The expiration date as a string, or null/undefined if not available
   */
  readonly expiresAt =
    "expires_at" in this.rawData ? this.rawData.expires_at : undefined;

  /**
   * Gets the guild scheduled event data for this invite.
   *
   * Only available if the invite is for a guild scheduled event.
   *
   * @returns The GuildScheduledEvent object, or undefined if not applicable
   */
  readonly guildScheduledEvent =
    "guild_scheduled_event" in this.rawData
      ? new ScheduledEvent(
          this.client,
          this.rawData.guild_scheduled_event as GuildScheduledEventEntity,
        )
      : undefined;

  /**
   * Gets the number of times this invite has been used.
   *
   * Only available if the invite includes metadata.
   *
   * @returns The usage count, or undefined if not available
   */
  readonly uses = "uses" in this.rawData ? this.rawData.uses : undefined;

  /**
   * Gets the maximum number of times this invite can be used.
   *
   * Only available if the invite includes metadata. 0 means unlimited uses.
   *
   * @returns The maximum usage limit, or undefined if not available
   */
  readonly maxUses =
    "max_uses" in this.rawData ? this.rawData.max_uses : undefined;

  /**
   * Gets the duration (in seconds) after which the invite expires.
   *
   * Only available if the invite includes metadata. 0 means the invite never expires.
   *
   * @returns The max age in seconds, or undefined if not available
   */
  readonly maxAge =
    "max_age" in this.rawData ? this.rawData.max_age : undefined;

  /**
   * Indicates whether this invite only grants temporary membership.
   *
   * Only available if the invite includes metadata. If true, users who join through
   * this invite will be removed when they disconnect unless given a role.
   *
   * @returns True if the invite grants temporary membership, undefined if not available
   */
  readonly temporary =
    "temporary" in this.rawData ? this.rawData.temporary : undefined;

  /**
   * Gets the timestamp when this invite was created.
   *
   * Only available if the invite includes metadata.
   *
   * @returns The creation timestamp as a string, or undefined if not available
   */
  readonly createdAt =
    "created_at" in this.rawData ? this.rawData.created_at : undefined;

  /**
   * Gets the Date object representing when this invite was created.
   *
   * Only available if the invite includes metadata.
   *
   * @returns A Date object, or undefined if creation timestamp is not available
   */
  get createdAtDate(): Date | undefined {
    return this.createdAt ? new Date(this.createdAt) : undefined;
  }

  /**
   * Gets the Date object representing when this invite expires.
   *
   * @returns A Date object, or null/undefined if expiration timestamp is not available
   */
  get expiresAtDate(): Date | null | undefined {
    return this.expiresAt ? new Date(this.expiresAt) : null;
  }

  /**
   * Gets the complete invite URL.
   *
   * @returns The full invite URL as a string
   */
  get url(): `https://discord.gg/${string}` {
    return `https://discord.gg/${this.code}`;
  }

  /**
   * Indicates whether this invite is for a stream.
   *
   * @returns True if this is a stream invite, false otherwise
   */
  get isStreamInvite(): boolean {
    return this.targetType === InviteTargetType.Stream;
  }

  /**
   * Indicates whether this invite is for an embedded application.
   *
   * @returns True if this is an embedded application invite, false otherwise
   */
  get isApplicationInvite(): boolean {
    return this.targetType === InviteTargetType.EmbeddedApplication;
  }

  /**
   * Indicates whether this invite has expired.
   *
   * This checks if the current time is past the expiration date.
   *
   * @returns True if the invite has expired, false if not or if expiration date is not available
   */
  get isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date(this.expiresAt) < new Date();
  }

  /**
   * Checks if this is a standard guild invite.
   *
   * @returns True if this is a guild invite, false otherwise
   */
  get isGuildInvite(): boolean {
    return this.type === InviteType.Guild;
  }

  /**
   * Checks if this is a group DM invite.
   *
   * @returns True if this is a group DM invite, false otherwise
   */
  get isGroupDmInvite(): boolean {
    return this.type === InviteType.GroupDm;
  }

  /**
   * Checks if this is a friend invite.
   *
   * @returns True if this is a friend invite, false otherwise
   */
  get isFriendInvite(): boolean {
    return this.type === InviteType.Friend;
  }

  /**
   * Deletes this invite.
   *
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the invite is deleted
   * @throws Error if the invite couldn't be deleted
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  async delete(reason?: string): Promise<void> {
    await this.client.rest.invites.deleteInvite(this.code, reason);
    this.uncache();
  }

  /**
   * Refreshes this invite's data from the API, including member counts.
   *
   * @param withCounts - Whether to include approximate member counts
   * @param withExpiration - Whether to include the expiration date
   * @returns A promise resolving to the updated Invite
   * @throws Error if the invite couldn't be fetched
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  async refresh(withCounts = true, withExpiration = true): Promise<Invite> {
    const inviteData = await this.client.rest.invites.fetchInvite(this.code, {
      with_counts: withCounts,
      with_expiration: withExpiration,
    });

    this.patch(inviteData);
    return this;
  }

  /**
   * Returns the time remaining until this invite expires.
   *
   * @returns The time in milliseconds until expiration, or Infinity if the invite doesn't expire
   */
  getTimeRemaining(): number {
    if (!this.expiresAt) {
      return Number.POSITIVE_INFINITY;
    }

    const expiresDate = new Date(this.expiresAt);
    const now = new Date();

    const remaining = expiresDate.getTime() - now.getTime();
    return Math.max(0, remaining);
  }

  /**
   * Gets the number of uses remaining for this invite.
   *
   * @returns The number of uses remaining, or Infinity if unlimited or not available
   */
  getUsesRemaining(): number {
    if (!this.maxUses) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.max(0, this.maxUses - (this.uses || 0));
  }

  /**
   * Returns a string representation of this invite.
   *
   * @returns The invite URL as a string
   */
  override toString(): string {
    return this.url;
  }
}
