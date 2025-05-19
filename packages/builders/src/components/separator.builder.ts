import { ComponentType, type SeparatorEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { SeparatorSchema } from "../schemas/index.js";

/**
 * A builder for creating Discord separator components.
 *
 * Separators add vertical padding and visual division between other components.
 * They help structure content by creating visual breaks in the layout.
 *
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class SeparatorBuilder {
  /** The internal separator data being constructed */
  readonly #data: z.input<typeof SeparatorSchema> = {
    type: ComponentType.Separator,
  };

  /**
   * Creates a new SeparatorBuilder instance.
   *
   * @param data - Optional initial data to populate the separator with
   */
  constructor(data?: z.input<typeof SeparatorSchema>) {
    if (data) {
      // Validate the initial data
      const result = SeparatorSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new SeparatorBuilder from existing separator data.
   *
   * @param data - The separator data to use
   * @returns A new SeparatorBuilder instance with the provided data
   */
  static from(data: z.input<typeof SeparatorSchema>): SeparatorBuilder {
    return new SeparatorBuilder(data);
  }

  /**
   * Sets whether a visual divider should be displayed in the component.
   *
   * @param divider - Whether to show a visual divider
   * @returns The separator builder instance for method chaining
   */
  setDivider(divider = true): this {
    this.#data.divider = divider;
    return this;
  }

  /**
   * Sets the size of separator padding.
   *
   * @param spacing - Size of padding (1 for small, 2 for large)
   * @returns The separator builder instance for method chaining
   * @throws Error if spacing is not 1 or 2
   */
  setSpacing(spacing: 1 | 2): this {
    const result = SeparatorSchema.shape.spacing.safeParse(spacing);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.spacing = result.data;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The separator builder instance for method chaining
   */
  setId(id: number): this {
    const result = SeparatorSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final separator entity object.
   *
   * @returns The complete separator entity
   * @throws Error if the separator configuration is invalid
   */
  build(): SeparatorEntity {
    // Validate the entire separator
    const result = SeparatorSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the separator.
   *
   * @returns A read-only copy of the separator data
   */
  toJson(): Readonly<z.input<typeof SeparatorSchema>> {
    return Object.freeze({ ...this.#data });
  }
}
