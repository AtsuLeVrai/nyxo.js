import type { EmojiEntity, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export interface VoiceServerUpdateEntity {
  token: string;
  guild_id: Snowflake;
  endpoint: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export const VoiceChannelEffectSendAnimationType = {
  premium: 0,
  basic: 1,
} as const;

export type VoiceChannelEffectSendAnimationType =
  (typeof VoiceChannelEffectSendAnimationType)[keyof typeof VoiceChannelEffectSendAnimationType];

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEntity {
  channel_id: Snowflake;
  guild_id: Snowflake;
  user_id: Snowflake;
  emoji?: EmojiEntity | null;
  animation_type?: VoiceChannelEffectSendAnimationType;
  animation_id?: number;
  sound_id?: Snowflake | number;
  sound_volume?: number;
}
