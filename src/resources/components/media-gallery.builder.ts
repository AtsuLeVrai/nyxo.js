import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for individual media items in Discord media galleries.
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery-media-gallery-item-structure}
 */
export class MediaGalleryItemBuilder extends BaseBuilder<MediaGalleryItemEntity> {
  constructor(data?: Partial<MediaGalleryItemEntity>) {
    super(data || {});
  }

  /**
   * @description Creates a media gallery item builder from existing data.
   * @param data - Existing media gallery item data
   * @returns New media gallery item builder instance
   */
  static from(data: MediaGalleryItemEntity): MediaGalleryItemBuilder {
    return new MediaGalleryItemBuilder(data);
  }

  /**
   * @description Sets the complete media item for the gallery item.
   * @param media - Media item with URL and metadata
   * @returns This builder instance for method chaining
   */
  setMedia(media: UnfurledMediaItemEntity): this {
    return this.set("media", media);
  }

  /**
   * @description Sets the media URL, creating or updating the media object.
   * @param url - Image/video URL or attachment reference (attachment://filename)
   * @returns This builder instance for method chaining
   */
  setMediaUrl(url: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, url });
  }

  /**
   * @description Sets the alt text description for accessibility.
   * @param description - Alt text description (max 1024 characters)
   * @returns This builder instance for method chaining
   */
  setDescription(description: string): this {
    if (description.length > 1024) {
      throw new Error("Media gallery item description cannot exceed 1024 characters");
    }
    return this.set("description", description);
  }

  /**
   * @description Sets whether the media should be blurred as a spoiler.
   * @param spoiler - Whether media is a spoiler (defaults to true)
   * @returns This builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  /**
   * @description Creates a media gallery item from an attachment reference.
   * @param filename - Attachment filename (will be prefixed with attachment://)
   * @param description - Alt text description
   * @param spoiler - Whether media is a spoiler
   * @returns This builder instance for method chaining
   */
  setFromAttachment(filename: string, description?: string, spoiler = false): this {
    this.setMediaUrl(`attachment://${filename}`).setSpoiler(spoiler);
    if (description) this.setDescription(description);
    return this;
  }

  /**
   * @description Creates a media gallery item from a direct URL.
   * @param url - Direct media URL
   * @param description - Alt text description
   * @param spoiler - Whether media is a spoiler
   * @returns This builder instance for method chaining
   */
  setFromUrl(url: string, description?: string, spoiler = false): this {
    this.setMediaUrl(url).setSpoiler(spoiler);
    if (description) this.setDescription(description);
    return this;
  }

  /**
   * @description Validates media gallery item data before building.
   * @throws {Error} When media gallery item configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;

    if (!data.media) {
      throw new Error("Media gallery item must have media");
    }

    if (!data.media.url) {
      throw new Error("Media gallery item media must have a URL");
    }

    // Validate URL format
    const url = data.media.url;
    if (!url.startsWith("http") && !url.startsWith("attachment://")) {
      throw new Error("Media gallery item URL must be a valid HTTP URL or attachment reference");
    }
  }
}

/**
 * @description Professional builder for Discord media gallery components in Components v2.
 * Creates grid layouts for organizing multiple media items.
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery}
 */
export class MediaGalleryBuilder extends BaseBuilder<MediaGalleryEntity> {
  constructor(data?: Partial<MediaGalleryEntity>) {
    super({
      type: ComponentType.MediaGallery,
      items: [],
      ...data,
    });
  }

  /**
   * @description Creates a media gallery builder from existing data.
   * @param data - Existing media gallery entity data
   * @returns New media gallery builder instance
   */
  static from(data: MediaGalleryEntity): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }

  /**
   * @description Adds a single media item to the gallery.
   * @param item - Media gallery item
   * @returns This builder instance for method chaining
   */
  addItem(item: MediaGalleryItemEntity): this {
    return this.pushToArray("items", item);
  }

  /**
   * @description Adds multiple media items to the gallery.
   * @param items - Media gallery items
   * @returns This builder instance for method chaining
   */
  addItems(...items: MediaGalleryItemEntity[]): this {
    for (const item of items) {
      this.addItem(item);
    }
    return this;
  }

  /**
   * @description Sets all media items, replacing existing ones.
   * @param items - Media gallery items (1-10 items)
   * @returns This builder instance for method chaining
   */
  setItems(items: MediaGalleryItemEntity[]): this {
    if (items.length > 10) {
      throw new Error("Media gallery cannot have more than 10 items");
    }
    return this.setArray("items", items);
  }

  /**
   * @description Adds a media item from a direct URL.
   * @param url - Direct media URL
   * @param description - Alt text description
   * @param spoiler - Whether media is a spoiler
   * @returns This builder instance for method chaining
   */
  addUrl(url: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder().setFromUrl(url, description, spoiler).toJSON();
    return this.addItem(item);
  }

  /**
   * @description Adds a media item from an attachment reference.
   * @param filename - Attachment filename
   * @param description - Alt text description
   * @param spoiler - Whether media is a spoiler
   * @returns This builder instance for method chaining
   */
  addAttachment(filename: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setFromAttachment(filename, description, spoiler)
      .toJSON();
    return this.addItem(item);
  }

  /**
   * @description Adds multiple URLs as gallery items.
   * @param urls - Array of media URLs
   * @param spoiler - Whether all media should be spoilers
   * @returns This builder instance for method chaining
   */
  addUrls(urls: string[], spoiler = false): this {
    for (const url of urls) {
      this.addUrl(url, undefined, spoiler);
    }
    return this;
  }

  /**
   * @description Adds multiple attachments as gallery items.
   * @param filenames - Array of attachment filenames
   * @param spoiler - Whether all media should be spoilers
   * @returns This builder instance for method chaining
   */
  addAttachments(filenames: string[], spoiler = false): this {
    for (const filename of filenames) {
      this.addAttachment(filename, undefined, spoiler);
    }
    return this;
  }

  /**
   * @description Sets the unique component identifier within the message.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Creates a simple image gallery from URLs.
   * @param urls - Array of image URLs (1-10)
   * @param spoiler - Whether images should be spoilers
   * @returns This builder instance for method chaining
   */
  createImageGallery(urls: string[], spoiler = false): this {
    return this.addUrls(urls, spoiler);
  }

  /**
   * @description Creates a simple attachment gallery from filenames.
   * @param filenames - Array of attachment filenames (1-10)
   * @param spoiler - Whether attachments should be spoilers
   * @returns This builder instance for method chaining
   */
  createAttachmentGallery(filenames: string[], spoiler = false): this {
    return this.addAttachments(filenames, spoiler);
  }

  /**
   * @description Validates media gallery data before building.
   * @throws {Error} When media gallery configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;

    if (!data.items || data.items.length === 0) {
      throw new Error("Media gallery must have at least one item");
    }

    if (data.items.length > 10) {
      throw new Error("Media gallery cannot have more than 10 items");
    }

    // Validate each item
    for (const item of data.items) {
      if (!item.media) {
        throw new Error("All media gallery items must have media");
      }
      if (!item.media.url) {
        throw new Error("All media gallery item media must have a URL");
      }
    }
  }
}
