import { Snowflake, StageInstancePrivacyLevel } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export const CreateStageInstanceSchema = z.object({
  channel_id: Snowflake,
  topic: z.string().min(1).max(120),
  privacy_level: z
    .nativeEnum(StageInstancePrivacyLevel)
    .optional()
    .default(StageInstancePrivacyLevel.GuildOnly),
  send_start_notification: z.boolean().optional(),
  guild_scheduled_event_id: Snowflake.optional(),
});

export type CreateStageInstanceSchema = z.input<
  typeof CreateStageInstanceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export const ModifyStageInstanceSchema = CreateStageInstanceSchema.pick({
  topic: true,
  privacy_level: true,
}).partial();

export type ModifyStageInstanceSchema = z.input<
  typeof ModifyStageInstanceSchema
>;
