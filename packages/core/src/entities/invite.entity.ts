import { z } from "zod";
import { ApplicationEntity } from "./application.entity.js";
import { AnyChannelEntity } from "./channel.entity.js";
import { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import { GuildScheduledEventEntity } from "./scheduled-event.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export const InviteStageInstanceEntity = z.object({
  members: z.array(GuildMemberEntity.partial()),
  participant_count: z.number().int(),
  speaker_count: z.number().int(),
  topic: z.string().min(1).max(120),
});

export type InviteStageInstanceEntity = z.infer<
  typeof InviteStageInstanceEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export const InviteMetadataEntity = z.object({
  uses: z.number().int(),
  max_uses: z.number().int(),
  max_age: z.number().int(),
  temporary: z.boolean(),
  created_at: z.string().datetime(),
});

export type InviteMetadataEntity = z.infer<typeof InviteMetadataEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetType {
  Stream = 1,
  EmbeddedApplication = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export enum InviteType {
  Guild = 0,
  GroupDm = 1,
  Friend = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export const InviteEntity = z.object({
  type: z.nativeEnum(InviteType),
  code: z.string(),
  guild: GuildEntity.partial().optional(),
  channel: AnyChannelEntity.nullable(),
  inviter: UserEntity.partial().optional(),
  target_type: z.nativeEnum(InviteTargetType).optional(),
  target_user: UserEntity.partial().optional(),
  target_application: ApplicationEntity.partial().optional(),
  approximate_presence_count: z.number().int().optional(),
  approximate_member_count: z.number().int().optional(),
  expires_at: z.string().datetime().nullish(),
  stage_instance: InviteStageInstanceEntity.optional(),
  guild_scheduled_event: GuildScheduledEventEntity.optional(),
});

export type InviteEntity = z.infer<typeof InviteEntity>;
