import type { AutoModerationRuleStructure, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/rest";

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

export class ModerationRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
     */
    public static deleteAutoModerationRule(
        guildId: Snowflake,
        autoModerationRuleId: Snowflake,
        reason?: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
     */
    public static modifyAutoModerationRule(
        guildId: Snowflake,
        autoModerationRuleId: Snowflake,
        json: ModifyAutoModerationRuleJSONParams,
        reason?: string
    ): RestRequestOptions<AutoModerationRuleStructure> {
        return {
            method: "PATCH",
            path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
     */
    public static createAutoModerationRule(
        guildId: Snowflake,
        json: CreateAutoModerationRuleJSONParams,
        reason?: string
    ): RestRequestOptions<AutoModerationRuleStructure> {
        return {
            method: "POST",
            path: `/guilds/${guildId}/auto-moderation/rules`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
     */
    public static getAutoModerationRule(
        guildId: Snowflake,
        autoModerationRuleId: Snowflake
    ): RestRequestOptions<AutoModerationRuleStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
        };
    }
}
