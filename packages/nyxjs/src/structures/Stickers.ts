import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerPackStructure,
    StickerStructure,
    StickerTypes,
} from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class Sticker extends Base<StickerStructure> {
    /**
     * @deprecated This field is deprecated and will be removed in a future API version
     */
    public asset?: string;

    public available?: boolean;

    public description?: string | null;

    public formatType!: StickerFormatTypes;

    public guild_id?: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public packId?: Snowflake;

    public sortValue?: Integer;

    public tags!: string;

    public type!: StickerTypes;

    public user?: User;

    public constructor(data: Readonly<Partial<StickerStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<StickerStructure>>): void {
        if ("asset" in data) {
            if (data.asset === null) {
                this.asset = undefined;
            } else if (data.asset !== undefined) {
                this.asset = data.asset;
            }
        }

        if ("available" in data) {
            if (data.available === null) {
                this.available = undefined;
            } else if (data.available !== undefined) {
                this.available = data.available;
            }
        }

        if ("description" in data) {
            if (data.description === null) {
                this.description = null;
            } else if (data.description !== undefined) {
                this.description = data.description;
            }
        }

        if (data.format_type !== undefined) {
            this.formatType = data.format_type;
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guild_id = undefined;
            } else {
                this.guild_id = data.guild_id;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("pack_id" in data) {
            if (data.pack_id === null) {
                this.packId = undefined;
            } else {
                this.packId = data.pack_id;
            }
        }

        if ("sort_value" in data) {
            if (data.sort_value === null) {
                this.sortValue = undefined;
            } else {
                this.sortValue = data.sort_value;
            }
        }

        if (data.tags !== undefined) {
            this.tags = data.tags;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = User.from(data.user);
            }
        }
    }
}

export class StickerPack extends Base<StickerPackStructure> {
    public bannerAssetId?: Snowflake;

    public coverStickerId?: Snowflake;

    public description!: string;

    public id!: Snowflake;

    public name!: string;

    public skuId!: Snowflake;

    public stickers!: Sticker[];

    public constructor(data: Readonly<Partial<StickerPackStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<StickerPackStructure>>): void {
        if ("banner_asset_id" in data) {
            if (data.banner_asset_id === null) {
                this.bannerAssetId = undefined;
            } else {
                this.bannerAssetId = data.banner_asset_id;
            }
        }

        if ("cover_sticker_id" in data) {
            if (data.cover_sticker_id === null) {
                this.coverStickerId = undefined;
            } else {
                this.coverStickerId = data.cover_sticker_id;
            }
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.sku_id !== undefined) {
            this.skuId = data.sku_id;
        }

        if (data.stickers !== undefined) {
            this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
        }
    }
}

export class StickerItem extends Base<StickerItemStructure> {
    public formatType!: StickerFormatTypes;

    public id!: Snowflake;

    public name!: string;

    public constructor(data: Readonly<Partial<StickerItemStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<StickerItemStructure>>): void {
        if (data.format_type !== undefined) {
            this.formatType = data.format_type;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }
    }
}
