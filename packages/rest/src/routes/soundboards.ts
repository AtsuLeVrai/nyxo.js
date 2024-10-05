import type { Snowflake, SoundboardSoundStructure, VoiceStateStructure } from "@nyxjs/core";
import type { RouteStructure } from "../types";
import { RestMethods } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params|Modify Guild Soundboard Sound JSON Params}
 */
export type ModifyGuildSoundboardSoundJsonParams = Pick<
    SoundboardSoundStructure,
    "emoji_id" | "emoji_name" | "name" | "volume"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params|Create Guild Soundboard Sound JSON Params}
 */
export type CreateGuildSoundboardSoundJsonParams = Pick<
    SoundboardSoundStructure,
    "emoji_id" | "emoji_name" | "name" | "volume"
> & {
    /**
     * The mp3 or ogg sound data, base64 encoded, similar to image data
     */
    sound: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params|Send Soundboard Sound JSON Params}
 */
export type SendSoundboardSoundJsonParams = Pick<SoundboardSoundStructure, "sound_id"> & {
    /**
     * The id of the guild the soundboard sound is from, required to play sounds from different servers
     */
    source_guild_id?: Snowflake;
};

export class SoundboardRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound|Delete Guild Soundboard Sound}
     */
    public static deleteGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake,
        reason?: string
    ): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound|Modify Guild Soundboard Sound}
     */
    public static modifyGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake,
        params: ModifyGuildSoundboardSoundJsonParams,
        reason?: string
    ): RouteStructure<SoundboardSoundStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
            body: JSON.stringify(params),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound|Create Guild Soundboard Sound}
     */
    public static createGuildSoundboardSound(
        guildId: Snowflake,
        params: CreateGuildSoundboardSoundJsonParams,
        reason?: string
    ): RouteStructure<SoundboardSoundStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/soundboard-sounds`,
            body: JSON.stringify(params),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound|Get Guild Soundboard Sound}
     */
    public static getGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake
    ): RouteStructure<SoundboardSoundStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds|List Guild Soundboard Sounds}
     */
    public static listGuildSoundboardSounds(guildId: Snowflake): RouteStructure<{ items: SoundboardSoundStructure[] }> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/soundboard-sounds`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds|List Default Soundboard Sounds}
     */
    public static listDefaultSoundboardSounds(): RouteStructure<SoundboardSoundStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/soundboard-default-sounds`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound|Send Soundboard Sound}
     */
    public static sendSoundboardSound(
        channelId: Snowflake,
        params: SendSoundboardSoundJsonParams
    ): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/send-soundboard-sound`,
            body: JSON.stringify(params),
        };
    }
}
