import {
  type EmbedAuthorEntity,
  EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedProviderEntity,
  type EmbedThumbnailEntity,
  type EmbedType,
  type EmbedVideoEntity,
} from "@nyxjs/core";
import { z } from "zod";

export class EmbedBuilder {
  readonly #data: Partial<z.input<typeof EmbedEntity>>;

  constructor(data: Partial<z.input<typeof EmbedEntity>> = {}) {
    this.#data = data;
  }

  get length(): number {
    return (
      (this.#data.title?.length ?? 0) +
      (this.#data.description?.length ?? 0) +
      (this.#data.fields?.reduce(
        (acc, field) => acc + field.name.length + field.value.length,
        0,
      ) ?? 0) +
      (this.#data.footer?.text.length ?? 0) +
      (this.#data.author?.name.length ?? 0)
    );
  }

  static from(data: z.input<typeof EmbedEntity>): EmbedBuilder {
    return new EmbedBuilder(data);
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

  setTimestamp(timestamp: string | number | Date = Date.now()): this {
    this.#data.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  setColor(color: number): this {
    this.#data.color = color;
    return this;
  }

  setFooter(footer: z.input<typeof EmbedFooterEntity>): this {
    this.#data.footer = footer;
    return this;
  }

  setImage(image: z.input<typeof EmbedImageEntity>): this {
    this.#data.image = image;
    return this;
  }

  setThumbnail(thumbnail: z.input<typeof EmbedThumbnailEntity>): this {
    this.#data.thumbnail = thumbnail;
    return this;
  }

  setVideo(video: z.input<typeof EmbedVideoEntity>): this {
    this.#data.video = video;
    return this;
  }

  setProvider(provider: z.input<typeof EmbedProviderEntity>): this {
    this.#data.provider = provider;
    return this;
  }

  setAuthor(author: z.input<typeof EmbedAuthorEntity>): this {
    this.#data.author = author;
    return this;
  }

  addField(field: z.input<typeof EmbedFieldEntity>): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    this.#data.fields.push(field);
    return this;
  }

  addFields(...fields: z.input<typeof EmbedFieldEntity>[]): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    this.#data.fields.push(...fields);
    return this;
  }

  setFields(fields: z.input<typeof EmbedFieldEntity>[]): this {
    this.#data.fields = fields;
    return this;
  }

  addBlankField(inline = false): this {
    return this.addField({ name: "\u200b", value: "\u200b", inline });
  }

  spliceFields(
    index: number,
    deleteCount: number,
    ...fields: z.input<typeof EmbedFieldEntity>[]
  ): this {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }
    this.#data.fields.splice(index, deleteCount, ...fields);
    return this;
  }

  removeField(index: number): this {
    if (this.#data.fields) {
      this.#data.fields.splice(index, 1);
    }
    return this;
  }

  toJson(): EmbedEntity {
    return EmbedEntity.parse(this.#data);
  }
}

export const EmbedBuilderSchema = z.instanceof(EmbedBuilder);
