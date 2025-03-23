import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ComponentType,
  type SelectMenuOptionEntity,
  StringSelectMenuEntity,
} from "../entities/index.js";
import { SelectMenuOptionBuilder } from "./select-menu-option.builder.js";

/**
 * A builder class for creating and validating Discord string select menus.
 *
 * This builder provides a fluent interface for constructing string select menus with proper validation
 * using Zod schemas. It ensures that all select menu properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const selectMenu = new StringSelectMenuBuilder()
 *   .setCustomId("select_food")
 *   .setPlaceholder("Choose your favorite food")
 *   .setMinValues(1)
 *   .setMaxValues(2)
 *   .addOptions(
 *     new SelectMenuOptionBuilder().setLabel("Pizza").setValue("pizza"),
 *     new SelectMenuOptionBuilder().setLabel("Burger").setValue("burger"),
 *     new SelectMenuOptionBuilder().setLabel("Sushi").setValue("sushi")
 *   )
 *   .build();
 * ```
 */
export class StringSelectMenuBuilder {
  /** Internal data object representing the string select menu being built */
  readonly #data: z.input<typeof StringSelectMenuEntity> = {
    type: ComponentType.StringSelect,
    custom_id: "",
    options: [],
  };

  /**
   * Creates a new StringSelectMenuBuilder instance.
   *
   * @param data Optional initial data to populate the string select menu
   */
  constructor(data?: Partial<z.input<typeof StringSelectMenuEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new StringSelectMenuBuilder from an existing string select menu object.
   *
   * @param selectMenu The string select menu object to copy from
   * @returns A new StringSelectMenuBuilder instance
   */
  static from(
    selectMenu: z.input<typeof StringSelectMenuEntity>,
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(selectMenu);
  }

  /**
   * Sets the custom ID of the string select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        StringSelectMenuEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the string select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        StringSelectMenuEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum number of options that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min values is invalid
   */
  setMinValues(minValues: number): this {
    try {
      this.#data.min_values =
        StringSelectMenuEntity.shape.min_values.parse(minValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum number of options that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max values is invalid
   */
  setMaxValues(maxValues: number): this {
    try {
      this.#data.max_values =
        StringSelectMenuEntity.shape.max_values.parse(maxValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the string select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled = StringSelectMenuEntity.shape.disabled.parse(disabled);
    return this;
  }

  /**
   * Adds options to the string select menu.
   *
   * @param options The options to add (max 25 total)
   * @returns This builder instance for method chaining
   * @throws {Error} If adding options would exceed the maximum of 25
   */
  addOptions(
    ...options: (
      | z.input<typeof SelectMenuOptionEntity>
      | SelectMenuOptionBuilder
    )[]
  ): this {
    try {
      const resolvedOptions = options.map((option) => {
        // If option is a SelectMenuOptionBuilder, call build() on it
        if (option instanceof SelectMenuOptionBuilder) {
          return option.build();
        }
        // Otherwise use the option directly
        return option as z.input<typeof SelectMenuOptionEntity>;
      });

      // Check if we're going to exceed the max options
      if (this.#data.options.length + resolvedOptions.length > 25) {
        throw new Error("Select menu cannot contain more than 25 options");
      }

      // Add the options to our existing options
      const newOptions = [...this.#data.options, ...resolvedOptions];

      // Validate the entire options array
      StringSelectMenuEntity.shape.options.parse(newOptions);

      this.#data.options = newOptions;
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets all options of the string select menu, replacing any existing options.
   *
   * @param options The options to set (max 25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the options are invalid
   */
  setOptions(
    ...options: (
      | z.input<typeof SelectMenuOptionEntity>
      | SelectMenuOptionBuilder
    )[]
  ): this {
    this.#data.options = [];
    return this.addOptions(...options);
  }

  /**
   * Validates and builds the final string select menu object.
   *
   * @returns The validated string select menu object ready to be sent to Discord
   * @throws {Error} If the string select menu fails validation
   */
  build(): z.infer<typeof StringSelectMenuEntity> {
    try {
      return StringSelectMenuEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this StringSelectMenuBuilder.
   *
   * @returns A new StringSelectMenuBuilder instance with the same data
   */
  clone(): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the string select menu data.
   *
   * @returns The string select menu data as a JSON object
   */
  toJson(): z.infer<typeof StringSelectMenuEntity> {
    return structuredClone(StringSelectMenuEntity.parse(this.#data));
  }

  /**
   * Checks if the string select menu is valid according to Discord's requirements.
   *
   * @returns True if the string select menu is valid, false otherwise
   */
  isValid(): boolean {
    return StringSelectMenuEntity.safeParse(this.#data).success;
  }
}
