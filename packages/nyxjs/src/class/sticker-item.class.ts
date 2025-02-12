import {
  type Snowflake,
  type StickerFormatType,
  StickerItemEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class StickerItem extends BaseClass<StickerItemEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof StickerItemEntity>> = {},
  ) {
    super(client, StickerItemEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get formatType(): StickerFormatType {
    return this.entity.format_type;
  }

  toJson(): StickerItemEntity {
    return { ...this.entity };
  }
}

export const StickerItemSchema = z.instanceof(StickerItem);
