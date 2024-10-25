import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerPackStructure,
    StickerStructure,
    StickerTypes,
} from "@nyxjs/core";
import { User } from "./Users.js";

export class StickerItem {
    formatType!: StickerFormatTypes;

    id!: Snowflake;

    name!: string;

    constructor(data: Partial<StickerItemStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerItemStructure>): void {
        if (data.format_type) {
            this.formatType = data.format_type;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.name) {
            this.name = data.name;
        }
    }
}

export class Sticker {
    available?: boolean | null;

    description!: string | null;

    formatType!: StickerFormatTypes;

    guildId?: Snowflake;

    id!: Snowflake;

    name!: string;

    packId?: Snowflake;

    sortValue?: Integer;

    tags!: string;

    type!: StickerTypes;

    user?: User;

    constructor(data: Partial<StickerStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerStructure>): void {
        if (data.available) {
            this.available = data.available;
        }
        if (data.description) {
            this.description = data.description;
        }
        if (data.format_type) {
            this.formatType = data.format_type;
        }
        if (data.guild_id) {
            this.guildId = data.guild_id;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.pack_id) {
            this.packId = data.pack_id;
        }
        if (data.sort_value) {
            this.sortValue = data.sort_value;
        }
        if (data.tags) {
            this.tags = data.tags;
        }
        if (data.type) {
            this.type = data.type;
        }
        if (data.user) {
            this.user = new User(data.user);
        }
    }
}

export class StickerPack {
    bannerAssetId?: Snowflake;

    coverStickerId?: Snowflake;

    description!: string;

    id!: Snowflake;

    name!: string;

    skuId!: Snowflake;

    stickers!: Sticker[];

    constructor(data: Partial<StickerPackStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerPackStructure>): void {
        if (data.banner_asset_id) {
            this.bannerAssetId = data.banner_asset_id;
        }
        if (data.cover_sticker_id) {
            this.coverStickerId = data.cover_sticker_id;
        }
        if (data.description) {
            this.description = data.description;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.sku_id) {
            this.skuId = data.sku_id;
        }
        if (data.stickers) {
            this.stickers = data.stickers.map((sticker) => new Sticker(sticker));
        }
    }
}
