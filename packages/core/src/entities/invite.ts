import type { Integer, Iso8601 } from "../formatting/index.js";
import type { ApplicationEntity } from "./application.js";
import type { ChannelEntity } from "./channel.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.js";
import type { UserEntity } from "./user.js";

/**
 * Represents an instance of a Stage channel in an invite.
 *
 * @remarks
 * This interface is deprecated according to Discord's documentation.
 * Contains information about the Stage instance including participants and topic.
 *
 * @example
 * ```typescript
 * const stageInstance: InviteStageInstanceEntity = {
 *   members: [{nick: "Speaker", roles: []}],
 *   participant_count: 50,
 *   speaker_count: 3,
 *   topic: "Community Discussion"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export interface InviteStageInstanceEntity {
  /** The members speaking in the Stage */
  members: Partial<GuildMemberEntity>[];
  /** The number of users in the Stage */
  participant_count: Integer;
  /** The number of users speaking in the Stage */
  speaker_count: Integer;
  /** The topic of the Stage instance (1-120 characters) */
  topic: string;
}

/**
 * Contains metadata about an invite.
 *
 * @remarks
 * Provides additional information about an invite such as usage statistics
 * and expiration details.
 *
 * @example
 * ```typescript
 * const metadata: InviteMetadataEntity = {
 *   uses: 0,
 *   max_uses: 100,
 *   max_age: 86400,
 *   temporary: false,
 *   created_at: "2021-01-01T00:00:00.000Z"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export interface InviteMetadataEntity {
  /** Number of times this invite has been used */
  uses: Integer;
  /** Maximum number of times this invite can be used */
  max_uses: Integer;
  /** Duration (in seconds) after which the invite expires */
  max_age: Integer;
  /** Whether this invite only grants temporary membership */
  temporary: boolean;
  /** When this invite was created */
  created_at: Iso8601;
}

/**
 * Represents the possible target types for voice channel invites.
 *
 * @remarks
 * Used to specify what type of invite target is being used, such as a stream
 * or embedded application.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetType {
  /** Stream target type */
  Stream = 1,
  /** Embedded application target type */
  EmbeddedApplication = 2,
}

/**
 * Represents the possible types of invites.
 *
 * @remarks
 * Determines where the invite will add the user - to a guild,
 * group DM, or as a friend.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export enum InviteType {
  /** Regular guild invite */
  Guild = 0,
  /** Group DM invite */
  GroupDm = 1,
  /** Friend request invite */
  Friend = 2,
}

/**
 * Represents a Discord invite.
 *
 * @remarks
 * An invite is a code that can be used to add a user to a guild, group DM, or as a friend.
 * Contains all relevant information about the invite including the target and any associated metadata.
 *
 * @example
 * ```typescript
 * const invite: InviteEntity = {
 *   type: InviteType.Guild,
 *   code: "discord-developers",
 *   guild: {
 *     id: "123456789",
 *     name: "Discord Developers"
 *   },
 *   channel: {
 *     id: "987654321",
 *     name: "general"
 *   }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export interface InviteEntity {
  /** The type of invite */
  type: InviteType;
  /** The unique invite code */
  code: string;
  /** The guild this invite is for */
  guild?: Partial<GuildEntity>;
  /** The channel this invite is for */
  channel: Partial<ChannelEntity> | null;
  /** The user who created the invite */
  inviter?: UserEntity;
  /** The type of target for this voice channel invite */
  target_type?: InviteTargetType;
  /** The user whose stream to display for this voice channel stream invite */
  target_user?: UserEntity;
  /** The embedded application to open for this voice channel embedded application invite */
  target_application?: Partial<ApplicationEntity>;
  /** Approximate count of online members (returned when with_counts is true) */
  approximate_presence_count?: Integer;
  /** Approximate count of total members (returned when with_counts is true) */
  approximate_member_count?: Integer;
  /** The expiration date of this invite (returned when with_expiration is true) */
  expires_at?: Iso8601 | null;
  /** Stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stage_instance?: InviteStageInstanceEntity;
  /** Guild scheduled event data */
  guild_scheduled_event?: GuildScheduledEventEntity;
}
