import type { Snowflake, SoundboardSoundStructure, VoiceStateStructure } from "@nyxjs/core";
import type { RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

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

export class SoundboardRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound|Delete Guild Soundboard Sound}
     */
    public static deleteGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake,
        reason?: string
    ): RestRequestOptions<void> {
        return this.delete(`/guilds/${guildId}/soundboard-sounds/${soundId}`, {
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound|Modify Guild Soundboard Sound}
     */
    public static modifyGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake,
        params: ModifyGuildSoundboardSoundJsonParams,
        reason?: string
    ): RestRequestOptions<SoundboardSoundStructure> {
        return this.patch(`/guilds/${guildId}/soundboard-sounds/${soundId}`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound|Create Guild Soundboard Sound}
     */
    public static createGuildSoundboardSound(
        guildId: Snowflake,
        params: CreateGuildSoundboardSoundJsonParams,
        reason?: string
    ): RestRequestOptions<SoundboardSoundStructure> {
        return this.post(`/guilds/${guildId}/soundboard-sounds`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound|Get Guild Soundboard Sound}
     */
    public static getGuildSoundboardSound(
        guildId: Snowflake,
        soundId: Snowflake
    ): RestRequestOptions<SoundboardSoundStructure> {
        return this.get(`/guilds/${guildId}/soundboard-sounds/${soundId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds|List Guild Soundboard Sounds}
     */
    public static listGuildSoundboardSounds(
        guildId: Snowflake
    ): RestRequestOptions<{ items: SoundboardSoundStructure[] }> {
        return this.get(`/guilds/${guildId}/soundboard-sounds`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds|List Default Soundboard Sounds}
     */
    public static listDefaultSoundboardSounds(): RestRequestOptions<SoundboardSoundStructure[]> {
        return this.get(`/soundboard-default-sounds`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound|Send Soundboard Sound}
     */
    public static sendSoundboardSound(
        channelId: Snowflake,
        params: SendSoundboardSoundJsonParams
    ): RestRequestOptions<VoiceStateStructure> {
        return this.post(`/channels/${channelId}/send-soundboard-sound`, {
            body: JSON.stringify(params),
        });
    }
}
