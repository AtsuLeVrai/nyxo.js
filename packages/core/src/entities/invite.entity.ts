import type { ApplicationEntity } from "./application.entity.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Target types for voice channel invites.
 * Specifies what kind of target the voice channel invite is for.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetType {
  /**
   * Stream in a voice channel.
   * Invite to a specific user's stream within a voice channel.
   */
  Stream = 1,

  /**
   * Embedded application in a voice channel.
   * Invite to use an embedded application (Activity) within a voice channel.
   */
  EmbeddedApplication = 2,
}

/**
 * Types of invites that can be created.
 * Specifies the destination that the invite leads to.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export enum InviteType {
  /**
   * Normal guild invite.
   * Standard invite that adds a user to a server.
   */
  Guild = 0,

  /**
   * Group DM invite.
   * Invite that adds a user to a group direct message.
   */
  GroupDm = 1,

  /**
   * Friend invite.
   * Invite to add someone as a friend.
   */
  Friend = 2,
}

/**
 * Stage instance data for a stage channel invite.
 * Contains information about an ongoing Stage when creating an invite to a Stage channel.
 * @deprecated This object is deprecated according to Discord's documentation.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object}
 */
export interface InviteStageInstanceEntity {
  /**
   * The members speaking in the Stage.
   * Array of partial guild member objects for users who are speaking.
   */
  members: Partial<GuildMemberEntity>[];

  /**
   * The number of users in the Stage.
   * Total count of participants in the Stage.
   * @minimum 0
   */
  participant_count: number;

  /**
   * The number of users speaking in the Stage.
   * Count of users who have speaker status in the Stage.
   * @minimum 0
   */
  speaker_count: number;

  /**
   * The topic of the Stage instance.
   * Title or subject of the ongoing Stage.
   * @minLength 1
   * @maxLength 120
   */
  topic: string;
}

/**
 * Additional metadata about an invite.
 * Contains extra information about an invite such as usage statistics and expiration.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object}
 */
export interface InviteMetadataEntity {
  /**
   * Number of times this invite has been used.
   * Count of how many users have joined using this invite.
   * @minimum 0
   */
  uses: number;

  /**
   * Max number of times this invite can be used (0 = unlimited).
   * Maximum usage limit before the invite becomes invalid.
   * @minimum 0
   */
  max_uses: number;

  /**
   * Duration (in seconds) after which the invite expires (0 = never).
   * Time in seconds until this invite becomes invalid.
   * @minimum 0
   */
  max_age: number;

  /**
   * Whether this invite only grants temporary membership.
   * If true, users who join through this invite will be kicked when they disconnect unless given a role.
   */
  temporary: boolean;

  /**
   * When this invite was created.
   * ISO8601 timestamp when the invite was initially generated.
   * @format datetime
   */
  created_at: string;
}

/**
 * Discord invite object.
 * Represents a code that when used, adds a user to a guild or group DM channel.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object}
 */
export interface InviteEntity {
  /**
   * The type of invite.
   * Indicates what kind of destination this invite leads to (guild, group DM, etc.).
   */
  type: InviteType;

  /**
   * The unique invite code (unique ID).
   * The code that appears in invite links (discord.gg/{code}).
   */
  code: string;

  /**
   * The guild this invite is for.
   * Partial information about the server this invite leads to.
   */
  guild?: Partial<GuildEntity>;

  /**
   * The channel this invite is for.
   * Information about the specific channel this invite leads to.
   * Null in rare cases like Group DM invites that no longer exist.
   */
  channel: AnyChannelEntity | null;

  /**
   * The user who created the invite.
   * Information about the user who generated this invite.
   */
  inviter?: Partial<UserEntity>;

  /**
   * The type of target for this voice channel invite.
   * For voice channel invites, specifies if it's for a stream or embedded application.
   */
  target_type?: InviteTargetType;

  /**
   * The user whose stream to display for this voice channel stream invite.
   * For stream invites, contains information about the user who is streaming.
   */
  target_user?: Partial<UserEntity>;

  /**
   * The embedded application to open for this voice channel embedded application invite.
   * For embedded application invites, contains information about the application.
   */
  target_application?: Partial<ApplicationEntity>;

  /**
   * Approximate count of online members.
   * Returned from the GET /invites/{code} endpoint when with_counts is true.
   * @minimum 0
   */
  approximate_presence_count?: number;

  /**
   * Approximate count of total members.
   * Returned from the GET /invites/{code} endpoint when with_counts is true.
   * @minimum 0
   */
  approximate_member_count?: number;

  /**
   * The expiration date of this invite.
   * Returned from the GET /invites/{code} endpoint when with_expiration is true.
   * @format datetime
   * @nullable
   */
  expires_at?: string | null;

  /**
   * Stage instance data if there is a public Stage instance in the Stage channel.
   * Contains information about an ongoing Stage when this invite is for a Stage channel.
   * @deprecated This field is deprecated according to Discord documentation
   */
  stage_instance?: InviteStageInstanceEntity;

  /**
   * Guild scheduled event data.
   * Only included if guild_scheduled_event_id contains a valid guild scheduled event ID.
   * Contains information about an upcoming event associated with this invite.
   */
  guild_scheduled_event?: GuildScheduledEventEntity;
}

/**
 * Complete invite with metadata.
 * Combines the base invite data with additional metadata like usage statistics.
 * Usually returned when creating invites or when the user has sufficient permissions.
 */
export type InviteWithMetadataEntity = InviteEntity & InviteMetadataEntity;
