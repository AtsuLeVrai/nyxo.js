import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "./message-components.entity.js";

export class ThumbnailBuilder {
  readonly #data: Partial<ThumbnailEntity> = {
    type: ComponentType.Thumbnail,
  };
  constructor(data?: ThumbnailEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: ThumbnailEntity): ThumbnailBuilder {
    return new ThumbnailBuilder(data);
  }
  setMedia(media: UnfurledMediaItemEntity): this {
    this.#data.media = media;
    return this;
  }
  setMediaUrl(url: string): this {
    if (this.#data.media) {
      this.#data.media.url = url;
    } else {
      this.#data.media = { url };
    }
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
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): ThumbnailEntity {
    return this.#data as ThumbnailEntity;
  }
  toJson(): Readonly<ThumbnailEntity> {
    return Object.freeze({ ...this.#data }) as ThumbnailEntity;
  }
}
