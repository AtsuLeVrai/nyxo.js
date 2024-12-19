import type { Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export interface ModifyCurrentUserVoiceStateOptions {
  channel_id?: Snowflake;
  suppress?: boolean;
  request_to_speak_timestamp?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export interface ModifyUserVoiceStateOptions {
  channel_id: Snowflake;
  suppress?: boolean;
}
