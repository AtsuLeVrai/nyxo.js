import {
  ComponentType,
  type TextInputEntity,
  type TextInputStyle,
} from "@nyxojs/core";

/**
 * A builder for creating Discord text input components.
 *
 * Text inputs are used in modals to collect text data from users.
 * This class follows the builder pattern to create text input components.
 */
export class TextInputBuilder {
  /** The internal text input data being constructed */
  readonly #data: Partial<TextInputEntity> = {
    type: ComponentType.TextInput,
  };

  /**
   * Creates a new TextInputBuilder instance.
   *
   * @param data - Optional initial data to populate the text input with
   */
  constructor(data?: TextInputEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new TextInputBuilder from existing text input data.
   *
   * @param data - The text input data to use
   * @returns A new TextInputBuilder instance with the provided data
   */
  static from(data: TextInputEntity): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  /**
   * Sets the custom ID of the text input.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   */
  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  /**
   * Sets the style of the text input.
   *
   * @param style - The text input style to set
   * @returns The text input builder instance for method chaining
   */
  setStyle(style: TextInputStyle): this {
    this.#data.style = style;
    return this;
  }

  /**
   * Sets the label of the text input.
   *
   * @param label - The label to set (max 45 characters)
   * @returns The text input builder instance for method chaining
   */
  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the minimum length of the text input.
   *
   * @param minLength - The minimum length to set (0-4000)
   * @returns The text input builder instance for method chaining
   */
  setMinLength(minLength: number): this {
    this.#data.min_length = minLength;
    return this;
  }

  /**
   * Sets the maximum length of the text input.
   *
   * @param maxLength - The maximum length to set (1-4000)
   * @returns The text input builder instance for method chaining
   */
  setMaxLength(maxLength: number): this {
    this.#data.max_length = maxLength;
    return this;
  }

  /**
   * Sets whether the text input is required.
   *
   * @param required - Whether the text input should be required
   * @returns The text input builder instance for method chaining
   */
  setRequired(required = true): this {
    this.#data.required = required;
    return this;
  }

  /**
   * Sets the pre-filled value of the text input.
   *
   * @param value - The value to set (max 4000 characters)
   * @returns The text input builder instance for method chaining
   */
  setValue(value: string): this {
    this.#data.value = value;
    return this;
  }

  /**
   * Sets the placeholder text of the text input.
   *
   * @param placeholder - The placeholder to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   */
  setPlaceholder(placeholder: string): this {
    this.#data.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The text input builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final text input entity object.
   * @returns The complete text input entity
   */
  build(): TextInputEntity {
    return this.#data as TextInputEntity;
  }

  /**
   * Converts the text input data to an immutable object.
   * @returns A read-only copy of the text input data
   */
  toJson(): Readonly<TextInputEntity> {
    return Object.freeze({ ...this.#data }) as TextInputEntity;
  }
}
