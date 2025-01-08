import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export const ModifyCurrentUserVoiceStateEntity = z
  .object({
    channel_id: Snowflake.optional(),
    suppress: z.boolean().optional(),
    request_to_speak_timestamp: z.string().datetime().nullish(),
  })
  .strict();

export type ModifyCurrentUserVoiceStateEntity = z.infer<
  typeof ModifyCurrentUserVoiceStateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export const ModifyUserVoiceStateEntity = z
  .object({
    channel_id: Snowflake,
    suppress: z.boolean().optional(),
  })
  .strict();

export type ModifyUserVoiceStateEntity = z.infer<
  typeof ModifyUserVoiceStateEntity
>;
