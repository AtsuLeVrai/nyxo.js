import type { EmojiEntity, Integer, Snowflake } from "@nyxjs/core";

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
export enum VoiceChannelEffectSendAnimationType {
  Premium = 0,
  Basic = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEntity {
  channel_id: Snowflake;
  guild_id: Snowflake;
  user_id: Snowflake;
  emoji?: EmojiEntity | null;
  animation_type?: VoiceChannelEffectSendAnimationType | number;
  animation_id?: Integer;
  sound_id?: Snowflake | Integer;
  sound_volume?: number;
}
