import type {
    DataUriSchema,
    GuildOnboardingStructure,
    GuildWidgetSettingsStructure,
    GuildWidgetStructure,
    Integer,
    IntegrationStructure,
    InviteMetadataStructure,
    InviteStructure,
    MfaLevels,
    RestHttpResponseCodes,
    RoleStructure,
    Snowflake,
    VoiceRegionStructure,
    WelcomeScreenStructure,
} from "@nyxjs/core";
import type { RestRequestOptions } from "../types/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding-json-params}
 */
export type ModifyGuildOnboardingJSONParams = Pick<
    GuildOnboardingStructure,
    "default_channel_ids" | "enabled" | "mode" | "prompts"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export type ModifyGuildWelcomeScreenJSONParams = WelcomeScreenStructure & {
    /**
     * Whether the welcome screen is enabled
     */
    enabled: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export enum GuildWidgetStyle {
    /**
     * Large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget
     */
    Banner1 = "banner1",
    /**
     * Smaller widget style with guild icon, name and online count. Split on the right with Discord logo
     */
    Banner2 = "banner2",
    /**
     * Large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right
     */
    Banner3 = "banner3",
    /**
     * Large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget and a "JOIN MY SERVER" button at the bottom
     */
    Banner4 = "banner4",
    /**
     * Shield style widget with Discord icon and guild members online count
     */
    Shield = "shield",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-query-string-params}
 */
export type GetGuildWidgetImageQueryStringParams = {
    /**
     * Style of the widget image returned
     */
    style?: GuildWidgetStyle;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export type BeginGuildPruneJSONParams = {
    /**
     * Whether pruned is returned, discouraged for large guilds
     */
    compute_prune_count: boolean;
    /**
     * Number of days to prune (1-30)
     */
    days: Integer;
    /**
     * Role(s) to include
     */
    include_roles?: Snowflake[];
    /**
     * Reason for the prune (deprecated)
     *
     * @deprecated Deprecated and will be removed in a future API version
     */
    reason?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export type GetGuildPruneCountQueryStringParams = Pick<BeginGuildPruneJSONParams, "days" | "include_roles">;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level-json-params}
 */
export type ModifyGuildMfaLevelJSONParams = {
    /**
     * Required MFA level for the guild
     */
    level: MfaLevels;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type ModifyGuildRoleJSONParams = Partial<
    Pick<RoleStructure, "color" | "hoist" | "mentionable" | "name" | "permissions" | "unicode_emoji"> & {
        /**
         * The role's icon image (if the guild has the ROLE_ICONS feature)
         */
        icon: DataUriSchema;
    }
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export type ModifyGuildRolePositionsJSONParams = Pick<RoleStructure, "id" | "position">;

export class GuildRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
     */
    public static modifyGuildOnboarding(
        guildId: Snowflake,
        json: ModifyGuildOnboardingJSONParams,
        reason?: string
    ): RestRequestOptions<GuildOnboardingStructure> {
        return {
            method: "PUT",
            path: `/guilds/${guildId}/onboarding`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
     */
    public static getGuildOnboarding(guildId: Snowflake): RestRequestOptions<GuildOnboardingStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/onboarding`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
     */
    public static modifyGuildWelcomeScreen(
        guildId: Snowflake,
        json: ModifyGuildWelcomeScreenJSONParams,
        reason?: string
    ): RestRequestOptions<WelcomeScreenStructure> {
        return {
            method: "PUT",
            path: `/guilds/${guildId}/welcome-screen`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
     */
    public static getGuildWelcomeScreen(guildId: Snowflake): RestRequestOptions<WelcomeScreenStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/welcome-screen`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
     */
    public static getGuildWidgetImage(
        guildId: Snowflake,
        query?: GetGuildWidgetImageQueryStringParams
    ): RestRequestOptions<string> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/widget.png`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
     */
    public static getGuildVanityURL(guildId: Snowflake): RestRequestOptions<
        Pick<
            InviteStructure & {
                uses: Integer;
            },
            "code" | "uses"
        >
    > {
        return {
            method: "GET",
            path: `/guilds/${guildId}/vanity-url`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
     */
    public static getGuildWidget(guildId: Snowflake): RestRequestOptions<GuildWidgetStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/widget.json`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
     */
    public static modifyGuildWidget(
        guildId: Snowflake,
        json: GuildWidgetSettingsStructure,
        reason?: string
    ): RestRequestOptions<GuildWidgetStructure> {
        return {
            method: "PATCH",
            path: `/guilds/${guildId}/widget`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
     */
    public static getGuildWidgetSettings(guildId: Snowflake): RestRequestOptions<GuildWidgetSettingsStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/widget`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
     */
    public static deleteGuildIntegration(
        guildId: Snowflake,
        integrationId: Snowflake
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/guilds/${guildId}/integrations/${integrationId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
     */
    public static getGuildIntegrations(guildId: Snowflake): RestRequestOptions<IntegrationStructure[]> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/integrations`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
     */
    public static getGuildInvites(
        guildId: Snowflake
    ): RestRequestOptions<(InviteMetadataStructure & InviteStructure)[]> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/invites`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
     */
    public static getGuildVoiceRegions(guildId: Snowflake): RestRequestOptions<VoiceRegionStructure[]> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/regions`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
     */
    public static beginGuildPrune(
        guildId: Snowflake,
        json: BeginGuildPruneJSONParams,
        reason?: string
    ): RestRequestOptions<{ pruned: Integer }> {
        return {
            method: "POST",
            path: `/guilds/${guildId}/prune`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
     */
    public static getGuildPruneCount(
        guildId: Snowflake,
        query?: GetGuildPruneCountQueryStringParams
    ): RestRequestOptions<{ pruned: Integer }> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/prune`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
     */
    public static deleteGuildRole(
        guildId: Snowflake,
        roleId: Snowflake,
        reason?: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/guilds/${guildId}/roles/${roleId}`,
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level}
     */
    public static modifyGuildMfaLevel(
        guildId: Snowflake,
        json: ModifyGuildMfaLevelJSONParams,
        reason?: string
    ): RestRequestOptions<MfaLevels> {
        return {
            method: "POST",
            path: `/guilds/${guildId}/mfa`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
     */
    public static modifyGuildRole(
        guildId: Snowflake,
        roleId: Snowflake,
        json: ModifyGuildRoleJSONParams,
        reason?: string
    ): RestRequestOptions<RoleStructure> {
        return {
            method: "PATCH",
            path: `/guilds/${guildId}/roles/${roleId}`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
     */
    public static modifyGuildRolePositions(
        guildId: Snowflake,
        json: ModifyGuildRolePositionsJSONParams[],
        reason?: string
    ): RestRequestOptions<RoleStructure[]> {
        return {
            method: "PATCH",
            path: `/guilds/${guildId}/roles`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    // TODO: Add missing routes
}
