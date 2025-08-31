import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type TextInputEntity, TextInputStyle } from "./components.entity.js";

export class TextInputBuilder extends BaseBuilder<TextInputEntity> {
  constructor(data?: Partial<TextInputEntity>) {
    super({
      type: ComponentType.TextInput,
      ...data,
    });
  }

  static from(data: TextInputEntity): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  setStyle(style: TextInputStyle): this {
    return this.set("style", style);
  }

  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Text input custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  setMinLength(minLength: number): this {
    if (minLength < 0 || minLength > 4000) {
      throw new Error("Text input minimum length must be between 0 and 4000");
    }
    return this.set("min_length", minLength);
  }

  setMaxLength(maxLength: number): this {
    if (maxLength < 1 || maxLength > 4000) {
      throw new Error("Text input maximum length must be between 1 and 4000");
    }
    return this.set("max_length", maxLength);
  }

  setRequired(required = true): this {
    return this.set("required", required);
  }

  setValue(value: string): this {
    if (value.length > 4000) {
      throw new Error("Text input value cannot exceed 4000 characters");
    }
    return this.set("value", value);
  }

  setPlaceholder(placeholder: string): this {
    if (placeholder.length > 100) {
      throw new Error("Text input placeholder cannot exceed 100 characters");
    }
    return this.set("placeholder", placeholder);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setShort(customId: string, placeholder?: string): this {
    this.setStyle(TextInputStyle.Short).setCustomId(customId);
    if (placeholder) this.setPlaceholder(placeholder);
    return this;
  }

  setParagraph(customId: string, placeholder?: string): this {
    this.setStyle(TextInputStyle.Paragraph).setCustomId(customId);
    if (placeholder) this.setPlaceholder(placeholder);
    return this;
  }

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
