import { ComponentType, TextInputEntity, TextInputStyle } from "@nyxjs/core";
import { z } from "zod";

export class TextInputBuilder {
  readonly #data: Partial<z.input<typeof TextInputEntity>>;

  constructor(data: Partial<z.input<typeof TextInputEntity>> = {}) {
    this.#data = {
      type: ComponentType.TextInput,
      required: true,
      ...data,
    };
  }

  static from(data: z.input<typeof TextInputEntity>): TextInputBuilder {
    return new TextInputBuilder(data);
  }

  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  setStyle(style: TextInputStyle): this {
    this.#data.style = style;
    return this;
  }

  setShort(): this {
    return this.setStyle(TextInputStyle.Short);
  }

  setParagraph(): this {
    return this.setStyle(TextInputStyle.Paragraph);
  }

  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }

  setMinLength(minLength: number): this {
    this.#data.min_length = minLength;
    return this;
  }

  setMaxLength(maxLength: number): this {
    this.#data.max_length = maxLength;
    return this;
  }

  setRequired(required = true): this {
    this.#data.required = required;
    return this;
  }

  setPlaceholder(placeholder: string): this {
    this.#data.placeholder = placeholder;
    return this;
  }

  setValue(value: string): this {
    this.#data.value = value;
    return this;
  }

  toJson(): TextInputEntity {
    return TextInputEntity.parse(this.#data);
  }
}

export const TextInputBuilderSchema = z.instanceof(TextInputBuilder);
