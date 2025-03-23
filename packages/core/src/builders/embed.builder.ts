import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  EmbedAuthorEntity,
  EmbedEntity,
  EmbedFieldEntity,
  EmbedFooterEntity,
  EmbedImageEntity,
  EmbedProviderEntity,
  EmbedThumbnailEntity,
  EmbedType,
  EmbedVideoEntity,
} from "../entities/index.js";

/**
 * A builder class for creating and validating Discord message embeds.
 *
 * This builder provides a fluent interface for constructing embeds with proper validation
 * using Zod schemas. It ensures that all embed properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const embed = new EmbedBuilder()
 *   .setTitle("Hello World")
 *   .setDescription("This is a sample embed")
 *   .setColor(0x3498db)
 *   .setFooter({ text: "Footer text" })
 *   .addField({ name: "Field name", value: "Field value" })
 *   .build();
 * ```
 */
export class EmbedBuilder {
  /** Internal data object representing the embed being built */
  readonly #data: z.input<typeof EmbedEntity> = {
    type: EmbedType.Rich,
  };

  /**
   * Creates a new EmbedBuilder instance.
   *
   * @param data Optional initial data to populate the embed
   */
  constructor(data?: Partial<z.input<typeof EmbedEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new EmbedBuilder from an existing embed object.
   *
   * @param embed The embed object to copy from
   * @returns A new EmbedBuilder instance
   */
  static from(embed: z.input<typeof EmbedEntity>): EmbedBuilder {
    return new EmbedBuilder(embed);
  }

  /**
   * Sets the type of the embed.
   *
   * @param type The type to set
   * @returns This builder instance for method chaining
   * @throws {Error} If the type is invalid
   */
  setType(type: EmbedType): this {
    try {
      this.#data.type = EmbedEntity.shape.type.parse(type);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the title of the embed.
   *
   * @param title The title to set (0-256 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the title exceeds 256 characters
   */
  setTitle(title: string): this {
    try {
      this.#data.title = EmbedEntity.shape.title.parse(title);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the description of the embed.
   *
   * @param description The description to set (0-4096 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the description exceeds 4096 characters
   */
  setDescription(description: string): this {
    try {
      this.#data.description = EmbedEntity.shape.description.parse(description);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the URL of the embed.
   *
   * @param url The URL to set
   * @returns This builder instance for method chaining
   * @throws {Error} If the URL is invalid
   */
  setUrl(url: string): this {
    try {
      this.#data.url = EmbedEntity.shape.url.parse(url);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the timestamp of the embed.
   *
   * @param timestamp The timestamp to set (ISO8601 string or Date object)
   * @returns This builder instance for method chaining
   */
  setTimestamp(timestamp: Date | string | number = Date.now()): this {
    this.#data.timestamp = EmbedEntity.shape.timestamp.parse(
      new Date(timestamp).toISOString(),
    );
    return this;
  }

  /**
   * Sets the color of the embed.
   *
   * @param color The color to set as a number (e.g., 0x3498db for blue)
   * @returns This builder instance for method chaining
   */
  setColor(color: number): this {
    this.#data.color = EmbedEntity.shape.color.parse(color);
    return this;
  }

  /**
   * Sets the footer of the embed.
   *
   * @param footer The footer data
   * @returns This builder instance for method chaining
   * @throws {Error} If the footer data is invalid
   */
  setFooter(footer: z.input<typeof EmbedFooterEntity>): this {
    try {
      this.#data.footer = EmbedFooterEntity.parse(footer);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the image of the embed.
   *
   * @param image The image data
   * @returns This builder instance for method chaining
   * @throws {Error} If the image data is invalid
   */
  setImage(image: z.input<typeof EmbedImageEntity>): this {
    try {
      this.#data.image = EmbedImageEntity.parse(image);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the thumbnail of the embed.
   *
   * @param thumbnail The thumbnail data
   * @returns This builder instance for method chaining
   * @throws {Error} If the thumbnail data is invalid
   */
  setThumbnail(thumbnail: z.input<typeof EmbedThumbnailEntity>): this {
    try {
      this.#data.thumbnail = EmbedThumbnailEntity.parse(thumbnail);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the author of the embed.
   *
   * @param author The author data
   * @returns This builder instance for method chaining
   * @throws {Error} If the author data is invalid
   */
  setAuthor(author: z.input<typeof EmbedAuthorEntity>): this {
    try {
      this.#data.author = EmbedAuthorEntity.parse(author);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Adds a field to the embed.
   *
   * @param field The field data
   * @returns This builder instance for method chaining
   * @throws {Error} If the field data is invalid or if adding would exceed the maximum of 25 fields
   */
  addField(field: z.input<typeof EmbedFieldEntity>): this {
    try {
      const validField = EmbedFieldEntity.parse(field);

      if (!this.#data.fields) {
        this.#data.fields = [];
      }

      EmbedEntity.shape.fields.parse(this.#data.fields);

      this.#data.fields.push(validField);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields An array of field data objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any field data is invalid or if adding would exceed the maximum of 25 fields
   */
  addFields(...fields: z.input<typeof EmbedFieldEntity>[]): this {
    for (const field of fields) {
      this.addField(field);
    }

    return this;
  }

  /**
   * Sets all fields of the embed, replacing any existing fields.
   *
   * @param fields An array of field data objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any field data is invalid or if the array contains more than 25 fields
   */
  setFields(fields: z.input<typeof EmbedFieldEntity>[]): this {
    EmbedEntity.shape.fields.parse(fields);

    this.#data.fields = [];
    return this.addFields(...fields);
  }

  /**
   * Removes a field at the specified index.
   *
   * @param index The index of the field to remove
   * @returns This builder instance for method chaining
   * @throws {Error} If the index is out of bounds
   */
  removeField(index: number): this {
    if (!this.#data.fields) {
      throw new Error("No fields to remove");
    }

    if (index < 0 || index >= this.#data.fields.length) {
      throw new Error(`Field index out of bounds: ${index}`);
    }

    this.#data.fields.splice(index, 1);
    return this;
  }

  /**
   * Sets the provider of the embed.
   * This is typically auto-populated by Discord and rarely set manually.
   *
   * @param provider The provider data
   * @returns This builder instance for method chaining
   * @throws {Error} If the provider data is invalid
   */
  setProvider(provider: z.input<typeof EmbedProviderEntity>): this {
    try {
      this.#data.provider = EmbedProviderEntity.parse(provider);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the video of the embed.
   * This is typically auto-populated by Discord and rarely set manually.
   *
   * @param video The video data
   * @returns This builder instance for method chaining
   * @throws {Error} If the video data is invalid
   */
  setVideo(video: z.input<typeof EmbedVideoEntity>): this {
    try {
      this.#data.video = EmbedVideoEntity.parse(video);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Validates and builds the final embed object.
   *
   * @returns The validated embed object ready to be sent to Discord
   * @throws {Error} If the embed fails validation
   */
  build(): EmbedEntity {
    try {
      return EmbedEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this EmbedBuilder.
   *
   * @returns A new EmbedBuilder instance with the same data
   */
  clone(): EmbedBuilder {
    return new EmbedBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the embed data.
   *
   * @returns The embed data as a JSON object
   */
  toJson(): EmbedEntity {
    return structuredClone(EmbedEntity.parse(this.#data));
  }

  /**
   * Calculates the total character count of the embed.
   * Discord has a limit of 6000 characters across all embed content.
   *
   * @returns The total character count
   */
  calculateLength(): number {
    let count = 0;

    if (this.#data.title) {
      count += this.#data.title.length;
    }
    if (this.#data.description) {
      count += this.#data.description.length;
    }
    if (this.#data.footer?.text) {
      count += this.#data.footer.text.length;
    }
    if (this.#data.author?.name) {
      count += this.#data.author.name.length;
    }

    if (this.#data.fields) {
      for (const field of this.#data.fields) {
        count += field.name.length;
        count += field.value.length;
      }
    }

    return count;
  }

  /**
   * Checks if the embed is empty (has no content).
   *
   * @returns True if the embed has no visible content, false otherwise
   */
  isEmpty(): boolean {
    return !(
      this.#data.title ||
      this.#data.description ||
      this.#data.url ||
      this.#data.timestamp ||
      this.#data.color ||
      this.#data.footer ||
      this.#data.image ||
      this.#data.thumbnail ||
      this.#data.author ||
      (this.#data.fields && this.#data.fields.length > 0)
    );
  }

  /**
   * Checks if the embed is valid according to Discord's requirements.
   *
   * @returns True if the embed is valid, false otherwise
   */
  isValid(): boolean {
    return EmbedEntity.safeParse(this.#data).success;
  }
}
