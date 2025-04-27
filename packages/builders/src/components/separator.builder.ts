import { ComponentType, type SeparatorEntity } from "@nyxojs/core";

/**
 * Builder for separator components.
 *
 * Separators add vertical padding and visual division between other components.
 */
export class SeparatorBuilder {
  /** The internal separator data being constructed */
  readonly #data: Partial<SeparatorEntity> = {
    type: ComponentType.Separator,
  };

  /**
   * Creates a new SeparatorBuilder instance.
   *
   * @param data - Optional initial data to populate the separator with
   */
  constructor(data?: Partial<SeparatorEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.Separator, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new SeparatorBuilder from existing separator data.
   *
   * @param data - The separator data to use
   * @returns A new SeparatorBuilder instance with the provided data
   */
  static from(data: Partial<SeparatorEntity>): SeparatorBuilder {
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
    if (spacing !== 1 && spacing !== 2) {
      throw new Error("Separator spacing must be 1 or 2");
    }

    this.#data.spacing = spacing;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The separator builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final separator entity object.
   *
   * @returns The complete separator entity
   */
  build(): SeparatorEntity {
    return this.#data as SeparatorEntity;
  }

  /**
   * Returns a JSON representation of the separator.
   *
   * @returns A read-only copy of the separator data
   */
  toJson(): Readonly<Partial<SeparatorEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
