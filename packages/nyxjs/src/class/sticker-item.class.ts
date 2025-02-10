import {
  type Snowflake,
  type StickerFormatType,
  StickerItemEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class StickerItem {
  readonly #data: StickerItemEntity;

  constructor(data: Partial<z.input<typeof StickerItemEntity>> = {}) {
    try {
      this.#data = StickerItemEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get formatType(): StickerFormatType {
    return this.#data.format_type;
  }

  toJson(): StickerItemEntity {
    return { ...this.#data };
  }

  clone(): StickerItem {
    return new StickerItem(this.toJson());
  }

  validate(): boolean {
    try {
      StickerItemSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<StickerItemEntity>): StickerItem {
    return new StickerItem({ ...this.toJson(), ...other });
  }

  equals(other: StickerItem): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const StickerItemSchema = z.instanceof(StickerItem);
