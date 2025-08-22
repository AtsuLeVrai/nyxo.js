import type { Snowflake } from "../common/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { UserObject } from "./user.js";

export interface SoundboardSoundObject {
  name: string;
  sound_id: Snowflake;
  volume: number;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
  guild_id?: Snowflake;
  available: boolean;
  user?: UserObject;
}

// Soundboard Request Interfaces
export interface SendSoundboardSoundRequest {
  sound_id: Snowflake;
  source_guild_id?: Snowflake;
}

export interface ListGuildSoundboardSoundsResponse {
  items: SoundboardSoundObject[];
}

export interface CreateGuildSoundboardSoundRequest {
  name: string;
  sound: DataUri;
  volume?: number;
  emoji_id?: Snowflake | null;
  emoji_name?: string | null;
}

export interface ModifyGuildSoundboardSoundRequest {
  name?: string;
  volume?: number;
  emoji_id?: Snowflake | null;
  emoji_name?: string | null;
}

export const SoundboardRoutes = {
  // POST /channels/{channel.id}/send-soundboard-sound - Send Soundboard Sound
  sendSoundboardSound: ((channelId: Snowflake) =>
    `/channels/${channelId}/send-soundboard-sound`) as EndpointFactory<
    `/channels/${string}/send-soundboard-sound`,
    ["POST"],
    void,
    false,
    false,
    SendSoundboardSoundRequest
  >,

  // GET /soundboard-default-sounds - List Default Soundboard Sounds
  listDefaultSoundboardSounds: (() => "/soundboard-default-sounds") as EndpointFactory<
    "/soundboard-default-sounds",
    ["GET"],
    SoundboardSoundObject[]
  >,

  // GET /guilds/{guild.id}/soundboard-sounds - List Guild Soundboard Sounds
  listGuildSoundboardSounds: ((guildId: Snowflake) =>
    `/guilds/${guildId}/soundboard-sounds`) as EndpointFactory<
    `/guilds/${string}/soundboard-sounds`,
    ["GET", "POST"],
    ListGuildSoundboardSoundsResponse,
    true,
    false,
    CreateGuildSoundboardSoundRequest
  >,

  // GET /guilds/{guild.id}/soundboard-sounds/{sound.id} - Get Guild Soundboard Sound
  getGuildSoundboardSound: ((guildId: Snowflake, soundId: Snowflake) =>
    `/guilds/${guildId}/soundboard-sounds/${soundId}`) as EndpointFactory<
    `/guilds/${string}/soundboard-sounds/${string}`,
    ["GET", "PATCH", "DELETE"],
    SoundboardSoundObject,
    true,
    false,
    ModifyGuildSoundboardSoundRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
