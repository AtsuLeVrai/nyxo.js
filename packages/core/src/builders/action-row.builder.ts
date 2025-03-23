import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ActionRowEntity,
  type AnyComponentEntity,
  ComponentType,
} from "../entities/index.js";

/**
 * A builder class for creating and validating Discord message action rows.
 *
 * Action rows are containers for other components such as buttons and select menus.
 * This builder provides a fluent interface for constructing action rows with proper validation
 * using Zod schemas.
 *
 * @example
 * ```typescript
 * const actionRow = new ActionRowBuilder()
 *   .addComponents(
 *     new ButtonBuilder().setCustomId("btn1").setLabel("Click me").setStyle(ButtonStyle.Primary),
 *     new ButtonBuilder().setCustomId("btn2").setLabel("Cancel").setStyle(ButtonStyle.Danger)
 *   )
 *   .build();
 * ```
 */
export class ActionRowBuilder {
  /** Internal data object representing the action row being built */
  readonly #data: z.input<typeof ActionRowEntity> = {
    type: ComponentType.ActionRow,
    components: [],
  };

  /**
   * Creates a new ActionRowBuilder instance.
   *
   * @param data Optional initial data to populate the action row
   */
  constructor(data?: Partial<z.input<typeof ActionRowEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new ActionRowBuilder from an existing action row object.
   *
   * @param actionRow The action row object to copy from
   * @returns A new ActionRowBuilder instance
   */
  static from(actionRow: z.input<typeof ActionRowEntity>): ActionRowBuilder {
    return new ActionRowBuilder(actionRow);
  }

  /**
   * Adds components to the action row.
   *
   * @param components The components to add (max 5 total)
   * @returns This builder instance for method chaining
   * @throws {Error} If adding components would exceed the maximum of 5
   * @throws {Error} If mixing select menus with buttons
   * @throws {Error} If adding more than one select menu
   */
  addComponents(
    ...components: (
      | z.input<typeof AnyComponentEntity>
      | { build(): z.input<typeof AnyComponentEntity> }
    )[]
  ): this {
    try {
      const resolvedComponents = components.map((component) => {
        // If component is a builder with a build method, call it
        if ("build" in component && typeof component.build === "function") {
          return (
            component as { build(): z.input<typeof AnyComponentEntity> }
          ).build();
        }
        // Otherwise use the component directly
        return component as z.input<typeof AnyComponentEntity>;
      });

      // Check if we're going to exceed the max components
      if (this.#data.components.length + resolvedComponents.length > 5) {
        throw new Error("Action row cannot contain more than 5 components");
      }

      // Add the components to our existing components
      const newComponents = [...this.#data.components, ...resolvedComponents];

      // Validate the entire components array
      ActionRowEntity.shape.components.parse(newComponents);

      this.#data.components = newComponents;
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets all components of the action row, replacing any existing components.
   *
   * @param components The components to set (max 5)
   * @returns This builder instance for method chaining
   * @throws {Error} If the components are invalid
   */
  setComponents(
    ...components: (
      | z.input<typeof AnyComponentEntity>
      | { build(): z.input<typeof AnyComponentEntity> }
    )[]
  ): this {
    this.#data.components = [];
    return this.addComponents(...components);
  }

  /**
   * Validates and builds the final action row object.
   *
   * @returns The validated action row object ready to be sent to Discord
   * @throws {Error} If the action row fails validation
   */
  build(): ActionRowEntity {
    try {
      return ActionRowEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this ActionRowBuilder.
   *
   * @returns A new ActionRowBuilder instance with the same data
   */
  clone(): ActionRowBuilder {
    return new ActionRowBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the action row data.
   *
   * @returns The action row data as a JSON object
   */
  toJson(): ActionRowEntity {
    return structuredClone(ActionRowEntity.parse(this.#data));
  }

  /**
   * Checks if the action row is empty (has no components).
   *
   * @returns True if the action row has no components, false otherwise
   */
  isEmpty(): boolean {
    return this.#data.components.length === 0;
  }

  /**
   * Checks if the action row is valid according to Discord's requirements.
   *
   * @returns True if the action row is valid, false otherwise
   */
  isValid(): boolean {
    return ActionRowEntity.safeParse(this.#data).success;
  }
}
