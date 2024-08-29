import type { Integer, Snowflake } from "@nyxjs/core";
import type {
	StickerFormatTypes,
	StickerItemStructure,
	StickerPackStructure,
	StickerStructure,
	StickerTypes,
} from "@nyxjs/rest";
import { Base } from "./base";
import { User } from "./users";

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

	public toJSON(): StickerStructure {
		return {
			asset: this.asset,
			available: this.available,
			description: this.description,
			format_type: this.formatType,
			guild_id: this.guild_id,
			id: this.id,
			name: this.name,
			pack_id: this.packId,
			sort_value: this.sortValue,
			tags: this.tags,
			type: this.type,
			user: this.user?.toJSON(),
		};
	}

	protected patch(data: Partial<StickerStructure>): void {
		if (data.asset !== undefined) {
			this.asset = data.asset;
		}

		if (data.available !== undefined) {
			this.available = data.available;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.format_type !== undefined) {
			this.formatType = data.format_type;
		}

		if (data.guild_id !== undefined) {
			this.guild_id = data.guild_id;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.pack_id !== undefined) {
			this.packId = data.pack_id;
		}

		if (data.sort_value !== undefined) {
			this.sortValue = data.sort_value;
		}

		if (data.tags !== undefined) {
			this.tags = data.tags;
		}

		if (data.type !== undefined) {
			this.type = data.type;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
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

	protected patch(data: StickerPackStructure): void {
		if (data.banner_asset_id !== undefined) {
			this.bannerAssetId = data.banner_asset_id;
		}

		if (data.cover_sticker_id !== undefined) {
			this.coverStickerId = data.cover_sticker_id;
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

	public constructor(data: Partial<StickerItemStructure>) {
		super(data);
	}

	public toJSON(): StickerItemStructure {
		return {
			format_type: this.formatType,
			id: this.id,
			name: this.name,
		};
	}

	protected patch(data: Partial<StickerItemStructure>): void {
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

export { StickerFormatTypes, StickerTypes } from "@nyxjs/rest";
