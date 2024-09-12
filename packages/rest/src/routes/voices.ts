import type { RestHttpResponseCodes, Snowflake, VoiceRegionStructure, VoiceStateStructure } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateJSONParams = Pick<VoiceStateStructure, "channel_id" | "suppress">;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentUserVoiceStateJSONParams = Partial<
    Pick<VoiceStateStructure, "channel_id" | "request_to_speak_timestamp" | "suppress">
>;

export class VoiceRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
     * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
     */
    public static modifyUserVoiceState(
        guildId: Snowflake,
        userId: Snowflake | "@me",
        json: ModifyCurrentUserVoiceStateJSONParams | ModifyUserVoiceStateJSONParams
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "PATCH",
            path: `/guilds/${guildId}/voice-states/${userId}`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
     * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
     */
    public static getUserVoiceState(
        guildId: Snowflake,
        userId: Snowflake | "@me"
    ): RestRequestOptions<VoiceStateStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/voice-states/${userId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
     */
    public static listVoiceRegions(): RestRequestOptions<VoiceRegionStructure[]> {
        return {
            method: "GET",
            path: "/voice/regions",
        };
    }
}
