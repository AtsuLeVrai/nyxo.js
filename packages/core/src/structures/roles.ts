import type { BitfieldResolvable } from "../managers/index.js";
import type { Integer, Snowflake } from "../markdown/index.js";

/**
 * Enum representing the role flags.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags|Role Flags}
 */
export enum RoleFlags {
    /**
     * Role can be selected by members in an onboarding prompt.
     */
    InPrompt = 1,
}

/**
 * Type representing the structure of role tags.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure|Role Tags Structure}
 */
export interface RoleTagsStructure {
    /**
     * Whether this role is available for purchase.
     */
    available_for_purchase?: null;
    /**
     * The id of the bot this role belongs to.
     */
    bot_id?: Snowflake;
    /**
     * Whether this role is a guild's linked role.
     */
    guild_connections?: null;
    /**
     * The id of the integration this role belongs to.
     */
    integration_id?: Snowflake;
    /**
     * Whether this is the guild's Booster role.
     */
    premium_subscriber?: null;
    /**
     * The id of this role's subscription sku and listing.
     */
    subscription_listing_id?: Snowflake;
}

/**
 * Type representing the structure of a role.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure|Role Structure}
 */
export interface RoleStructure {
    /**
     * The role's color encoded as an integer representation of hexadecimal color code.
     */
    color: Integer;
    /**
     * The role's flags combined as a bitfield.
     */
    flags: BitfieldResolvable<RoleFlags>;
    /**
     * Whether this role is pinned in the user listing.
     */
    hoist: boolean;
    /**
     * The role's icon hash.
     */
    icon?: string | null;
    /**
     * The role's id.
     */
    id: Snowflake;
    /**
     * Whether this role is managed by an integration.
     */
    managed: boolean;
    /**
     * Whether this role is mentionable.
     */
    mentionable: boolean;
    /**
     * The role's name.
     */
    name: string;
    /**
     * The role's permissions.
     */
    permissions: string;
    /**
     * The role's position.
     */
    position: Integer;
    /**
     * The role's tags.
     */
    tags?: RoleTagsStructure;
    /**
     * The role's unicode emoji.
     */
    unicode_emoji?: string | null;
}
