import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { StripNull } from "../../utils/index.js";
import type { StickerEntity, StickerPackEntity } from "./sticker.entity.js";

export interface RESTStickerPacksResponseEntity {
  sticker_packs: StickerPackEntity[];
}

export interface RESTCreateGuildStickerFormParams
  extends StripNull<Pick<StickerEntity, "name" | "description" | "tags">> {
  file: FileInput;
}

export type RESTModifyGuildStickerJSONParams = Partial<Omit<StickerEntity, "file">>;

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
