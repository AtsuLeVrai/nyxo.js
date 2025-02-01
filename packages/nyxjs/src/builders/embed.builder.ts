import {
  type EmbedAuthorEntity,
  EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedThumbnailEntity,
  EmbedType,
} from "@nyxjs/core";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { ColorHandler, type ColorInput } from "../handlers/index.js";

export class EmbedBuilder {
  #data: EmbedEntity;

  constructor(data: z.input<typeof EmbedEntity> = {}) {
    try {
      this.#data = EmbedEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  static from(data: z.input<typeof EmbedEntity>): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  static createRich(): EmbedBuilder {
    return new EmbedBuilder().setType(EmbedType.Rich);
  }

  static createImage(url: string): EmbedBuilder {
    return new EmbedBuilder().setType(EmbedType.Image).setImage({ url });
  }

  static createVideo(url: string): EmbedBuilder {
    return new EmbedBuilder().setType(EmbedType.Video).setVideo({ url });
  }

  static createArticle(title: string, url: string): EmbedBuilder {
    return new EmbedBuilder()
      .setType(EmbedType.Article)
      .setTitle(title)
      .setUrl(url);
  }

  setTitle(title: string): this {
    this.#data.title = title;
    return this;
  }

  setType(type: EmbedType): this {
    this.#data.type = type;
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

  setColor(color: ColorInput): this {
    this.#data.color = new ColorHandler(color).toNumber();
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

  setVideo(video: EmbedImageEntity): this {
    this.#data.video = video;
    return this;
  }

  setProvider(provider: EmbedImageEntity): this {
    this.#data.provider = provider;
    return this;
  }

  setAuthor(author: EmbedAuthorEntity): this {
    this.#data.author = author;
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

  spliceFields(
    index: number,
    deleteCount: number,
    ...fields: EmbedFieldEntity[]
  ): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    this.#data.fields.splice(index, deleteCount, ...fields);
    return this;
  }

  setFields(fields: EmbedFieldEntity[]): this {
    this.#data.fields = [];
    return this.addFields(...fields);
  }

  isEmpty(): boolean {
    return Object.keys(this.#data).length <= 1;
  }

  getLength(): number {
    let length = 0;

    if (this.#data.title) {
      length += this.#data.title.length;
    }

    if (this.#data.description) {
      length += this.#data.description.length;
    }

    if (this.#data.footer?.text) {
      length += this.#data.footer.text.length;
    }

    if (this.#data.author?.name) {
      length += this.#data.author.name.length;
    }

    if (this.#data.fields) {
      length += this.#data.fields.reduce(
        (acc, field) => acc + field.name.length + field.value.length,
        0,
      );
    }

    return length;
  }

  isValid(): boolean {
    try {
      EmbedEntity.parse(this.#data);
      return true;
    } catch {
      return false;
    }
  }

  equals(other: EmbedBuilder): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }

  clone(): EmbedBuilder {
    return new EmbedBuilder(this.toJson());
  }

  clear(): this {
    this.#data = EmbedEntity.parse({
      type: this.#data.type,
    });

    return this;
  }

  toJson(): EmbedEntity {
    return EmbedEntity.parse(this.#data);
  }
}
