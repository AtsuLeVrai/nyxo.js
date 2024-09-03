import type { Integer, Snowflake } from "@nyxjs/core";
import type {
	StickerFormatTypes,
	StickerItemStructure,
	StickerPackStructure,
	StickerStructure,
	StickerTypes,
} from "@nyxjs/rest";
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

	public constructor(data: Partial<StickerStructure>) {
		super(data);
	}

	protected patch(data: Partial<StickerStructure>): void {
		this.formatType = data.format_type ?? this.formatType;
		this.id = data.id ?? this.id;
		this.name = data.name ?? this.name;
		this.tags = data.tags ?? this.tags;
		this.type = data.type ?? this.type;

		if ("asset" in data) {
			this.asset = data.asset;
		}
		if ("available" in data) {
			this.available = data.available;
		}
		if ("description" in data) {
			this.description = data.description;
		}
		if ("guild_id" in data) {
			this.guild_id = data.guild_id;
		}
		if ("pack_id" in data) {
			this.packId = data.pack_id;
		}
		if ("sort_value" in data) {
			this.sortValue = data.sort_value;
		}
		if ("user" in data) {
			this.user = data.user ? User.from(data.user) : undefined;
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

	public constructor(data: StickerPackStructure) {
		super(data);
	}

	protected patch(data: Partial<StickerPackStructure>): void {
		this.description = data.description ?? this.description;
		this.id = data.id ?? this.id;
		this.name = data.name ?? this.name;
		this.skuId = data.sku_id ?? this.skuId;

		if ("banner_asset_id" in data) {
			this.bannerAssetId = data.banner_asset_id;
		}
		if ("cover_sticker_id" in data) {
			this.coverStickerId = data.cover_sticker_id;
		}
		this.stickers = data.stickers
			? data.stickers.map((sticker) => Sticker.from(sticker))
			: this.stickers;
	}
}

export class StickerItem extends Base<StickerItemStructure> {
	public formatType!: StickerFormatTypes;
	public id!: Snowflake;
	public name!: string;

	public constructor(data: Partial<StickerItemStructure>) {
		super(data);
	}

	protected patch(data: Partial<StickerItemStructure>): void {
		this.formatType = data.format_type ?? this.formatType;
		this.id = data.id ?? this.id;
		this.name = data.name ?? this.name;
	}
}

export { StickerFormatTypes, StickerTypes } from "@nyxjs/rest";
