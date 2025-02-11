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
    data: Partial<z.input<typeof StickerItemEntity>> = {},
  ) {
    super(client, StickerItemEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  toJson(): StickerItemEntity {
    return { ...this.data };
  }
}

export const StickerItemSchema = z.instanceof(StickerItem);
