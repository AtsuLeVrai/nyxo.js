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
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class Embed extends BaseClass<EmbedEntity> {
  constructor(client: Client, data: Partial<z.input<typeof EmbedEntity>> = {}) {
    super(client, EmbedEntity as z.ZodSchema, data);
  }

  get title(): string | null {
    return this.data.title ?? null;
  }

  get type(): EmbedType {
    return this.data.type;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get url(): string | null {
    return this.data.url ?? null;
  }

  get timestamp(): string | null {
    return this.data.timestamp ?? null;
  }

  get color(): number | null {
    return this.data.color ?? null;
  }

  get footer(): EmbedFooterEntity | null {
    return this.data.footer ?? null;
  }

  get image(): EmbedImageEntity | null {
    return this.data.image ?? null;
  }

  get thumbnail(): EmbedThumbnailEntity | null {
    return this.data.thumbnail ?? null;
  }

  get video(): EmbedVideoEntity | null {
    return this.data.video ?? null;
  }

  get provider(): EmbedProviderEntity | null {
    return this.data.provider ?? null;
  }

  get author(): EmbedAuthorEntity | null {
    return this.data.author ?? null;
  }

  get fields(): EmbedFieldEntity[] {
    return this.data.fields ?? [];
  }

  toJson(): EmbedEntity {
    return { ...this.data };
  }
}

export const EmbedSchema = z.instanceof(Embed);
