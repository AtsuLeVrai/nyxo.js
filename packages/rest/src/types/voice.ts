import type { VoiceStateEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentVoiceStateOptionsEntity = Partial<
  Pick<
    VoiceStateEntity,
    "channel_id" | "suppress" | "request_to_speak_timestamp"
  >
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateOptionsEntity = Pick<
  VoiceStateEntity,
  "channel_id" | "suppress"
>;
