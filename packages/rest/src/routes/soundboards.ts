import type { Snowflake, SoundboardSoundStructure, VoiceStateStructure } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

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
export interface CreateGuildSoundboardSoundJsonParams
    extends Pick<SoundboardSoundStructure, "emoji_id" | "emoji_name" | "name" | "volume"> {
    /**
     * The mp3 or ogg sound data, base64 encoded, similar to image data
     */
    sound: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params|Send Soundboard Sound JSON Params}
 */
export interface SendSoundboardSoundJsonParams extends Pick<SoundboardSoundStructure, "sound_id"> {
    /**
     * The id of the guild the soundboard sound is from, required to play sounds from different servers
     */
    source_guild_id?: Snowflake;
}

export const SoundboardRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound|Delete Guild Soundboard Sound}
     */
    deleteGuildSoundboardSound(guildId: Snowflake, soundId: Snowflake, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound|Modify Guild Soundboard Sound}
     */
    modifyGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake,
        params: ModifyGuildSoundboardSoundJsonParams,
        reason?: string,
    ): RouteStructure<SoundboardSoundStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound|Create Guild Soundboard Sound}
     */
    createGuildSoundboardSound(
        guildId: Snowflake,
        params: CreateGuildSoundboardSoundJsonParams,
        reason?: string,
    ): RouteStructure<SoundboardSoundStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/soundboard-sounds`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound|Get Guild Soundboard Sound}
     */
    getGuildSoundboardSound(guildId: Snowflake, soundId: Snowflake): RouteStructure<SoundboardSoundStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds|List Guild Soundboard Sounds}
     */
    listGuildSoundboardSounds(guildId: Snowflake): RouteStructure<{ items: SoundboardSoundStructure[] }> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/soundboard-sounds`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds|List Default Soundboard Sounds}
     */
    listDefaultSoundboardSounds(): RouteStructure<SoundboardSoundStructure[]> {
        return {
            method: RestMethods.Get,
            path: "/soundboard-default-sounds",
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound|Send Soundboard Sound}
     */
    sendSoundboardSound(
        channelId: Snowflake,
        params: SendSoundboardSoundJsonParams,
    ): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/send-soundboard-sound`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },
} as const;
