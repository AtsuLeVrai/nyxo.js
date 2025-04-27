import {
  ComponentType,
  type TextInputEntity,
  type TextInputStyle,
} from "@nyxojs/core";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Builder for text input components.
 *
 * Text inputs are used in modals to collect text data from users.
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
  constructor(data?: Partial<TextInputEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.TextInput, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new TextInputBuilder from existing text input data.
   *
   * @param data - The text input data to use
   * @returns A new TextInputBuilder instance with the provided data
   */
  static from(data: Partial<TextInputEntity>): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  /**
   * Sets the custom ID of the text input.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   * @throws Error if customId exceeds 100 characters
   */
  setCustomId(customId: string): this {
    if (customId.length > COMPONENT_LIMITS.CUSTOM_ID) {
      throw new Error(
        `Text input custom ID cannot exceed ${COMPONENT_LIMITS.CUSTOM_ID} characters`,
      );
    }
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
   * @throws Error if label exceeds 45 characters
   */
  setLabel(label: string): this {
    if (label.length > COMPONENT_LIMITS.TEXT_INPUT_LABEL) {
      throw new Error(
        `Text input label cannot exceed ${COMPONENT_LIMITS.TEXT_INPUT_LABEL} characters`,
      );
    }
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the minimum length of the text input.
   *
   * @param minLength - The minimum length to set (0-4000)
   * @returns The text input builder instance for method chaining
   * @throws Error if minLength is out of range
   */
  setMinLength(minLength: number): this {
    if (minLength < 0 || minLength > COMPONENT_LIMITS.TEXT_INPUT_VALUE) {
      throw new Error(
        `Minimum length must be between 0 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
      );
    }
    this.#data.min_length = minLength;
    return this;
  }

  /**
   * Sets the maximum length of the text input.
   *
   * @param maxLength - The maximum length to set (1-4000)
   * @returns The text input builder instance for method chaining
   * @throws Error if maxLength is out of range
   */
  setMaxLength(maxLength: number): this {
    if (maxLength < 1 || maxLength > COMPONENT_LIMITS.TEXT_INPUT_VALUE) {
      throw new Error(
        `Maximum length must be between 1 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
      );
    }
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
   * @throws Error if value exceeds 4000 characters
   */
  setValue(value: string): this {
    if (value.length > COMPONENT_LIMITS.TEXT_INPUT_VALUE) {
      throw new Error(
        `Text input value cannot exceed ${COMPONENT_LIMITS.TEXT_INPUT_VALUE} characters`,
      );
    }
    this.#data.value = value;
    return this;
  }

  /**
   * Sets the placeholder text of the text input.
   *
   * @param placeholder - The placeholder to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   * @throws Error if placeholder exceeds 100 characters
   */
  setPlaceholder(placeholder: string): this {
    if (placeholder.length > COMPONENT_LIMITS.TEXT_INPUT_PLACEHOLDER) {
      throw new Error(
        `Text input placeholder cannot exceed ${COMPONENT_LIMITS.TEXT_INPUT_PLACEHOLDER} characters`,
      );
    }
    this.#data.placeholder = placeholder;
    return this;
  }

  /**
   * Builds the final text input entity object.
   *
   * @returns The complete text input entity
   * @throws Error if the text input configuration is invalid
   */
  build(): TextInputEntity {
    if (!this.#data.custom_id) {
      throw new Error("Text input must have a custom ID");
    }

    if (!this.#data.style) {
      throw new Error("Text input must have a style");
    }

    if (!this.#data.label) {
      throw new Error("Text input must have a label");
    }

    if (
      this.#data.min_length !== undefined &&
      this.#data.max_length !== undefined &&
      this.#data.min_length > this.#data.max_length
    ) {
      throw new Error("Minimum length cannot be greater than maximum length");
    }

    return this.#data as TextInputEntity;
  }

  /**
   * Returns a JSON representation of the text input.
   *
   * @returns A read-only copy of the text input data
   */
  toJson(): Readonly<Partial<TextInputEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
