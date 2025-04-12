import {
  type EmbedAuthorEntity,
  type EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedProviderEntity,
  type EmbedThumbnailEntity,
  EmbedType,
  type EmbedVideoEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Zod schema for embed footer validation
 */
const EmbedFooterSchema = z.object({
  text: z.string().max(2048),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().optional(),
});

/**
 * Zod schema for embed author validation
 */
const EmbedAuthorSchema = z.object({
  name: z.string().max(256),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().optional(),
});

/**
 * Zod schema for embed field validation
 */
const EmbedFieldSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

/**
 * Zod schema for embed image validation
 */
const EmbedImageSchema = z.object({
  url: z.string().url(),
  proxy_url: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

/**
 * Zod schema for embed thumbnail validation
 */
const EmbedThumbnailSchema = z.object({
  url: z.string().url(),
  proxy_url: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

/**
 * Zod schema for embed video validation
 */
const EmbedVideoSchema = z.object({
  url: z.string().url().optional(),
  proxy_url: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

/**
 * Zod schema for embed provider validation
 */
const EmbedProviderSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
});

/**
 * Complete Zod schema for Discord embed validation
 * Enforces all Discord's limits including character counts and field restrictions
 */
const EmbedSchema = z
  .object({
    title: z.string().max(256).optional(),
    type: z.nativeEnum(EmbedType).default(EmbedType.Rich),
    description: z.string().max(4096).optional(),
    url: z.string().url().optional(),
    timestamp: z.string().optional(),
    color: z.number().optional(),
    footer: EmbedFooterSchema.optional(),
    image: EmbedImageSchema.optional(),
    thumbnail: EmbedThumbnailSchema.optional(),
    author: EmbedAuthorSchema.optional(),
    fields: z.array(EmbedFieldSchema).max(25).optional(),
    video: EmbedVideoSchema.optional(),
    provider: EmbedProviderSchema.optional(),
  })
  .refine(
    (data) => {
      // Validation of total character count (max 6000)
      let totalCharCount = 0;
      if (data.title) {
        totalCharCount += data.title.length;
      }
      if (data.description) {
        totalCharCount += data.description.length;
      }
      if (data.footer?.text) {
        totalCharCount += data.footer.text.length;
      }
      if (data.author?.name) {
        totalCharCount += data.author.name.length;
      }
      if (data.fields) {
        for (const field of data.fields) {
          totalCharCount += field.name.length + field.value.length;
        }
      }
      return totalCharCount <= 6000;
    },
    {
      message: "Total embed character count cannot exceed 6000 characters",
      path: ["_totalCharCount"],
    },
  );

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
   * @throws Error If title validation fails
   */
  setTitle(title: string): this {
    try {
      EmbedSchema.sourceType().shape.title.parse(title);
      this.#data.title = title;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the description of the embed.
   *
   * @param description The description to set (max 4096 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description validation fails
   */
  setDescription(description: string): this {
    try {
      EmbedSchema.sourceType().shape.description.parse(description);
      this.#data.description = description;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the URL of the embed.
   *
   * @param url The URL to set
   * @returns This builder instance, for method chaining
   * @throws Error If URL validation fails
   */
  setUrl(url: string): this {
    try {
      EmbedSchema.sourceType().shape.url.parse(url);
      this.#data.url = url;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
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
   * @throws Error If author validation fails
   */
  setAuthor(author: EmbedAuthorEntity): this {
    try {
      EmbedAuthorSchema.parse(author);
      this.#data.author = author;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the footer of the embed.
   *
   * @param footer The footer data to set
   * @returns This builder instance, for method chaining
   * @throws Error If footer validation fails
   */
  setFooter(footer: EmbedFooterEntity): this {
    try {
      EmbedFooterSchema.parse(footer);
      this.#data.footer = footer;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the thumbnail of the embed.
   *
   * @param thumbnail The thumbnail data to set
   * @returns This builder instance, for method chaining
   * @throws Error If thumbnail validation fails
   */
  setThumbnail(thumbnail: EmbedThumbnailEntity): this {
    try {
      EmbedThumbnailSchema.parse(thumbnail);
      this.#data.thumbnail = thumbnail;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the image of the embed.
   *
   * @param image The image data to set
   * @returns This builder instance, for method chaining
   * @throws Error If image validation fails
   */
  setImage(image: EmbedImageEntity): this {
    try {
      EmbedImageSchema.parse(image);
      this.#data.image = image;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the provider of the embed.
   *
   * @param provider The provider data to set
   * @returns This builder instance, for method chaining
   * @throws Error If provider validation fails
   */
  setProvider(provider: EmbedProviderEntity): this {
    try {
      EmbedProviderSchema.parse(provider);
      this.#data.provider = provider;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets the video of the embed.
   * Note: Videos are usually auto-embedded by Discord and not manually set.
   *
   * @param video The video data to set
   * @returns This builder instance, for method chaining
   * @throws Error If video validation fails
   */
  setVideo(video: EmbedVideoEntity): this {
    try {
      EmbedVideoSchema.parse(video);
      this.#data.video = video;
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Adds a field to the embed.
   *
   * @param field The field object to add
   * @returns This builder instance, for method chaining
   * @throws Error If field validation fails or limit exceeded
   */
  addField(field: EmbedFieldEntity): this {
    try {
      EmbedFieldSchema.parse(field);

      if (!this.#data.fields) {
        this.#data.fields = [];
      }

      if (this.#data.fields.length >= 25) {
        throw new Error("Embed cannot have more than 25 fields");
      }

      this.#data.fields.push(field);
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Adds multiple fields to the embed.
   *
   * @param fields An array of field objects to add
   * @returns This builder instance, for method chaining
   * @throws Error If field validation fails or limit exceeded
   */
  addFields(...fields: EmbedFieldEntity[]): this {
    try {
      for (const field of fields) {
        EmbedFieldSchema.parse(field);
      }

      if (!this.#data.fields) {
        this.#data.fields = [];
      }

      if (this.#data.fields.length + fields.length > 25) {
        throw new Error("Embed cannot have more than 25 fields");
      }

      this.#data.fields.push(...fields);
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
  }

  /**
   * Sets multiple fields at once, replacing any existing fields.
   *
   * @param fields An array of field objects to set
   * @returns This builder instance, for method chaining
   * @throws Error If validation fails or limit exceeded
   */
  setFields(fields: EmbedFieldEntity[]): this {
    try {
      const fieldsArray = z.array(EmbedFieldSchema).max(25);
      fieldsArray.parse(fields);

      this.#data.fields = [...fields];
      return this;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
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
   * Performs comprehensive validation to ensure all Discord limits are respected.
   *
   * @returns The constructed embed entity
   * @throws Error If validation fails
   */
  build(): EmbedEntity {
    try {
      // Validate the complete embed with Zod
      const result = EmbedSchema.parse(this.#data);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(fromZodError(error).message);
      }
      throw error;
    }
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
