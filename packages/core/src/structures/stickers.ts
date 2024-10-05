import type { Integer, Snowflake } from "../markdown";
import type { UserStructure } from "./users";

/**
 * Enum representing the different formats a sticker can have.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types|Sticker Format Types}
 */
export enum StickerFormatTypes {
    PNG = 1,
    APNG = 2,
    LOTTIE = 3,
    GIF = 4,
}

/**
 * Enum representing the different types of stickers.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types|Sticker Types}
 */
export enum StickerTypes {
    /**
     * An official sticker in a pack.
     */
    Standard = 1,
    /**
     * A sticker uploaded to a guild for the guild's members.
     */
    Guild = 2,
}

/**
 * Type representing the structure of a sticker pack.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure|Sticker Pack Structure}
 */
export type StickerPackStructure = {
    /**
     * ID of the sticker pack's banner image.
     */
    banner_asset_id?: Snowflake;
    /**
     * ID of a sticker in the pack which is shown as the pack's icon.
     */
    cover_sticker_id?: Snowflake;
    /**
     * Description of the sticker pack.
     */
    description: string;
    /**
     * ID of the sticker pack.
     */
    id: Snowflake;
    /**
     * Name of the sticker pack.
     */
    name: string;
    /**
     * ID of the pack's SKU.
     */
    sku_id: Snowflake;
    /**
     * The stickers in the pack.
     */
    stickers: StickerStructure[];
};

/**
 * Type representing the structure of a sticker item.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure|Sticker Item Structure}
 */
export type StickerItemStructure = {
    /**
     * Type of sticker format.
     */
    format_type: StickerFormatTypes;
    /**
     * ID of the sticker.
     */
    id: Snowflake;
    /**
     * Name of the sticker.
     */
    name: string;
};

/**
 * Type representing the structure of a sticker.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure|Sticker Structure}
 */
export type StickerStructure = {
    /**
     * Whether this guild sticker can be used, may be false due to loss of Server Boosts.
     */
    available?: boolean | null;
    /**
     * Description of the sticker.
     */
    description: string | null;
    /**
     * Type of sticker format.
     */
    format_type: StickerFormatTypes;
    /**
     * ID of the guild that owns this sticker.
     */
    guild_id?: Snowflake;
    /**
     * ID of the sticker.
     */
    id: Snowflake;
    /**
     * Name of the sticker.
     */
    name: string;
    /**
     * For standard stickers, ID of the pack the sticker is from.
     */
    pack_id?: Snowflake;
    /**
     * The standard sticker's sort order within its pack.
     */
    sort_value?: Integer;
    /**
     * Autocomplete/suggestion tags for the sticker (max 200 characters).
     */
    tags: string;
    /**
     * Type of sticker.
     */
    type: StickerTypes;
    /**
     * The user that uploaded the guild sticker.
     */
    user?: UserStructure;
};
