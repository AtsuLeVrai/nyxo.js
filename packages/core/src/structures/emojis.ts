import type { Snowflake } from "../markdown/index.js";
import type { UserStructure } from "./users.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object-emoji-structure|Emoji Structure}
 */
export interface EmojiStructure {
    /**
     * Whether this emoji is animated.
     */
    animated?: boolean;
    /**
     * Whether this emoji is available.
     */
    available?: boolean;
    /**
     * The ID of the emoji.
     */
    id: Snowflake | null;
    /**
     * Whether this emoji is managed.
     */
    managed?: boolean;
    /**
     * The name of the emoji.
     */
    name: string | null;
    /**
     * Whether this emoji must be wrapped in colons.
     */
    require_colons?: boolean;
    /**
     * The roles that are allowed to use this emoji.
     */
    roles?: Snowflake[];
    /**
     * The user that created this emoji.
     */
    user?: UserStructure;
}
