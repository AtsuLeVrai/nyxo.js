import {
  ApplicationSchema,
  InviteTargetType,
  SnowflakeSchema,
  UserSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export const InviteDeleteSchema = z
  .object({
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    code: z.string(),
  })
  .strict();

export type InviteDeleteEntity = z.infer<typeof InviteDeleteSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export const InviteCreateSchema = z
  .object({
    channel_id: SnowflakeSchema,
    code: z.string(),
    created_at: z.string(),
    guild_id: SnowflakeSchema.optional(),
    inviter: UserSchema.optional(),
    max_age: z.number().int(),
    max_uses: z.number().int(),
    target_type: z.nativeEnum(InviteTargetType).optional(),
    target_user: UserSchema.optional(),
    target_application: ApplicationSchema.partial().optional(),
    temporary: z.boolean(),
    uses: z.number().int(),
  })
  .strict();

export type InviteCreateEntity = z.infer<typeof InviteCreateSchema>;
