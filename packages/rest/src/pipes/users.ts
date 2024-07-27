import type { Boolean, DataURIScheme, Integer, Snowflake } from "@lunajs/core";
import type { ApplicationRoleConnectionStructure } from "../structures/users";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export type UpdateCurrentUserApplicationRoleConnectionParams = ApplicationRoleConnectionStructure & {};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export type CreateGroupDMParams = {
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
export type CreateDMParams = {
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
export type ModifyCurrentUserParams = {
	/**
	 * If passed, modifies the user's avatar
	 */
	avatar?: DataURIScheme | null;
	/**
	 * If passed, modifies the user's banner
	 */
	banner?: DataURIScheme | null;
	/**
	 * User's username, if changed may cause the user's discriminator to be randomized
	 */
	username?: string;
};
