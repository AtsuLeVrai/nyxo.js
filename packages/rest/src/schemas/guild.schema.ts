import {
  DefaultMessageNotificationLevel,
  type RoleEntity,
  RoleFlags,
  type RoleTagsEntity,
  SnowflakeManager,
  VerificationLevel,
} from "@nyxjs/core";
import { z } from "zod";

const RoleTagsSchema: z.ZodType<RoleTagsEntity> = z
  .object({
    bot_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    integration_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    premium_subscriber: z.null().optional(),
    subscription_listing_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    available_for_purchase: z.null().optional(),
    guild_connections: z.null().optional(),
  })
  .strict();

const RoleSchema: z.ZodType<RoleEntity> = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    name: z.string(),
    color: z.number().int(),
    hoist: z.boolean(),
    icon: z.string().optional().nullable(),
    unicode_emoji: z.string().emoji().optional().nullable(),
    position: z.number().int(),
    permissions: z.string(),
    managed: z.boolean(),
    mentionable: z.boolean(),
    tags: RoleTagsSchema.optional(),
    flags: z.nativeEnum(RoleFlags),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export const CreateGuildSchema = z.object({
  name: z.string().min(2).max(100),
  /** @deprecated Voice region id for the guild (deprecated) */
  region: z.string().optional().nullable(),
  icon: z
    .string()
    .regex(/^data:image\/(jpeg|png|gif);base64,/)
    .optional(),
  verification_level: z.nativeEnum(VerificationLevel).optional(),
  default_message_notifications: z
    .nativeEnum(DefaultMessageNotificationLevel)
    .optional(),
  roles: z.array(RoleSchema).optional(),
});
