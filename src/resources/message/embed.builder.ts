import { type ColorResolvable, resolveColor } from "../../utils/index.js";
import type {
  EmbedAuthorEntity,
  EmbedEntity,
  EmbedFieldEntity,
  EmbedFooterEntity,
  EmbedImageEntity,
  EmbedProviderEntity,
  EmbedThumbnailEntity,
  EmbedType,
  EmbedVideoEntity,
} from "./message.entity.js";

export class EmbedBuilder {
  readonly #data: Partial<EmbedEntity> = {};
  constructor(data?: EmbedEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: EmbedEntity): EmbedBuilder {
    return new EmbedBuilder(data);
  }
  setTitle(title: string): this {
    this.#data.title = title;
    return this;
  }
  setDescription(description: string): this {
    this.#data.description = description;
    return this;
  }
  setUrl(url: string): this {
    this.#data.url = url;
    return this;
  }
  setTimestamp(timestamp: Date | number | string = new Date()): this {
    this.#data.timestamp = new Date(timestamp).toISOString();
    return this;
  }
  setColor(color: ColorResolvable): this {
    this.#data.color = resolveColor(color);
    return this;
  }
  setType(type: EmbedType): this {
    this.#data.type = type;
    return this;
  }
  setFooter(footer: EmbedFooterEntity): this {
    this.#data.footer = footer;
    return this;
  }
  setImage(image: EmbedImageEntity): this {
    this.#data.image = image;
    return this;
  }
  setThumbnail(thumbnail: EmbedThumbnailEntity): this {
    this.#data.thumbnail = thumbnail;
    return this;
  }
  setAuthor(author: EmbedAuthorEntity): this {
    this.#data.author = author;
    return this;
  }
  setProvider(provider: EmbedProviderEntity): this {
    this.#data.provider = provider;
    return this;
  }
  setVideo(video: EmbedVideoEntity): this {
    this.#data.video = video;
    return this;
  }
  addField(field: EmbedFieldEntity): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }
    this.#data.fields.push(field);
    return this;
  }
  addFields(...fields: EmbedFieldEntity[]): this {
    for (const field of fields) {
      this.addField(field);
    }
    return this;
  }
  setFields(fields: EmbedFieldEntity[]): this {
    this.#data.fields = [];
    return this.addFields(...fields);
  }
  spliceFields(index: number, deleteCount: number, ...fields: EmbedFieldEntity[]): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }
    this.#data.fields.splice(index, deleteCount, ...fields);
    return this;
  }
  build(): EmbedEntity {
    return this.#data as EmbedEntity;
  }
  toJson(): Readonly<EmbedEntity> {
    return Object.freeze({ ...this.#data }) as EmbedEntity;
  }
}
