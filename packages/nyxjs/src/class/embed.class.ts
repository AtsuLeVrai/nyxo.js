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
import { fromError } from "zod-validation-error";

export class Embed {
  readonly #data: EmbedEntity;

  constructor(data: Partial<z.input<typeof EmbedEntity>> = {}) {
    try {
      this.#data = EmbedEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get title(): string | null {
    return this.#data.title ?? null;
  }

  get type(): EmbedType {
    return this.#data.type;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get url(): string | null {
    return this.#data.url ?? null;
  }

  get timestamp(): string | null {
    return this.#data.timestamp ?? null;
  }

  get color(): number | null {
    return this.#data.color ?? null;
  }

  get footer(): EmbedFooterEntity | null {
    return this.#data.footer ?? null;
  }

  get image(): EmbedImageEntity | null {
    return this.#data.image ?? null;
  }

  get thumbnail(): EmbedThumbnailEntity | null {
    return this.#data.thumbnail ?? null;
  }

  get video(): EmbedVideoEntity | null {
    return this.#data.video ?? null;
  }

  get provider(): EmbedProviderEntity | null {
    return this.#data.provider ?? null;
  }

  get author(): EmbedAuthorEntity | null {
    return this.#data.author ?? null;
  }

  get fields(): EmbedFieldEntity[] {
    return this.#data.fields ?? [];
  }

  toJson(): EmbedEntity {
    return { ...this.#data };
  }

  clone(): Embed {
    return new Embed(this.toJson());
  }

  validate(): boolean {
    try {
      EmbedEntity.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<EmbedEntity>): Embed {
    return new Embed({ ...this.toJson(), ...other });
  }

  equals(other: Embed): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const EmbedSchema = z.instanceof(Embed);
