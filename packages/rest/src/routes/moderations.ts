import type { AutoModerationRuleStructure, Snowflake } from "@nyxjs/core";
import type { RouteStructure } from "../types";
import { RestMethods } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params|Modify Auto Moderation Rule JSON Params}
 */
export type ModifyAutoModerationRuleJsonParams = Partial<
    Pick<
        AutoModerationRuleStructure,
        "actions" | "enabled" | "event_type" | "exempt_channels" | "exempt_roles" | "name" | "trigger_metadata"
    >
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params|Create Auto Moderation Rule JSON Params}
 */
export type CreateAutoModerationRuleJsonParams = Pick<
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
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule|Delete Auto Moderation Rule}
     */
    public static deleteAutoModerationRule(
        guildId: Snowflake,
        ruleId: Snowflake,
        reason?: string
    ): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule|Modify Auto Moderation Rule}
     */
    public static modifyAutoModerationRule(
        guildId: Snowflake,
        ruleId: Snowflake,
        params: ModifyAutoModerationRuleJsonParams,
        reason?: string
    ): RouteStructure<AutoModerationRuleStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
            body: JSON.stringify(params),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule|Create Auto Moderation Rule}
     */
    public static createAutoModerationRule(
        guildId: Snowflake,
        params: CreateAutoModerationRuleJsonParams,
        reason?: string
    ): RouteStructure<AutoModerationRuleStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/auto-moderation/rules`,
            body: JSON.stringify(params),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule|Get Auto Moderation Rule}
     */
    public static getAutoModerationRule(
        guildId: Snowflake,
        ruleId: Snowflake
    ): RouteStructure<AutoModerationRuleStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild|List Auto Moderation Rules for Guild}
     */
    public static listAutoModerationRulesForGuild(guildId: Snowflake): RouteStructure<AutoModerationRuleStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/auto-moderation/rules`,
        };
    }
}
