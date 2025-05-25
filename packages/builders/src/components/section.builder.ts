import {
  type ButtonEntity,
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
  type ThumbnailEntity,
} from "@nyxojs/core";

/**
 * A builder for creating Discord section components.
 *
 * Sections allow you to join text contextually with an accessory component.
 * This class follows the builder pattern to create section components.
 */
export class SectionBuilder {
  /** The internal section data being constructed */
  readonly #data: Partial<SectionEntity> = {
    type: ComponentType.Section,
  };

  /**
   * Creates a new SectionBuilder instance.
   *
   * @param data - Optional initial data to populate the section with
   */
  constructor(data?: SectionEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new SectionBuilder from existing section data.
   *
   * @param data - The section data to use
   * @returns A new SectionBuilder instance with the provided data
   */
  static from(data: SectionEntity): SectionBuilder {
    return new SectionBuilder(data);
  }

  /**
   * Adds a text display component to the section.
   *
   * @param component - The text display component to add
   * @returns The section builder instance for method chaining
   */
  addComponent(component: TextDisplayEntity): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple text display components to the section.
   *
   * @param components - The text display components to add
   * @returns The section builder instance for method chaining
   */
  addComponents(...components: TextDisplayEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  /**
   * Sets all text display components for the section, replacing any existing components.
   *
   * @param components - The text display components to set
   * @returns The section builder instance for method chaining
   */
  setComponents(components: TextDisplayEntity[]): this {
    this.#data.components = [...components];
    return this;
  }

  /**
   * Adds a text component with the given content.
   * This is a convenience method that creates a TextDisplay component internally.
   *
   * @param content - The text content to add
   * @returns The section builder instance for method chaining
   */
  addText(content: string): this {
    const textComponent = {
      type: ComponentType.TextDisplay,
      content,
    } as TextDisplayEntity;

    return this.addComponent(textComponent);
  }

  /**
   * Sets the accessory component for the section.
   *
   * @param accessory - The accessory component (thumbnail or button)
   * @returns The section builder instance for method chaining
   */
  setAccessory(accessory: ThumbnailEntity | ButtonEntity): this {
    this.#data.accessory = accessory;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The section builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final section entity object.
   * @returns The complete section entity
   */
  build(): SectionEntity {
    return this.#data as SectionEntity;
  }

  /**
   * Converts the section data to an immutable object.
   * @returns A read-only copy of the section data
   */
  toJson(): Readonly<SectionEntity> {
    return Object.freeze({ ...this.#data }) as SectionEntity;
  }
}
