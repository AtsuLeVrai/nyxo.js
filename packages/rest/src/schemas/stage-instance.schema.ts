import { Snowflake, StageInstancePrivacyLevel } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export const CreateStageInstanceEntity = z
  .object({
    channel_id: Snowflake,
    topic: z.string().min(1).max(120),
    privacy_level: z
      .nativeEnum(StageInstancePrivacyLevel)
      .optional()
      .default(StageInstancePrivacyLevel.GuildOnly),
    send_start_notification: z.boolean().optional(),
    guild_scheduled_event_id: Snowflake.optional(),
  })
  .strict();

export type CreateStageInstanceEntity = z.infer<
  typeof CreateStageInstanceEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export const ModifyStageInstanceEntity = CreateStageInstanceEntity.pick({
  topic: true,
  privacy_level: true,
}).partial();

export type ModifyStageInstanceEntity = z.infer<
  typeof ModifyStageInstanceEntity
>;
