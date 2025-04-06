import {
  type Snowflake,
  type StickerEntity,
  StickerFormatType,
  type StickerItemEntity,
  type StickerPackEntity,
  StickerType,
} from "@nyxjs/core";
import { Cdn, type StickerFormat } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord sticker that can be sent in messages.
 *
 * Stickers in Discord are small images that can be used in messages,
 * similar to emojis but larger. They can be PNG, APNG, Lottie, or GIF format.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export class Sticker extends BaseClass<StickerEntity> {
  /**
   * The unique ID of this sticker
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * For standard stickers, the ID of the pack the sticker is from
   */
  get packId(): Snowflake | undefined {
    return this.data.pack_id;
  }

  /**
   * The name of the sticker (2-30 characters)
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The description of the sticker (null or 2-100 characters)
   */
  get description(): string | null {
    return this.data.description;
  }

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters)
   */
  get tags(): string {
    return this.data.tags;
  }

  /**
   * The type of sticker (Standard or Guild)
   */
  get type(): StickerType {
    return this.data.type;
  }

  /**
   * The type of sticker format (PNG, APNG, Lottie, or GIF)
   */
  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  /**
   * Whether this guild sticker can be used
   * May be false due to loss of Server Boosts
   */
  get available(): boolean {
    return this.data.available !== false;
  }

  /**
   * The ID of the guild that owns this sticker
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The user that uploaded the guild sticker
   */
  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user);
  }

  /**
   * The standard sticker's sort order within its pack
   */
  get sortValue(): number | undefined {
    return this.data.sort_value;
  }

  /**
   * Gets the URL for this sticker's image
   */
  get imageUrl(): string {
    return Cdn.sticker(this.id, {
      format: this.#getImageExtension(),
    });
  }

  /**
   * Whether this sticker is a standard sticker (from a pack)
   */
  isStandard(): boolean {
    return this.type === StickerType.Standard;
  }

  /**
   * Whether this sticker is a guild sticker (uploaded to a guild)
   */
  isGuild(): boolean {
    return this.type === StickerType.Guild;
  }

  /**
   * Whether this sticker is animated (APNG, Lottie, or GIF format)
   */
  isAnimated(): boolean {
    return (
      this.formatType === StickerFormatType.Apng ||
      this.formatType === StickerFormatType.Lottie ||
      this.formatType === StickerFormatType.Gif
    );
  }

  /**
   * Gets the appropriate file extension for this sticker based on its format type
   * @private
   */
  #getImageExtension(): StickerFormat {
    switch (this.formatType) {
      case StickerFormatType.Png:
        return "png";
      case StickerFormatType.Apng:
        return "png"; // APNG uses .png extension
      case StickerFormatType.Lottie:
        return "json";
      case StickerFormatType.Gif:
        return "gif";
      default:
        return "png";
    }
  }
}

/**
 * Represents a pack of standard stickers in Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object}
 */
export class StickerPack extends BaseClass<StickerPackEntity> {
  /**
   * The unique ID of this sticker pack
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The stickers included in this pack
   */
  get stickers(): Sticker[] {
    return this.data.stickers.map(
      (sticker) => new Sticker(this.client, sticker),
    );
  }

  /**
   * The name of the sticker pack
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The ID of the pack's SKU
   */
  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  /**
   * The ID of a sticker in the pack which is shown as the pack's icon
   */
  get coverStickerId(): Snowflake | undefined {
    return this.data.cover_sticker_id;
  }

  /**
   * The description of the sticker pack
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * The ID of the sticker pack's banner image
   */
  get bannerAssetId(): Snowflake | undefined {
    return this.data.banner_asset_id;
  }

  /**
   * The cover sticker object from this pack
   */
  get coverSticker(): Sticker | undefined {
    if (!this.coverStickerId) {
      return undefined;
    }

    return this.stickers.find((sticker) => sticker.id === this.coverStickerId);
  }

  /**
   * The number of stickers in this pack
   */
  get stickerCount(): number {
    return this.stickers.length;
  }

  /**
   * Gets the URL for this sticker pack's banner
   */
  get bannerUrl(): string | null {
    if (!this.bannerAssetId) {
      return null;
    }

    return Cdn.stickerPackBanner(this.bannerAssetId);
  }
}

/**
 * Represents the smallest amount of data required to render a sticker.
 * This is a partial sticker object typically used in messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object}
 */
export class StickerItem extends BaseClass<StickerItemEntity> {
  /**
   * The unique ID of this sticker
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The name of the sticker
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The type of sticker format (PNG, APNG, Lottie, or GIF)
   */
  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  /**
   * Gets the URL for this sticker's image
   */
  get imageUrl(): string {
    return Cdn.sticker(this.id, {
      format: this.#getImageExtension(),
    });
  }

  /**
   * Whether this sticker is animated (APNG, Lottie, or GIF format)
   */
  isAnimated(): boolean {
    return (
      this.formatType === StickerFormatType.Apng ||
      this.formatType === StickerFormatType.Lottie ||
      this.formatType === StickerFormatType.Gif
    );
  }

  /**
   * Gets the appropriate file extension for this sticker based on its format type
   * @private
   */
  #getImageExtension(): StickerFormat {
    switch (this.formatType) {
      case StickerFormatType.Png:
        return "png";
      case StickerFormatType.Apng:
        return "png"; // APNG uses .png extension
      case StickerFormatType.Lottie:
        return "json";
      case StickerFormatType.Gif:
        return "gif";
      default:
        return "png";
    }
  }
}
