import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export interface StickerCreate
  extends Pick<StickerEntity, "name" | "description" | "tags"> {
  file: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type StickerModify = Pick<
  StickerEntity,
  "name" | "description" | "tags"
>;

export class StickerRouter {
  static routes = {
    sticker: (stickerId: Snowflake): `/stickers/${Snowflake}` => {
      return `/stickers/${stickerId}` as const;
    },
    stickerPacks: "/sticker-packs" as const,
    stickerPack: (packId: Snowflake): `/sticker-packs/${Snowflake}` => {
      return `/sticker-packs/${packId}` as const;
    },
    guildStickers: (guildId: Snowflake): `/guilds/${Snowflake}/stickers` => {
      return `/guilds/${guildId}/stickers` as const;
    },
    guildSticker: (
      guildId: Snowflake,
      stickerId: Snowflake,
    ): `/guilds/${Snowflake}/stickers/${Snowflake}` => {
      return `/guilds/${guildId}/stickers/${stickerId}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  getSticker(stickerId: Snowflake): Promise<StickerEntity> {
    return this.#rest.get(StickerRouter.routes.sticker(stickerId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   */
  listStickerPacks(): Promise<{ sticker_packs: StickerPackEntity[] }> {
    return this.#rest.get(StickerRouter.routes.stickerPacks);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   */
  getStickerPack(packId: Snowflake): Promise<StickerPackEntity> {
    return this.#rest.get(StickerRouter.routes.stickerPack(packId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   */
  listGuildStickers(guildId: Snowflake): Promise<StickerEntity[]> {
    return this.#rest.get(StickerRouter.routes.guildStickers(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   */
  getGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
  ): Promise<StickerEntity> {
    return this.#rest.get(
      StickerRouter.routes.guildSticker(guildId, stickerId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   */
  createGuildSticker(
    guildId: Snowflake,
    options: StickerCreate,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.post(StickerRouter.routes.guildStickers(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   */
  modifyGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    options: StickerModify,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.patch(
      StickerRouter.routes.guildSticker(guildId, stickerId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   */
  deleteGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      StickerRouter.routes.guildSticker(guildId, stickerId),
      {
        reason,
      },
    );
  }
}
