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
  constructor(
    client: Client,
    entity: Partial<z.input<typeof EmbedEntity>> = {},
  ) {
    super(client, EmbedEntity as z.ZodSchema, entity);
  }

  get title(): string | null {
    return this.entity.title ?? null;
  }

  get type(): EmbedType {
    return this.entity.type;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get url(): string | null {
    return this.entity.url ?? null;
  }

  get timestamp(): string | null {
    return this.entity.timestamp ?? null;
  }

  get color(): number | null {
    return this.entity.color ?? null;
  }

  get footer(): EmbedFooterEntity | null {
    return this.entity.footer ?? null;
  }

  get image(): EmbedImageEntity | null {
    return this.entity.image ?? null;
  }

  get thumbnail(): EmbedThumbnailEntity | null {
    return this.entity.thumbnail ?? null;
  }

  get video(): EmbedVideoEntity | null {
    return this.entity.video ?? null;
  }

  get provider(): EmbedProviderEntity | null {
    return this.entity.provider ?? null;
  }

  get author(): EmbedAuthorEntity | null {
    return this.entity.author ?? null;
  }

  get fields(): EmbedFieldEntity[] {
    return this.entity.fields ?? [];
  }

  toJson(): EmbedEntity {
    return { ...this.entity };
  }
}

export const EmbedSchema = z.instanceof(Embed);
