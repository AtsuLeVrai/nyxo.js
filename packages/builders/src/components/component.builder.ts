import type { AnyComponentEntity } from "@nyxjs/core";

/**
 * Base builder class for all Discord message components.
 * This abstract class provides common functionality for component builders.
 *
 * @template T The component entity type this builder produces
 * @template B The builder type (for method chaining)
 */
export abstract class ComponentBuilder<
  T extends AnyComponentEntity,
  B extends ComponentBuilder<T, B>,
> {
  /** The component data being built */
  protected data: Partial<T>;

  /**
   * Creates a new component builder.
   *
   * @param data Initial component data
   */
  protected constructor(data: Partial<T>) {
    this.data = data;
  }

  /**
   * Returns this builder for method chaining.
   * Used internally to ensure correct typing for subclasses.
   */
  protected abstract get self(): B;

  /**
   * Builds and returns the final component object.
   *
   * @returns The constructed component entity
   */
  abstract build(): T;

  /**
   * Converts the component to a plain object representation.
   *
   * @returns The component data as a plain object
   */
  toJson(): Partial<T> {
    return { ...this.data };
  }
}
