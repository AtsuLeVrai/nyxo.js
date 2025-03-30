import {
  ComponentType,
  type TextInputEntity,
  type TextInputStyle,
} from "@nyxjs/core";
import { ComponentBuilder } from "./component.builder.js";

/**
 * Builder for creating text input components for modals.
 *
 * @example
 * ```typescript
 * const textInput = new TextInputBuilder()
 *   .setCustomId('my_input')
 *   .setLabel('Enter some text')
 *   .setStyle(TextInputStyle.Short)
 *   .setRequired(true)
 *   .build();
 * ```
 */
export class TextInputBuilder extends ComponentBuilder<
  TextInputEntity,
  TextInputBuilder
> {
  /**
   * Creates a new TextInputBuilder instance.
   *
   * @param data Optional initial text input data
   */
  constructor(data: Partial<TextInputEntity> = {}) {
    super({
      type: ComponentType.TextInput,
      required: true,
      ...data,
    });
  }

  protected get self(): TextInputBuilder {
    return this;
  }

  /**
   * Creates a new TextInputBuilder from an existing text input entity.
   *
   * @param textInput The text input entity to use as a base
   * @returns A new TextInputBuilder instance
   */
  static from(
    textInput: TextInputEntity | Partial<TextInputEntity>,
  ): TextInputBuilder {
    return new TextInputBuilder(textInput);
  }

  /**
   * Sets the custom ID of the text input.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If customId exceeds 100 characters
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Text input custom ID cannot exceed 100 characters");
    }
    this.data.custom_id = customId;
    return this;
  }

  /**
   * Sets the style of the text input.
   *
   * @param style The text input style to use
   * @returns This builder instance, for method chaining
   */
  setStyle(style: TextInputStyle): this {
    this.data.style = style;
    return this;
  }

  /**
   * Sets the label of the text input.
   *
   * @param label The label text to set (max 45 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If label exceeds 45 characters
   */
  setLabel(label: string): this {
    if (label.length > 45) {
      throw new Error("Text input label cannot exceed 45 characters");
    }
    this.data.label = label;
    return this;
  }

  /**
   * Sets the minimum length of the text input.
   *
   * @param minLength The minimum length to set (0-4000)
   * @returns This builder instance, for method chaining
   * @throws Error If minLength is outside the valid range
   */
  setMinLength(minLength: number): this {
    if (minLength < 0 || minLength > 4000) {
      throw new Error("Text input minimum length must be between 0 and 4000");
    }
    this.data.min_length = minLength;
    return this;
  }

  /**
   * Sets the maximum length of the text input.
   *
   * @param maxLength The maximum length to set (1-4000)
   * @returns This builder instance, for method chaining
   * @throws Error If maxLength is outside the valid range
   */
  setMaxLength(maxLength: number): this {
    if (maxLength < 1 || maxLength > 4000) {
      throw new Error("Text input maximum length must be between 1 and 4000");
    }
    this.data.max_length = maxLength;
    return this;
  }

  /**
   * Sets whether the text input is required.
   *
   * @param required Whether the text input is required
   * @returns This builder instance, for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  /**
   * Sets the placeholder text of the text input.
   *
   * @param placeholder The placeholder text to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If placeholder exceeds 100 characters
   */
  setPlaceholder(placeholder: string): this {
    if (placeholder.length > 100) {
      throw new Error("Text input placeholder cannot exceed 100 characters");
    }
    this.data.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the default value of the text input.
   *
   * @param value The default value to set (max 4000 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If value exceeds 4000 characters
   */
  setValue(value: string): this {
    if (value.length > 4000) {
      throw new Error("Text input value cannot exceed 4000 characters");
    }
    this.data.value = value;
    return this;
  }

  /**
   * Builds and returns the final text input object.
   *
   * @returns The constructed text input entity
   * @throws Error If required properties are missing
   */
  build(): TextInputEntity {
    // Validate required properties
    if (!this.data.custom_id) {
      throw new Error("Text input must have a custom ID");
    }

    if (!this.data.style) {
      throw new Error("Text input must have a style");
    }

    if (!this.data.label) {
      throw new Error("Text input must have a label");
    }

    // Validate min/max length
    if (
      this.data.min_length !== undefined &&
      this.data.max_length !== undefined &&
      this.data.min_length > this.data.max_length
    ) {
      throw new Error(
        "Text input minimum length cannot be greater than maximum length",
      );
    }

    return this.data as TextInputEntity;
  }
}
