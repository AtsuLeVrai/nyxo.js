import type { Integer, Snowflake } from "@nyxjs/core";
import type {
	StickerFormatTypes,
	StickerItemStructure,
	StickerPackStructure,
	StickerStructure,
	StickerTypes,
} from "@nyxjs/rest";
import { Base } from "./Base";
import type { User } from "./Users";

export class Sticker extends Base<StickerStructure> {
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
}

export class StickerItem extends Base<StickerItemStructure> {
	public formatType!: StickerFormatTypes;

	public id!: Snowflake;

	public name!: string;

	public constructor(data: Partial<StickerItemStructure>) {
		super(data);
	}
}

export { StickerFormatTypes, StickerTypes } from "@nyxjs/rest";
