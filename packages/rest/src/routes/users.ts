import type { Boolean, DataUriSchema, Integer, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../globals/rest";
import type { ChannelStructure } from "../structures/channels";
import type { GuildMemberStructure, GuildStructure } from "../structures/guilds";
import type { ApplicationRoleConnectionStructure, ConnectionStructure, UserStructure } from "../structures/users";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export type UpdateUserApplicationRoleConnectionJSONParams = {
	/**
	 * Object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected
	 */
	metadata?: Record<string, ApplicationRoleConnectionStructure>;
	/**
	 * The vanity name of the platform a bot has connected (max 50 characters)
	 */
	platform_name?: string | null;
	/**
	 * The username on the platform a bot has connected (max 100 characters)
	 */
	platform_username?: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
 */
export function updateUserApplicationRoleConnection(applicationId: Snowflake, json: UpdateUserApplicationRoleConnectionJSONParams): RestRequestOptions<ApplicationRoleConnectionStructure> {
	return {
		method: "PATCH",
		path: `/users/@me/applications/${applicationId}/role-connection`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
 */
export function getCurrentUserApplicationRoleConnection(applicationId: Snowflake): RestRequestOptions<ApplicationRoleConnectionStructure> {
	return {
		method: "GET",
		path: `/users/@me/applications/${applicationId}/role-connection`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
 */
export function getCurrentUserConnections(): RestRequestOptions<ConnectionStructure[]> {
	return {
		method: "GET",
		path: "/users/@me/connections",
	};
}

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
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
 */
export function createDM(json: CreateDMJSONParams | CreateGroupDMJSONParams): RestRequestOptions<ChannelStructure> {
	return {
		method: "POST",
		path: "/users/@me/channels",
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
 */
export function leaveGuild(guildId: Snowflake): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/users/@me/guilds/${guildId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
 */
export function getCurrentUserGuildMember(guildId: Snowflake): RestRequestOptions<GuildMemberStructure> {
	return {
		method: "GET",
		path: `/users/@me/guilds/${guildId}/member`,
	};
}

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
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
 */
export function getCurrentUserGuilds(query?: GetCurrentUserGuildsQueryStringParams): RestRequestOptions<Pick<GuildStructure, "approximate_member_count" | "approximate_presence_count" | "banner" | "features" | "icon" | "id" | "name" | "owner" | "permissions">[]> {
	return {
		method: "GET",
		path: "/users/@me/guilds",
		query,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export type ModifyCurrentUserJSONParams = {
	/**
	 * If passed, modifies the user's avatar
	 */
	avatar?: DataUriSchema | null;
	/**
	 * If passed, modifies the user's banner
	 */
	banner?: DataUriSchema | null;
	/**
	 * User's username, if changed may cause the user's discriminator to be randomized
	 */
	username?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
 */
export function modifyCurrentUser(json: ModifyCurrentUserJSONParams): RestRequestOptions<UserStructure> {
	return {
		method: "PATCH",
		path: "/users/@me",
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
 * @see {@link https://discord.com/developers/docs/resources/user#get-user}
 */
export function getUser(userId: Snowflake | "@me"): RestRequestOptions<UserStructure> {
	return {
		method: "GET",
		path: `/users/${userId}`,
	};
}
