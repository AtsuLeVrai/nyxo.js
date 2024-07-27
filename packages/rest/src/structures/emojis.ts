import type { Snowflake } from "@nyxjs/core";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object-emoji-structure}
 */
export type EmojiStructure = {
	/**
	 * Whether this emoji is animated
	 */
	animated?: boolean;
	/**
	 * Whether this emoji can be used, may be false due to loss of Server Boosts
	 */
	available?: boolean;
	/**
	 * Emoji ID
	 */
	id: Snowflake | null;
	/**
	 * Whether this emoji is managed
	 */
	managed?: boolean;
	/**
	 * Emoji name
	 */
	name: string | null;
	/**
	 * Whether this emoji must be wrapped in colons
	 */
	require_colons?: boolean;
	/**
	 * Roles allowed to use this emoji
	 */
	roles?: Snowflake[];
	/**
	 * User that created this emoji
	 */
	user?: UserStructure;
};
