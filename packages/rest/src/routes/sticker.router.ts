import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import type { FileEntity } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export interface StickerCreateEntity
  extends Pick<StickerEntity, "name" | "description" | "tags"> {
  file: FileEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type StickerModifyEntity = Pick<
  StickerEntity,
  "name" | "description" | "tags"
>;

export class StickerRouter extends BaseRouter {
  static readonly NAME_MIN_LENGTH = 2;
  static readonly NAME_MAX_LENGTH = 30;
  static readonly DESCRIPTION_MIN_LENGTH = 2;
  static readonly DESCRIPTION_MAX_LENGTH = 100;
  static readonly TAGS_MAX_LENGTH = 200;
  static readonly FILE_MAX_SIZE = 512 * 1024;
  static readonly ANIMATED_MAX_LENGTH = 5;
  static readonly MAX_SIZE = 320;
  static readonly DEFAULT_STICKER_SLOTS = 5;

  static readonly routes = {
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

  validateName(name: string): void {
    if (
      name.length < StickerRouter.NAME_MIN_LENGTH ||
      name.length > StickerRouter.NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Sticker name must be between ${StickerRouter.NAME_MIN_LENGTH} and ${StickerRouter.NAME_MAX_LENGTH} characters`,
      );
    }
  }

  validateDescription(description?: string | null): void {
    if (
      description &&
      (description.length < StickerRouter.DESCRIPTION_MIN_LENGTH ||
        description.length > StickerRouter.DESCRIPTION_MAX_LENGTH)
    ) {
      throw new Error(
        `Sticker description must be between ${StickerRouter.DESCRIPTION_MIN_LENGTH} and ${StickerRouter.DESCRIPTION_MAX_LENGTH} characters`,
      );
    }
  }

  validateTags(tags: string): void {
    if (tags.length > StickerRouter.TAGS_MAX_LENGTH) {
      throw new Error(
        `Sticker tags cannot exceed ${StickerRouter.TAGS_MAX_LENGTH} characters`,
      );
    }
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  getSticker(stickerId: Snowflake): Promise<StickerEntity> {
    return this.get(StickerRouter.routes.sticker(stickerId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   */
  listStickerPacks(): Promise<{ sticker_packs: StickerPackEntity[] }> {
    return this.get(StickerRouter.routes.stickerPacks);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   */
  getStickerPack(packId: Snowflake): Promise<StickerPackEntity> {
    return this.get(StickerRouter.routes.stickerPack(packId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   */
  listGuildStickers(guildId: Snowflake): Promise<StickerEntity[]> {
    return this.get(StickerRouter.routes.guildStickers(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   */
  getGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
  ): Promise<StickerEntity> {
    return this.get(StickerRouter.routes.guildSticker(guildId, stickerId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   */
  createGuildSticker(
    guildId: Snowflake,
    options: StickerCreateEntity,
    reason?: string,
  ): Promise<StickerEntity> {
    this.validateName(options.name);
    this.validateDescription(options.description);
    this.validateTags(options.tags);

    return this.post(StickerRouter.routes.guildStickers(guildId), {
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
    options: StickerModifyEntity,
    reason?: string,
  ): Promise<StickerEntity> {
    if (options.name) {
      this.validateName(options.name);
    }
    if (options.description) {
      this.validateDescription(options.description);
    }
    if (options.tags) {
      this.validateTags(options.tags);
    }

    return this.patch(StickerRouter.routes.guildSticker(guildId, stickerId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   */
  deleteGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(StickerRouter.routes.guildSticker(guildId, stickerId), {
      reason,
    });
  }
}
