import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  MediaGalleryItemSchema,
  MediaGallerySchema,
  UnfurledMediaItemSchema,
} from "../schemas/index.js";

/**
 * A builder for creating Discord media gallery item components.
 *
 * Media gallery items represent individual items in a media gallery.
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class MediaGalleryItemBuilder {
  /** The internal media gallery item data being constructed */
  readonly #data: Partial<z.infer<typeof MediaGalleryItemSchema>> = {};

  /**
   * Creates a new MediaGalleryItemBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery item with
   */
  constructor(data?: z.infer<typeof MediaGalleryItemSchema>) {
    if (data) {
      // Validate the initial data
      const result = MediaGalleryItemSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new MediaGalleryItemBuilder from existing media gallery item data.
   *
   * @param data - The media gallery item data to use
   * @returns A new MediaGalleryItemBuilder instance with the provided data
   */
  static from(
    data: z.infer<typeof MediaGalleryItemSchema>,
  ): MediaGalleryItemBuilder {
    return new MediaGalleryItemBuilder(data);
  }

  /**
   * Sets the media for the gallery item.
   *
   * @param media - The media object with URL
   * @returns The media gallery item builder instance for method chaining
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
   * Sets the description (alt text) for the gallery item.
   * This is important for accessibility.
   *
   * @param description - The description to set
   * @returns The media gallery item builder instance for method chaining
   */
  setDescription(description: string): this {
    const result =
      MediaGalleryItemSchema.shape.description.safeParse(description);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.description = result.data;
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
    // Validate the entire media gallery item
    const result = MediaGalleryItemSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the media gallery item.
   *
   * @returns A read-only copy of the media gallery item data
   */
  toJson(): Readonly<Partial<z.input<typeof MediaGalleryItemSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * A builder for creating Discord media gallery components.
 *
 * Media galleries allow you to display 1-10 media attachments in an organized gallery format.
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class MediaGalleryBuilder {
  /** The internal media gallery data being constructed */
  readonly #data: Partial<z.infer<typeof MediaGallerySchema>> = {
    type: ComponentType.MediaGallery,
  };

  /**
   * Creates a new MediaGalleryBuilder instance.
   *
   * @param data - Optional initial data to populate the media gallery with
   */
  constructor(data?: z.infer<typeof MediaGallerySchema>) {
    if (data) {
      // Validate the initial data
      const result = MediaGallerySchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new MediaGalleryBuilder from existing media gallery data.
   *
   * @param data - The media gallery data to use
   * @returns A new MediaGalleryBuilder instance with the provided data
   */
  static from(data: z.infer<typeof MediaGallerySchema>): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }

  /**
   * Adds an item to the media gallery.
   *
   * @param item - The media gallery item to add
   * @returns The media gallery builder instance for method chaining
   * @throws Error if adding the item would exceed the maximum of 10 items
   */
  addItem(item: z.input<typeof MediaGalleryItemSchema>): this {
    if (!this.#data.items) {
      this.#data.items = [];
    }

    if (this.#data.items.length >= 10) {
      throw new Error("Media galleries cannot have more than 10 items");
    }

    const result = MediaGalleryItemSchema.safeParse(item);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.items.push(result.data);
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
   * @throws Error if adding the items would exceed the maximum of 10 items
   */
  addItems(...items: z.input<typeof MediaGalleryItemSchema>[]): this {
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
  setItems(items: z.input<typeof MediaGalleryItemSchema>[]): this {
    if (items.length > 10) {
      throw new Error("Media galleries cannot have more than 10 items");
    }

    if (items.length === 0) {
      throw new Error("Media galleries must have at least one item");
    }

    this.#data.items = [];
    return this.addItems(...items);
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The media gallery builder instance for method chaining
   */
  setId(id: number): this {
    const result = MediaGallerySchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final media gallery entity object.
   *
   * @returns The complete media gallery entity
   * @throws Error if the media gallery configuration is invalid
   */
  build(): MediaGalleryEntity {
    // Validate the entire media gallery
    const result = MediaGallerySchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the media gallery.
   *
   * @returns A read-only copy of the media gallery data
   */
  toJson(): Readonly<Partial<z.input<typeof MediaGallerySchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
