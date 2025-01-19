import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export const ModifyCurrentUserVoiceStateSchema = z.object({
  channel_id: Snowflake.optional(),
  suppress: z.boolean().optional(),
  request_to_speak_timestamp: z.string().datetime().nullish(),
});

export type ModifyCurrentUserVoiceStateSchema = z.input<
  typeof ModifyCurrentUserVoiceStateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export const ModifyUserVoiceStateSchema = z.object({
  channel_id: Snowflake,
  suppress: z.boolean().optional(),
});

export type ModifyUserVoiceStateSchema = z.input<
  typeof ModifyUserVoiceStateSchema
>;
