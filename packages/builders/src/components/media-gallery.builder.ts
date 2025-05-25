import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * A builder for creating Discord media gallery item components.
 *
 * Media gallery items represent individual items in a media gallery.
 * This class follows the builder pattern to create media gallery item components.
 */
export class MediaGalleryItemBuilder {
  /** The internal media gallery item data being constructed */
  readonly #data: Partial<MediaGalleryItemEntity> = {};

  /**
   * Creates a new MediaGalleryItemBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery item with
   */
  constructor(data?: MediaGalleryItemEntity) {
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
  static from(data: MediaGalleryItemEntity): MediaGalleryItemBuilder {
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
   * This is important for accessibility.
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
   * @returns The complete media gallery item entity
   */
  build(): MediaGalleryItemEntity {
    return this.#data as MediaGalleryItemEntity;
  }

  /**
   * Converts the media gallery item data to an immutable object.
   * @returns A read-only copy of the media gallery item data
   */
  toJson(): Readonly<MediaGalleryItemEntity> {
    return Object.freeze({ ...this.#data }) as MediaGalleryItemEntity;
  }
}

/**
 * A builder for creating Discord media gallery components.
 *
 * Media galleries allow you to display 1-10 media attachments in an organized gallery format.
 * This class follows the builder pattern to create media gallery components.
 */
export class MediaGalleryBuilder {
  /** The internal media gallery data being constructed */
  readonly #data: Partial<MediaGalleryEntity> = {
    type: ComponentType.MediaGallery,
  };

  /**
   * Creates a new MediaGalleryBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery with
   */
  constructor(data?: MediaGalleryEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new MediaGalleryBuilder from existing media gallery data.
   *
   * @param data - The media gallery data to use
   * @returns A new MediaGalleryBuilder instance with the provided data
   */
  static from(data: MediaGalleryEntity): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }

  /**
   * Adds an item to the media gallery.
   *
   * @param item - The media gallery item to add
   * @returns The media gallery builder instance for method chaining
   */
  addItem(item: MediaGalleryItemEntity): this {
    if (!this.#data.items) {
      this.#data.items = [];
    }

    this.#data.items.push(item);
    return this;
  }

  /**
   * Adds a media item directly using a URL.
   * This is a convenience method to add media items without creating MediaGalleryItemBuilder instances.
   *
   * @param url - The URL of the media
   * @param description - Optional description/alt text for the media
   * @param spoiler - Whether the media should be a spoiler (defaults to false)
   * @returns The media gallery builder instance for method chaining
   */
  addUrl(url: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url })
      .setDescription(description || "")
      .setSpoiler(spoiler)
      .build();

    return this.addItem(item);
  }

  /**
   * Adds a media item directly using an attachment reference.
   * This is a convenience method to add media items without creating MediaGalleryItemBuilder instances.
   *
   * @param filename - The filename of the attachment
   * @param description - Optional description/alt text for the media
   * @param spoiler - Whether the media should be a spoiler (defaults to false)
   * @returns The media gallery builder instance for method chaining
   */
  addAttachment(filename: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: `attachment://${filename}` })
      .setDescription(description || "")
      .setSpoiler(spoiler)
      .build();

    return this.addItem(item);
  }

  /**
   * Adds multiple items to the media gallery.
   *
   * @param items - The media gallery items to add
   * @returns The media gallery builder instance for method chaining
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
   */
  setItems(items: MediaGalleryItemEntity[]): this {
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
   * @returns The complete media gallery entity
   */
  build(): MediaGalleryEntity {
    return this.#data as MediaGalleryEntity;
  }

  /**
   * Converts the media gallery data to an immutable object.
   * @returns A read-only copy of the media gallery data
   */
  toJson(): Readonly<MediaGalleryEntity> {
    return Object.freeze({ ...this.#data }) as MediaGalleryEntity;
  }
}
