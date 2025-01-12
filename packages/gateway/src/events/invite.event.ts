import {
  ApplicationEntity,
  InviteTargetType,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export const InviteDeleteEntity = z.object({
  channel_id: Snowflake,
  guild_id: Snowflake.optional(),
  code: z.string(),
});

export type InviteDeleteEntity = z.infer<typeof InviteDeleteEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export const InviteCreateEntity = z.object({
  channel_id: Snowflake,
  code: z.string(),
  created_at: z.string(),
  guild_id: Snowflake.optional(),
  inviter: UserEntity.optional(),
  max_age: z.number().int(),
  max_uses: z.number().int(),
  target_type: z.nativeEnum(InviteTargetType).optional(),
  target_user: UserEntity.optional(),
  target_application: ApplicationEntity.partial().optional(),
  temporary: z.boolean(),
  uses: z.number().int(),
});

export type InviteCreateEntity = z.infer<typeof InviteCreateEntity>;
