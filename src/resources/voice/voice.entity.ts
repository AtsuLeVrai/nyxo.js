import type { EmojiEntity } from "../emoji/index.js";
import type { GuildMemberEntity } from "../guild/index.js";

export enum VoiceChannelEffectSendAnimationType {
  Premium = 0,
  Basic = 1,
}

export interface VoiceRegionEntity {
  id: string;
  name: string;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

export interface VoiceStateEntity {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  member?: GuildMemberEntity;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string | null;
}

export interface GatewayVoiceServerUpdateEntity {
  token: string;
  guild_id: string;
  endpoint: string | null;
}

export interface GatewayVoiceChannelEffectSendEntity {
  channel_id: string;
  guild_id: string;
  user_id: string;
  emoji?: EmojiEntity | null;
  animation_type?: VoiceChannelEffectSendAnimationType;
  animation_id?: number;
  sound_id?: string | number;
  sound_volume?: number;
}
