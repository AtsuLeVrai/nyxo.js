import type {
  EmbedAuthorEntity,
  EmbedEntity,
  EmbedFieldEntity,
  EmbedFooterEntity,
  EmbedImageEntity,
  EmbedProviderEntity,
  EmbedThumbnailEntity,
  EmbedType,
  EmbedVideoEntity,
} from "@nyxojs/core";
import { EMBED_LIMITS } from "../utils/index.js";

/**
 * Common color constants to use with embeds.
 * Provides named color values that can be used with the SetColor method.
 */
export enum Colors {
  /** Default embed color - Discord blurple */
  Default = 0x5865f2,

  /** White color */
  White = 0xffffff,

  /** Black color */
  Black = 0x000000,

  /** Red color */
  Red = 0xed4245,

  /** Green color */
  Green = 0x57f287,

  /** Blue color */
  Blue = 0x3498db,

  /** Yellow color */
  Yellow = 0xfee75c,

  /** Orange color */
  Orange = 0xe67e22,

  /** Purple color */
  Purple = 0x9b59b6,

  /** Pink color */
  Pink = 0xeb459e,

  /** Gold color */
  Gold = 0xf1c40f,

  /** Navy color */
  Navy = 0x34495e,

  /** Dark Aqua color */
  DarkAqua = 0x11806a,

  /** Dark Green color */
  DarkGreen = 0x1f8b4c,

  /** Dark Blue color */
  DarkBlue = 0x206694,

  /** Dark Purple color */
  DarkPurple = 0x71368a,

  /** Dark Orange color */
  DarkOrange = 0xa84300,

  /** Dark Red color */
  DarkRed = 0x992d22,

  /** Gray color */
  Gray = 0x95a5a6,

  /** Dark Gray color */
  DarkGray = 0x979c9f,

  /** Light Gray color */
  LightGray = 0xbcc0c0,

  /** Blurple color - Discord's brand color */
  Blurple = 0x5865f2,

  /** Greyple color - Discord's secondary color */
  Greyple = 0x99aab5,

  /** Dark Theme background color */
  DarkTheme = 0x36393f,

  /** Fuchsia color */
  Fuchsia = 0xeb459e,

  /** Discord brand color */
  DiscordBrand = 0x5865f2,
}

/**
 * Type representing valid color formats accepted by the EmbedBuilder.
 * Colors can be provided as numbers, hex strings, RGB arrays, or named colors.
 */
export type ColorResolvable =
  | number
  | string
  | [red: number, green: number, blue: number]
  | Colors;

/**
 * A comprehensive builder for creating Discord embeds.
 *
 * This class follows the builder pattern to create fully-featured Discord embeds
 * with all features supported by Discord's API, including titles, descriptions,
 * fields, images, thumbnails, footers, authors, and more.
 */
export class EmbedBuilder {
  /** The internal embed data being constructed */
  readonly #data: Partial<EmbedEntity> = {};

  /**
   * Creates a new EmbedBuilder instance.
   *
   * @param data - Optional initial data to populate the embed with
   */
  constructor(data?: Partial<EmbedEntity>) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new EmbedBuilder from an existing EmbedEntity or partial.
   *
   * @param data - The embed data to use
   * @returns A new EmbedBuilder instance with the provided data
   */
  static from(data: Partial<EmbedEntity>): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  /**
   * Sets the title of the embed.
   *
   * @param title - The title to set (max 256 characters)
   * @returns The embed builder instance for method chaining
   * @throws Error if title exceeds 256 characters
   */
  setTitle(title: string): this {
    if (title.length > EMBED_LIMITS.TITLE) {
      throw new Error(
        `Embed title cannot exceed ${EMBED_LIMITS.TITLE} characters`,
      );
    }
    this.#data.title = title;
    return this;
  }

  /**
   * Sets the description of the embed.
   *
   * @param description - The description to set (max 4096 characters)
   * @returns The embed builder instance for method chaining
   * @throws Error if description exceeds 4096 characters
   */
  setDescription(description: string): this {
    if (description.length > EMBED_LIMITS.DESCRIPTION) {
      throw new Error(
        `Embed description cannot exceed ${EMBED_LIMITS.DESCRIPTION} characters`,
      );
    }
    this.#data.description = description;
    return this;
  }

  /**
   * Sets the URL of the embed. This makes the title clickable.
   *
   * @param url - The URL to set
   * @returns The embed builder instance for method chaining
   */
  setUrl(url: string): this {
    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    this.#data.url = url;
    return this;
  }

  /**
   * Sets the timestamp of the embed.
   *
   * @param timestamp - The timestamp to set, or current time if no argument is provided
   * @returns The embed builder instance for method chaining
   */
  setTimestamp(timestamp: Date | number | string = new Date()): this {
    this.#data.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  /**
   * Sets the color of the embed.
   *
   * @param color - The color to set (number, hex string, RGB array, or named color)
   * @returns The embed builder instance for method chaining
   */
  setColor(color: ColorResolvable): this {
    this.#data.color = this.#resolveColor(color);
    return this;
  }

  /**
   * Sets the type of the embed.
   * For webhook embeds, this should almost always be 'rich'.
   *
   * @param type - The embed type to set
   * @returns The embed builder instance for method chaining
   */
  setType(type: EmbedType): this {
    this.#data.type = type;
    return this;
  }

  /**
   * Sets the footer of the embed.
   *
   * @param footer - The footer options
   * @returns The embed builder instance for method chaining
   * @throws Error if footer text exceeds 2048 characters
   */
  setFooter(footer: EmbedFooterEntity): this {
    if (footer.text.length > EMBED_LIMITS.FOOTER_TEXT) {
      throw new Error(
        `Embed footer text cannot exceed ${EMBED_LIMITS.FOOTER_TEXT} characters`,
      );
    }

    this.#data.footer = footer;
    return this;
  }

  /**
   * Sets the image of the embed.
   *
   * @param image - The image options
   * @returns The embed builder instance for method chaining
   */
  setImage(image: EmbedImageEntity): this {
    this.#data.image = image;
    return this;
  }

  /**
   * Sets the thumbnail of the embed.
   *
   * @param thumbnail - The thumbnail options
   * @returns The embed builder instance for method chaining
   */
  setThumbnail(thumbnail: EmbedThumbnailEntity): this {
    this.#data.thumbnail = thumbnail;
    return this;
  }

  /**
   * Sets the author of the embed.
   *
   * @param author - The author options
   * @returns The embed builder instance for method chaining
   * @throws Error if author name exceeds 256 characters
   */
  setAuthor(author: EmbedAuthorEntity): this {
    if (author.name.length > EMBED_LIMITS.AUTHOR_NAME) {
      throw new Error(
        `Embed author name cannot exceed ${EMBED_LIMITS.AUTHOR_NAME} characters`,
      );
    }

    this.#data.author = author;
    return this;
  }

  /**
   * Sets the provider of the embed.
   * Note: This is rarely used directly as it's typically populated by Discord when embedding external content.
   *
   * @param provider - The provider options
   * @returns The embed builder instance for method chaining
   */
  setProvider(provider: EmbedProviderEntity): this {
    this.#data.provider = provider;
    return this;
  }

  /**
   * Sets the video of the embed.
   * Note: This is rarely used directly as it's typically populated by Discord when embedding videos.
   *
   * @param video - The video options
   * @returns The embed builder instance for method chaining
   */
  setVideo(video: EmbedVideoEntity): this {
    this.#data.video = video;
    return this;
  }

  /**
   * Adds a field to the embed.
   *
   * @param field - The field object to add
   * @returns The embed builder instance for method chaining
   * @throws Error if fields limit is exceeded or if name/value exceed length limits
   */
  addField(field: EmbedFieldEntity): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    if (this.#data.fields.length >= EMBED_LIMITS.FIELDS) {
      throw new Error(
        `Embeds cannot have more than ${EMBED_LIMITS.FIELDS} fields`,
      );
    }

    if (field.name.length > EMBED_LIMITS.FIELD_NAME) {
      throw new Error(
        `Embed field name cannot exceed ${EMBED_LIMITS.FIELD_NAME} characters`,
      );
    }

    if (field.value.length > EMBED_LIMITS.FIELD_VALUE) {
      throw new Error(
        `Embed field value cannot exceed ${EMBED_LIMITS.FIELD_VALUE} characters`,
      );
    }

    this.#data.fields.push(field);
    return this;
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields - An array of field objects to add
   * @returns The embed builder instance for method chaining
   * @throws Error if fields limit is exceeded or if name/value exceed length limits
   */
  addFields(...fields: EmbedFieldEntity[]): this {
    for (const field of fields) {
      this.addField(field);
    }
    return this;
  }

  /**
   * Sets all fields of the embed, replacing any existing fields.
   *
   * @param fields - An array of field objects to set
   * @returns The embed builder instance for method chaining
   * @throws Error if fields limit is exceeded or if name/value exceed length limits
   */
  setFields(fields: EmbedFieldEntity[]): this {
    this.#data.fields = [];
    return this.addFields(...fields);
  }

  /**
   * Splices (removes, replaces, or inserts) fields in the embed.
   *
   * @param index - The index to start at
   * @param deleteCount - The number of fields to remove
   * @param fields - The new fields to insert
   * @returns The embed builder instance for method chaining
   * @throws Error if name/value exceed length limits
   */
  spliceFields(
    index: number,
    deleteCount: number,
    ...fields: EmbedFieldEntity[]
  ): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    for (const field of fields) {
      if (field.name.length > EMBED_LIMITS.FIELD_NAME) {
        throw new Error(
          `Embed field name cannot exceed ${EMBED_LIMITS.FIELD_NAME} characters`,
        );
      }
      if (field.value.length > EMBED_LIMITS.FIELD_VALUE) {
        throw new Error(
          `Embed field value cannot exceed ${EMBED_LIMITS.FIELD_VALUE} characters`,
        );
      }
    }

    this.#data.fields.splice(
      index,
      deleteCount,
      ...fields.map((field) => ({
        name: field.name,
        value: field.value,
        inline: field.inline ?? false,
      })),
    );

    return this;
  }

  /**
   * Builds the final embed entity object.
   *
   * @returns The complete embed entity ready to be sent to Discord's API
   * @throws Error if the embed exceeds Discord's limitations
   */
  build(): EmbedEntity {
    let length = 0;

    if (this.#data.title) {
      length += this.#data.title.length;
    }
    if (this.#data.description) {
      length += this.#data.description.length;
    }
    if (this.#data.footer?.text) {
      length += this.#data.footer.text.length;
    }
    if (this.#data.author?.name) {
      length += this.#data.author.name.length;
    }

    if (this.#data.fields) {
      for (const field of this.#data.fields) {
        length += field.name.length + field.value.length;
      }
    }

    if (length > EMBED_LIMITS.TOTAL_LENGTH) {
      throw new Error(
        `Embed exceeds maximum total character limit (${length}/${EMBED_LIMITS.TOTAL_LENGTH})`,
      );
    }

    if (this.#data.fields && this.#data.fields.length > EMBED_LIMITS.FIELDS) {
      throw new Error(
        `Embed exceeds maximum field limit (${this.#data.fields.length}/${EMBED_LIMITS.FIELDS})`,
      );
    }

    return this.#data as EmbedEntity;
  }

  /**
   * Converts the embed data to a JSON object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the embed data
   */
  toJson(): Readonly<Partial<EmbedEntity>> {
    return Object.freeze({ ...this.#data });
  }

  /**
   * Converts a color input into a numeric color value.
   * Supports hex strings, RGB arrays, named colors, and direct numeric values.
   *
   * @param color - The color to resolve
   * @returns The resolved numeric color value
   * @private
   */
  #resolveColor(color: ColorResolvable): number {
    if (typeof color === "number") {
      return color;
    }

    if (Array.isArray(color)) {
      // Convert RGB array to numeric value
      return (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if (color.startsWith("#")) {
      // Convert hex string to numeric value
      return Number.parseInt(color.slice(1), 16);
    }

    // Handle named colors
    if (color in Colors) {
      return Colors[color as keyof typeof Colors];
    }

    throw new Error(`Invalid color: ${color}`);
  }
}
