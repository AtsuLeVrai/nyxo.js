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
import type { CamelCasedPropertiesDeep } from "type-fest";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { snakeCaseDeep } from "../utils.js";
import { ColorBuilder, type ColorResolvable } from "./color.builder.js";

export class EmbedBuilder {
  readonly #data: z.input<typeof EmbedEntity> = {};

  constructor(data: z.input<typeof EmbedEntity> = {}) {
    this.#data = data;
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

  setTimestamp(timestamp: string = new Date().toISOString()): this {
    this.#data.timestamp = timestamp;
    return this;
  }

  setColor(color: ColorResolvable): this {
    this.#data.color = ColorBuilder.from(color).toDecimal();
    return this;
  }

  setFooter(options: CamelCasedPropertiesDeep<EmbedFooterEntity>): this {
    this.#data.footer = snakeCaseDeep(options);
    return this;
  }

  setImage(options: CamelCasedPropertiesDeep<EmbedImageEntity>): this {
    this.#data.image = snakeCaseDeep(options);
    return this;
  }

  setThumbnail(options: CamelCasedPropertiesDeep<EmbedThumbnailEntity>): this {
    this.#data.thumbnail = snakeCaseDeep(options);
    return this;
  }

  setVideo(options: CamelCasedPropertiesDeep<EmbedVideoEntity>): this {
    this.#data.video = snakeCaseDeep(options);
    return this;
  }

  setProvider(options: CamelCasedPropertiesDeep<EmbedProviderEntity>): this {
    this.#data.provider = snakeCaseDeep(options);
    return this;
  }

  setAuthor(options: CamelCasedPropertiesDeep<EmbedAuthorEntity>): this {
    this.#data.author = snakeCaseDeep(options);
    return this;
  }

  addField(options: CamelCasedPropertiesDeep<EmbedFieldEntity>): this {
    this.#data.fields = this.#data.fields ?? [];
    this.#data.fields.push(snakeCaseDeep(options));
    return this;
  }

  addFields(...options: CamelCasedPropertiesDeep<EmbedFieldEntity>[]): this {
    this.#data.fields = this.#data.fields ?? [];
    this.#data.fields.push(...options.map(snakeCaseDeep));
    return this;
  }

  setFields(options: CamelCasedPropertiesDeep<EmbedFieldEntity>[]): this {
    this.#data.fields = options.map(snakeCaseDeep);
    return this;
  }

  toJson(): z.output<typeof EmbedEntity> {
    try {
      return EmbedEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}
