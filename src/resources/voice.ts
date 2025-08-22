import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { GuildMemberObject } from "./guild.js";

export interface VoiceStateObject {
  guild_id?: Snowflake;
  channel_id: Snowflake | null;
  user_id: Snowflake;
  member?: GuildMemberObject;
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

export interface VoiceRegionObject {
  id: string;
  name: string;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

// Voice Request Interfaces
export interface ModifyCurrentUserVoiceStateRequest {
  channel_id?: Snowflake;
  suppress?: boolean;
  request_to_speak_timestamp?: string | null;
}

export interface ModifyUserVoiceStateRequest {
  channel_id?: Snowflake;
  suppress?: boolean;
}

export const VoiceRoutes = {
  // GET /voice/regions - List Voice Regions
  listVoiceRegions: (() => "/voice/regions") as EndpointFactory<
    "/voice/regions",
    ["GET"],
    VoiceRegionObject[]
  >,

  // GET /guilds/{guild.id}/voice-states/@me - Get Current User Voice State
  getCurrentUserVoiceState: ((guildId: Snowflake) =>
    `/guilds/${guildId}/voice-states/@me`) as EndpointFactory<
    `/guilds/${string}/voice-states/@me`,
    ["GET", "PATCH"],
    VoiceStateObject,
    false,
    false,
    ModifyCurrentUserVoiceStateRequest
  >,

  // GET /guilds/{guild.id}/voice-states/{user.id} - Get User Voice State
  getUserVoiceState: ((guildId: Snowflake, userId: Snowflake) =>
    `/guilds/${guildId}/voice-states/${userId}`) as EndpointFactory<
    `/guilds/${string}/voice-states/${string}`,
    ["GET", "PATCH"],
    VoiceStateObject,
    false,
    false,
    ModifyUserVoiceStateRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
