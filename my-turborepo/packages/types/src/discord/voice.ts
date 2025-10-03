import type { SetNonNullable } from "../utils/index.js";
import type { EmojiObject } from "./emoji.js";
import type { GuildMemberEntity } from "./guild.js";

/**
 * Types of emoji animations available for voice channel effects.
 * Determines the visual animation style when emoji reactions are sent in voice channels.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types} for animation types specification
 */
export enum AnimationTypes {
  /** Fun animation sent by Nitro subscribers with enhanced visual effects */
  Premium = 0,
  /** Standard animation available to all users */
  Basic = 1,
}

/**
 * Information about Discord voice regions available for voice and stage channels.
 * Voice regions determine server location for optimal audio quality and latency.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object} for voice region specification
 */
export interface VoiceRegionObject {
  /** Unique identifier for the voice region */
  readonly id: string;
  /** Human-readable name of the voice region */
  readonly name: string;
  /** Whether this region is closest to the current user's client */
  readonly optimal: boolean;
  /** Whether this region is deprecated and should be avoided */
  readonly deprecated: boolean;
  /** Whether this is a custom region used for events or special purposes */
  readonly custom: boolean;
}

/**
 * User's current voice connection status and settings within a guild.
 * Represents audio/video state, permissions, and stage channel interactions.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object} for voice state specification
 */
export interface VoiceStateObject {
  /** Guild where this voice state applies */
  readonly guild_id?: string;
  /** Voice channel the user is connected to (null if disconnected) */
  readonly channel_id: string | null;
  /** User this voice state represents */
  readonly user_id: string;
  /** Guild member object if voice state is in a guild */
  readonly member?: GuildMemberEntity;
  /** Session identifier for this voice connection */
  readonly session_id: string;
  /** Whether user is server-deafened (cannot hear others) */
  readonly deaf: boolean;
  /** Whether user is server-muted (cannot speak) */
  readonly mute: boolean;
  /** Whether user has locally deafened themselves */
  readonly self_deaf: boolean;
  /** Whether user has locally muted themselves */
  readonly self_mute: boolean;
  /** Whether user is streaming using "Go Live" feature */
  readonly self_stream?: boolean;
  /** Whether user's camera is enabled */
  readonly self_video: boolean;
  /** Whether user's permission to speak is denied (stage channels) */
  readonly suppress: boolean;
  /** Timestamp when user requested to speak in stage channel */
  readonly request_to_speak_timestamp: string | null;
}

/**
 * Voice server connection information sent when joining or switching voice servers.
 * Contains authentication token and endpoint for establishing voice connection.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update} for voice server update specification
 */
export interface VoiceServerUpdateObject {
  /** Authentication token for voice connection */
  readonly token: string;
  /** Guild this voice server update applies to */
  readonly guild_id: string;
  /** Voice server host endpoint (null if server unavailable) */
  readonly endpoint: string | null;
}

/**
 * Data for voice channel effects such as emoji reactions and soundboard sounds.
 * Represents interactive elements sent within voice channels for enhanced communication.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send} for voice channel effects specification
 */
export interface VoiceChannelEffectSendObject {
  /** Voice channel where the effect was sent */
  readonly channel_id: string;
  /** Guild containing the voice channel */
  readonly guild_id: string;
  /** User who sent the effect */
  readonly user_id: string;
  /** Emoji used for reaction effects */
  readonly emoji?: EmojiObject | null;
  /** Visual animation type for emoji and soundboard effects */
  readonly animation_type?: AnimationTypes;
  /** Unique identifier for the emoji animation */
  readonly animation_id?: number;
  /** Soundboard sound identifier (string or integer) */
  readonly sound_id?: string | number;
  /** Playback volume for soundboard effects (0.0 to 1.0) */
  readonly sound_volume?: number;
}

/**
 * Request parameters for modifying the current user's voice state in a guild.
 * Supports updating channel, suppress status, and stage channel speak requests.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state} for modify voice state endpoint
 */
export type ModifyCurrentUserVoiceStateJSONParams = Partial<
  SetNonNullable<Pick<VoiceStateObject, "channel_id">> &
    Pick<VoiceStateObject, "suppress" | "request_to_speak_timestamp">
>;

/**
 * Request parameters for modifying another user's voice state in a guild.
 * Limited to channel and suppress status changes, excluding speak request timestamps.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state} for modify user voice state endpoint
 */
export type ModifyUserVoiceStateJSONParams = Omit<
  ModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;
