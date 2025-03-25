import type { ApplicationEntity } from "./application.entity.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the types of targets for voice channel invites.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/invite.md#invite-target-types}
 */
export enum InviteTargetType {
  /** Stream in a voice channel */
  Stream = 1,

  /** Embedded application in a voice channel */
  EmbeddedApplication = 2,
}

/**
 * Represents the different types of invites.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/invite.md#invite-types}
 */
export enum InviteType {
  /** Normal guild invite */
  Guild = 0,

  /** Group DM invite */
  GroupDm = 1,

  /** Friend invite */
  Friend = 2,
}

/**
 * Represents stage instance data for a stage channel invite.
 * @deprecated This object is deprecated according to Discord documentation.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/invite.md#invite-stage-instance-object}
 */
export interface InviteStageInstanceEntity {
  /** The members speaking in the Stage */
  members: Partial<GuildMemberEntity>[];

  /**
   * The number of users in the Stage
   * @minimum 0
   */
  participant_count: number;

  /**
   * The number of users speaking in the Stage
   * @minimum 0
   */
  speaker_count: number;

  /**
   * The topic of the Stage instance
   * @minLength 1
   * @maxLength 120
   */
  topic: string;
}

/**
 * Represents additional metadata about an invite.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/invite.md#invite-metadata-object}
 */
export interface InviteMetadataEntity {
  /**
   * Number of times this invite has been used
   * @minimum 0
   */
  uses: number;

  /**
   * Max number of times this invite can be used (0 = unlimited)
   * @minimum 0
   */
  max_uses: number;

  /**
   * Duration (in seconds) after which the invite expires (0 = never)
   * @minimum 0
   */
  max_age: number;

  /** Whether this invite only grants temporary membership */
  temporary: boolean;

  /**
   * When this invite was created
   * @format datetime
   */
  created_at: string;
}

/**
 * Represents a Discord invite that can be used to add a user to a guild or group DM channel.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/invite.md#invite-object}
 */
export interface InviteEntity {
  /** The type of invite */
  type: InviteType;

  /** The unique invite code (unique ID) */
  code: string;

  /** The guild this invite is for */
  guild?: Partial<GuildEntity>;

  /** The channel this invite is for */
  channel: AnyChannelEntity | null;

  /** The user who created the invite */
  inviter?: Partial<UserEntity>;

  /** The type of target for this voice channel invite */
  target_type?: InviteTargetType;

  /** The user whose stream to display for this voice channel stream invite */
  target_user?: Partial<UserEntity>;

  /** The embedded application to open for this voice channel embedded application invite */
  target_application?: Partial<ApplicationEntity>;

  /**
   * Approximate count of online members (returned when `with_counts` is true)
   * @minimum 0
   */
  approximate_presence_count?: number;

  /**
   * Approximate count of total members (returned when `with_counts` is true)
   * @minimum 0
   */
  approximate_member_count?: number;

  /**
   * The expiration date of this invite (returned when `with_expiration` is true)
   * @format datetime
   * @nullable
   */
  expires_at?: string | null;

  /**
   * Stage instance data if there is a public Stage instance in the Stage channel
   * @deprecated This field is deprecated according to Discord documentation
   */
  stage_instance?: InviteStageInstanceEntity;

  /** Guild scheduled event data, only included if `guild_scheduled_event_id` contains a valid guild scheduled event ID */
  guild_scheduled_event?: GuildScheduledEventEntity;
}

/**
 * Represents a complete invite with metadata
 */
export type InviteWithMetadataEntity = InviteEntity & InviteMetadataEntity;
