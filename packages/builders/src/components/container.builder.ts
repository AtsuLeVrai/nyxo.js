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

/**
 * Builder for container components.
 *
 * Containers are top-level layout components that hold up to 10 components
 * and are visually distinct with an optional customizable color bar.
 *
 * @example
 * ```typescript
 * const container = new ContainerBuilder()
 *   .addComponent(
 *     new TextDisplayBuilder()
 *       .setContent('# Hello World')
 *       .build()
 *   )
 *   .setAccentColor(0xFF0000)
 *   .build();
 * ```
 */
export class ContainerBuilder {
  /** The internal container data being constructed */
  readonly #data: Partial<ContainerEntity> = {
    type: ComponentType.Container,
    components: [],
  };

  /**
   * Creates a new ContainerBuilder instance.
   *
   * @param data - Optional initial data to populate the container with
   */
  constructor(data?: Partial<ContainerEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.Container, // Ensure type is set correctly
        components: data.components ? [...data.components] : [],
      };
    }
  }

  /**
   * Creates a new ContainerBuilder from existing container data.
   *
   * @param data - The container data to use
   * @returns A new ContainerBuilder instance with the provided data
   */
  static from(data: Partial<ContainerEntity>): ContainerBuilder {
    return new ContainerBuilder(data);
  }

  /**
   * Adds a component to the container.
   *
   * @param component - The component to add
   * @returns The container builder instance for method chaining
   * @throws Error if adding the component would exceed the maximum of 10 components
   * or if the component type is not supported
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

    if (this.#data.components.length >= 10) {
      throw new Error("Containers cannot have more than 10 components");
    }

    // Check if the component type is supported
    if (
      component.type !== ComponentType.ActionRow &&
      component.type !== ComponentType.TextDisplay &&
      component.type !== ComponentType.Section &&
      component.type !== ComponentType.MediaGallery &&
      component.type !== ComponentType.Separator &&
      component.type !== ComponentType.File
    ) {
      throw new Error(
        "Container only supports ActionRow, TextDisplay, Section, MediaGallery, Separator, and File components",
      );
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple components to the container.
   *
   * @param components - The components to add
   * @returns The container builder instance for method chaining
   * @throws Error if adding the components would exceed the maximum of 10 components
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
   * @throws Error if too many components are provided
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
    if (components.length > 10) {
      throw new Error("Containers cannot have more than 10 components");
    }

    // Check if all component types are supported
    for (const component of components) {
      if (
        component.type !== ComponentType.ActionRow &&
        component.type !== ComponentType.TextDisplay &&
        component.type !== ComponentType.Section &&
        component.type !== ComponentType.MediaGallery &&
        component.type !== ComponentType.Separator &&
        component.type !== ComponentType.File
      ) {
        throw new Error(
          "Container only supports ActionRow, TextDisplay, Section, MediaGallery, Separator, and File components",
        );
      }
    }

    this.#data.components = [...components];
    return this;
  }

  /**
   * Sets the accent color for the container.
   *
   * @param color - RGB color from 0x000000 to 0xFFFFFF
   * @returns The container builder instance for method chaining
   * @throws Error if color is out of range
   */
  setAccentColor(color: number): this {
    if (color < 0 || color > 0xffffff) {
      throw new Error("Accent color must be between 0x000000 and 0xFFFFFF");
    }

    this.#data.accent_color = color;
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
   *
   * @returns The complete container entity
   * @throws Error if the container configuration is invalid
   */
  build(): ContainerEntity {
    if (!this.#data.components || this.#data.components.length === 0) {
      throw new Error("Container must have at least one component");
    }

    if (this.#data.components.length > 10) {
      throw new Error("Containers cannot have more than 10 components");
    }

    return this.#data as ContainerEntity;
  }

  /**
   * Returns a JSON representation of the container.
   *
   * @returns A read-only copy of the container data
   */
  toJson(): Readonly<Partial<ContainerEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
