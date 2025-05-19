import {
  ComponentType,
  type TextInputEntity,
  type TextInputStyle,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { TextInputSchema } from "../schemas/index.js";

/**
 * A builder for creating Discord text input components.
 *
 * Text inputs are used in modals to collect text data from users.
 * This class follows the builder pattern to create text input components with
 * validation through Zod schemas to ensure all elements meet Discord's requirements.
 */
export class TextInputBuilder {
  /** The internal text input data being constructed */
  readonly #data: Partial<z.input<typeof TextInputSchema>> = {
    type: ComponentType.TextInput,
  };

  /**
   * Creates a new TextInputBuilder instance.
   *
   * @param data - Optional initial data to populate the text input with
   */
  constructor(data?: z.input<typeof TextInputSchema>) {
    if (data) {
      // Validate the initial data
      const result = TextInputSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new TextInputBuilder from existing text input data.
   *
   * @param data - The text input data to use
   * @returns A new TextInputBuilder instance with the provided data
   */
  static from(data: z.input<typeof TextInputSchema>): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  /**
   * Sets the custom ID of the text input.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   */
  setCustomId(customId: string): this {
    const result = TextInputSchema.shape.custom_id.safeParse(customId);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.custom_id = result.data;
    return this;
  }

  /**
   * Sets the style of the text input.
   *
   * @param style - The text input style to set
   * @returns The text input builder instance for method chaining
   */
  setStyle(style: TextInputStyle): this {
    const result = TextInputSchema.shape.style.safeParse(style);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.style = result.data;
    return this;
  }

  /**
   * Sets the label of the text input.
   *
   * @param label - The label to set (max 45 characters)
   * @returns The text input builder instance for method chaining
   */
  setLabel(label: string): this {
    const result = TextInputSchema.shape.label.safeParse(label);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.label = result.data;
    return this;
  }

  /**
   * Sets the minimum length of the text input.
   *
   * @param minLength - The minimum length to set (0-4000)
   * @returns The text input builder instance for method chaining
   */
  setMinLength(minLength: number): this {
    const result = TextInputSchema.shape.min_length.safeParse(minLength);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Check if min_length would be greater than max_length
    if (
      this.#data.max_length !== undefined &&
      minLength > this.#data.max_length
    ) {
      throw new Error("Minimum length cannot be greater than maximum length");
    }

    this.#data.min_length = result.data;
    return this;
  }

  /**
   * Sets the maximum length of the text input.
   *
   * @param maxLength - The maximum length to set (1-4000)
   * @returns The text input builder instance for method chaining
   */
  setMaxLength(maxLength: number): this {
    const result = TextInputSchema.shape.max_length.safeParse(maxLength);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Check if max_length would be less than min_length
    if (
      this.#data.min_length !== undefined &&
      maxLength < this.#data.min_length
    ) {
      throw new Error("Maximum length cannot be less than minimum length");
    }

    this.#data.max_length = result.data;
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
    const result = TextInputSchema.shape.value.safeParse(value);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Check if value meets min_length requirement
    if (
      this.#data.min_length !== undefined &&
      value.length < this.#data.min_length
    ) {
      throw new Error(
        `Value length (${value.length}) is less than minimum length (${this.#data.min_length})`,
      );
    }

    // Check if value meets max_length requirement
    if (
      this.#data.max_length !== undefined &&
      value.length > this.#data.max_length
    ) {
      throw new Error(
        `Value length (${value.length}) exceeds maximum length (${this.#data.max_length})`,
      );
    }

    this.#data.value = result.data;
    return this;
  }

  /**
   * Sets the placeholder text of the text input.
   *
   * @param placeholder - The placeholder to set (max 100 characters)
   * @returns The text input builder instance for method chaining
   */
  setPlaceholder(placeholder: string): this {
    const result = TextInputSchema.shape.placeholder.safeParse(placeholder);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.placeholder = result.data;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The text input builder instance for method chaining
   */
  setId(id: number): this {
    const result = TextInputSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final text input entity object.
   *
   * @returns The complete text input entity
   * @throws Error if the text input configuration is invalid
   */
  build(): TextInputEntity {
    // Validate the entire text input
    const result = TextInputSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data as TextInputEntity;
  }

  /**
   * Returns a JSON representation of the text input.
   *
   * @returns A read-only copy of the text input data
   */
  toJson(): Readonly<Partial<z.input<typeof TextInputSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
