import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

export class MediaGalleryItemBuilder extends BaseBuilder<MediaGalleryItemEntity> {
  constructor(data?: Partial<MediaGalleryItemEntity>) {
    super(data || {});
  }

  static from(data: MediaGalleryItemEntity): MediaGalleryItemBuilder {
    return new MediaGalleryItemBuilder(data);
  }

  setMedia(media: UnfurledMediaItemEntity): this {
    return this.set("media", media);
  }

  setMediaUrl(url: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, url });
  }

  setDescription(description: string): this {
    if (description.length > 1024) {
      throw new Error("Media gallery item description cannot exceed 1024 characters");
    }
    return this.set("description", description);
  }

  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  setFromAttachment(filename: string, description?: string, spoiler = false): this {
    this.setMediaUrl(`attachment://${filename}`).setSpoiler(spoiler);
    if (description) this.setDescription(description);
    return this;
  }

  setFromUrl(url: string, description?: string, spoiler = false): this {
    this.setMediaUrl(url).setSpoiler(spoiler);
    if (description) this.setDescription(description);
    return this;
  }

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

export class MediaGalleryBuilder extends BaseBuilder<MediaGalleryEntity> {
  constructor(data?: Partial<MediaGalleryEntity>) {
    super({
      type: ComponentType.MediaGallery,
      items: [],
      ...data,
    });
  }

  static from(data: MediaGalleryEntity): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }

  addItem(item: MediaGalleryItemEntity): this {
    return this.pushToArray("items", item);
  }

  addItems(...items: MediaGalleryItemEntity[]): this {
    for (const item of items) {
      this.addItem(item);
    }
    return this;
  }

  setItems(items: MediaGalleryItemEntity[]): this {
    if (items.length > 10) {
      throw new Error("Media gallery cannot have more than 10 items");
    }
    return this.setArray("items", items);
  }

  addUrl(url: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder().setFromUrl(url, description, spoiler).toJSON();
    return this.addItem(item);
  }

  addAttachment(filename: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setFromAttachment(filename, description, spoiler)
      .toJSON();
    return this.addItem(item);
  }

  addUrls(urls: string[], spoiler = false): this {
    for (const url of urls) {
      this.addUrl(url, undefined, spoiler);
    }
    return this;
  }

  addAttachments(filenames: string[], spoiler = false): this {
    for (const filename of filenames) {
      this.addAttachment(filename, undefined, spoiler);
    }
    return this;
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  createImageGallery(urls: string[], spoiler = false): this {
    return this.addUrls(urls, spoiler);
  }

  createAttachmentGallery(filenames: string[], spoiler = false): this {
    return this.addAttachments(filenames, spoiler);
  }

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
