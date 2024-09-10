import type {
    ApplicationCommandOptionStructure,
    ApplicationCommandPermissionsStructure,
    ApplicationCommandStructure,
    ApplicationCommandTypes,
    Boolean,
    GuildApplicationCommandPermissionsStructure,
    IntegrationTypes,
    InteractionContextTypes,
    Locales,
    RestHttpResponseCodes,
    Snowflake,
} from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
 */
function editApplicationCommandPermissions(
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
function getApplicationCommandPermissions(
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
function getGuildApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake
): RestRequestOptions<GuildApplicationCommandPermissionsStructure[]> {
    return {
        method: "GET",
        path: `/applications/${applicationId}/guilds/${guildId}/commands/permissions`,
    };
}

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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
 */
function bulkOverwriteGuildApplicationCommands(
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
function deleteGuildApplicationCommand(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
 */
function modifyGuildApplicationCommand(
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
function getGuildApplicationCommand(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
 */

function createGuildApplicationCommand(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands-query-string-params}
 */
export type GetGuildApplicationCommandsQuery = {
    /**
     * Whether to include full localization dictionaries (name_localizations and description_localizations) in the returned objects, instead of the name_localized and description_localized fields. Default false.
     */
    with_localizations?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
 */
function getGuildApplicationCommands(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
 */
function bulkOverwriteGlobalApplicationCommands(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
 */
function deleteGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake
): RestRequestOptions<RestHttpResponseCodes.NoContent> {
    return {
        method: "DELETE",
        path: `/applications/${applicationId}/commands/${commandId}`,
    };
}

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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
 */
function modifyGlobalApplicationCommand(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
 */
function getGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake
): RestRequestOptions<ApplicationCommandStructure> {
    return {
        method: "GET",
        path: `/applications/${applicationId}/commands/${commandId}`,
    };
}

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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
 */
function createGlobalApplicationCommand(
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands-query-string-params}
 */
export type GetGlobalApplicationCommandsQuery = {
    /**
     * Whether to include full localization dictionaries (name_localizations and description_localizations) in the returned objects, instead of the name_localized and description_localized fields. Default false.
     */
    with_localizations?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
 */
function getGlobalApplicationCommands(
    applicationId: Snowflake,
    query?: GetGlobalApplicationCommandsQuery
): RestRequestOptions<ApplicationCommandStructure[]> {
    return {
        method: "GET",
        path: `/applications/${applicationId}/commands`,
        query,
    };
}

export const ApplicationCommandRoutes = {
    editApplicationCommandPermissions,
    getApplicationCommandPermissions,
    getGuildApplicationCommandPermissions,
    bulkOverwriteGuildApplicationCommands,
    deleteGuildApplicationCommand,
    modifyGuildApplicationCommand,
    getGuildApplicationCommand,
    createGuildApplicationCommand,
    getGuildApplicationCommands,
    bulkOverwriteGlobalApplicationCommands,
    deleteGlobalApplicationCommand,
    modifyGlobalApplicationCommand,
    getGlobalApplicationCommand,
    createGlobalApplicationCommand,
    getGlobalApplicationCommands,
};
