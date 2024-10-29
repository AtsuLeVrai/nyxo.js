import type {
    Integer,
    Snowflake,
    StickerFormatTypes,
    StickerItemStructure,
    StickerPackStructure,
    StickerStructure,
    StickerTypes,
    UserStructure,
} from "@nyxjs/core";
import { User } from "./Users.js";

export class StickerItem {
    #formatType: StickerFormatTypes | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;

    constructor(data: Partial<StickerItemStructure>) {
        this.patch(data);
    }

    get formatType() {
        return this.#formatType;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    patch(data: Partial<StickerItemStructure>): void {
        if (!data) {
            return;
        }

        this.#formatType = data.format_type ?? this.#formatType;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJSON(): Partial<StickerItemStructure> {
        return {
            format_type: this.#formatType ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }
}

export class Sticker {
    #available: boolean | null = null;
    #description: string | null = null;
    #formatType: StickerFormatTypes | null = null;
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #packId: Snowflake | null = null;
    #sortValue: Integer | null = null;
    #tags: string | null = null;
    #type: StickerTypes | null = null;
    #user?: User;

    constructor(data: Partial<StickerStructure>) {
        this.patch(data);
    }

    get available() {
        return this.#available;
    }

    get description() {
        return this.#description;
    }

    get formatType() {
        return this.#formatType;
    }

    get guildId() {
        return this.#guildId;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get packId() {
        return this.#packId;
    }

    get sortValue() {
        return this.#sortValue;
    }

    get tags() {
        return this.#tags;
    }

    get type() {
        return this.#type;
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<StickerStructure>): void {
        if (!data) {
            return;
        }

        this.#available = data.available ?? this.#available;
        this.#description = data.description ?? this.#description;
        this.#formatType = data.format_type ?? this.#formatType;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#packId = data.pack_id ?? this.#packId;
        this.#sortValue = data.sort_value ?? this.#sortValue;
        this.#tags = data.tags ?? this.#tags;
        this.#type = data.type ?? this.#type;

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<StickerStructure> {
        return {
            available: this.#available,
            description: this.#description,
            format_type: this.#formatType ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            pack_id: this.#packId ?? undefined,
            sort_value: this.#sortValue ?? undefined,
            tags: this.#tags ?? undefined,
            type: this.#type ?? undefined,
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}

export class StickerPack {
    #bannerAssetId: Snowflake | null = null;
    #coverStickerId: Snowflake | null = null;
    #description: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #skuId: Snowflake | null = null;
    #stickers: Sticker[] = [];

    constructor(data: Partial<StickerPackStructure>) {
        this.patch(data);
    }

    get bannerAssetId() {
        return this.#bannerAssetId;
    }

    get coverStickerId() {
        return this.#coverStickerId;
    }

    get description() {
        return this.#description;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get skuId() {
        return this.#skuId;
    }

    get stickers() {
        return this.#stickers;
    }

    patch(data: Partial<StickerPackStructure>): void {
        if (!data) {
            return;
        }

        this.#bannerAssetId = data.banner_asset_id ?? this.#bannerAssetId;
        this.#coverStickerId = data.cover_sticker_id ?? this.#coverStickerId;
        this.#description = data.description ?? this.#description;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#skuId = data.sku_id ?? this.#skuId;

        if (data.stickers) {
            this.#stickers = data.stickers.map((sticker) => new Sticker(sticker));
        }
    }

    toJSON(): Partial<StickerPackStructure> {
        return {
            banner_asset_id: this.#bannerAssetId ?? undefined,
            cover_sticker_id: this.#coverStickerId ?? undefined,
            description: this.#description ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            sku_id: this.#skuId ?? undefined,
            stickers: this.#stickers?.map((sticker) => sticker.toJSON()) as StickerStructure[],
        };
    }
}
