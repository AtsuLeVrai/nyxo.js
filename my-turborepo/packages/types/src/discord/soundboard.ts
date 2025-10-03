import type { FileInput, SetNullable } from "../utils/index.js";
import type { UserObject } from "./user.js";

/**
 * Discord soundboard sound with audio content, emoji association, and metadata.
 * Represents both default Discord sounds and custom guild-uploaded soundboard sounds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object} for soundboard sound specification
 */
export interface SoundboardSoundObject {
  /** Display name of the soundboard sound */
  readonly name: string;
  /** Unique identifier for the soundboard sound */
  readonly sound_id: string;
  /** Playback volume from 0.0 to 1.0 */
  readonly volume: number;
  /** Custom emoji ID associated with this sound */
  readonly emoji_id: string | null;
  /** Unicode emoji character associated with this sound */
  readonly emoji_name: string | null;
  /** Guild that owns this sound (omitted for default sounds) */
  readonly guild_id?: string;
  /** Whether sound can be used (may be false due to lost Server Boosts) */
  readonly available: boolean;
  /** User who created this guild soundboard sound */
  readonly user?: UserObject;
}

/**
 * Response structure containing a guild's collection of soundboard sounds.
 * Used for API endpoints that return multiple sounds with guild context.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds} for list guild sounds endpoint
 */
export interface SoundboardSoundsObject extends Required<Pick<SoundboardSoundObject, "guild_id">> {
  /** Array of all soundboard sounds in the guild */
  readonly soundboard_sounds: SoundboardSoundObject[];
}

/**
 * Event data for guild soundboard sound deletion containing essential identifiers.
 * Used in Gateway events to notify clients when sounds are removed.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete} for sound delete event
 */
export type GuildSoundboardSoundDeleteObject = Required<
  Pick<SoundboardSoundObject, "guild_id" | "sound_id">
>;

/**
 * Parameters for sending a soundboard sound to a voice channel.
 * Requires user to be connected to voice channel with appropriate permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound} for send sound endpoint
 */
export interface SendSoundboardSoundJSONParams extends Pick<SoundboardSoundObject, "sound_id"> {
  /** Source guild ID required when playing sounds from different servers */
  readonly source_guild_id?: string;
}

/**
 * Form parameters for creating new guild soundboard sounds with audio upload.
 * Supports MP3 or Ogg audio files with size and duration limitations.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound} for create sound endpoint
 */
export interface CreateGuildSoundboardSoundFormParams
  extends Pick<SoundboardSoundObject, "name">,
    Partial<
      Pick<SoundboardSoundObject, "emoji_id" | "emoji_name"> &
        SetNullable<Pick<SoundboardSoundObject, "volume">>
    > {
  /** Audio file data (MP3 or Ogg, max 512KB, max 5.2 seconds duration) */
  readonly sound: FileInput;
}

/**
 * JSON parameters for modifying existing guild soundboard sounds.
 * Allows partial updates to metadata without requiring audio file replacement.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound} for modify sound endpoint
 */
export type ModifyGuildSoundboardSoundJSONParams = Partial<
  Omit<CreateGuildSoundboardSoundFormParams, "sound">
>;
