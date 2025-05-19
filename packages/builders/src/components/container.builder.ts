import {
  ComponentType,
  type ContainerEntity,
  type TextDisplayEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { ContainerComponentSchema, ContainerSchema } from "../schemas/index.js";
import { type ColorResolvable, resolveColor } from "../utils/index.js";

/**
 * A builder for creating Discord container components.
 *
 * Containers are top-level layout components that hold up to 10 components and
 * are visually distinct with an optional customizable color bar.
 *
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class ContainerBuilder {
  /** The internal container data being constructed */
  readonly #data: Partial<z.input<typeof ContainerSchema>> = {
    type: ComponentType.Container,
  };

  /**
   * Creates a new ContainerBuilder instance.
   *
   * @param data - Optional initial data to populate the container with
   */
  constructor(data?: z.input<typeof ContainerSchema>) {
    if (data) {
      // Validate the initial data
      const result = ContainerSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new ContainerBuilder from existing container data.
   *
   * @param data - The container data to use
   * @returns A new ContainerBuilder instance with the provided data
   */
  static from(data: z.input<typeof ContainerSchema>): ContainerBuilder {
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
  addComponent(component: z.input<typeof ContainerComponentSchema>): this {
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

    const result = ContainerComponentSchema.safeParse(component);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
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
    ...components: z.input<typeof ContainerComponentSchema>[]
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
  setComponents(components: z.input<typeof ContainerComponentSchema>[]): this {
    if (components.length > 10) {
      throw new Error("Containers cannot have more than 10 components");
    }

    if (components.length === 0) {
      throw new Error("Containers must have at least one component");
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

    // Validate all components in one go
    const validationResult = z
      .array(ContainerComponentSchema)
      .safeParse(components);
    if (!validationResult.success) {
      throw new Error(z.prettifyError(validationResult.error));
    }

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
   * @throws Error if color is invalid
   */
  setAccentColor(color: ColorResolvable): this {
    // Validate the color
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
    const result = ContainerSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final container entity object.
   *
   * @returns The complete container entity
   * @throws Error if the container configuration is invalid
   */
  build(): ContainerEntity {
    // Validate the entire container
    const result = ContainerSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the container.
   *
   * @returns A read-only copy of the container data
   */
  toJson(): Readonly<Partial<z.input<typeof ContainerSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
