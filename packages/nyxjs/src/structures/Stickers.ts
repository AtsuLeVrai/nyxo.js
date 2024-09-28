import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerStructure,
    StickerTypes,
    StickerPackStructure,
} from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class StickerItem extends Base<StickerItemStructure> {
    public formatType: StickerFormatTypes;

    public id: Snowflake;

    public name: string;

    public constructor(data: Partial<StickerItemStructure> = {}) {
        super();
        this.formatType = data.format_type!;
        this.id = data.id!;
        this.name = data.name!;
    }
}

export class Sticker extends Base<StickerStructure> {
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
}

export class StickerPack extends Base<StickerPackStructure> {
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
}
