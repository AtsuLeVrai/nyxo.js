import { z } from "zod";
import { ApplicationSchema } from "./application.entity.js";
import { AnyChannelSchema } from "./channel.entity.js";
import { GuildMemberSchema, GuildSchema } from "./guild.entity.js";
import { GuildScheduledEventSchema } from "./scheduled-event.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export const InviteStageInstanceSchema = z
  .object({
    members: z.array(GuildMemberSchema.partial()),
    participant_count: z.number().int(),
    speaker_count: z.number().int(),
    topic: z.string().min(1).max(120),
  })
  .strict();

export type InviteStageInstanceEntity = z.infer<
  typeof InviteStageInstanceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export const InviteMetadataSchema = z
  .object({
    uses: z.number().int(),
    max_uses: z.number().int(),
    max_age: z.number().int(),
    temporary: z.boolean(),
    created_at: z.string().datetime(),
  })
  .strict();

export type InviteMetadataEntity = z.infer<typeof InviteMetadataSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export const InviteTargetType = {
  stream: 1,
  embeddedApplication: 2,
} as const;

export type InviteTargetType =
  (typeof InviteTargetType)[keyof typeof InviteTargetType];

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export const InviteType = {
  guild: 0,
  groupDm: 1,
  friend: 2,
} as const;

export type InviteType = (typeof InviteType)[keyof typeof InviteType];

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export const InviteSchema = z
  .object({
    type: z.nativeEnum(InviteType),
    code: z.string(),
    guild: GuildSchema.partial().optional(),
    channel: AnyChannelSchema.nullable(),
    inviter: UserSchema.partial().optional(),
    target_type: z.nativeEnum(InviteTargetType).optional(),
    target_user: UserSchema.partial().optional(),
    target_application: ApplicationSchema.partial().optional(),
    approximate_presence_count: z.number().int().optional(),
    approximate_member_count: z.number().int().optional(),
    expires_at: z.string().datetime().nullish(),
    stage_instance: InviteStageInstanceSchema.optional(),
    guild_scheduled_event: GuildScheduledEventSchema.optional(),
  })
  .strict();

export type InviteEntity = z.infer<typeof InviteSchema>;
