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
import { type ColorResolvable, resolveColor } from "../utils/index.js";

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
  constructor(data?: EmbedEntity) {
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
  static from(data: EmbedEntity): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  /**
   * Sets the title of the embed.
   *
   * @param title - The title to set (max 256 characters)
   * @returns The embed builder instance for method chaining
   */
  setTitle(title: string): this {
    this.#data.title = title;
    return this;
  }

  /**
   * Sets the description of the embed.
   *
   * @param description - The description to set (max 4096 characters)
   * @returns The embed builder instance for method chaining
   */
  setDescription(description: string): this {
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
    this.#data.color = resolveColor(color);
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
   */
  setFooter(footer: EmbedFooterEntity): this {
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
   */
  setAuthor(author: EmbedAuthorEntity): this {
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
   */
  addField(field: EmbedFieldEntity): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    this.#data.fields.push(field);
    return this;
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields - An array of field objects to add
   * @returns The embed builder instance for method chaining
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
   */
  spliceFields(
    index: number,
    deleteCount: number,
    ...fields: EmbedFieldEntity[]
  ): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    this.#data.fields.splice(index, deleteCount, ...fields);
    return this;
  }

  /**
   * Builds the final embed entity object.
   *
   * @returns The complete embed entity ready to be sent to Discord's API
   */
  build(): EmbedEntity {
    return this.#data as EmbedEntity;
  }

  /**
   * Converts the embed data to an immutable object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the embed data
   */
  toJson(): Readonly<EmbedEntity> {
    return Object.freeze({ ...this.#data }) as EmbedEntity;
  }
}
