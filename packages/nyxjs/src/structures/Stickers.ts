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
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface StickerItemSchema {
    readonly formatType: StickerFormatTypes | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
}

export class StickerItem extends Base<StickerItemStructure, StickerItemSchema> implements StickerItemSchema {
    #formatType: StickerFormatTypes | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;

    constructor(data: Partial<StickerItemStructure>) {
        super();
        this.patch(data);
    }

    get formatType(): StickerFormatTypes | null {
        return this.#formatType;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    static from(data: Partial<StickerItemStructure>): StickerItem {
        return new StickerItem(data);
    }

    patch(data: Partial<StickerItemStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#formatType = data.format_type ?? this.#formatType;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJson(): Partial<StickerItemStructure> {
        return {
            format_type: this.#formatType ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): StickerItemSchema {
        return {
            formatType: this.#formatType,
            id: this.#id,
            name: this.#name,
        };
    }

    clone(): StickerItem {
        return new StickerItem(this.toJson());
    }

    reset(): void {
        this.#formatType = null;
        this.#id = null;
        this.#name = null;
    }

    equals(other: Partial<StickerItem>): boolean {
        return Boolean(this.#formatType === other.formatType && this.#id === other.id && this.#name === other.name);
    }
}

export interface StickerSchema {
    readonly available: boolean | null;
    readonly description: string | null;
    readonly formatType: StickerFormatTypes | null;
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly packId: Snowflake | null;
    readonly sortValue: Integer | null;
    readonly tags: string | null;
    readonly type: StickerTypes | null;
    readonly user: User | null;
}

export class Sticker extends Base<StickerStructure, StickerSchema> implements StickerSchema {
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
    #user: User | null = null;

    constructor(data: Partial<StickerStructure>) {
        super();
        this.patch(data);
    }

    get available(): boolean | null {
        return this.#available;
    }

    get description(): string | null {
        return this.#description;
    }

    get formatType(): StickerFormatTypes | null {
        return this.#formatType;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get packId(): Snowflake | null {
        return this.#packId;
    }

    get sortValue(): Integer | null {
        return this.#sortValue;
    }

    get tags(): string | null {
        return this.#tags;
    }

    get type(): StickerTypes | null {
        return this.#type;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<StickerStructure>): Sticker {
        return new Sticker(data);
    }

    patch(data: Partial<StickerStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#available = Boolean(data.available ?? this.#available);
        this.#description = data.description ?? this.#description;
        this.#formatType = data.format_type ?? this.#formatType;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#packId = data.pack_id ?? this.#packId;
        this.#sortValue = data.sort_value ?? this.#sortValue;
        this.#tags = data.tags ?? this.#tags;
        this.#type = data.type ?? this.#type;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<StickerStructure> {
        return {
            available: this.#available ?? undefined,
            description: this.#description ?? undefined,
            format_type: this.#formatType ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            pack_id: this.#packId ?? undefined,
            sort_value: this.#sortValue ?? undefined,
            tags: this.#tags ?? undefined,
            type: this.#type ?? undefined,
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): StickerSchema {
        return {
            available: this.#available,
            description: this.#description,
            formatType: this.#formatType,
            guildId: this.#guildId,
            id: this.#id,
            name: this.#name,
            packId: this.#packId,
            sortValue: this.#sortValue,
            tags: this.#tags,
            type: this.#type,
            user: this.#user,
        };
    }

    clone(): Sticker {
        return new Sticker(this.toJson());
    }

    reset(): void {
        this.#available = null;
        this.#description = null;
        this.#formatType = null;
        this.#guildId = null;
        this.#id = null;
        this.#name = null;
        this.#packId = null;
        this.#sortValue = null;
        this.#tags = null;
        this.#type = null;
        this.#user = null;
    }

    equals(other: Partial<Sticker>): boolean {
        return Boolean(
            this.#available === other.available &&
                this.#description === other.description &&
                this.#formatType === other.formatType &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#packId === other.packId &&
                this.#sortValue === other.sortValue &&
                this.#tags === other.tags &&
                this.#type === other.type &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}

export interface StickerPackSchema {
    readonly bannerAssetId: Snowflake | null;
    readonly coverStickerId: Snowflake | null;
    readonly description: string | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly skuId: Snowflake | null;
    readonly stickers: Sticker[];
}

export class StickerPack extends Base<StickerPackStructure, StickerPackSchema> implements StickerPackSchema {
    #bannerAssetId: Snowflake | null = null;
    #coverStickerId: Snowflake | null = null;
    #description: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #skuId: Snowflake | null = null;
    #stickers: Sticker[] = [];

    constructor(data: Partial<StickerPackStructure>) {
        super();
        this.patch(data);
    }

    get bannerAssetId(): Snowflake | null {
        return this.#bannerAssetId;
    }

    get coverStickerId(): Snowflake | null {
        return this.#coverStickerId;
    }

    get description(): string | null {
        return this.#description;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get skuId(): Snowflake | null {
        return this.#skuId;
    }

    get stickers(): Sticker[] {
        return [...this.#stickers];
    }

    static from(data: Partial<StickerPackStructure>): StickerPack {
        return new StickerPack(data);
    }

    patch(data: Partial<StickerPackStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#bannerAssetId = data.banner_asset_id ?? this.#bannerAssetId;
        this.#coverStickerId = data.cover_sticker_id ?? this.#coverStickerId;
        this.#description = data.description ?? this.#description;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#skuId = data.sku_id ?? this.#skuId;

        if (data.stickers && Array.isArray(data.stickers)) {
            this.#stickers = data.stickers.map((sticker) => Sticker.from(sticker));
        }
    }

    toJson(): Partial<StickerPackStructure> {
        return {
            banner_asset_id: this.#bannerAssetId ?? undefined,
            cover_sticker_id: this.#coverStickerId ?? undefined,
            description: this.#description ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            sku_id: this.#skuId ?? undefined,
            stickers: this.#stickers.map((sticker) => sticker.toJson()) as StickerStructure[],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): StickerPackSchema {
        return {
            bannerAssetId: this.#bannerAssetId,
            coverStickerId: this.#coverStickerId,
            description: this.#description,
            id: this.#id,
            name: this.#name,
            skuId: this.#skuId,
            stickers: [...this.#stickers],
        };
    }

    clone(): StickerPack {
        return new StickerPack(this.toJson());
    }

    reset(): void {
        this.#bannerAssetId = null;
        this.#coverStickerId = null;
        this.#description = null;
        this.#id = null;
        this.#name = null;
        this.#skuId = null;
        this.#stickers = [];
    }

    equals(other: Partial<StickerPack>): boolean {
        return Boolean(
            this.#bannerAssetId === other.bannerAssetId &&
                this.#coverStickerId === other.coverStickerId &&
                this.#description === other.description &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#skuId === other.skuId &&
                this.#stickers.length === other.stickers?.length &&
                this.#stickers.every((sticker, index) => sticker.equals(other.stickers?.[index] ?? {})),
        );
    }
}
