import type { SetNonNullable } from "type-fest";
import type { EmojiObject } from "./emoji.js";
import type { GuildMemberEntity } from "./guild.js";

export enum AnimationTypes {
  Premium = 0,
  Basic = 1,
}

export interface VoiceRegionObject {
  id: string;
  name: string;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

export interface VoiceStateObject {
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

export interface VoiceServerUpdateObject {
  token: string;
  guild_id: string;
  endpoint: string | null;
}

export interface VoiceChannelEffectSendObject {
  channel_id: string;
  guild_id: string;
  user_id: string;
  emoji?: EmojiObject | null;
  animation_type?: AnimationTypes;
  animation_id?: number;
  sound_id?: string | number;
  sound_volume?: number;
}

export type ModifyCurrentUserVoiceStateJSONParams = Partial<
  SetNonNullable<Pick<VoiceStateObject, "channel_id">> &
    Pick<VoiceStateObject, "suppress" | "request_to_speak_timestamp">
>;

export type ModifyUserVoiceStateJSONParams = Omit<
  ModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;

/**
 * Checks if a voice state indicates the user is in a voice channel
 * @param voiceState The voice state to check
 * @returns true if the user is connected to a voice channel
 */
export function isConnectedToVoice(voiceState: VoiceStateObject): boolean {
  return voiceState.channel_id !== null;
}

/**
 * Checks if a voice state indicates the user is deafened (server or self)
 * @param voiceState The voice state to check
 * @returns true if the user is deafened by server or themselves
 */
export function isDeafened(voiceState: VoiceStateObject): boolean {
  return voiceState.deaf || voiceState.self_deaf;
}

/**
 * Checks if a voice state indicates the user is muted (server or self)
 * @param voiceState The voice state to check
 * @returns true if the user is muted by server or themselves
 */
export function isMuted(voiceState: VoiceStateObject): boolean {
  return voiceState.mute || voiceState.self_mute;
}

/**
 * Checks if a voice state indicates the user is suppressed (cannot speak)
 * @param voiceState The voice state to check
 * @returns true if the user's permission to speak is denied
 */
export function isSuppressed(voiceState: VoiceStateObject): boolean {
  return voiceState.suppress;
}

/**
 * Checks if a voice state indicates the user has requested to speak
 * @param voiceState The voice state to check
 * @returns true if the user has an active request to speak
 */
export function hasRequestedToSpeak(voiceState: VoiceStateObject): boolean {
  return voiceState.request_to_speak_timestamp !== null;
}

/**
 * Checks if a voice region is optimal for the current user
 * @param voiceRegion The voice region to check
 * @returns true if this region is closest to the user's client
 */
export function isOptimalRegion(voiceRegion: VoiceRegionObject): boolean {
  return voiceRegion.optimal;
}

/**
 * Checks if a voice region is deprecated
 * @param voiceRegion The voice region to check
 * @returns true if this region is deprecated and should be avoided
 */
export function isDeprecatedRegion(voiceRegion: VoiceRegionObject): boolean {
  return voiceRegion.deprecated;
}
