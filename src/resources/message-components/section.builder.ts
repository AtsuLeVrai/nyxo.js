import {
  type ButtonEntity,
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
  type ThumbnailEntity,
} from "./message-components.entity.js";

export class SectionBuilder {
  readonly #data: Partial<SectionEntity> = {
    type: ComponentType.Section,
  };
  constructor(data?: SectionEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: SectionEntity): SectionBuilder {
    return new SectionBuilder(data);
  }
  addComponent(component: TextDisplayEntity): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }
    this.#data.components.push(component);
    return this;
  }
  addComponents(...components: TextDisplayEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }
  setComponents(components: TextDisplayEntity[]): this {
    this.#data.components = [...components];
    return this;
  }
  addText(content: string): this {
    const textComponent = {
      type: ComponentType.TextDisplay,
      content,
    } as TextDisplayEntity;
    return this.addComponent(textComponent);
  }
  setAccessory(accessory: ThumbnailEntity | ButtonEntity): this {
    this.#data.accessory = accessory;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): SectionEntity {
    return this.#data as SectionEntity;
  }
  toJson(): Readonly<SectionEntity> {
    return Object.freeze({ ...this.#data }) as SectionEntity;
  }
}
