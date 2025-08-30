import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type TextInputEntity, TextInputStyle } from "./components.entity.js";

/**
 * @description Professional builder for Discord text input components in modals.
 * Supports both short and paragraph styles with comprehensive validation.
 * @see {@link https://discord.com/developers/docs/components/reference#text-input}
 */
export class TextInputBuilder extends BaseBuilder<TextInputEntity> {
  constructor(data?: Partial<TextInputEntity>) {
    super({
      type: ComponentType.TextInput,
      ...data,
    });
  }

  /**
   * @description Creates a text input builder from existing data.
   * @param data - Existing text input entity data
   * @returns New text input builder instance
   */
  static from(data: TextInputEntity): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  /**
   * @description Sets the text input display style.
   * @param style - Input style (Short for single-line, Paragraph for multi-line)
   * @returns This builder instance for method chaining
   */
  setStyle(style: TextInputStyle): this {
    return this.set("style", style);
  }

  /**
   * @description Sets the custom ID for interaction responses.
   * @param customId - Developer-defined identifier (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When custom ID is too long
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Text input custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  /**
   * @description Sets the minimum input length constraint.
   * @param minLength - Minimum length (0-4000 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When length is out of bounds
   */
  setMinLength(minLength: number): this {
    if (minLength < 0 || minLength > 4000) {
      throw new Error("Text input minimum length must be between 0 and 4000");
    }
    return this.set("min_length", minLength);
  }

  /**
   * @description Sets the maximum input length constraint.
   * @param maxLength - Maximum length (1-4000 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When length is out of bounds
   */
  setMaxLength(maxLength: number): this {
    if (maxLength < 1 || maxLength > 4000) {
      throw new Error("Text input maximum length must be between 1 and 4000");
    }
    return this.set("max_length", maxLength);
  }

  /**
   * @description Sets whether the input is required to be filled.
   * @param required - Whether input is required (defaults to true)
   * @returns This builder instance for method chaining
   */
  setRequired(required = true): this {
    return this.set("required", required);
  }

  /**
   * @description Sets the pre-filled text value.
   * @param value - Pre-filled text (max 4000 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When value is too long
   */
  setValue(value: string): this {
    if (value.length > 4000) {
      throw new Error("Text input value cannot exceed 4000 characters");
    }
    return this.set("value", value);
  }

  /**
   * @description Sets the placeholder text when input is empty.
   * @param placeholder - Placeholder text (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When placeholder is too long
   */
  setPlaceholder(placeholder: string): this {
    if (placeholder.length > 100) {
      throw new Error("Text input placeholder cannot exceed 100 characters");
    }
    return this.set("placeholder", placeholder);
  }

  /**
   * @description Sets the unique component identifier within the modal.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Creates a short single-line text input.
   * @param customId - Developer-defined identifier
   * @param placeholder - Placeholder text
   * @returns This builder instance for method chaining
   */
  setShort(customId: string, placeholder?: string): this {
    this.setStyle(TextInputStyle.Short).setCustomId(customId);
    if (placeholder) this.setPlaceholder(placeholder);
    return this;
  }

  /**
   * @description Creates a paragraph multi-line text input.
   * @param customId - Developer-defined identifier
   * @param placeholder - Placeholder text
   * @returns This builder instance for method chaining
   */
  setParagraph(customId: string, placeholder?: string): this {
    this.setStyle(TextInputStyle.Paragraph).setCustomId(customId);
    if (placeholder) this.setPlaceholder(placeholder);
    return this;
  }

  /**
   * @description Validates text input data before building.
   * @throws {Error} When text input configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;

    if (!data.custom_id) {
      throw new Error("Text input must have a custom_id");
    }

    if (!data.style) {
      throw new Error("Text input must have a style");
    }

    // Validate length constraints
    if (data.min_length !== undefined && data.max_length !== undefined) {
      if (data.min_length > data.max_length) {
        throw new Error("Text input minimum length cannot exceed maximum length");
      }
    }

    // Validate value against constraints
    if (data.value) {
      const valueLength = data.value.length;
      if (data.min_length !== undefined && valueLength < data.min_length) {
        throw new Error("Text input value is shorter than minimum length");
      }
      if (data.max_length !== undefined && valueLength > data.max_length) {
        throw new Error("Text input value exceeds maximum length");
      }
    }
  }
}
