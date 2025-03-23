import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ComponentType,
  MentionableSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
} from "../entities/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * A builder class for creating and validating Discord mentionable select menus.
 *
 * This builder provides a fluent interface for constructing mentionable select menus with proper validation
 * using Zod schemas. Mentionable select menus allow users to select either users or roles.
 *
 * @example
 * ```typescript
 * const mentionableSelect = new MentionableSelectMenuBuilder()
 *   .setCustomId("select_mentions")
 *   .setPlaceholder("Select users or roles")
 *   .setMinValues(1)
 *   .setMaxValues(3)
 *   .build();
 * ```
 */
export class MentionableSelectMenuBuilder {
  /** Internal data object representing the mentionable select menu being built */
  readonly #data: z.input<typeof MentionableSelectMenuEntity> = {
    type: ComponentType.MentionableSelect,
    custom_id: "",
  };

  /**
   * Creates a new MentionableSelectMenuBuilder instance.
   *
   * @param data Optional initial data to populate the mentionable select menu
   */
  constructor(data?: Partial<z.input<typeof MentionableSelectMenuEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new MentionableSelectMenuBuilder from an existing mentionable select menu object.
   *
   * @param selectMenu The mentionable select menu object to copy from
   * @returns A new MentionableSelectMenuBuilder instance
   */
  static from(
    selectMenu: z.input<typeof MentionableSelectMenuEntity>,
  ): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(selectMenu);
  }

  /**
   * Sets the custom ID of the mentionable select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        MentionableSelectMenuEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the mentionable select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        MentionableSelectMenuEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum number of mentionables that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min values is invalid
   */
  setMinValues(minValues: number): this {
    try {
      this.#data.min_values =
        MentionableSelectMenuEntity.shape.min_values.parse(minValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum number of mentionables that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max values is invalid
   */
  setMaxValues(maxValues: number): this {
    try {
      this.#data.max_values =
        MentionableSelectMenuEntity.shape.max_values.parse(maxValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the mentionable select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled =
      MentionableSelectMenuEntity.shape.disabled.parse(disabled);
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

      return this.addDefaultValues(...defaultValues);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
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

      return this.addDefaultValues(...defaultValues);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets default users and roles for the select menu, replacing any existing defaults.
   *
   * @param mentionables An object containing arrays of user IDs and role IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the IDs are invalid
   */
  setDefaultMentionables(mentionables: {
    users?: Snowflake[];
    roles?: Snowflake[];
  }): this {
    this.#data.default_values = [];

    if (mentionables.users && mentionables.users.length > 0) {
      this.addDefaultUsers(...mentionables.users);
    }

    if (mentionables.roles && mentionables.roles.length > 0) {
      this.addDefaultRoles(...mentionables.roles);
    }

    return this;
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
        MentionableSelectMenuEntity.shape.default_values.parse(
          newDefaultValues,
        );

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
   * Validates and builds the final mentionable select menu object.
   *
   * @returns The validated mentionable select menu object ready to be sent to Discord
   * @throws {Error} If the mentionable select menu fails validation
   */
  build(): MentionableSelectMenuEntity {
    try {
      return MentionableSelectMenuEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this MentionableSelectMenuBuilder.
   *
   * @returns A new MentionableSelectMenuBuilder instance with the same data
   */
  clone(): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the mentionable select menu data.
   *
   * @returns The mentionable select menu data as a JSON object
   */
  toJson(): MentionableSelectMenuEntity {
    return structuredClone(MentionableSelectMenuEntity.parse(this.#data));
  }

  /**
   * Checks if the mentionable select menu is valid according to Discord's requirements.
   *
   * @returns True if the mentionable select menu is valid, false otherwise
   */
  isValid(): boolean {
    return MentionableSelectMenuEntity.safeParse(this.#data).success;
  }
}
