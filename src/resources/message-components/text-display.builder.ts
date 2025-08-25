import { ComponentType, type TextDisplayEntity } from "./message-components.entity.js";

export class TextDisplayBuilder {
  readonly #data: Partial<TextDisplayEntity> = {
    type: ComponentType.TextDisplay,
  };
  constructor(data?: TextDisplayEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: TextDisplayEntity): TextDisplayBuilder {
    return new TextDisplayBuilder(data);
  }
  setContent(content: string): this {
    this.#data.content = content;
    return this;
  }
  appendContent(content: string, separator = ""): this {
    const newContent = this.#data.content ? `${this.#data.content}${separator}${content}` : content;
    return this.setContent(newContent);
  }
  addHeading(text: string, level: 1 | 2 | 3 = 1, append = false): this {
    const headingText = `${"#".repeat(level)} ${text}`;
    if (append) {
      return this.appendContent(headingText, "\n\n");
    }
    return this.setContent(headingText);
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): TextDisplayEntity {
    return this.#data as TextDisplayEntity;
  }
  toJson(): Readonly<TextDisplayEntity> {
    return Object.freeze({ ...this.#data }) as TextDisplayEntity;
  }
}
