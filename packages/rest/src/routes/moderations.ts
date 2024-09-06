import type { AutoModerationRuleStructure } from "@nyxjs/api-types";
import type { RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleJSONParams = Pick<
    AutoModerationRuleStructure,
    "actions" | "enabled" | "event_type" | "exempt_channels" | "exempt_roles" | "name" | "trigger_metadata"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleJSONParams = Pick<
    AutoModerationRuleStructure,
    | "actions"
    | "enabled"
    | "event_type"
    | "exempt_channels"
    | "exempt_roles"
    | "name"
    | "trigger_metadata"
    | "trigger_type"
>;

export const ModerationRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
     */
    deleteAutoModerationRule: (
        guildId: Snowflake,
        autoModerationRuleId: Snowflake,
        reason?: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> => ({
        method: "DELETE",
        path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
        headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
     */
    modifyAutoModerationRule: (
        guildId: Snowflake,
        autoModerationRuleId: Snowflake,
        json: ModifyAutoModerationRuleJSONParams,
        reason?: string
    ): RestRequestOptions<AutoModerationRuleStructure> => ({
        method: "PATCH",
        path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
        body: JSON.stringify(json),
        headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
     */
    createAutoModerationRule: (
        guildId: Snowflake,
        json: CreateAutoModerationRuleJSONParams,
        reason?: string
    ): RestRequestOptions<AutoModerationRuleStructure> => ({
        method: "POST",
        path: `/guilds/${guildId}/auto-moderation/rules`,
        body: JSON.stringify(json),
        headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
     */
    getAutoModerationRule: (
        guildId: Snowflake,
        autoModerationRuleId: Snowflake
    ): RestRequestOptions<AutoModerationRuleStructure> => ({
        method: "GET",
        path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
    }),
};
