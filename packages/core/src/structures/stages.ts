import type { Snowflake } from "../libs/types";

/**
 * Enum representing the privacy levels of a Stage instance.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level|Stage Instance Privacy Level}
 */
export enum StagePrivacyLevel {
    /**
     * The Stage instance is visible publicly. (deprecated)
     *
     * @deprecated Use `StagePrivacyLevel.GuildOnly` instead.
     */
    Public = 1,
    /**
     * The Stage instance is visible to only guild members.
     */
    GuildOnly = 2,
}

/**
 * Type representing the structure of a Stage instance.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object|Stage Instance Object}
 */
export type StageInstanceStructure = {
    /**
     * The id of the associated Stage channel.
     */
    channel_id: Snowflake;
    /**
     * Whether or not Stage Discovery is disabled (deprecated).
     *
     * @deprecated No longer supported by Discord.
     */
    discoverable_disabled?: boolean;
    /**
     * The guild id of the associated Stage channel.
     */
    guild_id: Snowflake;
    /**
     * The id of the scheduled event for this Stage instance.
     */
    guild_scheduled_event_id: Snowflake | null;
    /**
     * The id of this Stage instance.
     */
    id: Snowflake;
    /**
     * The privacy level of the Stage instance.
     */
    privacy_level: StagePrivacyLevel;
    /**
     * The topic of the Stage instance (1-120 characters).
     */
    topic: string;
};
