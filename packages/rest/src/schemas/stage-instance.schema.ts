import { SnowflakeManager, StageInstancePrivacyLevel } from "@nyxjs/core";
import { z } from "zod";

export const CreateStageInstanceSchema = z
  .object({
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    topic: z.string().min(1).max(120),
    privacy_level: z
      .nativeEnum(StageInstancePrivacyLevel)
      .default(StageInstancePrivacyLevel.GuildOnly)
      .optional(),
    send_start_notification: z.boolean().optional(),
    guild_scheduled_event_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export type CreateStageInstanceEntity = z.infer<
  typeof CreateStageInstanceSchema
>;

export const ModifyStageInstanceSchema = CreateStageInstanceSchema.pick({
  topic: true,
  privacy_level: true,
})
  .strict()
  .partial();

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type ModifyStageInstanceEntity = z.infer<
  typeof ModifyStageInstanceSchema
>;
