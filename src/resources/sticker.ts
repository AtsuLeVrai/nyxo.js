export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

export enum StickerType {
  Standard = 1,
  Guild = 2,
}

export interface StickerEntity {
  id: string;
  pack_id?: string;
  name: string;
  description: string | null;
  tags: string;
  type: StickerType;
  format_type: StickerFormatType;
  available?: boolean;
  guild_id?: string;
  user?: UserEntity;
  sort_value?: number;
}

export interface StickerItemEntity {
  id: string;
  name: string;
  format_type: StickerFormatType;
}

export interface StickerPackEntity {
  id: string;
  stickers: StickerEntity[];
  name: string;
  sku_id: string;
  cover_sticker_id?: string;
  description: string;
  banner_asset_id?: string;
}

export interface RESTStickerPacksResponseEntity {
  sticker_packs: StickerPackEntity[];
}

export interface RESTCreateGuildStickerFormParams
  extends DeepNonNullable<Pick<StickerEntity, "name" | "description" | "tags">> {
  file: FileInput;
}

export type RESTModifyGuildStickerJSONParams = Partial<
  Omit<RESTCreateGuildStickerFormParams, "file">
>;

export const StickerRoutes = {
  getSticker: (stickerId: string) => `/stickers/${stickerId}` as const,
  listStickerPacks: () => "/sticker-packs",
  getStickerPack: (packId: string) => `/sticker-packs/${packId}` as const,
  listGuildStickers: (guildId: string) => `/guilds/${guildId}/stickers` as const,
  getGuildSticker: (guildId: string, stickerId: string) =>
    `/guilds/${guildId}/stickers/${stickerId}` as const,
} as const satisfies RouteBuilder;

export class StickerRouter extends BaseRouter {
  getSticker(stickerId: string): Promise<StickerEntity> {
    return this.rest.get(StickerRoutes.getSticker(stickerId));
  }

  listStickerPacks(): Promise<RESTStickerPacksResponseEntity> {
    return this.rest.get(StickerRoutes.listStickerPacks());
  }

  getStickerPack(packId: string): Promise<StickerPackEntity> {
    return this.rest.get(StickerRoutes.getStickerPack(packId));
  }

  listGuildStickers(guildId: string): Promise<StickerEntity[]> {
    return this.rest.get(StickerRoutes.listGuildStickers(guildId));
  }

  getGuildSticker(guildId: string, stickerId: string): Promise<StickerEntity> {
    return this.rest.get(StickerRoutes.getGuildSticker(guildId, stickerId));
  }

  createGuildSticker(
    guildId: string,
    options: RESTCreateGuildStickerFormParams,
    reason?: string,
  ): Promise<StickerEntity> {
    const { file, ...rest } = options;
    return this.rest.post(StickerRoutes.listGuildStickers(guildId), {
      body: JSON.stringify(rest),
      files: file,
      reason,
    });
  }

  modifyGuildSticker(
    guildId: string,
    stickerId: string,
    options: RESTModifyGuildStickerJSONParams,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.rest.patch(StickerRoutes.getGuildSticker(guildId, stickerId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<void> {
    return this.rest.delete(StickerRoutes.getGuildSticker(guildId, stickerId), {
      reason,
    });
  }
}

export class Sticker extends BaseClass<StickerEntity> implements CamelCaseKeys<StickerEntity> {
  readonly id = this.rawData.id;
  readonly packId = this.rawData.pack_id;
  readonly name = this.rawData.name;
  readonly description = this.rawData.description;
  readonly tags = this.rawData.tags;
  readonly type = this.rawData.type;
  readonly formatType = this.rawData.format_type;
  readonly available = this.rawData.available;
  readonly guildId = this.rawData.guild_id;
  readonly user = this.rawData.user;
  readonly sortValue = this.rawData.sort_value;
}

export class StickerPack
  extends BaseClass<StickerPackEntity>
  implements CamelCaseKeys<StickerPackEntity>
{
  readonly id = this.rawData.id;
  readonly stickers = this.rawData.stickers.map((sticker) => new Sticker(this.client, sticker));
  readonly name = this.rawData.name;
  readonly skuId = this.rawData.sku_id;
  readonly coverStickerId = this.rawData.cover_sticker_id;
  readonly description = this.rawData.description;
  readonly bannerAssetId = this.rawData.banner_asset_id;
}
