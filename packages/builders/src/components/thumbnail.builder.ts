import { ComponentType, type ThumbnailEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { ThumbnailSchema, UnfurledMediaItemSchema } from "../schemas/index.js";

/**
 * A builder for creating Discord thumbnail components.
 *
 * Thumbnails are small images that can be used as an accessory in a section.
 * This class follows the builder pattern to create thumbnail components with
 * validation through Zod schemas to ensure all elements meet Discord's requirements.
 */
export class ThumbnailBuilder {
  /** The internal thumbnail data being constructed */
  readonly #data: Partial<z.input<typeof ThumbnailSchema>> = {
    type: ComponentType.Thumbnail,
  };

  /**
   * Creates a new ThumbnailBuilder instance.
   *
   * @param data - Optional initial data to populate the thumbnail with
   */
  constructor(data?: z.input<typeof ThumbnailSchema>) {
    if (data) {
      // Validate the initial data
      const result = ThumbnailSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new ThumbnailBuilder from existing thumbnail data.
   *
   * @param data - The thumbnail data to use
   * @returns A new ThumbnailBuilder instance with the provided data
   */
  static from(data: z.input<typeof ThumbnailSchema>): ThumbnailBuilder {
    return new ThumbnailBuilder(data);
  }

  /**
   * Sets the media for the thumbnail.
   *
   * @param media - The media object with URL
   * @returns The thumbnail builder instance for method chaining
   */
  setMedia(media: z.input<typeof UnfurledMediaItemSchema>): this {
    const result = UnfurledMediaItemSchema.safeParse(media);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.media = result.data;
    return this;
  }

  /**
   * Sets the media URL for the thumbnail.
   * Convenience method that creates a media object from just a URL.
   *
   * @param url - The URL of the media
   * @returns The thumbnail builder instance for method chaining
   */
  setMediaUrl(url: string): this {
    const result = UnfurledMediaItemSchema.shape.url.safeParse(url);
    if (!result.success) {
      throw new Error("Invalid URL format");
    }

    if (this.#data.media) {
      this.#data.media.url = result.data;
    } else {
      this.#data.media = { url: result.data };
    }

    return this;
  }

  /**
   * Sets the description (alt text) for the thumbnail.
   * This is important for accessibility.
   *
   * @param description - The description to set
   * @returns The thumbnail builder instance for method chaining
   */
  setDescription(description: string): this {
    const result = ThumbnailSchema.shape.description.safeParse(description);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.description = result.data;
    return this;
  }

  /**
   * Sets whether the thumbnail should be a spoiler (blurred out).
   *
   * @param spoiler - Whether the thumbnail should be a spoiler
   * @returns The thumbnail builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The thumbnail builder instance for method chaining
   */
  setId(id: number): this {
    const result = ThumbnailSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final thumbnail entity object.
   *
   * @returns The complete thumbnail entity
   * @throws Error if the thumbnail configuration is invalid
   */
  build(): ThumbnailEntity {
    // Validate the entire thumbnail
    const result = ThumbnailSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the thumbnail.
   *
   * @returns A read-only copy of the thumbnail data
   */
  toJson(): Readonly<Partial<z.input<typeof ThumbnailSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
