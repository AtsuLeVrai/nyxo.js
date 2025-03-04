import type { z } from "zod";
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
} from "../entities/index.js";

export class EmbedBuilder {
  readonly #embed: z.input<typeof EmbedEntity>;

  constructor(data: z.input<typeof EmbedEntity> = {}) {
    this.#embed = data;
  }

  static from(data: z.input<typeof EmbedEntity> = {}): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  setTitle(title: string): this {
    this.#embed.title = title;
    return this;
  }

  setType(type: EmbedType): this {
    this.#embed.type = type;
    return this;
  }

  setDescription(description: string): this {
    this.#embed.description = description;
    return this;
  }

  setUrl(url: string): this {
    this.#embed.url = url;
    return this;
  }

  setTimestamp(timestamp: Date | string | number = new Date()): this {
    this.#embed.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  setColor(color: number): this {
    this.#embed.color = color;
    return this;
  }

  setFooter(footer: z.input<typeof EmbedFooterEntity>): this {
    this.#embed.footer = footer;
    return this;
  }

  setImage(image: z.input<typeof EmbedImageEntity>): this {
    this.#embed.image = image;
    return this;
  }

  setThumbnail(thumbnail: z.input<typeof EmbedThumbnailEntity>): this {
    this.#embed.thumbnail = thumbnail;
    return this;
  }

  setAuthor(author: z.input<typeof EmbedAuthorEntity>): this {
    this.#embed.author = author;
    return this;
  }

  setProvider(provider: z.input<typeof EmbedProviderEntity>): this {
    this.#embed.provider = provider;
    return this;
  }

  setVideo(video: z.input<typeof EmbedVideoEntity>): this {
    this.#embed.video = video;
    return this;
  }

  setFields(fields: z.input<typeof EmbedFieldEntity>[]): this {
    this.#embed.fields = fields;
    return this;
  }

  addField(field: z.input<typeof EmbedFieldEntity>): this {
    if (!this.#embed.fields) {
      this.#embed.fields = [];
    }

    this.#embed.fields.push(field);
    return this;
  }

  addFields(...fields: z.input<typeof EmbedFieldEntity>[]): this {
    for (const field of fields) {
      this.addField(field);
    }

    return this;
  }

  toJson(): EmbedEntity {
    return EmbedEntity.parse(this.#embed);
  }
}
