import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ComponentType,
  type SelectMenuDefaultValueEntity,
  UserSelectMenuEntity,
} from "../entities/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * A builder class for creating and validating Discord user select menus.
 *
 * This builder provides a fluent interface for constructing user select menus with proper validation
 * using Zod schemas. It ensures that all select menu properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const userSelect = new UserSelectMenuBuilder()
 *   .setCustomId("select_users")
 *   .setPlaceholder("Select some users")
 *   .setMinValues(1)
 *   .setMaxValues(3)
 *   .build();
 * ```
 */
export class UserSelectMenuBuilder {
  /** Internal data object representing the user select menu being built */
  readonly #data: z.input<typeof UserSelectMenuEntity> = {
    type: ComponentType.UserSelect,
    custom_id: "",
  };

  /**
   * Creates a new UserSelectMenuBuilder instance.
   *
   * @param data Optional initial data to populate the user select menu
   */
  constructor(data?: Partial<z.input<typeof UserSelectMenuEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new UserSelectMenuBuilder from an existing user select menu object.
   *
   * @param selectMenu The user select menu object to copy from
   * @returns A new UserSelectMenuBuilder instance
   */
  static from(
    selectMenu: z.input<typeof UserSelectMenuEntity>,
  ): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(selectMenu);
  }

  /**
   * Sets the custom ID of the user select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        UserSelectMenuEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the user select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        UserSelectMenuEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum number of users that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min values is invalid
   */
  setMinValues(minValues: number): this {
    try {
      this.#data.min_values =
        UserSelectMenuEntity.shape.min_values.parse(minValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum number of users that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max values is invalid
   */
  setMaxValues(maxValues: number): this {
    try {
      this.#data.max_values =
        UserSelectMenuEntity.shape.max_values.parse(maxValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the user select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled = UserSelectMenuEntity.shape.disabled.parse(disabled);
    return this;
  }

  /**
   * Adds default users to the select menu.
   *
   * @param userIds An array of user IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the user IDs are invalid
   */
  addDefaultUsers(...userIds: Snowflake[]): this {
    try {
      const defaultValues = userIds.map((userId) => {
        return {
          id: userId,
          type: "user" as const,
        };
      });

      // Initialize default_values if it doesn't exist
      if (!this.#data.default_values) {
        this.#data.default_values = [];
      }

      // Add the new default values
      const newDefaultValues = [
        ...(this.#data.default_values || []),
        ...defaultValues,
      ];

      // Validate
      this.#data.default_values =
        UserSelectMenuEntity.shape.default_values.parse(newDefaultValues);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the default users for the select menu, replacing any existing defaults.
   *
   * @param userIds An array of user IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the user IDs are invalid
   */
  setDefaultUsers(...userIds: Snowflake[]): this {
    this.#data.default_values = [];
    return this.addDefaultUsers(...userIds);
  }

  /**
   * Adds default values to the select menu.
   *
   * @param defaultValues An array of default value objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the default values are invalid
   */
  addDefaultValues(
    ...defaultValues: z.input<typeof SelectMenuDefaultValueEntity>[]
  ): this {
    try {
      // Initialize default_values if it doesn't exist
      if (!this.#data.default_values) {
        this.#data.default_values = [];
      }

      // Add the new default values
      const newDefaultValues = [
        ...(this.#data.default_values || []),
        ...defaultValues,
      ];

      // Validate
      this.#data.default_values =
        UserSelectMenuEntity.shape.default_values.parse(newDefaultValues);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the default values for the select menu, replacing any existing defaults.
   *
   * @param defaultValues An array of default value objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the default values are invalid
   */
  setDefaultValues(
    ...defaultValues: z.input<typeof SelectMenuDefaultValueEntity>[]
  ): this {
    this.#data.default_values = [];
    return this.addDefaultValues(...defaultValues);
  }

  /**
   * Validates and builds the final user select menu object.
   *
   * @returns The validated user select menu object ready to be sent to Discord
   * @throws {Error} If the user select menu fails validation
   */
  build(): z.infer<typeof UserSelectMenuEntity> {
    try {
      return UserSelectMenuEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this UserSelectMenuBuilder.
   *
   * @returns A new UserSelectMenuBuilder instance with the same data
   */
  clone(): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the user select menu data.
   *
   * @returns The user select menu data as a JSON object
   */
  toJson(): z.infer<typeof UserSelectMenuEntity> {
    return structuredClone(UserSelectMenuEntity.parse(this.#data));
  }

  /**
   * Checks if the user select menu is valid according to Discord's requirements.
   *
   * @returns True if the user select menu is valid, false otherwise
   */
  isValid(): boolean {
    return UserSelectMenuEntity.safeParse(this.#data).success;
  }
}
