import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * A builder for creating Discord thumbnail components.
 *
 * Thumbnails are small images that can be used as an accessory in a section.
 * This class follows the builder pattern to create thumbnail components.
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
  constructor(data?: ThumbnailEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new ThumbnailBuilder from existing thumbnail data.
   *
   * @param data - The thumbnail data to use
   * @returns A new ThumbnailBuilder instance with the provided data
   */
  static from(data: ThumbnailEntity): ThumbnailBuilder {
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
   * Sets the media URL for the thumbnail.
   * Convenience method that creates a media object from just a URL.
   *
   * @param url - The URL of the media
   * @returns The thumbnail builder instance for method chaining
   */
  setMediaUrl(url: string): this {
    if (this.#data.media) {
      this.#data.media.url = url;
    } else {
      this.#data.media = { url };
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
   */
  build(): ThumbnailEntity {
    return this.#data as ThumbnailEntity;
  }

  /**
   * Converts the thumbnail data to an immutable object.
   *
   * @returns A read-only copy of the thumbnail data
   */
  toJson(): Readonly<ThumbnailEntity> {
    return Object.freeze({ ...this.#data }) as ThumbnailEntity;
  }
}
