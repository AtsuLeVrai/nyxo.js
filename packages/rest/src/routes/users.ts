import type {
    ApplicationRoleConnectionStructure,
    ChannelStructure,
    ConnectionStructure,
    GuildMemberStructure,
    GuildStructure,
    UserStructure,
} from "@nyxjs/api-types";
import type { Boolean, Integer, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export type UpdateUserApplicationRoleConnectionJSONParams = Partial<ApplicationRoleConnectionStructure>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export type CreateGroupDMJSONParams = {
    /**
     * Access tokens of users that have granted your app the gdm.join scope
     */
    access_tokens: string[];
    /**
     * A dictionary of user ids to their respective nicknames
     */
    nicks: Record<Snowflake, string>;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm-json-params}
 */
export type CreateDMJSONParams = {
    /**
     * The recipient to open a DM channel with
     */
    recipient_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export type GetCurrentUserGuildsQueryStringParams = {
    /**
     * Get guilds after this guild ID
     */
    after?: Snowflake;
    /**
     * Get guilds before this guild ID
     */
    before?: Snowflake;
    /**
     * Max number of guilds to return (1-200)
     */
    limit?: Integer;
    /**
     * Include approximate member and presence counts in response
     */
    with_counts?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export type ModifyCurrentUserJSONParams = Partial<Pick<UserStructure, "avatar" | "banner" | "username">>;

export const UserRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
     */
    updateUserApplicationRoleConnection: (
        applicationId: Snowflake,
        json: UpdateUserApplicationRoleConnectionJSONParams
    ): RestRequestOptions<ApplicationRoleConnectionStructure> => ({
        method: "PATCH",
        path: `/users/@me/applications/${applicationId}/role-connection`,
        body: JSON.stringify(json),
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
     */
    getCurrentUserApplicationRoleConnection: (
        applicationId: Snowflake
    ): RestRequestOptions<ApplicationRoleConnectionStructure> => ({
        method: "GET",
        path: `/users/@me/applications/${applicationId}/role-connection`,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
     */
    getCurrentUserConnections: (): RestRequestOptions<ConnectionStructure[]> => ({
        method: "GET",
        path: "/users/@me/connections",
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
     * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
     */
    createDM: (json: CreateDMJSONParams | CreateGroupDMJSONParams): RestRequestOptions<ChannelStructure> => ({
        method: "POST",
        path: "/users/@me/channels",
        body: JSON.stringify(json),
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
     */
    leaveGuild: (guildId: Snowflake): RestRequestOptions<RestHttpResponseCodes.NoContent> => ({
        method: "DELETE",
        path: `/users/@me/guilds/${guildId}`,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
     */
    getCurrentUserGuildMember: (guildId: Snowflake): RestRequestOptions<GuildMemberStructure> => ({
        method: "GET",
        path: `/users/@me/guilds/${guildId}/member`,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
     */
    getCurrentUserGuilds: (
        query?: GetCurrentUserGuildsQueryStringParams
    ): RestRequestOptions<
        Pick<
            GuildStructure,
            | "approximate_member_count"
            | "approximate_presence_count"
            | "banner"
            | "features"
            | "icon"
            | "id"
            | "name"
            | "owner"
            | "permissions"
        >[]
    > => ({
        method: "GET",
        path: "/users/@me/guilds",
        query,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
     */
    modifyCurrentUser: (json: ModifyCurrentUserJSONParams): RestRequestOptions<UserStructure> => ({
        method: "PATCH",
        path: "/users/@me",
        body: JSON.stringify(json),
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
     * @see {@link https://discord.com/developers/docs/resources/user#get-user}
     */
    getUser: (userId: Snowflake | "@me"): RestRequestOptions<UserStructure> => ({
        method: "GET",
        path: `/users/${userId}`,
    }),
};
