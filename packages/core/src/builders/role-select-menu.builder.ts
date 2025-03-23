import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ComponentType,
  RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
} from "../entities/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * A builder class for creating and validating Discord role select menus.
 *
 * This builder provides a fluent interface for constructing role select menus with proper validation
 * using Zod schemas. It ensures that all select menu properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const roleSelect = new RoleSelectMenuBuilder()
 *   .setCustomId("select_roles")
 *   .setPlaceholder("Select some roles")
 *   .setMinValues(1)
 *   .setMaxValues(3)
 *   .build();
 * ```
 */
export class RoleSelectMenuBuilder {
  /** Internal data object representing the role select menu being built */
  readonly #data: z.input<typeof RoleSelectMenuEntity> = {
    type: ComponentType.RoleSelect,
    custom_id: "",
  };

  /**
   * Creates a new RoleSelectMenuBuilder instance.
   *
   * @param data Optional initial data to populate the role select menu
   */
  constructor(data?: Partial<z.input<typeof RoleSelectMenuEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new RoleSelectMenuBuilder from an existing role select menu object.
   *
   * @param selectMenu The role select menu object to copy from
   * @returns A new RoleSelectMenuBuilder instance
   */
  static from(
    selectMenu: z.input<typeof RoleSelectMenuEntity>,
  ): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(selectMenu);
  }

  /**
   * Sets the custom ID of the role select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        RoleSelectMenuEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the role select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        RoleSelectMenuEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum number of roles that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min values is invalid
   */
  setMinValues(minValues: number): this {
    try {
      this.#data.min_values =
        RoleSelectMenuEntity.shape.min_values.parse(minValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum number of roles that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max values is invalid
   */
  setMaxValues(maxValues: number): this {
    try {
      this.#data.max_values =
        RoleSelectMenuEntity.shape.max_values.parse(maxValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the role select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled = RoleSelectMenuEntity.shape.disabled.parse(disabled);
    return this;
  }

  /**
   * Adds default roles to the select menu.
   *
   * @param roleIds An array of role IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the role IDs are invalid
   */
  addDefaultRoles(...roleIds: Snowflake[]): this {
    try {
      const defaultValues = roleIds.map((roleId) => {
        return {
          id: roleId,
          type: "role" as const,
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
        RoleSelectMenuEntity.shape.default_values.parse(newDefaultValues);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the default roles for the select menu, replacing any existing defaults.
   *
   * @param roleIds An array of role IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the role IDs are invalid
   */
  setDefaultRoles(...roleIds: Snowflake[]): this {
    this.#data.default_values = [];
    return this.addDefaultRoles(...roleIds);
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
        RoleSelectMenuEntity.shape.default_values.parse(newDefaultValues);

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
   * Validates and builds the final role select menu object.
   *
   * @returns The validated role select menu object ready to be sent to Discord
   * @throws {Error} If the role select menu fails validation
   */
  build(): z.infer<typeof RoleSelectMenuEntity> {
    try {
      return RoleSelectMenuEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this RoleSelectMenuBuilder.
   *
   * @returns A new RoleSelectMenuBuilder instance with the same data
   */
  clone(): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the role select menu data.
   *
   * @returns The role select menu data as a JSON object
   */
  toJson(): z.infer<typeof RoleSelectMenuEntity> {
    return structuredClone(RoleSelectMenuEntity.parse(this.#data));
  }

  /**
   * Checks if the role select menu is valid according to Discord's requirements.
   *
   * @returns True if the role select menu is valid, false otherwise
   */
  isValid(): boolean {
    return RoleSelectMenuEntity.safeParse(this.#data).success;
  }
}
