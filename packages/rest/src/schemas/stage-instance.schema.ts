import { SnowflakeSchema, StageInstancePrivacyLevel } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export const CreateStageInstanceSchema = z
  .object({
    channel_id: SnowflakeSchema,
    topic: z.string().min(1).max(120),
    privacy_level: z
      .nativeEnum(StageInstancePrivacyLevel)
      .default(StageInstancePrivacyLevel.guildOnly)
      .optional(),
    send_start_notification: z.boolean().optional(),
    guild_scheduled_event_id: SnowflakeSchema.optional(),
  })
  .strict();

export type CreateStageInstanceEntity = z.infer<
  typeof CreateStageInstanceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export const ModifyStageInstanceSchema = CreateStageInstanceSchema.pick({
  topic: true,
  privacy_level: true,
})
  .strict()
  .partial();

export type ModifyStageInstanceEntity = z.infer<
  typeof ModifyStageInstanceSchema
>;
