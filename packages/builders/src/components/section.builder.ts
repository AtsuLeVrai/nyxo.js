import {
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  type ButtonSchema,
  SectionAccessorySchema,
  SectionSchema,
  TextDisplaySchema,
  type ThumbnailSchema,
} from "../schemas/index.js";

/**
 * A builder for creating Discord section components.
 *
 * Sections allow you to join text contextually with an accessory component.
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class SectionBuilder {
  /** The internal section data being constructed */
  readonly #data: Partial<z.input<typeof SectionSchema>> = {
    type: ComponentType.Section,
  };

  /**
   * Creates a new SectionBuilder instance.
   *
   * @param data - Optional initial data to populate the section with
   */
  constructor(data?: z.input<typeof SectionSchema>) {
    if (data) {
      // Validate the initial data
      const result = SectionSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new SectionBuilder from existing section data.
   *
   * @param data - The section data to use
   * @returns A new SectionBuilder instance with the provided data
   */
  static from(data: z.input<typeof SectionSchema>): SectionBuilder {
    return new SectionBuilder(data);
  }

  /**
   * Adds a text display component to the section.
   *
   * @param component - The text display component to add
   * @returns The section builder instance for method chaining
   * @throws Error if adding the component would exceed the maximum allowed text components
   */
  addComponent(component: z.input<typeof TextDisplaySchema>): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    if (this.#data.components.length >= 3) {
      throw new Error("Sections cannot have more than three text components");
    }

    if (component.type !== ComponentType.TextDisplay) {
      throw new Error("Section components must be TextDisplay components");
    }

    const result = TextDisplaySchema.safeParse(component);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple text display components to the section.
   *
   * @param components - The text display components to add
   * @returns The section builder instance for method chaining
   * @throws Error if adding the components would exceed the maximum allowed text components
   */
  addComponents(...components: z.input<typeof TextDisplaySchema>[]): this {
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
   * @throws Error if too many components are provided
   */
  setComponents(components: z.input<typeof TextDisplaySchema>[]): this {
    if (components.length > 3) {
      throw new Error("Sections cannot have more than three text components");
    }

    if (components.length === 0) {
      throw new Error("Sections must have at least one text component");
    }

    // Empty the components array
    this.#data.components = [];

    // Add each component individually to ensure validation
    for (const component of components) {
      this.addComponent(component);
    }

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
  setAccessory(
    accessory: z.input<typeof ThumbnailSchema> | z.input<typeof ButtonSchema>,
  ): this {
    if (
      accessory.type !== ComponentType.Thumbnail &&
      accessory.type !== ComponentType.Button
    ) {
      throw new Error(
        "Section accessory must be a Thumbnail or Button component",
      );
    }

    const result = SectionAccessorySchema.safeParse(accessory);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

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
    const result = SectionSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final section entity object.
   *
   * @returns The complete section entity
   * @throws Error if the section configuration is invalid
   */
  build(): SectionEntity {
    // Validate the entire section
    const result = SectionSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the section.
   *
   * @returns A read-only copy of the section data
   */
  toJson(): Readonly<Partial<z.input<typeof SectionSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
