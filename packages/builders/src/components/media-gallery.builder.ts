import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * Builder for media gallery item components.
 *
 * Media gallery items represent individual items in a media gallery.
 *
 * @example
 * ```typescript
 * const item = new MediaGalleryItemBuilder()
 *   .setMedia({ url: 'https://example.com/image.png' })
 *   .setDescription('An example image')
 *   .build();
 * ```
 */
export class MediaGalleryItemBuilder {
  /** The internal media gallery item data being constructed */
  readonly #data: Partial<MediaGalleryItemEntity> = {};

  /**
   * Creates a new MediaGalleryItemBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery item with
   */
  constructor(data?: Partial<MediaGalleryItemEntity>) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new MediaGalleryItemBuilder from existing media gallery item data.
   *
   * @param data - The media gallery item data to use
   * @returns A new MediaGalleryItemBuilder instance with the provided data
   */
  static from(data: Partial<MediaGalleryItemEntity>): MediaGalleryItemBuilder {
    return new MediaGalleryItemBuilder(data);
  }

  /**
   * Sets the media for the gallery item.
   *
   * @param media - The media object with URL
   * @returns The media gallery item builder instance for method chaining
   */
  setMedia(media: UnfurledMediaItemEntity): this {
    this.#data.media = media;
    return this;
  }

  /**
   * Sets the description (alt text) for the gallery item.
   *
   * @param description - The description to set
   * @returns The media gallery item builder instance for method chaining
   */
  setDescription(description: string): this {
    this.#data.description = description;
    return this;
  }

  /**
   * Sets whether the gallery item should be a spoiler (blurred out).
   *
   * @param spoiler - Whether the gallery item should be a spoiler
   * @returns The media gallery item builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }

  /**
   * Builds the final media gallery item entity object.
   *
   * @returns The complete media gallery item entity
   * @throws Error if the gallery item configuration is invalid
   */
  build(): MediaGalleryItemEntity {
    if (!this.#data.media?.url) {
      throw new Error("Media gallery item must have media with a URL");
    }

    return this.#data as MediaGalleryItemEntity;
  }

  /**
   * Returns a JSON representation of the media gallery item.
   *
   * @returns A read-only copy of the media gallery item data
   */
  toJson(): Readonly<Partial<MediaGalleryItemEntity>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * Builder for media gallery components.
 *
 * Media galleries allow you to display 1-10 media attachments in an organized gallery format.
 *
 * @example
 * ```typescript
 * const gallery = new MediaGalleryBuilder()
 *   .addItem(
 *     new MediaGalleryItemBuilder()
 *       .setMedia({ url: 'https://example.com/image1.png' })
 *       .build()
 *   )
 *   .addItem(
 *     new MediaGalleryItemBuilder()
 *       .setMedia({ url: 'https://example.com/image2.png' })
 *       .build()
 *   )
 *   .build();
 * ```
 */
export class MediaGalleryBuilder {
  /** The internal media gallery data being constructed */
  readonly #data: Partial<MediaGalleryEntity> = {
    type: ComponentType.MediaGallery,
    items: [],
  };

  /**
   * Creates a new MediaGalleryBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery with
   */
  constructor(data?: Partial<MediaGalleryEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.MediaGallery, // Ensure type is set correctly
        items: data.items ? [...data.items] : [],
      };
    }
  }

  /**
   * Creates a new MediaGalleryBuilder from existing media gallery data.
   *
   * @param data - The media gallery data to use
   * @returns A new MediaGalleryBuilder instance with the provided data
   */
  static from(data: Partial<MediaGalleryEntity>): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }

  /**
   * Adds an item to the media gallery.
   *
   * @param item - The media gallery item to add
   * @returns The media gallery builder instance for method chaining
   * @throws Error if adding the item would exceed the maximum of 10 items
   */
  addItem(item: MediaGalleryItemEntity): this {
    if (!this.#data.items) {
      this.#data.items = [];
    }

    if (this.#data.items.length >= 10) {
      throw new Error("Media galleries cannot have more than 10 items");
    }

    this.#data.items.push(item);
    return this;
  }

  /**
   * Adds multiple items to the media gallery.
   *
   * @param items - The media gallery items to add
   * @returns The media gallery builder instance for method chaining
   * @throws Error if adding the items would exceed the maximum of 10 items
   */
  addItems(...items: MediaGalleryItemEntity[]): this {
    for (const item of items) {
      this.addItem(item);
    }
    return this;
  }

  /**
   * Sets all items for the media gallery, replacing any existing items.
   *
   * @param items - The media gallery items to set
   * @returns The media gallery builder instance for method chaining
   * @throws Error if too many items are provided
   */
  setItems(items: MediaGalleryItemEntity[]): this {
    if (items.length > 10) {
      throw new Error("Media galleries cannot have more than 10 items");
    }

    this.#data.items = [...items];
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The media gallery builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final media gallery entity object.
   *
   * @returns The complete media gallery entity
   * @throws Error if the media gallery configuration is invalid
   */
  build(): MediaGalleryEntity {
    if (!this.#data.items || this.#data.items.length === 0) {
      throw new Error("Media gallery must have at least one item");
    }

    if (this.#data.items.length > 10) {
      throw new Error("Media galleries cannot have more than 10 items");
    }

    return this.#data as MediaGalleryEntity;
  }

  /**
   * Returns a JSON representation of the media gallery.
   *
   * @returns A read-only copy of the media gallery data
   */
  toJson(): Readonly<Partial<MediaGalleryEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
