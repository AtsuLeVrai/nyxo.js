import type { EmojiEntity, SelectMenuOptionEntity } from "@nyxjs/core";

/**
 * Builder for creating select menu options.
 * Used with StringSelectMenuBuilder.
 *
 * @example
 * ```typescript
 * const option = new SelectMenuOptionBuilder()
 *   .setLabel('Option 1')
 *   .setValue('option_1')
 *   .setDescription('This is option 1')
 *   .build();
 * ```
 */
export class SelectMenuOptionBuilder {
  readonly #data: Partial<SelectMenuOptionEntity>;

  /**
   * Creates a new SelectMenuOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<SelectMenuOptionEntity> = {}) {
    this.#data = data;
  }

  /**
   * Creates a new SelectMenuOptionBuilder from an existing option entity.
   *
   * @param option The option entity to use as a base
   * @returns A new SelectMenuOptionBuilder instance
   */
  static from(
    option: SelectMenuOptionEntity | Partial<SelectMenuOptionEntity>,
  ): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(option);
  }

  /**
   * Sets the label of the select menu option.
   *
   * @param label The label text to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If label exceeds 100 characters
   */
  setLabel(label: string): this {
    if (label.length > 100) {
      throw new Error("Select menu option label cannot exceed 100 characters");
    }
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the value of the select menu option.
   *
   * @param value The value to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If value exceeds 100 characters
   */
  setValue(value: string): this {
    if (value.length > 100) {
      throw new Error("Select menu option value cannot exceed 100 characters");
    }
    this.#data.value = value;
    return this;
  }

  /**
   * Sets the description of the select menu option.
   *
   * @param description The description to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description exceeds 100 characters
   */
  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error(
        "Select menu option description cannot exceed 100 characters",
      );
    }
    this.#data.description = description;
    return this;
  }

  /**
   * Sets the emoji for the select menu option.
   *
   * @param emoji The emoji to use (can be a partial emoji object or string)
   * @returns This builder instance, for method chaining
   */
  setEmoji(emoji: Pick<EmojiEntity, "id" | "name" | "animated">): this {
    this.#data.emoji = emoji;
    return this;
  }

  /**
   * Sets whether this option is selected by default.
   *
   * @param isDefault Whether this option is selected by default
   * @returns This builder instance, for method chaining
   */
  setDefault(isDefault = true): this {
    this.#data.default = isDefault;
    return this;
  }

  /**
   * Builds and returns the final select menu option object.
   *
   * @returns The constructed select menu option entity
   * @throws Error If required properties are missing
   */
  build(): SelectMenuOptionEntity {
    // Validate required properties
    if (!this.#data.label) {
      throw new Error("Select menu option must have a label");
    }

    if (!this.#data.value) {
      throw new Error("Select menu option must have a value");
    }

    return this.#data as SelectMenuOptionEntity;
  }
}
