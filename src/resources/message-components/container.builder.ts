import { type ColorResolvable, resolveColor } from "../../utils/index.js";
import {
  type ActionRowEntity,
  ComponentType,
  type ContainerEntity,
  type FileEntity,
  type MediaGalleryEntity,
  type SectionEntity,
  type SeparatorEntity,
  type TextDisplayEntity,
} from "./message-components.entity.js";

export class ContainerBuilder {
  readonly #data: Partial<ContainerEntity> = {
    type: ComponentType.Container,
  };
  constructor(data?: ContainerEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: ContainerEntity): ContainerBuilder {
    return new ContainerBuilder(data);
  }
  addComponent(
    component:
      | ActionRowEntity
      | TextDisplayEntity
      | SectionEntity
      | MediaGalleryEntity
      | SeparatorEntity
      | FileEntity,
  ): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }
    this.#data.components.push(component);
    return this;
  }
  addComponents(
    ...components: (
      | ActionRowEntity
      | TextDisplayEntity
      | SectionEntity
      | MediaGalleryEntity
      | SeparatorEntity
      | FileEntity
    )[]
  ): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }
  setComponents(
    components: (
      | ActionRowEntity
      | TextDisplayEntity
      | SectionEntity
      | MediaGalleryEntity
      | SeparatorEntity
      | FileEntity
    )[],
  ): this {
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
  setAccentColor(color: ColorResolvable): this {
    this.#data.accent_color = resolveColor(color);
    return this;
  }
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): ContainerEntity {
    return this.#data as ContainerEntity;
  }
  toJson(): Readonly<ContainerEntity> {
    return Object.freeze({ ...this.#data }) as ContainerEntity;
  }
}
