import {
  type ActionRowEntity,
  ComponentType,
  type ContainerEntity,
  type FileEntity,
  type MediaGalleryEntity,
  type SectionEntity,
  type SeparatorEntity,
  type TextDisplayEntity,
} from "@nyxojs/core";
import { type ColorResolvable, resolveColor } from "../utils/index.js";

/**
 * A builder for creating Discord container components.
 *
 * Containers are top-level layout components that hold up to 10 components and
 * are visually distinct with an optional customizable color bar.
 */
export class ContainerBuilder {
  /** The internal container data being constructed */
  readonly #data: Partial<ContainerEntity> = {
    type: ComponentType.Container,
  };

  /**
   * Creates a new ContainerBuilder instance.
   *
   * @param data - Optional initial data to populate the container with
   */
  constructor(data?: ContainerEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new ContainerBuilder from existing container data.
   *
   * @param data - The container data to use
   * @returns A new ContainerBuilder instance with the provided data
   */
  static from(data: ContainerEntity): ContainerBuilder {
    return new ContainerBuilder(data);
  }

  /**
   * Adds a component to the container.
   *
   * @param component - The component to add
   * @returns The container builder instance for method chaining
   */
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

  /**
   * Adds multiple components to the container.
   *
   * @param components - The components to add
   * @returns The container builder instance for method chaining
   */
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

  /**
   * Sets all components for the container, replacing any existing components.
   *
   * @param components - The components to set
   * @returns The container builder instance for method chaining
   */
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

  /**
   * Adds a text component with the given content.
   * This is a convenience method that creates a TextDisplay component internally.
   *
   * @param content - The text content to add
   * @returns The container builder instance for method chaining
   */
  addText(content: string): this {
    const textComponent = {
      type: ComponentType.TextDisplay,
      content,
    } as TextDisplayEntity;

    return this.addComponent(textComponent);
  }

  /**
   * Sets the accent color for the container.
   *
   * @param color - RGB color from 0x000000 to 0xFFFFFF, hex string, or RGB array
   * @returns The container builder instance for method chaining
   */
  setAccentColor(color: ColorResolvable): this {
    this.#data.accent_color = resolveColor(color);
    return this;
  }

  /**
   * Sets whether the container should be a spoiler (blurred out).
   *
   * @param spoiler - Whether the container should be a spoiler
   * @returns The container builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The container builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final container entity object.
   * @returns The complete container entity
   */
  build(): ContainerEntity {
    return this.#data as ContainerEntity;
  }

  /**
   * Converts the container data to an immutable object.
   * @returns A read-only copy of the container data
   */
  toJson(): Readonly<ContainerEntity> {
    return Object.freeze({ ...this.#data }) as ContainerEntity;
  }
}
