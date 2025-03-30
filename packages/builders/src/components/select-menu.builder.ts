import type {
  AnySelectMenuEntity,
  SelectMenuDefaultValueEntity,
  Snowflake,
} from "@nyxjs/core";
import { ComponentBuilder } from "./component.builder.js";

/**
 * Abstract base builder for select menu components.
 *
 * @template T The select menu entity type this builder produces
 * @template B The builder type (for method chaining)
 */
export abstract class SelectMenuBuilder<
  T extends AnySelectMenuEntity,
  B extends SelectMenuBuilder<T, B>,
> extends ComponentBuilder<T, B> {
  /**
   * Sets the custom ID of the select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If customId exceeds 100 characters
   */
  setCustomId(customId: string): B {
    if (customId.length > 100) {
      throw new Error("Select menu custom ID cannot exceed 100 characters");
    }
    this.data.custom_id = customId;
    return this.self;
  }

  /**
   * Sets the placeholder text of the select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If placeholder exceeds 150 characters
   */
  setPlaceholder(placeholder: string): B {
    if (placeholder.length > 150) {
      throw new Error("Select menu placeholder cannot exceed 150 characters");
    }
    this.data.placeholder = placeholder;
    return this.self;
  }

  /**
   * Sets the minimum number of values that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance, for method chaining
   * @throws Error If minValues is outside the valid range
   */
  setMinValues(minValues: number): B {
    if (minValues < 0 || minValues > 25) {
      throw new Error("Select menu minimum values must be between 0 and 25");
    }
    this.data.min_values = minValues;
    return this.self;
  }

  /**
   * Sets the maximum number of values that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance, for method chaining
   * @throws Error If maxValues is outside the valid range
   */
  setMaxValues(maxValues: number): B {
    if (maxValues < 1 || maxValues > 25) {
      throw new Error("Select menu maximum values must be between 1 and 25");
    }
    this.data.max_values = maxValues;
    return this.self;
  }

  /**
   * Sets whether the select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance, for method chaining
   */
  setDisabled(disabled = true): B {
    this.data.disabled = disabled;
    return this.self;
  }

  /**
   * Sets the default values for the select menu.
   *
   * @param defaultValues Array of default value entities
   * @returns This builder instance, for method chaining
   */
  setDefaultValues(defaultValues: SelectMenuDefaultValueEntity[]): B {
    this.data.default_values = defaultValues;
    return this.self;
  }

  /**
   * Adds a default value to the select menu.
   *
   * @param id The ID of the default value
   * @param type The type of the default value ("user", "role", or "channel")
   * @returns This builder instance, for method chaining
   */
  addDefaultValue(id: Snowflake, type: "user" | "role" | "channel"): B {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({ id, type });
    return this.self;
  }

  /**
   * Validates common select menu properties.
   *
   * @throws Error If required properties are missing or if validation fails
   */
  protected validateCommon(): void {
    // Validate required properties
    if (!this.data.custom_id) {
      throw new Error("Select menu must have a custom ID");
    }

    // Validate min/max values
    if (
      this.data.min_values !== undefined &&
      this.data.max_values !== undefined &&
      this.data.min_values > this.data.max_values
    ) {
      throw new Error(
        "Select menu minimum values cannot be greater than maximum values",
      );
    }
  }
}
