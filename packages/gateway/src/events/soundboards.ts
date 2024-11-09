import type { Snowflake, SoundboardSoundStructure } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export interface GuildSoundboardSoundDeleteEventFields {
    /**
     * ID of the guild the sound was in
     */
    guild_id: Snowflake;
    /**
     * ID of the sound that was deleted
     */
    sound_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export interface SoundboardSoundsEventFields {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Array of soundboard sound objects
     */
    soundboard_sounds: SoundboardSoundStructure[];
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export interface RequestSoundboardSoundsStructure {
    /**
     * IDs of the guilds to get soundboard sounds for
     */
    guild_ids: Snowflake[];
}
