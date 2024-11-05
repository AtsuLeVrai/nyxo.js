import type { Snowflake, VoiceRegionStructure, VoiceStateStructure } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params|Modify User Voice State JSON Params}
 */
export type ModifyUserVoiceStateJsonParams = Pick<VoiceStateStructure, "channel_id" | "suppress">;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params|Modify Current User Voice State JSON Params}
 */
export type ModifyCurrentUserVoiceStateJsonParams = Pick<
    VoiceStateStructure,
    "channel_id" | "request_to_speak_timestamp" | "suppress"
>;

export const VoiceRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state|Modify User Voice State}
     * @return No information available in the Discord API documentation for the response.
     */
    modifyUserVoiceState(
        guildId: Snowflake,
        userId: Snowflake,
        params: ModifyUserVoiceStateJsonParams,
    ): RouteStructure<void> {
        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/voice-states/${userId}`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state|Modify Current User Voice State}
     */
    modifyCurrentUserVoiceState(
        guildId: Snowflake,
        params: ModifyCurrentUserVoiceStateJsonParams,
    ): RouteStructure<void> {
        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/voice-states/@me`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state|Get User Voice State}
     */
    getUserVoiceState(guildId: Snowflake, userId: Snowflake): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/voice-states/${userId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state|Get Current User Voice State}
     */
    getCurrentUserVoiceState(guildId: Snowflake): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/voice-states/@me`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions|List Voice Regions}
     */
    listVoiceRegions(): RouteStructure<VoiceRegionStructure[]> {
        return {
            method: RestMethods.Get,
            path: "/voice/regions",
        };
    },
} as const;
