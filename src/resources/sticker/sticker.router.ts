import type { FileInput, Rest } from "../../core/index.js";
import type { StickerEntity, StickerPackEntity } from "./sticker.entity.js";

export interface StickerPacksResponse {
  sticker_packs: StickerPackEntity[];
}

export interface GuildStickerCreateOptions {
  name: string;
  description: string;
  tags: string;
  file: FileInput;
}

export interface GuildStickerUpdateOptions {
  name?: string;
  description?: string | null;
  tags?: string;
}

export class StickerRouter {
  static readonly Routes = {
    stickerPacksEndpoint: () => "/sticker-packs",
    stickerByIdEndpoint: (stickerId: string) => `/stickers/${stickerId}` as const,
    stickerPackByIdEndpoint: (packId: string) => `/sticker-packs/${packId}` as const,
    guildStickersEndpoint: (guildId: string) => `/guilds/${guildId}/stickers` as const,
    guildStickerByIdEndpoint: (guildId: string, stickerId: string) =>
      `/guilds/${guildId}/stickers/${stickerId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchSticker(stickerId: string): Promise<StickerEntity> {
    return this.#rest.get(StickerRouter.Routes.stickerByIdEndpoint(stickerId));
  }
  fetchStickerPacks(): Promise<StickerPacksResponse> {
    return this.#rest.get(StickerRouter.Routes.stickerPacksEndpoint());
  }
  fetchStickerPack(packId: string): Promise<StickerPackEntity> {
    return this.#rest.get(StickerRouter.Routes.stickerPackByIdEndpoint(packId));
  }
  fetchGuildStickers(guildId: string): Promise<StickerEntity[]> {
    return this.#rest.get(StickerRouter.Routes.guildStickersEndpoint(guildId));
  }
  fetchGuildSticker(guildId: string, stickerId: string): Promise<StickerEntity> {
    return this.#rest.get(StickerRouter.Routes.guildStickerByIdEndpoint(guildId, stickerId));
  }
  createGuildSticker(
    guildId: string,
    options: GuildStickerCreateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    const { file, ...rest } = options;
    return this.#rest.post(StickerRouter.Routes.guildStickersEndpoint(guildId), {
      body: JSON.stringify(rest),
      files: file,
      reason,
    });
  }
  updateGuildSticker(
    guildId: string,
    stickerId: string,
    options: GuildStickerUpdateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.patch(StickerRouter.Routes.guildStickerByIdEndpoint(guildId, stickerId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<void> {
    return this.#rest.delete(StickerRouter.Routes.guildStickerByIdEndpoint(guildId, stickerId), {
      reason,
    });
  }
}
