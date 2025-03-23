import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ComponentType,
  TextInputEntity,
  TextInputStyle,
} from "../entities/index.js";

/**
 * A builder class for creating and validating Discord modal text inputs.
 *
 * This builder provides a fluent interface for constructing text inputs with proper validation
 * using Zod schemas. It ensures that all text input properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * // Create a short text input
 * const shortInput = new TextInputBuilder()
 *   .setCustomId("name_input")
 *   .setLabel("Your Name")
 *   .setStyle(TextInputStyle.Short)
 *   .setPlaceholder("Enter your name")
 *   .setRequired(true)
 *   .build();
 *
 * // Create a paragraph text input
 * const paragraphInput = new TextInputBuilder()
 *   .setCustomId("bio_input")
 *   .setLabel("Biography")
 *   .setStyle(TextInputStyle.Paragraph)
 *   .setMinLength(10)
 *   .setMaxLength(1000)
 *   .setValue("I am a...")
 *   .build();
 * ```
 */
export class TextInputBuilder {
  /** Internal data object representing the text input being built */
  readonly #data: z.input<typeof TextInputEntity> = {
    type: ComponentType.TextInput,
    custom_id: "",
    style: TextInputStyle.Short,
    label: "",
  };

  /**
   * Creates a new TextInputBuilder instance.
   *
   * @param data Optional initial data to populate the text input
   */
  constructor(data?: Partial<z.input<typeof TextInputEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new TextInputBuilder from an existing text input object.
   *
   * @param textInput The text input object to copy from
   * @returns A new TextInputBuilder instance
   */
  static from(textInput: z.input<typeof TextInputEntity>): TextInputBuilder {
    return new TextInputBuilder(textInput);
  }

  /**
   * Creates a short text input with common settings.
   *
   * @param customId The custom ID for the text input
   * @param label The label for the text input
   * @param required Whether the text input is required
   * @returns A new TextInputBuilder configured as a short text input
   */
  static createShort(
    customId: string,
    label: string,
    required = true,
  ): TextInputBuilder {
    return new TextInputBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(TextInputStyle.Short)
      .setRequired(required);
  }

  /**
   * Creates a paragraph text input with common settings.
   *
   * @param customId The custom ID for the text input
   * @param label The label for the text input
   * @param required Whether the text input is required
   * @returns A new TextInputBuilder configured as a paragraph text input
   */
  static createParagraph(
    customId: string,
    label: string,
    required = true,
  ): TextInputBuilder {
    return new TextInputBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(required);
  }

  /**
   * Sets the custom ID of the text input.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id = TextInputEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the label of the text input.
   *
   * @param label The label to set (max 45 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the label is invalid
   */
  setLabel(label: string): this {
    try {
      this.#data.label = TextInputEntity.shape.label.parse(label);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the style of the text input.
   *
   * @param style The style to set (Short or Paragraph)
   * @returns This builder instance for method chaining
   * @throws {Error} If the style is invalid
   */
  setStyle(style: TextInputStyle): this {
    try {
      this.#data.style = TextInputEntity.shape.style.parse(style);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum length of the text input.
   *
   * @param minLength The minimum length to set (0-4000)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min length is invalid
   */
  setMinLength(minLength: number): this {
    try {
      this.#data.min_length = TextInputEntity.shape.min_length.parse(minLength);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum length of the text input.
   *
   * @param maxLength The maximum length to set (1-4000)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max length is invalid
   */
  setMaxLength(maxLength: number): this {
    try {
      this.#data.max_length = TextInputEntity.shape.max_length.parse(maxLength);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the text input is required.
   *
   * @param required Whether the text input is required
   * @returns This builder instance for method chaining
   */
  setRequired(required: boolean): this {
    this.#data.required = TextInputEntity.shape.required.parse(required);
    return this;
  }

  /**
   * Sets the pre-filled value of the text input.
   *
   * @param value The value to set (max 4000 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the value is invalid
   */
  setValue(value: string): this {
    try {
      this.#data.value = TextInputEntity.shape.value.parse(value);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the text input.
   *
   * @param placeholder The placeholder text to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        TextInputEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Validates and builds the final text input object.
   *
   * @returns The validated text input object ready to be sent to Discord
   * @throws {Error} If the text input fails validation
   */
  build(): z.infer<typeof TextInputEntity> {
    try {
      return TextInputEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this TextInputBuilder.
   *
   * @returns A new TextInputBuilder instance with the same data
   */
  clone(): TextInputBuilder {
    return new TextInputBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the text input data.
   *
   * @returns The text input data as a JSON object
   */
  toJson(): z.infer<typeof TextInputEntity> {
    return structuredClone(TextInputEntity.parse(this.#data));
  }

  /**
   * Checks if the text input is valid according to Discord's requirements.
   *
   * @returns True if the text input is valid, false otherwise
   */
  isValid(): boolean {
    return TextInputEntity.safeParse(this.#data).success;
  }
}
