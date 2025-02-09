import { StickerItemEntity } from "@nyxjs/core";
import { z } from "zod";

export class StickerItem {
  readonly #data: StickerItemEntity;

  constructor(data: StickerItemEntity) {
    this.#data = StickerItemEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get formatType(): unknown {
    return this.#data.format_type;
  }

  static fromJson(json: StickerItemEntity): StickerItem {
    return new StickerItem(json);
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
