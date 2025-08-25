import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
  type UnfurledMediaItemEntity,
} from "./message-components.entity.js";

export class MediaGalleryItemBuilder {
  readonly #data: Partial<MediaGalleryItemEntity> = {};
  constructor(data?: MediaGalleryItemEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: MediaGalleryItemEntity): MediaGalleryItemBuilder {
    return new MediaGalleryItemBuilder(data);
  }
  setMedia(media: UnfurledMediaItemEntity): this {
    this.#data.media = media;
    return this;
  }
  setDescription(description: string): this {
    this.#data.description = description;
    return this;
  }
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }
  build(): MediaGalleryItemEntity {
    return this.#data as MediaGalleryItemEntity;
  }
  toJson(): Readonly<MediaGalleryItemEntity> {
    return Object.freeze({ ...this.#data }) as MediaGalleryItemEntity;
  }
}

export class MediaGalleryBuilder {
  readonly #data: Partial<MediaGalleryEntity> = {
    type: ComponentType.MediaGallery,
  };
  constructor(data?: MediaGalleryEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: MediaGalleryEntity): MediaGalleryBuilder {
    return new MediaGalleryBuilder(data);
  }
  addItem(item: MediaGalleryItemEntity): this {
    if (!this.#data.items) {
      this.#data.items = [];
    }
    this.#data.items.push(item);
    return this;
  }
  addUrl(url: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url })
      .setDescription(description || "")
      .setSpoiler(spoiler)
      .build();
    return this.addItem(item);
  }
  addAttachment(filename: string, description?: string, spoiler = false): this {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: `attachment://${filename}` })
      .setDescription(description || "")
      .setSpoiler(spoiler)
      .build();
    return this.addItem(item);
  }
  addItems(...items: MediaGalleryItemEntity[]): this {
    for (const item of items) {
      this.addItem(item);
    }
    return this;
  }
  setItems(items: MediaGalleryItemEntity[]): this {
    this.#data.items = [...items];
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): MediaGalleryEntity {
    return this.#data as MediaGalleryEntity;
  }
  toJson(): Readonly<MediaGalleryEntity> {
    return Object.freeze({ ...this.#data }) as MediaGalleryEntity;
  }
}
