import {
  type ActionRowEntity,
  type AnyComponentEntity,
  ComponentType,
} from "@nyxojs/core";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Builder for action row components.
 *
 * Action rows are containers that hold other components like buttons and select menus.
 *
 * @example
 * ```typescript
 * const row = new ActionRowBuilder()
 *   .addComponents(
 *     new ButtonBuilder()
 *       .setLabel('Accept')
 *       .setStyle(ButtonStyle.Success)
 *       .setCustomId('accept'),
 *     new ButtonBuilder()
 *       .setLabel('Decline')
 *       .setStyle(ButtonStyle.Danger)
 *       .setCustomId('decline')
 *   )
 *   .build();
 * ```
 */
export class ActionRowBuilder {
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
  static from(data: Partial<ActionRowEntity>): ActionRowBuilder {
    return new ActionRowBuilder(data);
  }

  /**
   * Adds a component to the action row.
   *
   * @param component - The component to add
   * @returns The action row builder instance for method chaining
   * @throws Error if adding the component would exceed the maximum number of components or if the component type is invalid
   *
   * @example
   * ```typescript
   * new ActionRowBuilder().addComponent(
   *   new ButtonBuilder()
   *     .setLabel('Click Me')
   *     .setStyle(ButtonStyle.Primary)
   *     .setCustomId('my_button')
   *     .build()
   * );
   * ```
   */
  addComponent(component: AnyComponentEntity): this {
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
      const existingType = this.#getComponentType(
        this.#data.components[0] as AnyComponentEntity,
      );
      const newType = this.#getComponentType(component);

      // Check for incompatible component types
      if (existingType === "selectMenu" && newType !== "none") {
        throw new Error(
          "Action rows with select menus cannot contain other components",
        );
      }
      if (existingType !== "none" && newType === "selectMenu") {
        throw new Error(
          "Action rows with components cannot contain select menus",
        );
      }
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple components to the action row.
   *
   * @param components - The components to add
   * @returns The action row builder instance for method chaining
   * @throws Error if adding the components would exceed the maximum number of components or if the component types are invalid
   *
   * @example
   * ```typescript
   * new ActionRowBuilder().addComponents(
   *   new ButtonBuilder()
   *     .setLabel('Yes')
   *     .setStyle(ButtonStyle.Success)
   *     .setCustomId('yes')
   *     .build(),
   *   new ButtonBuilder()
   *     .setLabel('No')
   *     .setStyle(ButtonStyle.Danger)
   *     .setCustomId('no')
   *     .build()
   * );
   * ```
   */
  addComponents(...components: AnyComponentEntity[]): this {
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
   *
   * @example
   * ```typescript
   * new ActionRowBuilder().setComponents([
   *   new ButtonBuilder()
   *     .setLabel('Yes')
   *     .setStyle(ButtonStyle.Success)
   *     .setCustomId('yes')
   *     .build(),
   *   new ButtonBuilder()
   *     .setLabel('No')
   *     .setStyle(ButtonStyle.Danger)
   *     .setCustomId('no')
   *     .build()
   * ]);
   * ```
   */
  setComponents(components: AnyComponentEntity[]): this {
    if (components.length > COMPONENT_LIMITS.ACTION_ROW_COMPONENTS) {
      throw new Error(
        `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
      );
    }

    // Check for incompatible component types
    const types = components.map((c) => this.#getComponentType(c));
    const hasSelectMenu = types.includes("selectMenu");
    const hasOtherComponents = types.some(
      (t) => t !== "selectMenu" && t !== "none",
    );

    if (hasSelectMenu && hasOtherComponents) {
      throw new Error(
        "Action rows cannot contain both select menus and other components",
      );
    }

    this.#data.components = [...components];
    return this;
  }

  /**
   * Builds the final action row entity object.
   *
   * @returns The complete action row entity
   * @throws Error if the action row configuration is invalid
   *
   * @example
   * ```typescript
   * const row = new ActionRowBuilder()
   *   .addComponents(
   *     new ButtonBuilder()
   *       .setLabel('Click Me')
   *       .setStyle(ButtonStyle.Primary)
   *       .setCustomId('my_button')
   *       .build()
   *   )
   *   .build();
   * ```
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

  /**
   * Helper method to get the component type category.
   *
   * @param component - The component to check
   * @returns The component type category: 'button', 'selectMenu', 'textInput', or 'none'
   * @private
   */
  #getComponentType(
    component: AnyComponentEntity,
  ): "button" | "selectMenu" | "textInput" | "none" {
    if (component.type === ComponentType.Button) {
      return "button";
    }
    if (
      component.type === ComponentType.StringSelect ||
      component.type === ComponentType.UserSelect ||
      component.type === ComponentType.RoleSelect ||
      component.type === ComponentType.MentionableSelect ||
      component.type === ComponentType.ChannelSelect
    ) {
      return "selectMenu";
    }
    if (component.type === ComponentType.TextInput) {
      return "textInput";
    }
    return "none";
  }
}
