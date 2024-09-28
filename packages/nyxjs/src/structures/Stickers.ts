import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerPackStructure,
    StickerStructure,
    StickerTypes,
} from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";
import { User } from "./Users";

export class StickerItem extends BaseStructure<StickerItemStructure> {
    public formatType: StickerFormatTypes;

    public id: Snowflake;

    public name: string;

    public constructor(data: Partial<StickerItemStructure> = {}) {
        super();
        this.formatType = data.format_type!;
        this.id = data.id!;
        this.name = data.name!;
    }

    public toJSON(): StickerItemStructure {
        return {
            format_type: this.formatType,
            id: this.id,
            name: this.name,
        };
    }
}

export class Sticker extends BaseStructure<StickerStructure> {
    public available?: boolean | null;

    public description: string | null;

    public formatType: StickerFormatTypes;

    public guildId?: Snowflake;

    public id: Snowflake;

    public name: string;

    public packId?: Snowflake;

    public sortValue?: Integer;

    public tags: string;

    public type: StickerTypes;

    public user?: User;

    public constructor(data: Partial<StickerStructure> = {}) {
        super();
        this.available = data.available;
        this.description = data.description!;
        this.formatType = data.format_type!;
        this.guildId = data.guild_id;
        this.id = data.id!;
        this.name = data.name!;
        this.packId = data.pack_id;
        this.sortValue = data.sort_value;
        this.tags = data.tags!;
        this.type = data.type!;
        this.user = User.from(data.user);
    }

    public toJSON(): StickerStructure {
        return {
            available: this.available,
            description: this.description,
            format_type: this.formatType,
            guild_id: this.guildId,
            id: this.id,
            name: this.name,
            pack_id: this.packId,
            sort_value: this.sortValue,
            tags: this.tags,
            type: this.type,
            user: this.user?.toJSON(),
        };
    }
}

export class StickerPack extends BaseStructure<StickerPackStructure> {
    public bannerAssetId?: Snowflake;

    public coverStickerId?: Snowflake;

    public description: string;

    public id: Snowflake;

    public name: string;

    public skuId: Snowflake;

    public stickers: Sticker[];

    public constructor(data: Partial<StickerPackStructure> = {}) {
        super();
        this.bannerAssetId = data.banner_asset_id;
        this.coverStickerId = data.cover_sticker_id;
        this.description = data.description!;
        this.id = data.id!;
        this.name = data.name!;
        this.skuId = data.sku_id!;
        this.stickers = data.stickers!.map((sticker) => new Sticker(sticker));
    }

    public toJSON(): StickerPackStructure {
        return {
            banner_asset_id: this.bannerAssetId,
            cover_sticker_id: this.coverStickerId,
            description: this.description,
            id: this.id,
            name: this.name,
            sku_id: this.skuId,
            stickers: this.stickers.map((sticker) => sticker.toJSON()),
        };
    }
}
