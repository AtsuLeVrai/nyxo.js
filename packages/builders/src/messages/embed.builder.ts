import {
  type EmbedAuthorEntity,
  type EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedThumbnailEntity,
  EmbedType,
} from "@nyxjs/core";

/**
 * A builder class for creating Discord embed objects.
 *
 * This class provides a fluent interface for constructing rich embed objects
 * that can be sent as part of Discord messages.
 *
 * @example
 * ```typescript
 * const embed = new EmbedBuilder()
 *   .setTitle('Hello World')
 *   .setDescription('This is a description')
 *   .setColor(0x00ff00)
 *   .addField('Field 1', 'Value 1', true)
 *   .addField('Field 2', 'Value 2', true)
 *   .setFooter({ text: 'Footer text' })
 *   .build();
 * ```
 */
export class EmbedBuilder {
  /** The internal embed data being constructed */
  readonly #data: Partial<EmbedEntity>;

  /**
   * Creates a new EmbedBuilder instance.
   *
   * @param data Optional initial data to populate the embed
   */
  constructor(data: Partial<EmbedEntity> = {}) {
    this.#data = {
      type: EmbedType.Rich,
      ...data,
    };
  }

  /**
   * Creates a new EmbedBuilder from an existing embed.
   *
   * @param embed The embed to copy data from
   * @returns A new EmbedBuilder instance
   */
  static from(embed: EmbedEntity | Partial<EmbedEntity>): EmbedBuilder {
    return new EmbedBuilder(embed);
  }

  /**
   * Sets the title of the embed.
   *
   * @param title The title to set (max 256 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If title exceeds 256 characters
   */
  setTitle(title: string): this {
    if (title.length > 256) {
      throw new Error("Embed title cannot exceed 256 characters");
    }
    this.#data.title = title;
    return this;
  }

  /**
   * Sets the description of the embed.
   *
   * @param description The description to set (max 4096 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description exceeds 4096 characters
   */
  setDescription(description: string): this {
    if (description.length > 4096) {
      throw new Error("Embed description cannot exceed 4096 characters");
    }
    this.#data.description = description;
    return this;
  }

  /**
   * Sets the URL of the embed.
   *
   * @param url The URL to set
   * @returns This builder instance, for method chaining
   */
  setUrl(url: string): this {
    this.#data.url = url;
    return this;
  }

  /**
   * Sets the color of the embed.
   *
   * @param color The color to set as an integer (hex color code)
   * @returns This builder instance, for method chaining
   */
  setColor(color: number): this {
    this.#data.color = color;
    return this;
  }

  /**
   * Sets the timestamp of the embed.
   *
   * @param timestamp The timestamp to set (ISO8601 string or Date object)
   * @returns This builder instance, for method chaining
   */
  setTimestamp(timestamp: Date | string | number = new Date()): this {
    this.#data.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  /**
   * Sets the author of the embed.
   *
   * @param author The author data to set
   * @returns This builder instance, for method chaining
   * @throws Error If author name exceeds 256 characters
   */
  setAuthor(author: EmbedAuthorEntity): this {
    if (author.name.length > 256) {
      throw new Error("Embed author name cannot exceed 256 characters");
    }

    this.#data.author = author;
    return this;
  }

  /**
   * Sets the footer of the embed.
   *
   * @param footer The footer data to set
   * @returns This builder instance, for method chaining
   * @throws Error If footer text exceeds 2048 characters
   */
  setFooter(footer: EmbedFooterEntity): this {
    if (footer.text.length > 2048) {
      throw new Error("Embed footer text cannot exceed 2048 characters");
    }

    this.#data.footer = footer;
    return this;
  }

  /**
   * Sets the thumbnail of the embed.
   *
   * @param thumbnail The thumbnail data to set
   * @returns This builder instance, for method chaining
   */
  setThumbnail(thumbnail: EmbedThumbnailEntity): this {
    this.#data.thumbnail = thumbnail;
    return this;
  }

  /**
   * Sets the image of the embed.
   *
   * @param image The image data to set
   * @returns This builder instance, for method chaining
   */
  setImage(image: EmbedImageEntity): this {
    this.#data.image = image;
    return this;
  }

  /**
   * Adds a field to the embed.
   *
   * @param field The field object to add
   * @returns This builder instance, for method chaining
   * @throws Error If field name exceeds 256 characters or value exceeds 1024 characters
   */
  addField(field: EmbedFieldEntity): this {
    if (field.name.length > 256) {
      throw new Error("Embed field name cannot exceed 256 characters");
    }

    if (field.value.length > 1024) {
      throw new Error("Embed field value cannot exceed 1024 characters");
    }

    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    if (this.#data.fields.length >= 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }

    this.#data.fields.push(field);
    return this;
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields An array of field objects to add
   * @returns This builder instance, for method chaining
   * @throws Error If any field name exceeds 256 characters or value exceeds 1024 characters
   */
  addFields(...fields: EmbedFieldEntity[]): this {
    for (const field of fields) {
      if (field.name.length > 256) {
        throw new Error("Embed field name cannot exceed 256 characters");
      }

      if (field.value.length > 1024) {
        throw new Error("Embed field value cannot exceed 1024 characters");
      }
    }

    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    if (this.#data.fields.length + fields.length > 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }

    this.#data.fields.push(...fields);
    return this;
  }

  /**
   * Sets multiple fields at once, replacing any existing fields.
   *
   * @param fields An array of field objects to set
   * @returns This builder instance, for method chaining
   * @throws Error If there are more than 25 fields, or if any field exceeds character limits
   */
  setFields(fields: EmbedFieldEntity[]): this {
    if (fields.length > 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }

    for (const field of fields) {
      if (field.name.length > 256) {
        throw new Error("Embed field name cannot exceed 256 characters");
      }

      if (field.value.length > 1024) {
        throw new Error("Embed field value cannot exceed 1024 characters");
      }
    }

    this.#data.fields = [...fields];
    return this;
  }

  /**
   * Sets the type of the embed.
   *
   * @param type The type of embed to set
   * @returns This builder instance, for method chaining
   */
  setType(type: EmbedType): this {
    this.#data.type = type;
    return this;
  }

  /**
   * Builds and returns the final embed object.
   *
   * @returns The constructed embed entity
   * @throws Error If the total embed length exceeds Discord's limit
   */
  build(): EmbedEntity {
    // Validate total character count
    let totalCharCount = 0;

    if (this.#data.title) {
      totalCharCount += this.#data.title.length;
    }
    if (this.#data.description) {
      totalCharCount += this.#data.description.length;
    }
    if (this.#data.footer?.text) {
      totalCharCount += this.#data.footer.text.length;
    }
    if (this.#data.author?.name) {
      totalCharCount += this.#data.author.name.length;
    }

    if (this.#data.fields) {
      for (const field of this.#data.fields) {
        totalCharCount += field.name.length + field.value.length;
      }
    }

    if (totalCharCount > 6000) {
      throw new Error(
        "Total embed character count cannot exceed 6000 characters",
      );
    }

    // Ensure we have the required type property
    if (!this.#data.type) {
      this.#data.type = EmbedType.Rich;
    }

    return this.#data as EmbedEntity;
  }

  /**
   * Returns the current embed data without validation.
   *
   * @returns The current embed data
   */
  toJson(): Partial<EmbedEntity> {
    return { ...this.#data };
  }
}
