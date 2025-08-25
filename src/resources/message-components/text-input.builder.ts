import {
  ComponentType,
  type TextInputEntity,
  type TextInputStyle,
} from "./message-components.entity.js";

export class TextInputBuilder {
  readonly #data: Partial<TextInputEntity> = {
    type: ComponentType.TextInput,
  };
  constructor(data?: TextInputEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: TextInputEntity): TextInputBuilder {
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
  setValue(value: string): this {
    this.#data.value = value;
    return this;
  }
  setPlaceholder(placeholder: string): this {
    this.#data.placeholder = placeholder;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): TextInputEntity {
    return this.#data as TextInputEntity;
  }
  toJson(): Readonly<TextInputEntity> {
    return Object.freeze({ ...this.#data }) as TextInputEntity;
  }
}
