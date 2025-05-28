import {
  type Snowflake,
  type StickerEntity,
  StickerFormatType,
  type StickerItemEntity,
  type StickerPackEntity,
  StickerType,
} from "@nyxojs/core";
import {
  Cdn,
  type GuildStickerUpdateOptions,
  type ImageOptions,
  type StickerFormatOptions,
  type StickerPackBannerUrl,
  type StickerUrl,
} from "@nyxojs/rest";
import type { z } from "zod/v4";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Sticker, providing methods to interact with and manage stickers.
 *
 * The Sticker class serves as a comprehensive wrapper around Discord's Sticker API, offering:
 * - Access to sticker information (name, description, format, etc.)
 * - Methods to update or delete guild stickers
 * - Utilities for retrieving sticker images
 * - Support for different sticker types and formats
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
@Cacheable("stickers")
export class Sticker
  extends BaseClass<StickerEntity>
  implements Enforce<PropsToCamel<StickerEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this sticker.
   *
   * This ID is used for API operations and remains constant for the lifetime of the sticker.
   *
   * @returns The sticker's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the ID of the sticker pack this sticker is from, if applicable.
   *
   * Only present for standard stickers that are part of an official Discord sticker pack.
   *
   * @returns The pack's ID as a Snowflake string, or undefined if not from a pack
   */
  readonly packId = this.rawData.pack_id;

  /**
   * Gets the name of this sticker.
   *
   * This is the display name shown in the Discord client (2-30 characters).
   *
   * @returns The sticker name as a string
   */
  readonly name = this.rawData.name;

  /**
   * Gets the description of this sticker.
   *
   * This is a short description of what the sticker depicts (0-100 characters).
   *
   * @returns The sticker description as a string, or null if not set
   */
  readonly description = this.rawData.description;

  /**
   * Gets the autocomplete/suggestion tags for this sticker.
   *
   * These are comma-separated keywords used for search and suggestions.
   *
   * @returns The tags as a string
   */
  readonly tags = this.rawData.tags;

  /**
   * Gets the sticker asset hash.
   *
   * Previously this was a hashed value, now it's an empty string.
   * Included for backward compatibility.
   *
   * @returns The asset value as a string, or undefined if not available
   * @deprecated This property is no longer used by Discord
   */
  readonly asset = this.rawData.asset;

  /**
   * Gets the type of this sticker.
   *
   * Indicates whether this is a standard sticker from a pack or a guild-specific sticker.
   *
   * @returns The sticker type enum value
   * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
   */
  readonly type = this.rawData.type;

  /**
   * Gets the format type of this sticker.
   *
   * Determines the file format of the sticker (PNG, APNG, Lottie, or GIF).
   *
   * @returns The format type enum value
   * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
   */
  readonly formatType = this.rawData.format_type;

  /**
   * Indicates whether this guild sticker can be used by Nitro users in other guilds.
   *
   * Only applicable to guild stickers.
   *
   * @returns True if the sticker is available for use by Nitro users across guilds, undefined if not applicable
   */
  readonly available = this.rawData.available;

  /**
   * Gets the ID of the guild that owns this sticker.
   *
   * Only present for guild stickers.
   *
   * @returns The guild's ID as a Snowflake string, or undefined if not a guild sticker
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the user that uploaded the guild sticker.
   *
   * Only present for guild stickers and when the current user has the
   * MANAGE_GUILD_EXPRESSIONS permission.
   *
   * @returns The User object, or undefined if not available
   */
  readonly user = this.rawData.user
    ? new User(this.client, this.rawData.user)
    : undefined;

  /**
   * Gets the sort order within the sticker pack.
   *
   * Only applicable to standard stickers in packs.
   *
   * @returns The sort value as a number, or undefined if not applicable
   */
  readonly sortValue = this.rawData.sort_value;

  /**
   * Checks if this is a standard sticker from an official pack.
   *
   * @returns True if this is a standard sticker, false otherwise
   */
  get isStandard(): boolean {
    return this.type === StickerType.Standard;
  }

  /**
   * Checks if this is a guild-specific sticker.
   *
   * @returns True if this is a guild sticker, false otherwise
   */
  get isGuildSticker(): boolean {
    return this.type === StickerType.Guild;
  }

  /**
   * Gets the URL to this sticker's image.
   *
   * @returns The URL to the sticker image
   */
  url(options: z.input<typeof StickerFormatOptions>): StickerUrl {
    return Cdn.sticker(this.id, options);
  }

  /**
   * Updates this sticker with new information.
   *
   * Only works for guild stickers. Requires the MANAGE_GUILD_EXPRESSIONS permission.
   *
   * @param options - Options for updating the sticker
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated Sticker
   * @throws Error if the sticker couldn't be updated or is not a guild sticker
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   */
  async update(
    options: GuildStickerUpdateOptions,
    reason?: string,
  ): Promise<Sticker> {
    if (!this.guildId) {
      throw new Error("Cannot update standard stickers");
    }

    const updatedSticker = await this.client.rest.stickers.updateGuildSticker(
      this.guildId,
      this.id,
      options,
      reason,
    );

    this.patch(updatedSticker);
    return this;
  }

  /**
   * Deletes this sticker.
   *
   * Only works for guild stickers. Requires the MANAGE_GUILD_EXPRESSIONS permission.
   *
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sticker is deleted
   * @throws Error if the sticker couldn't be deleted or is not a guild sticker
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   */
  async delete(reason?: string): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot delete standard stickers");
    }

    await this.client.rest.stickers.deleteGuildSticker(
      this.guildId,
      this.id,
      reason,
    );

    this.uncache();
  }

  /**
   * Refreshes this sticker's data from the API.
   *
   * @returns A promise resolving to the updated Sticker
   * @throws Error if the sticker couldn't be fetched
   */
  async refresh(): Promise<Sticker> {
    let stickerData: StickerEntity;

    if (this.guildId) {
      // For guild stickers, use fetchGuildSticker
      stickerData = await this.client.rest.stickers.fetchGuildSticker(
        this.guildId,
        this.id,
      );
    } else {
      // For standard stickers, use fetchSticker
      stickerData = await this.client.rest.stickers.fetchSticker(this.id);
    }

    this.patch(stickerData);
    return this;
  }

  /**
   * Sets a new name for this sticker.
   *
   * Only works for guild stickers.
   *
   * @param name - The new name for the sticker (2-30 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated Sticker
   * @throws Error if the name couldn't be updated or sticker is not a guild sticker
   */
  setName(name: string, reason?: string): Promise<Sticker> {
    return this.update({ name }, reason);
  }

  /**
   * Sets a new description for this sticker.
   *
   * Only works for guild stickers.
   *
   * @param description - The new description for the sticker (0-100 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated Sticker
   * @throws Error if the description couldn't be updated or sticker is not a guild sticker
   */
  setDescription(description: string, reason?: string): Promise<Sticker> {
    return this.update({ description }, reason);
  }

  /**
   * Sets new tags for this sticker.
   *
   * Only works for guild stickers.
   *
   * @param tags - The new comma-separated tags for the sticker (max 200 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated Sticker
   * @throws Error if the tags couldn't be updated or sticker is not a guild sticker
   */
  setTags(tags: string, reason?: string): Promise<Sticker> {
    return this.update({ tags }, reason);
  }
}

/**
 * Represents a lightweight Discord Sticker Item, providing basic information for stickers in messages.
 *
 * The StickerItem class represents the smallest amount of data required to render a sticker.
 * It is used in contexts where the full sticker data isn't needed, such as in messages.
 * This lightweight representation includes only essential display information like ID, name, and format.
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object}
 */
export class StickerItem
  extends BaseClass<StickerItemEntity>
  implements Enforce<PropsToCamel<StickerItemEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this sticker.
   *
   * This ID can be used to retrieve the full sticker information if needed.
   *
   * @returns The sticker's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the name of this sticker.
   *
   * This is the display name shown in the Discord client.
   *
   * @returns The sticker name as a string
   */
  readonly name = this.rawData.name;

  /**
   * Gets the format type of this sticker.
   *
   * Determines the file format of the sticker (PNG, APNG, Lottie, or GIF).
   *
   * @returns The format type enum value
   * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
   */
  readonly formatType = this.rawData.format_type;

  /**
   * Fetches the complete sticker information.
   *
   * This method retrieves the full Sticker object with additional details
   * that aren't included in the StickerItem.
   *
   * @returns A promise resolving to the complete Sticker object
   * @throws Error if the sticker couldn't be fetched
   */
  async fetchSticker(): Promise<Sticker> {
    const stickerData = await this.client.rest.stickers.fetchSticker(this.id);
    return new Sticker(this.client, stickerData);
  }

  /**
   * Checks if this sticker is an animated sticker.
   *
   * @returns True if the sticker is animated (APNG, Lottie, or GIF), false otherwise
   */
  isAnimated(): boolean {
    return (
      this.formatType === StickerFormatType.Apng ||
      this.formatType === StickerFormatType.Lottie ||
      this.formatType === StickerFormatType.Gif
    );
  }

  /**
   * Checks if this sticker is a Lottie sticker.
   *
   * Lottie stickers are vector-based animation format that enables smaller file sizes.
   * They can only be uploaded to guilds with VERIFIED and/or PARTNERED features.
   *
   * @returns True if this is a Lottie sticker, false otherwise
   */
  isLottie(): boolean {
    return this.formatType === StickerFormatType.Lottie;
  }

  /**
   * Checks if this sticker is a PNG or APNG sticker.
   *
   * @returns True if this is a PNG or APNG sticker, false otherwise
   */
  isPng(): boolean {
    return (
      this.formatType === StickerFormatType.Png ||
      this.formatType === StickerFormatType.Apng
    );
  }

  /**
   * Checks if this sticker is a GIF sticker.
   *
   * @returns True if this is a GIF sticker, false otherwise
   */
  isGif(): boolean {
    return this.formatType === StickerFormatType.Gif;
  }
}

/**
 * Represents a Discord Sticker Pack, providing access to collections of official stickers.
 *
 * The StickerPack class encapsulates a collection of standard stickers provided by Discord.
 * Sticker packs are collections of related stickers that may be available to users based on
 * various factors like Nitro subscription status.
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object}
 */
export class StickerPack
  extends BaseClass<StickerPackEntity>
  implements Enforce<PropsToCamel<StickerPackEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this sticker pack.
   *
   * This ID is used for API operations and remains constant for the lifetime of the pack.
   *
   * @returns The sticker pack's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the stickers contained in this pack.
   *
   * This is an array of complete sticker objects available in this pack.
   *
   * @returns An array of Sticker objects
   */
  readonly stickers = this.rawData.stickers.map(
    (sticker) => new Sticker(this.client, sticker),
  );

  /**
   * Gets the name of this sticker pack.
   *
   * This is the display name shown in the Discord client.
   *
   * @returns The sticker pack name as a string
   */
  readonly name = this.rawData.name;

  /**
   * Gets the ID of this pack's SKU.
   *
   * This links the sticker pack to its purchasable SKU.
   *
   * @returns The SKU ID as a Snowflake string
   */
  readonly skuId = this.rawData.sku_id;

  /**
   * Gets the ID of a sticker in the pack which is shown as the pack's icon.
   *
   * This sticker is used as the visual representation of the pack in the Discord client.
   *
   * @returns The cover sticker's ID as a Snowflake string, or undefined if not set
   */
  readonly coverStickerId = this.rawData.cover_sticker_id;

  /**
   * Gets the description of this sticker pack.
   *
   * This is a brief explanation of the sticker pack's theme or contents.
   *
   * @returns The description as a string
   */
  readonly description = this.rawData.description;

  /**
   * Gets the ID of this pack's banner image.
   *
   * This is used as the background when viewing the pack in the Discord client.
   *
   * @returns The banner asset ID as a Snowflake string, or undefined if not set
   */
  readonly bannerAssetId = this.rawData.banner_asset_id;

  /**
   * Gets the number of stickers in this pack.
   *
   * @returns The count of stickers in the pack
   */
  readonly stickerCount = this.stickers.length;

  /**
   * Gets the cover sticker for this pack.
   *
   * This is the sticker that's used as the visual representation of the pack.
   *
   * @returns The cover Sticker object, or undefined if not set
   */
  readonly coverSticker = this.stickers.find(
    (sticker) => sticker.id === this.coverStickerId,
  );

  /**
   * Gets the URL to this sticker pack's banner image, if available.
   *
   * @returns The URL to the banner image, or null if no banner asset is set
   */
  bannerUrl(
    options: z.input<typeof ImageOptions>,
  ): StickerPackBannerUrl | null {
    if (!this.bannerAssetId) {
      return null;
    }
    return Cdn.stickerPackBanner(this.bannerAssetId, options);
  }

  /**
   * Refreshes this sticker pack's data from the API.
   *
   * @returns A promise resolving to the updated StickerPack
   * @throws Error if the sticker pack couldn't be fetched
   */
  async refresh(): Promise<StickerPack> {
    const packData = await this.client.rest.stickers.fetchStickerPack(this.id);
    this.patch(packData);
    return this;
  }

  /**
   * Gets a specific sticker from this pack by its ID.
   *
   * @param stickerId - The ID of the sticker to retrieve
   * @returns The Sticker object if found, or undefined if not in this pack
   */
  getSticker(stickerId: Snowflake): Sticker | undefined {
    return this.stickers.find((sticker) => sticker.id === stickerId);
  }

  /**
   * Gets a specific sticker from this pack by its name.
   *
   * @param name - The name of the sticker to retrieve
   * @returns The first matching Sticker object if found, or undefined if not in this pack
   */
  getStickerByName(name: string): Sticker | undefined {
    return this.stickers.find(
      (sticker) => sticker.name.toLowerCase() === name.toLowerCase(),
    );
  }

  /**
   * Searches for stickers in this pack that match a query string.
   *
   * This searches through sticker names and tags to find relevant matches.
   *
   * @param query - The search query to match against sticker names and tags
   * @returns An array of matching Sticker objects, or an empty array if none match
   */
  searchStickers(query: string): Sticker[] {
    const lowercaseQuery = query.toLowerCase();

    return this.stickers.filter((sticker) => {
      const nameMatch = sticker.name.toLowerCase().includes(lowercaseQuery);
      const tagsMatch = sticker.tags.toLowerCase().includes(lowercaseQuery);
      return nameMatch || tagsMatch;
    });
  }
}
