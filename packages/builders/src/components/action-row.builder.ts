import {
  type ActionRowEntity,
  type AnyComponentEntity,
  ComponentType,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  ActionRowComponentSchema,
  ActionRowSchema,
  isSelectMenuComponent,
} from "../schemas/index.js";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * A builder for creating Discord action row components.
 *
 * Action rows are containers that hold other interactive components like buttons,
 * select menus, or text inputs. This class follows the builder pattern with
 * validation through Zod schemas to ensure all elements meet Discord's requirements.
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
  readonly #data: Partial<z.input<typeof ActionRowSchema>> = {
    type: ComponentType.ActionRow,
    components: [],
  };

  /**
   * Creates a new ActionRowBuilder instance.
   *
   * @param data - Optional initial data to populate the action row with
   */
  constructor(data?: z.input<typeof ActionRowSchema>) {
    if (data) {
      // Validate the initial data
      const result = ActionRowSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new ActionRowBuilder from existing action row data.
   *
   * @param data - The action row data to use
   * @returns A new ActionRowBuilder instance with the provided data
   */
  static from<C extends AnyComponentEntity>(
    data: z.input<typeof ActionRowSchema>,
  ): ActionRowBuilder<C> {
    return new ActionRowBuilder<C>(data);
  }

  /**
   * Adds a component to the action row.
   *
   * @param component - The component to add
   * @returns The action row builder instance for method chaining
   * @throws Error if adding the component would exceed the maximum number of components or if the component type is invalid
   */
  addComponent(component: T): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    // Check for max components
    if (
      this.#data.components.length >= COMPONENT_LIMITS.ACTION_ROW_COMPONENTS
    ) {
      throw new Error(
        `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
      );
    }

    // Check for component type compatibility
    if (this.#data.components.length > 0) {
      const existingComponent = this.#data.components[0] as AnyComponentEntity;

      // Text inputs must be the only component
      if (
        existingComponent.type === ComponentType.TextInput ||
        component.type === ComponentType.TextInput
      ) {
        throw new Error(
          "Action rows with text inputs cannot contain other components",
        );
      }

      // Select menus must be the only component
      if (isSelectMenuComponent(existingComponent.type)) {
        throw new Error(
          "Action rows with select menus cannot contain other components",
        );
      }
    }

    // Validate the component with the schema
    const result = ActionRowComponentSchema.safeParse(component);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.components.push(result.data);
    return this;
  }

  /**
   * Adds multiple components to the action row.
   *
   * @param components - The components to add
   * @returns The action row builder instance for method chaining
   * @throws Error if adding the components would exceed the maximum number of components or if the component types are invalid
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
   * @throws Error if too many components are provided or if the component types are invalid
   */
  setComponents(components: T[]): this {
    if (components.length > COMPONENT_LIMITS.ACTION_ROW_COMPONENTS) {
      throw new Error(
        `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
      );
    }

    // Reset components
    this.#data.components = [];

    // Add each component individually to ensure validation
    for (const component of components) {
      this.addComponent(component);
    }

    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The action row builder instance for method chaining
   */
  setId(id: number): this {
    const result = ActionRowSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final action row entity object.
   *
   * @returns The complete action row entity
   * @throws Error if the action row configuration is invalid
   */
  build(): ActionRowEntity {
    // Validate the entire action row
    const result = ActionRowSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the action row.
   *
   * @returns A read-only copy of the action row data
   */
  toJson(): Readonly<Partial<z.input<typeof ActionRowSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
