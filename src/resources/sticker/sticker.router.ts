import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DeepNonNullable } from "../../utils/index.js";
import type { StickerEntity, StickerPackEntity } from "./sticker.entity.js";

/**
 * @description Response wrapper for Discord sticker pack collection endpoint.
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
 */
export interface RESTStickerPacksResponseEntity {
  /**
   * @description Array of available Discord sticker packs for Nitro subscribers.
   */
  sticker_packs: StickerPackEntity[];
}

/**
 * @description Form parameters for uploading new guild stickers with multipart/form-data format.
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
 */
export interface RESTCreateGuildStickerFormParams
  extends DeepNonNullable<Pick<StickerEntity, "name" | "description" | "tags">> {
  /**
   * @description Sticker file content (PNG, APNG, GIF, or Lottie JSON, max 512 KiB).
   */
  file: FileInput;
}

/**
 * @description JSON parameters for modifying existing guild stickers with optional fields.
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
 */
export type RESTModifyGuildStickerJSONParams = Partial<
  Omit<RESTCreateGuildStickerFormParams, "file">
>;

/**
 * @description Discord API endpoints for sticker-related operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export const StickerRoutes = {
  getSticker: (stickerId: string) => `/stickers/${stickerId}` as const,
  listStickerPacks: () => "/sticker-packs",
  getStickerPack: (packId: string) => `/sticker-packs/${packId}` as const,
  listGuildStickers: (guildId: string) => `/guilds/${guildId}/stickers` as const,
  getGuildSticker: (guildId: string, stickerId: string) =>
    `/guilds/${guildId}/stickers/${stickerId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord sticker API client with direct REST operations and intelligent rate limiting.
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export class StickerRouter extends BaseRouter {
  /**
   * @description Retrieves sticker data directly from Discord API without caching.
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   *
   * @param stickerId - Snowflake ID of the sticker to fetch
   * @returns Promise resolving to complete sticker object with metadata
   */
  getSticker(stickerId: string): Promise<StickerEntity> {
    return this.rest.get(StickerRoutes.getSticker(stickerId));
  }

  /**
   * @description Fetches all available Discord sticker packs for Nitro subscribers.
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   *
   * @returns Promise resolving to response containing array of sticker pack objects
   */
  listStickerPacks(): Promise<RESTStickerPacksResponseEntity> {
    return this.rest.get(StickerRoutes.listStickerPacks());
  }

  /**
   * @description Retrieves specific sticker pack with all contained stickers.
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   *
   * @param packId - Snowflake ID of the sticker pack to fetch
   * @returns Promise resolving to complete sticker pack object with sticker array
   */
  getStickerPack(packId: string): Promise<StickerPackEntity> {
    return this.rest.get(StickerRoutes.getStickerPack(packId));
  }

  /**
   * @description Lists all custom stickers uploaded to a Discord guild.
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   *
   * @param guildId - Snowflake ID of the target guild
   * @returns Promise resolving to array of guild sticker objects (includes user field with proper permissions)
   */
  listGuildStickers(guildId: string): Promise<StickerEntity[]> {
    return this.rest.get(StickerRoutes.listGuildStickers(guildId));
  }

  /**
   * @description Retrieves specific guild sticker with full metadata and user information.
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   *
   * @param guildId - Snowflake ID of the guild containing the sticker
   * @param stickerId - Snowflake ID of the sticker to fetch
   * @returns Promise resolving to complete guild sticker object (includes user field with proper permissions)
   */
  getGuildSticker(guildId: string, stickerId: string): Promise<StickerEntity> {
    return this.rest.get(StickerRoutes.getGuildSticker(guildId, stickerId));
  }

  /**
   * @description Uploads new custom sticker to Discord guild with multipart/form-data format.
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   *
   * @param guildId - Snowflake ID of the target guild
   * @param options - Sticker creation parameters including file data and metadata
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to newly created sticker object
   * @throws {Error} When lacking CREATE_GUILD_EXPRESSIONS permission
   * @throws {Error} When file exceeds 512 KiB or has invalid format
   */
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

  /**
   * @description Modifies existing guild sticker metadata with optional field updates.
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   *
   * @param guildId - Snowflake ID of the guild containing the sticker
   * @param stickerId - Snowflake ID of the sticker to modify
   * @param options - Partial sticker data for fields to update
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to updated sticker object
   * @throws {Error} When lacking MANAGE_GUILD_EXPRESSIONS permission (or CREATE_GUILD_EXPRESSIONS for own stickers)
   */
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

  /**
   * @description Permanently removes custom sticker from Discord guild.
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   *
   * @param guildId - Snowflake ID of the guild containing the sticker
   * @param stickerId - Snowflake ID of the sticker to delete
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving when deletion is complete (204 No Content)
   * @throws {Error} When lacking MANAGE_GUILD_EXPRESSIONS permission (or CREATE_GUILD_EXPRESSIONS for own stickers)
   */
  deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<void> {
    return this.rest.delete(StickerRoutes.getGuildSticker(guildId, stickerId), {
      reason,
    });
  }
}
