import type { EmbedEntity, EmbedType } from "@nyxojs/core";
import { z } from "zod/v4";
import {
  EmbedAuthorSchema,
  EmbedFieldSchema,
  EmbedFooterSchema,
  EmbedImageSchema,
  EmbedProviderSchema,
  EmbedSchema,
  EmbedThumbnailSchema,
  EmbedVideoSchema,
} from "../schemas/index.js";
import { type ColorResolvable, resolveColor } from "../utils/index.js";

/**
 * A comprehensive builder for creating Discord embeds.
 *
 * This class follows the builder pattern to create fully-featured Discord embeds
 * with all features supported by Discord's API, including titles, descriptions,
 * fields, images, thumbnails, footers, authors, and more.
 *
 * It uses Zod schemas for validation to ensure all elements meet Discord's requirements.
 */
export class EmbedBuilder {
  /** The internal embed data being constructed */
  readonly #data: z.input<typeof EmbedSchema> = {};

  /**
   * Creates a new EmbedBuilder instance.
   *
   * @param data - Optional initial data to populate the embed with
   */
  constructor(data?: z.input<typeof EmbedSchema>) {
    if (data) {
      // Validate the initial data
      const result = EmbedSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new EmbedBuilder from an existing EmbedEntity or partial.
   *
   * @param data - The embed data to use
   * @returns A new EmbedBuilder instance with the provided data
   */
  static from(data: z.input<typeof EmbedSchema>): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  /**
   * Sets the title of the embed.
   *
   * @param title - The title to set (max 256 characters)
   * @returns The embed builder instance for method chaining
   */
  setTitle(title: string): this {
    const result = EmbedSchema.shape.title.safeParse(title);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.title = result.data;
    return this;
  }

  /**
   * Sets the description of the embed.
   *
   * @param description - The description to set (max 4096 characters)
   * @returns The embed builder instance for method chaining
   */
  setDescription(description: string): this {
    const result = EmbedSchema.shape.description.safeParse(description);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.description = result.data;
    return this;
  }

  /**
   * Sets the URL of the embed. This makes the title clickable.
   *
   * @param url - The URL to set
   * @returns The embed builder instance for method chaining
   */
  setUrl(url: string): this {
    const result = z.url().safeParse(url);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.url = result.data;
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
    const result = EmbedSchema.shape.type.safeParse(type);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.type = result.data;
    return this;
  }

  /**
   * Sets the footer of the embed.
   *
   * @param footer - The footer options
   * @returns The embed builder instance for method chaining
   */
  setFooter(footer: z.input<typeof EmbedFooterSchema>): this {
    const result = EmbedFooterSchema.safeParse(footer);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.footer = result.data;
    return this;
  }

  /**
   * Sets the image of the embed.
   *
   * @param image - The image options
   * @returns The embed builder instance for method chaining
   */
  setImage(image: z.input<typeof EmbedImageSchema>): this {
    const result = EmbedImageSchema.safeParse(image);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.image = result.data;
    return this;
  }

  /**
   * Sets the thumbnail of the embed.
   *
   * @param thumbnail - The thumbnail options
   * @returns The embed builder instance for method chaining
   */
  setThumbnail(thumbnail: z.input<typeof EmbedThumbnailSchema>): this {
    const result = EmbedThumbnailSchema.safeParse(thumbnail);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.thumbnail = result.data;
    return this;
  }

  /**
   * Sets the author of the embed.
   *
   * @param author - The author options
   * @returns The embed builder instance for method chaining
   */
  setAuthor(author: z.input<typeof EmbedAuthorSchema>): this {
    const result = EmbedAuthorSchema.safeParse(author);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.author = result.data;
    return this;
  }

  /**
   * Sets the provider of the embed.
   * Note: This is rarely used directly as it's typically populated by Discord when embedding external content.
   *
   * @param provider - The provider options
   * @returns The embed builder instance for method chaining
   */
  setProvider(provider: z.input<typeof EmbedProviderSchema>): this {
    const result = EmbedProviderSchema.safeParse(provider);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.provider = result.data;
    return this;
  }

  /**
   * Sets the video of the embed.
   * Note: This is rarely used directly as it's typically populated by Discord when embedding videos.
   *
   * @param video - The video options
   * @returns The embed builder instance for method chaining
   */
  setVideo(video: z.input<typeof EmbedVideoSchema>): this {
    const result = EmbedVideoSchema.safeParse(video);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.video = result.data;
    return this;
  }

  /**
   * Adds a field to the embed.
   *
   * @param field - The field object to add
   * @returns The embed builder instance for method chaining
   */
  addField(field: z.input<typeof EmbedFieldSchema>): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    const result = EmbedFieldSchema.safeParse(field);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.fields.push(result.data);
    return this;
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields - An array of field objects to add
   * @returns The embed builder instance for method chaining
   */
  addFields(...fields: z.input<typeof EmbedFieldSchema>[]): this {
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
  setFields(fields: z.input<typeof EmbedFieldSchema>[]): this {
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
    ...fields: z.input<typeof EmbedFieldSchema>[]
  ): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    const result = fields.map((field) => EmbedFieldSchema.safeParse(field));
    for (const field of result) {
      if (!field.success) {
        throw new Error(z.prettifyError(field.error));
      }
    }

    const validOptions: z.input<typeof EmbedFieldSchema>[] = [];
    for (const field of fields) {
      const result = EmbedFieldSchema.safeParse(field);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      validOptions.push(result.data);
    }

    this.#data.fields.splice(index, deleteCount, ...validOptions);
    return this;
  }

  /**
   * Builds the final embed entity object.
   *
   * @returns The complete embed entity ready to be sent to Discord's API
   */
  build(): EmbedEntity {
    // Use Zod to validate the entire embed structure
    const result = EmbedSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Return the validated data
    return result.data;
  }

  /**
   * Converts the embed data to a JSON object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the embed data
   */
  toJson(): Readonly<z.input<typeof EmbedSchema>> {
    return Object.freeze({ ...this.#data });
  }
}
