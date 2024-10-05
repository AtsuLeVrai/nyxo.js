import type { Snowflake, VoiceRegionStructure, VoiceStateStructure } from "@nyxjs/core";
import type { RouteStructure } from "../types";
import { RestMethods } from "../types";

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

export class VoiceRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state|Modify User Voice State}
     * @return No information available in the Discord API documentation for the response.
     */
    public static modifyUserVoiceState(
        guildId: Snowflake,
        userId: Snowflake,
        params: ModifyUserVoiceStateJsonParams
    ): RouteStructure<void> {
        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/voice-states/${userId}`,
            body: JSON.stringify(params),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state|Modify Current User Voice State}
     */
    public static modifyCurrentUserVoiceState(
        guildId: Snowflake,
        params: ModifyCurrentUserVoiceStateJsonParams
    ): RouteStructure<void> {
        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/voice-states/@me`,
            body: JSON.stringify(params),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state|Get User Voice State}
     */
    public static getUserVoiceState(guildId: Snowflake, userId: Snowflake): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/voice-states/${userId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state|Get Current User Voice State}
     */
    public static getCurrentUserVoiceState(guildId: Snowflake): RouteStructure<VoiceStateStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/voice-states/@me`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions|List Voice Regions}
     */
    public static listVoiceRegions(): RouteStructure<VoiceRegionStructure[]> {
        return {
            method: RestMethods.Get,
            path: "/voice/regions",
        };
    }
}
