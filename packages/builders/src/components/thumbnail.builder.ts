import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * Builder for thumbnail components.
 *
 * Thumbnails are small images that can be used as an accessory in a section.
 *
 * @example
 * ```typescript
 * const thumbnail = new ThumbnailBuilder()
 *   .setMedia({ url: 'https://example.com/image.png' })
 *   .setDescription('An example image')
 *   .build();
 * ```
 */
export class ThumbnailBuilder {
  /** The internal thumbnail data being constructed */
  readonly #data: Partial<ThumbnailEntity> = {
    type: ComponentType.Thumbnail,
  };

  /**
   * Creates a new ThumbnailBuilder instance.
   *
   * @param data - Optional initial data to populate the thumbnail with
   */
  constructor(data?: Partial<ThumbnailEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.Thumbnail, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new ThumbnailBuilder from existing thumbnail data.
   *
   * @param data - The thumbnail data to use
   * @returns A new ThumbnailBuilder instance with the provided data
   */
  static from(data: Partial<ThumbnailEntity>): ThumbnailBuilder {
    return new ThumbnailBuilder(data);
  }

  /**
   * Sets the media for the thumbnail.
   *
   * @param media - The media object with URL
   * @returns The thumbnail builder instance for method chaining
   */
  setMedia(media: UnfurledMediaItemEntity): this {
    this.#data.media = media;
    return this;
  }

  /**
   * Sets the description (alt text) for the thumbnail.
   *
   * @param description - The description to set
   * @returns The thumbnail builder instance for method chaining
   */
  setDescription(description: string): this {
    this.#data.description = description;
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
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final thumbnail entity object.
   *
   * @returns The complete thumbnail entity
   * @throws Error if the thumbnail configuration is invalid
   */
  build(): ThumbnailEntity {
    if (!this.#data.media?.url) {
      throw new Error("Thumbnail must have media with a URL");
    }

    return this.#data as ThumbnailEntity;
  }

  /**
   * Returns a JSON representation of the thumbnail.
   *
   * @returns A read-only copy of the thumbnail data
   */
  toJson(): Readonly<Partial<ThumbnailEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
