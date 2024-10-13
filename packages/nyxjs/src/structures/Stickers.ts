import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerPackStructure,
    StickerStructure,
    StickerTypes,
} from "@nyxjs/core";
import { User } from "./Users";

export class StickerItem {
    public formatType!: StickerFormatTypes;

    public id!: Snowflake;

    public name!: string;

    public constructor(data: Partial<StickerItemStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerItemStructure>): void {
        if (data.format_type) this.formatType = data.format_type;
        if (data.id) this.id = data.id;
        if (data.name) this.name = data.name;
    }
}

export class Sticker {
    public available?: boolean | null;

    public description!: string | null;

    public formatType!: StickerFormatTypes;

    public guildId?: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public packId?: Snowflake;

    public sortValue?: Integer;

    public tags!: string;

    public type!: StickerTypes;

    public user?: User;

    public constructor(data: Partial<StickerStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerStructure>): void {
        if (data.available) this.available = data.available;
        if (data.description) this.description = data.description;
        if (data.format_type) this.formatType = data.format_type;
        if (data.guild_id) this.guildId = data.guild_id;
        if (data.id) this.id = data.id;
        if (data.name) this.name = data.name;
        if (data.pack_id) this.packId = data.pack_id;
        if (data.sort_value) this.sortValue = data.sort_value;
        if (data.tags) this.tags = data.tags;
        if (data.type) this.type = data.type;
        if (data.user) this.user = new User(data.user);
    }
}

export class StickerPack {
    public bannerAssetId?: Snowflake;

    public coverStickerId?: Snowflake;

    public description!: string;

    public id!: Snowflake;

    public name!: string;

    public skuId!: Snowflake;

    public stickers!: Sticker[];

    public constructor(data: Partial<StickerPackStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StickerPackStructure>): void {
        if (data.banner_asset_id) this.bannerAssetId = data.banner_asset_id;
        if (data.cover_sticker_id) this.coverStickerId = data.cover_sticker_id;
        if (data.description) this.description = data.description;
        if (data.id) this.id = data.id;
        if (data.name) this.name = data.name;
        if (data.sku_id) this.skuId = data.sku_id;
        if (data.stickers) this.stickers = data.stickers.map((sticker) => new Sticker(sticker));
    }
}
