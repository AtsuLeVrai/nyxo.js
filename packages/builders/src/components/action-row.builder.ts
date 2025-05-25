import {
  type ActionRowEntity,
  type AnyComponentEntity,
  ComponentType,
} from "@nyxojs/core";

/**
 * A builder for creating Discord action row components.
 *
 * Action rows are containers that hold other interactive components like buttons,
 * select menus, or text inputs. This class follows the builder pattern to create
 * action row components.
 *
 * The generic parameter `T` allows for type safety when adding components:
 * - ActionRowBuilder<ButtonEntity> for button-only rows
 * - ActionRowBuilder<AnySelectMenuEntity> for select menu rows
 * - ActionRowBuilder<TextInputEntity> for text input rows
 *
 * @template T - The type of components this action row will contain
 */
export class ActionRowBuilder<T extends AnyComponentEntity> {
  /** The internal action row data being constructed */
  readonly #data: Partial<ActionRowEntity> = {
    type: ComponentType.ActionRow,
    components: [],
  };

  /**
   * Creates a new ActionRowBuilder instance.
   *
   * @param data - Optional initial data to populate the action row with
   */
  constructor(data?: ActionRowEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new ActionRowBuilder from existing action row data.
   *
   * @param data - The action row data to use
   * @returns A new ActionRowBuilder instance with the provided data
   */
  static from<C extends AnyComponentEntity>(
    data: ActionRowEntity,
  ): ActionRowBuilder<C> {
    return new ActionRowBuilder<C>(data);
  }

  /**
   * Adds a component to the action row.
   *
   * @param component - The component to add
   * @returns The action row builder instance for method chaining
   */
  addComponent(component: T): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple components to the action row.
   *
   * @param components - The components to add
   * @returns The action row builder instance for method chaining
   */
  addComponents(...components: T[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  /**
   * Sets all components for the action row, replacing any existing components.
   *
   * @param components - The components to set
   * @returns The action row builder instance for method chaining
   */
  setComponents(components: T[]): this {
    this.#data.components = [...components];
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The action row builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final action row entity object.
   * @returns The complete action row entity
   */
  build(): ActionRowEntity {
    return this.#data as ActionRowEntity;
  }

  /**
   * Converts the action row data to an immutable object.
   * @returns A read-only copy of the action row data
   */
  toJson(): Readonly<ActionRowEntity> {
    return Object.freeze({ ...this.#data }) as ActionRowEntity;
  }
}
