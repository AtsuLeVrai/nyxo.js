import type { Snowflake } from "@nyxjs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";
import type {
	CreateDMParams,
	CreateGroupDMParams,
	ModifyCurrentUserParams,
	UpdateCurrentUserApplicationRoleConnectionParams,
} from "../pipes/users";
import type { ChannelStructure } from "../structures/channels";
import type { GuildMemberStructure, GuildStructure } from "../structures/guilds";
import type { ApplicationRoleConnectionStructure, ConnectionStructure, UserStructure } from "../structures/users";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
 */
export function updateCurrentUserApplicationRoleConnection(applicationId: Snowflake, params: UpdateCurrentUserApplicationRoleConnectionParams): RESTMakeRequestOptions<ApplicationRoleConnectionStructure> {
	return {
		method: "PUT",
		path: `/users/@me/applications/${applicationId}/role-connection`,
		body: JSON.stringify(params),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
 */
export function getCurrentUserApplicationRoleConnection(applicationId: Snowflake): RESTMakeRequestOptions<ApplicationRoleConnectionStructure> {
	return {
		method: "GET",
		path: `/users/@me/applications/${applicationId}/role-connection`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
 */
export function getCurrentUserConnections(): RESTMakeRequestOptions<ConnectionStructure[]> {
	return {
		method: "GET",
		path: "/users/@me/connections",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
 */
export function createGroupDM<T extends boolean>(isDm: T, params: T extends true ? CreateGroupDMParams : CreateDMParams): RESTMakeRequestOptions<ChannelStructure> {
	return {
		method: "POST",
		path: "/users/@me/channels",
		body: JSON.stringify(params),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
 */
export function leaveGuild(guildId: Snowflake): RESTMakeRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/users/@me/guilds/${guildId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
 */
export function getCurrentUserGuildMember(guildId: Snowflake): RESTMakeRequestOptions<GuildMemberStructure> {
	return {
		method: "GET",
		path: `/users/@me/guilds/${guildId}/member`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
 */
export function getCurrentUserGuilds(): RESTMakeRequestOptions<Pick<GuildStructure, "approximate_member_count" | "approximate_presence_count" | "banner" | "features" | "icon" | "id" | "name" | "owner" | "permissions">[]> {
	return {
		method: "GET",
		path: "/users/@me/guilds",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
 */
export function modifyCurrentUser(params: ModifyCurrentUserParams): RESTMakeRequestOptions<UserStructure> {
	return {
		method: "PATCH",
		path: "/users/@me",
		body: JSON.stringify(params),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-user}
 */
export function getUser(userId: Snowflake): RESTMakeRequestOptions<UserStructure> {
	return {
		method: "GET",
		path: `/users/${userId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
 */
export function getCurrentUser(): RESTMakeRequestOptions<UserStructure> {
	return {
		method: "GET",
		path: "/users/@me",
	};
}
