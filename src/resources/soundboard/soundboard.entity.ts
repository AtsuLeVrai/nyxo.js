import type { UserEntity } from "../user/index.js";

/**
 * @description Represents a Discord soundboard sound that can be played in voice channels with emoji and volume settings.
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure}
 */
export interface SoundboardSoundEntity {
  /**
   * @description Name of this soundboard sound (2-32 characters for guild sounds).
   */
  name: string;
  /**
   * @description Unique snowflake identifier for this soundboard sound.
   */
  sound_id: string;
  /**
   * @description Volume level of this sound from 0 to 1.
   */
  volume: number;
  /**
   * @description Snowflake ID of this sound's custom emoji.
   */
  emoji_id: string | null;
  /**
   * @description Unicode character of this sound's standard emoji.
   */
  emoji_name: string | null;
  /**
   * @description Snowflake ID of the guild this sound belongs to (omitted for default sounds).
   */
  guild_id?: string;
  /**
   * @description Whether this sound can be used (may be false due to loss of Server Boosts).
   */
  available: boolean;
  /**
   * @description User who created this soundboard sound (requires CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permission to view).
   */
  user?: UserEntity;
}

/**
 * @description Gateway event payload containing guild's soundboard sounds in response to Request Soundboard Sounds.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds}
 */
export interface GatewaySoundboardSoundsEntity
  extends Required<Pick<SoundboardSoundEntity, "guild_id">> {
  /**
   * @description Array of soundboard sounds available in this guild.
   */
  soundboard_sounds: SoundboardSoundEntity[];
}

/**
 * @description Gateway event payload for guild soundboard sound deletion events.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete}
 */
export type GatewayGuildSoundboardSoundDeleteEntity = Required<
  Pick<SoundboardSoundEntity, "guild_id" | "sound_id">
>;
