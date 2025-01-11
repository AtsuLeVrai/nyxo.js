import { TextInputEntity, type TextInputStyle } from "@nyxjs/core";
import type { z } from "zod";
import { fromError } from "zod-validation-error";

export class TextInputBuilder {
  readonly #data: Partial<z.input<typeof TextInputEntity>> = {};

  constructor(data?: z.input<typeof TextInputEntity>) {
    if (data) {
      this.#data = data;
    }
  }

  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  setStyle(style: TextInputStyle): this {
    this.#data.style = style;
    return this;
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

  setRequired(required: boolean): this {
    this.#data.required = required;
    return this;
  }

  setValue(value: string): this {
    this.#data.value = value;
    return this;
  }

  setPlaceholder(placeholder: string): this {
    this.#data.placeholder = placeholder;
    return this;
  }

  toJson(): z.output<typeof TextInputEntity> {
    try {
      return TextInputEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}
