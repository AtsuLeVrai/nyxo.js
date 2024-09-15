import type {
    ApplicationCommandOptionStructure,
    ApplicationCommandPermissionsStructure,
    ApplicationCommandStructure,
    ApplicationCommandTypes,
    Boolean,
    GuildApplicationCommandPermissionsStructure,
    IntegrationTypes,
    InteractionCallbackResponseStructure,
    InteractionContextTypes,
    InteractionResponseStructure,
    Locales,
    MessageStructure,
    RestHttpResponseCodes,
    Snowflake,
} from "@nyxjs/core";
import { FileManager } from "../globals/FileManager";
import type { RestRequestOptions } from "../types/rest";
import type {
    EditWebhookMessageJSONFormParams,
    ExecuteWebhookJSONFormParams,
    ExecuteWebhookQueryStringParams,
    WebhookMessageQueryStringParams,
} from "./webhooks";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export type EditApplicationCommandPermissionsJSONParams = {
    /**
     * Permissions for the command in the guild
     */
    permissions: ApplicationCommandPermissionsStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands-json-params}
 */
export type BulkOverwriteGuildApplicationCommandsJSONParams = {
    /**
     * Interaction context(s) where the command can be used, defaults to all contexts [0,1,2]
     */
    contexts: InteractionContextTypes[];
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions?: string | null;
    /**
     * Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true
     */
    default_permission?: boolean;
    /**
     * 1-100 character description
     */
    description: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: Record<Locales, string> | null;
    /**
     * Deprecated (use contexts instead); Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
     *
     * @deprecated use contexts instead
     */
    dm_permission?: boolean | null;
    /**
     * ID of the command, if known
     */
    id?: Snowflake;
    /**
     * Installation context(s) where the command is available, defaults to GUILD_INSTALL ([0])
     */
    integration_types: IntegrationTypes[];
    /**
     * Name of command, 1-32 characters
     */
    name: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: Record<Locales, string> | null;
    /**
     * Indicates whether the command is age-restricted
     */
    nsfw?: boolean;
    /**
     * Parameters for the command
     */
    options?: ApplicationCommandOptionStructure[];
    /**
     * Type of command, defaults 1 if not set
     */
    type?: ApplicationCommandTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
 */
export type ModifyGuildApplicationCommandJSONParams = {
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions?: string | null;
    /**
     * Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true
     */
    default_permission?: boolean;
    /**
     * 1-100 character description
     */
    description?: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: Record<Locales, string> | null;
    /**
     * Name of command, 1-32 characters
     */
    name?: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: Record<Locales, string> | null;
    /**
     * Indicates whether the command is age-restricted
     */
    nsfw?: boolean;
    /**
     * Parameters for the command, max of 25
     */
    options?: ApplicationCommandOptionStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export type CreateGuildApplicationCommandJSONParams = {
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions?: string | null;
    /**
     * Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true
     */
    default_permission?: boolean;
    /**
     * 1-100 character description for CHAT_INPUT commands
     */
    description?: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: Record<Locales, string> | null;
    /**
     * Name of command, 1-32 characters
     */
    name: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: Record<Locales, string> | null;
    /**
     * Indicates whether the command is age-restricted
     */
    nsfw?: boolean;
    /**
     * Parameters for the command, max of 25
     */
    options?: ApplicationCommandOptionStructure[];
    /**
     * Type of command, defaults 1 if not set
     */
    type?: ApplicationCommandTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands-query-string-params}
 */
export type GetGuildApplicationCommandsQuery = {
    /**
     * Whether to include full localization dictionaries (name_localizations and description_localizations) in the returned objects, instead of the name_localized and description_localized fields. Default false.
     */
    with_localizations?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export type ModifyGlobalApplicationCommandJSONParams = {
    /**
     * Interaction context(s) where the command can be used
     */
    contexts?: InteractionContextTypes[];
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions?: string | null;
    /**
     * Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true
     */
    default_permission?: boolean;
    /**
     * 1-100 character description
     */
    description?: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: Record<Locales, string> | null;
    /**
     * Deprecated (use contexts instead); Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
     *
     * @deprecated use contexts instead
     */
    dm_permission?: boolean | null;
    /**
     * Installation context(s) where the command is available
     */
    integration_types?: IntegrationTypes[];
    /**
     * Name of command, 1-32 characters
     */
    name?: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: Record<Locales, string> | null;
    /**
     * Indicates whether the command is age-restricted
     */
    nsfw?: boolean;
    /**
     * Parameters for the command
     */
    options?: ApplicationCommandOptionStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export type CreateGlobalApplicationCommandJSONParams = {
    /**
     * Interaction context(s) where the command can be used
     */
    contexts?: InteractionContextTypes[];
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions?: string | null;
    /**
     * Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true
     */
    default_permission?: boolean;
    /**
     * 1-100 character description for CHAT_INPUT commands
     */
    description?: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: Record<Locales, string> | null;
    /**
     * Deprecated (use contexts instead); Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
     *
     * @deprecated use contexts instead
     */
    dm_permission?: boolean | null;
    /**
     * Installation context(s) where the command is available
     */
    integration_types?: IntegrationTypes[];
    /**
     * Name of command, 1-32 characters
     */
    name: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: Record<Locales, string> | null;
    /**
     * Indicates whether the command is age-restricted
     */
    nsfw?: boolean;
    /**
     * Parameters for the command, max of 25
     */
    options?: ApplicationCommandOptionStructure[];
    /**
     * Type of command, defaults 1 if not set
     */
    type?: ApplicationCommandTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands-query-string-params}
 */
export type GetGlobalApplicationCommandsQuery = {
    /**
     * Whether to include full localization dictionaries (name_localizations and description_localizations) in the returned objects, instead of the name_localized and description_localized fields. Default false.
     */
    with_localizations?: Boolean;
};

export class ApplicationCommandRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
     */
    public static getGlobalApplicationCommands(
        applicationId: Snowflake,
        query?: GetGlobalApplicationCommandsQuery
    ): RestRequestOptions<ApplicationCommandStructure[]> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/commands`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
     */
    public static createGlobalApplicationCommand(
        applicationId: Snowflake,
        json: CreateGlobalApplicationCommandJSONParams
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "POST",
            path: `/applications/${applicationId}/commands`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
     */
    public static getGlobalApplicationCommand(
        applicationId: Snowflake,
        commandId: Snowflake
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/commands/${commandId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
     */
    public static modifyGlobalApplicationCommand(
        applicationId: Snowflake,
        commandId: Snowflake,
        json: ModifyGlobalApplicationCommandJSONParams
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "PATCH",
            path: `/applications/${applicationId}/commands/${commandId}`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
     */
    public static deleteGlobalApplicationCommand(
        applicationId: Snowflake,
        commandId: Snowflake
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/applications/${applicationId}/commands/${commandId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
     */
    public static bulkOverwriteGlobalApplicationCommands(
        applicationId: Snowflake,
        json: BulkOverwriteGuildApplicationCommandsJSONParams
    ): RestRequestOptions<ApplicationCommandStructure[]> {
        return {
            method: "PUT",
            path: `/applications/${applicationId}/commands`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
     */
    public static getGuildApplicationCommands(
        applicationId: Snowflake,
        guildId: Snowflake,
        query?: GetGuildApplicationCommandsQuery
    ): RestRequestOptions<ApplicationCommandStructure[]> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/guilds/${guildId}/commands`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
     */
    public static createGuildApplicationCommand(
        applicationId: Snowflake,
        guildId: Snowflake,
        json: CreateGuildApplicationCommandJSONParams
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "POST",
            path: `/applications/${applicationId}/guilds/${guildId}/commands`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
     */
    public static modifyGuildApplicationCommand(
        applicationId: Snowflake,
        guildId: Snowflake,
        commandId: Snowflake,
        json: ModifyGuildApplicationCommandJSONParams
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "PATCH",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
     */
    public static getGuildApplicationCommand(
        applicationId: Snowflake,
        guildId: Snowflake,
        commandId: Snowflake
    ): RestRequestOptions<ApplicationCommandStructure> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
     */
    public static bulkOverwriteGuildApplicationCommands(
        applicationId: Snowflake,
        guildId: Snowflake,
        json: BulkOverwriteGuildApplicationCommandsJSONParams
    ): RestRequestOptions<ApplicationCommandStructure[]> {
        return {
            method: "PUT",
            path: `/applications/${applicationId}/guilds/${guildId}/commands`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
     */
    public static deleteGuildApplicationCommand(
        applicationId: Snowflake,
        guildId: Snowflake,
        commandId: Snowflake
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
     */
    public static editApplicationCommandPermissions(
        applicationId: Snowflake,
        guildId: Snowflake,
        commandId: Snowflake,
        json: EditApplicationCommandPermissionsJSONParams
    ): RestRequestOptions<GuildApplicationCommandPermissionsStructure> {
        return {
            method: "PUT",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
     */
    public static getApplicationCommandPermissions(
        applicationId: Snowflake,
        guildId: Snowflake,
        commandId: Snowflake
    ): RestRequestOptions<GuildApplicationCommandPermissionsStructure> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
     */
    public static getGuildApplicationCommandPermissions(
        applicationId: Snowflake,
        guildId: Snowflake
    ): RestRequestOptions<GuildApplicationCommandPermissionsStructure[]> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/guilds/${guildId}/commands/permissions`,
        };
    }
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response-query-string-params}
 */
export type CreateInteractionResponseQuery = {
    /**
     * Whether to include a [interaction callback response] as the response instead of a 204
     */
    with_response?: Boolean;
};

export class InteractionRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
     */
    public static deleteFollowupMessage(
        applicationId: Snowflake,
        token: string,
        messageId: Snowflake
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/webhooks/${applicationId}/${token}/messages/${messageId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
     */
    public static editFollowupMessage(
        applicationId: Snowflake,
        token: string,
        messageId: Snowflake,
        json: EditWebhookMessageJSONFormParams,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        const formData = FileManager.createFormData(
            Object.fromEntries(Object.entries(json).filter(([key]) => key !== "files")),
            json.files
        );

        return {
            method: "PATCH",
            path: `/webhooks/${applicationId}/${token}/messages/${messageId}`,
            body: formData,
            query,
            headers: {
                "Content-Type": formData.getHeaders(),
            },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
     */
    public static getFollowupMessage(
        applicationId: Snowflake,
        token: string,
        messageId: Snowflake,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        return {
            method: "GET",
            path: `/webhooks/${applicationId}/${token}/messages/${messageId}`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
     */
    public static createFollowupMessage(
        applicationId: Snowflake,
        token: string,
        json: ExecuteWebhookJSONFormParams,
        query?: ExecuteWebhookQueryStringParams
    ): RestRequestOptions<MessageStructure | RestHttpResponseCodes.NoContent> {
        const formData = FileManager.createFormData(
            Object.fromEntries(Object.entries(json).filter(([key]) => key !== "files")),
            json.files
        );

        return {
            method: "POST",
            path: `/webhooks/${applicationId}/${token}`,
            body: formData,
            query,
            headers: {
                "Content-Type": formData.getHeaders(),
            },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
     */
    public static deleteOriginalInteractionResponse(
        applicationId: Snowflake,
        token: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/webhooks/${applicationId}/${token}/messages/@original`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
     */
    public static editOriginalInteractionResponse(
        applicationId: Snowflake,
        token: string,
        json: EditWebhookMessageJSONFormParams,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        const formData = FileManager.createFormData(
            Object.fromEntries(Object.entries(json).filter(([key]) => key !== "files")),
            json.files
        );

        return {
            method: "PATCH",
            path: `/webhooks/${applicationId}/${token}/messages/@original`,
            body: formData,
            query,
            headers: {
                "Content-Type": formData.getHeaders(),
            },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
     */
    public static getOriginalInteractionResponse(
        applicationId: Snowflake,
        token: string,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        return {
            method: "GET",
            path: `/webhooks/${applicationId}/${token}/messages/@original`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
     */
    public static createInteractionResponse(
        applicationId: Snowflake,
        token: string,
        json: InteractionResponseStructure,
        query?: CreateInteractionResponseQuery
    ): RestRequestOptions<InteractionCallbackResponseStructure> {
        return {
            method: "POST",
            path: `/interactions/${applicationId}/${token}/callback`,
            body: JSON.stringify(json),
            query,
        };
    }
}
