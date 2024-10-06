import { Buffer } from "node:buffer";
import type {
    ApplicationRoleConnectionStructure,
    ChannelStructure,
    ConnectionStructure,
    GuildMemberStructure,
    GuildStructure,
    Snowflake,
    UserStructure,
} from "@nyxjs/core";
import type { QueryStringParams, RouteStructure } from "../types";
import { RestMethods } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params|Update Current User Application Role Connection}
 */
export type UpdateCurrentUserApplicationRoleConnectionJsonParams = ApplicationRoleConnectionStructure;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params|Create Group DM JSON Params}
 */
export type CreateGroupDmJsonParams = {
    /**
     * Access tokens of users that have granted your app the gdm.join scope.
     */
    access_tokens: string[];
    /**
     * A dictionary of user ids to their respective nicknames.
     */
    nicks: Record<Snowflake, string>;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm-json-params|Create DM JSON Params}
 */
export type CreateDmJsonParams = {
    /**
     * The recipient to open a DM channel with.
     */
    recipient_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params|Get Current User Guilds Query String Params}
 */
export type GetCurrentGuildsQueryStringParams = QueryStringParams & {
    /**
     * Include approximate member and presence counts in response.
     */
    with_counts?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params|Modify Current User JSON Params}
 */
export type ModifyCurrentUserJsonParams = {
    /**
     * If passed, modifies the user's avatar.
     */
    avatar?: string | null;
    /**
     * If passed, modifies the user's banner.
     */
    banner?: string | null;
    /**
     * The user's username, if changed may cause the user's discriminator to be randomized.
     */
    username?: string;
};

export class UserRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params|Update Current User Application Role Connection}
     */
    public static updateCurrentUserApplicationRoleConnection(
        applicationId: Snowflake,
        params: UpdateCurrentUserApplicationRoleConnectionJsonParams
    ): RouteStructure<ApplicationRoleConnectionStructure> {
        return {
            method: RestMethods.Put,
            path: `/users/@me/applications/${applicationId}/role-connection`,
            body: Buffer.from(JSON.stringify(params)),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection|Get Current User Application Role Connection}
     */
    public static getCurrentUserApplicationRoleConnection(
        applicationId: Snowflake
    ): RouteStructure<ApplicationRoleConnectionStructure> {
        return {
            method: RestMethods.Get,
            path: `/users/@me/applications/${applicationId}/role-connection`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections|Get Current User Connections}
     */
    public static getCurrentUserConnections(): RouteStructure<ConnectionStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/users/@me/connections`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm|Create Group DM}
     * @see {@link https://discord.com/developers/docs/resources/user#create-dm|Create DM}
     */
    public static createDm(params: CreateDmJsonParams | CreateGroupDmJsonParams): RouteStructure<ChannelStructure> {
        return {
            method: RestMethods.Post,
            path: `/users/@me/channels`,
            body: Buffer.from(JSON.stringify(params)),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#leave-guild|Leave Guild}
     */
    public static leaveGuild(guildId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/users/@me/guilds/${guildId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member|Get Current User Guild Member}
     */
    public static getCurrentUserGuildMember(guildId: Snowflake): RouteStructure<GuildMemberStructure> {
        return {
            method: RestMethods.Get,
            path: `/users/@me/guilds/${guildId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds|Get Current User Guilds}
     * @todo Verify if GuildStructure is correct
     */
    public static getCurrentUserGuilds(
        params?: GetCurrentGuildsQueryStringParams
    ): RouteStructure<
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
    > {
        return {
            method: RestMethods.Get,
            path: `/users/@me/guilds`,
            query: params,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user|Modify Current User}
     */
    public static modifyCurrentUser(params: ModifyCurrentUserJsonParams): RouteStructure<UserStructure> {
        return {
            method: RestMethods.Patch,
            path: `/users/@me`,
            body: Buffer.from(JSON.stringify(params)),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-user|Get User}
     */
    public static getUser(userId: Snowflake): RouteStructure<UserStructure> {
        return {
            method: RestMethods.Get,
            path: `/users/${userId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/user#get-current-user|Get Current User}
     */
    public static getCurrentUser(): RouteStructure<UserStructure> {
        return {
            method: RestMethods.Get,
            path: `/users/@me`,
        };
    }
}
