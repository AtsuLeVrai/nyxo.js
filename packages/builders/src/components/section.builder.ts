import {
  type ButtonEntity,
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
  type ThumbnailEntity,
} from "@nyxojs/core";

/**
 * Builder for section components.
 *
 * Sections allow you to join text contextually with an accessory component.
 */
export class SectionBuilder {
  /** The internal section data being constructed */
  readonly #data: Partial<SectionEntity> = {
    type: ComponentType.Section,
    components: [],
  };

  /**
   * Creates a new SectionBuilder instance.
   *
   * @param data - Optional initial data to populate the section with
   */
  constructor(data?: Partial<SectionEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.Section, // Ensure type is set correctly
        components: data.components ? [...data.components] : [],
      };
    }
  }

  /**
   * Creates a new SectionBuilder from existing section data.
   *
   * @param data - The section data to use
   * @returns A new SectionBuilder instance with the provided data
   */
  static from(data: Partial<SectionEntity>): SectionBuilder {
    return new SectionBuilder(data);
  }

  /**
   * Adds a text display component to the section.
   *
   * @param component - The text display component to add
   * @returns The section builder instance for method chaining
   * @throws Error if adding the component would exceed the maximum of three text components
   */
  addComponent(component: TextDisplayEntity): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    if (this.#data.components.length >= 3) {
      throw new Error("Sections cannot have more than three text components");
    }

    if (component.type !== ComponentType.TextDisplay) {
      throw new Error("Section components must be TextDisplay components");
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Sets the accessory component for the section.
   *
   * @param accessory - The accessory component (thumbnail or button)
   * @returns The section builder instance for method chaining
   */
  setAccessory(accessory: ThumbnailEntity | ButtonEntity): this {
    if (
      accessory.type !== ComponentType.Thumbnail &&
      accessory.type !== ComponentType.Button
    ) {
      throw new Error(
        "Section accessory must be a Thumbnail or Button component",
      );
    }

    this.#data.accessory = accessory;
    return this;
  }

  /**
   * Builds the final section entity object.
   *
   * @returns The complete section entity
   * @throws Error if the section configuration is invalid
   */
  build(): SectionEntity {
    if (!this.#data.components || this.#data.components.length === 0) {
      throw new Error("Section must have at least one text component");
    }

    if (!this.#data.accessory) {
      throw new Error("Section must have an accessory component");
    }

    return this.#data as SectionEntity;
  }

  /**
   * Returns a JSON representation of the section.
   *
   * @returns A read-only copy of the section data
   */
  toJson(): Readonly<Partial<SectionEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
