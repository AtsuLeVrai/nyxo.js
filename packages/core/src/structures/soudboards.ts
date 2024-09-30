import type { Float, Snowflake } from "../markdown/formats";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure|Soundboard Sound Structure}
 */
export type SoundboardSoundStructure = {
    /**
     * Whether this sound can be used, may be false due to loss of Server Boosts.
     */
    available: boolean;
    /**
     * The ID of this sound's custom emoji.
     */
    emoji_id: Snowflake | null;
    /**
     * The unicode character of this sound's standard emoji.
     */
    emoji_name: string | null;
    /**
     * The ID of the guild this sound is in.
     */
    guild_id?: Snowflake;
    /**
     * The name of this sound.
     */
    name: string;
    /**
     * The ID of this sound.
     */
    sound_id: Snowflake;
    /**
     * The user who created this sound.
     */
    user?: UserStructure;
    /**
     * The volume of this sound, from 0 to 1.
     */
    volume: Float;
};
