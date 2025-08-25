import { ComponentType, type SeparatorEntity } from "./message-components.entity.js";

export class SeparatorBuilder {
  readonly #data: Partial<SeparatorEntity> = {
    type: ComponentType.Separator,
  };
  constructor(data?: SeparatorEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: SeparatorEntity): SeparatorBuilder {
    return new SeparatorBuilder(data);
  }
  setDivider(divider = true): this {
    this.#data.divider = divider;
    return this;
  }
  setSpacing(spacing: 1 | 2): this {
    this.#data.spacing = spacing;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): SeparatorEntity {
    return this.#data as SeparatorEntity;
  }
  toJson(): Readonly<SeparatorEntity> {
    return Object.freeze({ ...this.#data }) as SeparatorEntity;
  }
}
