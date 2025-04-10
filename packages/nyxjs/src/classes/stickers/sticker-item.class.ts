import type {
  Snowflake,
  StickerFormatType,
  StickerItemEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class StickerItem
  extends BaseClass<StickerItemEntity>
  implements EnforceCamelCase<StickerItemEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
