import {
  type ActionRowEntity,
  type AnyComponentEntity,
  type AnySelectMenuEntity,
  ComponentType,
} from "@nyxojs/core";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Type guard for select menu components
 */
function isSelectMenuComponent(
  component: AnyComponentEntity,
): component is AnySelectMenuEntity {
  return [
    ComponentType.StringSelect,
    ComponentType.UserSelect,
    ComponentType.RoleSelect,
    ComponentType.MentionableSelect,
    ComponentType.ChannelSelect,
  ].includes(component.type);
}

/**
 * Builder for action row components.
 *
 * Action rows are containers that hold other components like buttons and select menus.
 * The generic parameter `T` allows for type safety when adding components:
 * - ActionRowBuilder<ButtonEntity> for button-only rows
 * - ActionRowBuilder<SelectMenuComponent> for select menu rows
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
  constructor(data?: Partial<ActionRowEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.ActionRow, // Ensure type is set correctly
        components: data.components ? [...data.components] : [],
      };
    }
  }

  /**
   * Creates a new ActionRowBuilder from existing action row data.
   *
   * @param data - The action row data to use
   * @returns A new ActionRowBuilder instance with the provided data
   */
  static from<C extends AnyComponentEntity>(
    data: Partial<ActionRowEntity>,
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

    if (
      this.#data.components.length >= COMPONENT_LIMITS.ACTION_ROW_COMPONENTS
    ) {
      throw new Error(
        `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
      );
    }

    // Validate component type compatibility with existing components
    if (this.#data.components.length > 0) {
      const existingComponent = this.#data.components[0] as AnyComponentEntity;

      // Check if we're trying to mix select menus with other components
      if (
        isSelectMenuComponent(existingComponent) &&
        component.type !== existingComponent.type
      ) {
        throw new Error(
          "Action rows with select menus cannot contain other components",
        );
      }

      if (
        isSelectMenuComponent(component) &&
        existingComponent.type !== component.type
      ) {
        throw new Error(
          "Action rows with components cannot contain select menus",
        );
      }

      // If it's a text input, it should be the only component
      if (
        existingComponent.type === ComponentType.TextInput ||
        component.type === ComponentType.TextInput
      ) {
        throw new Error(
          "Action rows with text inputs cannot contain other components",
        );
      }
    }

    this.#data.components.push(component as AnyComponentEntity);
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

    // Empty the components array
    this.#data.components = [];

    // Add each component individually to ensure type validation
    for (const component of components) {
      this.addComponent(component);
    }

    return this;
  }

  /**
   * Sets the custom ID for the action row.
   *
   * @param id - The custom ID to set
   *
   * @returns The action row builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final action row entity object.
   *
   * @returns The complete action row entity
   * @throws Error if the action row configuration is invalid
   */
  build(): ActionRowEntity {
    if (!this.#data.components || this.#data.components.length === 0) {
      throw new Error("Action row must have at least one component");
    }

    if (this.#data.components.length > COMPONENT_LIMITS.ACTION_ROW_COMPONENTS) {
      throw new Error(
        `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
      );
    }

    return this.#data as ActionRowEntity;
  }

  /**
   * Returns a JSON representation of the action row.
   *
   * @returns A read-only copy of the action row data
   */
  toJson(): Readonly<Partial<ActionRowEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
