import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export const ModifyCurrentUserVoiceStateSchema = z
  .object({
    channel_id: SnowflakeSchema.optional(),
    suppress: z.boolean().optional(),
    request_to_speak_timestamp: z.string().datetime().nullish(),
  })
  .strict();

export type ModifyCurrentUserVoiceStateEntity = z.infer<
  typeof ModifyCurrentUserVoiceStateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export const ModifyUserVoiceStateSchema = z
  .object({
    channel_id: SnowflakeSchema,
    suppress: z.boolean().optional(),
  })
  .strict();

export type ModifyUserVoiceStateEntity = z.infer<
  typeof ModifyUserVoiceStateSchema
>;
