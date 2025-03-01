import { z } from "zod";
import { ApplicationEntity } from "./application.entity.js";
import { AnyChannelEntity } from "./channel.entity.js";
import { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import { GuildScheduledEventEntity } from "./scheduled-event.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents the types of targets for voice channel invites.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetType {
  /** Stream in a voice channel */
  Stream = 1,

  /** Embedded application in a voice channel */
  EmbeddedApplication = 2,
}

/**
 * Represents the different types of invites.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
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
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export const InviteStageInstanceEntity = z.object({
  /** The members speaking in the Stage */
  members: z.array(z.lazy(() => GuildMemberEntity.partial())),

  /** The number of users in the Stage */
  participant_count: z.number().int(),

  /** The number of users speaking in the Stage */
  speaker_count: z.number().int(),

  /** The topic of the Stage instance (1-120 characters) */
  topic: z.string().min(1).max(120),
});

export type InviteStageInstanceEntity = z.infer<
  typeof InviteStageInstanceEntity
>;

/**
 * Represents additional metadata about an invite.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export const InviteMetadataEntity = z.object({
  /** Number of times this invite has been used */
  uses: z.number().int(),

  /** Max number of times this invite can be used (0 = unlimited) */
  max_uses: z.number().int(),

  /** Duration (in seconds) after which the invite expires (0 = never) */
  max_age: z.number().int(),

  /** Whether this invite only grants temporary membership */
  temporary: z.boolean(),

  /** When this invite was created */
  created_at: z.string().datetime(),
});

export type InviteMetadataEntity = z.infer<typeof InviteMetadataEntity>;

/**
 * Represents a Discord invite that can be used to add a user to a guild or group DM channel.
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export const InviteEntity = z.object({
  /** The type of invite */
  type: z.nativeEnum(InviteType),

  /** The unique invite code (unique ID) */
  code: z.string(),

  /** The guild this invite is for */
  guild: z.lazy(() => GuildEntity.partial()).optional(),

  /** The channel this invite is for */
  channel: z.lazy(() => AnyChannelEntity).nullable(),

  /** The user who created the invite */
  inviter: z.lazy(() => UserEntity.partial()).optional(),

  /** The type of target for this voice channel invite */
  target_type: z.nativeEnum(InviteTargetType).optional(),

  /** The user whose stream to display for this voice channel stream invite */
  target_user: z.lazy(() => UserEntity.partial()).optional(),

  /** The embedded application to open for this voice channel embedded application invite */
  target_application: z.lazy(() => ApplicationEntity.partial()).optional(),

  /** Approximate count of online members (returned when `with_counts` is true) */
  approximate_presence_count: z.number().int().optional(),

  /** Approximate count of total members (returned when `with_counts` is true) */
  approximate_member_count: z.number().int().optional(),

  /** The expiration date of this invite (returned when `with_expiration` is true) */
  expires_at: z.string().datetime().nullish(),

  /**
   * Stage instance data if there is a public Stage instance in the Stage channel
   * @deprecated This field is deprecated according to Discord documentation
   */
  stage_instance: z.lazy(() => InviteStageInstanceEntity).optional(),

  /** Guild scheduled event data, only included if `guild_scheduled_event_id` contains a valid guild scheduled event ID */
  guild_scheduled_event: z.lazy(() => GuildScheduledEventEntity).optional(),
});

export type InviteEntity = z.infer<typeof InviteEntity>;
