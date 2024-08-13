import type { Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
	/**
	 * Role can be selected by members in an onboarding prompt
	 */
	InPrompt = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export type RoleTags = {
	/**
	 * Whether this role is available for purchase
	 */
	available_for_purchase?: null;
	/**
	 * The id of the bot this role belongs to
	 */
	bot_id?: Snowflake;
	/**
	 * Whether this role is a guild's linked role
	 */
	guild_connections?: null;
	/**
	 * The id of the integration this role belongs to
	 */
	integration_id?: Snowflake;
	/**
	 * Whether this is the guild's Booster role
	 */
	premium_subscriber?: null;
	/**
	 * The id of this role's subscription sku and listing
	 */
	subscription_listing_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export type RoleStructure = {
	/**
	 * The role's color
	 */
	color: Integer;
	/**
	 * The role's flags
	 */
	flags: RoleFlags;
	/**
	 * Whether the role is hoisted
	 */
	hoist: boolean;
	/**
	 * The role's icon hash
	 */
	icon?: string | null;
	/**
	 * The role's ID
	 */
	id: Snowflake;
	/**
	 * Whether the role is managed
	 */
	managed: boolean;
	/**
	 * Whether the role is mentionable
	 */
	mentionable: boolean;
	/**
	 * The role's name
	 */
	name: string;
	/**
	 * The role's permissions
	 */
	permissions: string;
	/**
	 * The role's position
	 */
	position: Integer;
	/**
	 * The role's tags
	 */
	tags?: RoleTags;
	/**
	 * The role's unicode emoji
	 */
	unicode_emoji?: string | null;
};
