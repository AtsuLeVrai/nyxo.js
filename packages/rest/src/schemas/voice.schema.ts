import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const ModifyCurrentUserVoiceStateSchema = z
  .object({
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    suppress: z.boolean().optional(),
    request_to_speak_timestamp: z.string().datetime().optional().nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentUserVoiceStateEntity = z.infer<
  typeof ModifyCurrentUserVoiceStateSchema
>;

export const ModifyUserVoiceStateSchema = z
  .object({
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    suppress: z.boolean().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateEntity = z.infer<
  typeof ModifyUserVoiceStateSchema
>;
