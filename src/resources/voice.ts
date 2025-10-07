import type { SetNonNullable } from "../utils/index.js";
import type { EmojiObject } from "./emoji.js";
import type { GuildMemberEntity } from "./guild.js";

export enum AnimationTypes {
  Premium = 0,

  Basic = 1,
}

export interface VoiceRegionObject {
  readonly id: string;

  readonly name: string;

  readonly optimal: boolean;

  readonly deprecated: boolean;

  readonly custom: boolean;
}

export interface VoiceStateObject {
  readonly guild_id?: string;

  readonly channel_id: string | null;

  readonly user_id: string;

  readonly member?: GuildMemberEntity;

  readonly session_id: string;

  readonly deaf: boolean;

  readonly mute: boolean;

  readonly self_deaf: boolean;

  readonly self_mute: boolean;

  readonly self_stream?: boolean;

  readonly self_video: boolean;

  readonly suppress: boolean;

  readonly request_to_speak_timestamp: string | null;
}

export interface VoiceServerUpdateObject {
  readonly token: string;

  readonly guild_id: string;

  readonly endpoint: string | null;
}

export interface VoiceChannelEffectSendObject {
  readonly channel_id: string;

  readonly guild_id: string;

  readonly user_id: string;

  readonly emoji?: EmojiObject | null;

  readonly animation_type?: AnimationTypes;

  readonly animation_id?: number;

  readonly sound_id?: string | number;

  readonly sound_volume?: number;
}

export type ModifyCurrentUserVoiceStateJSONParams = Partial<
  SetNonNullable<Pick<VoiceStateObject, "channel_id">> &
    Pick<VoiceStateObject, "suppress" | "request_to_speak_timestamp">
>;

export type ModifyUserVoiceStateJSONParams = Omit<
  ModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;
