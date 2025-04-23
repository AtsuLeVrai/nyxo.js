import { ComponentType, type TextDisplayEntity } from "@nyxojs/core";

/**
 * Builder for text display components.
 *
 * Text displays allow you to add text to your message formatted with markdown.
 *
 * @example
 * ```typescript
 * const textDisplay = new TextDisplayBuilder()
 *   .setContent('# Hello World\nThis is a **markdown** text display')
 *   .build();
 * ```
 */
export class TextDisplayBuilder {
  /** The internal text display data being constructed */
  readonly #data: Partial<TextDisplayEntity> = {
    type: ComponentType.TextDisplay,
  };

  /**
   * Creates a new TextDisplayBuilder instance.
   *
   * @param data - Optional initial data to populate the text display with
   */
  constructor(data?: Partial<TextDisplayEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.TextDisplay, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new TextDisplayBuilder from existing text display data.
   *
   * @param data - The text display data to use
   * @returns A new TextDisplayBuilder instance with the provided data
   */
  static from(data: Partial<TextDisplayEntity>): TextDisplayBuilder {
    return new TextDisplayBuilder(data);
  }

  /**
   * Sets the content of the text display.
   *
   * @param content - The content to display
   * @returns The text display builder instance for method chaining
   */
  setContent(content: string): this {
    this.#data.content = content;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The text display builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final text display entity object.
   *
   * @returns The complete text display entity
   * @throws Error if the text display configuration is invalid
   */
  build(): TextDisplayEntity {
    if (!this.#data.content) {
      throw new Error("Text display must have content");
    }

    return this.#data as TextDisplayEntity;
  }

  /**
   * Returns a JSON representation of the text display.
   *
   * @returns A read-only copy of the text display data
   */
  toJson(): Readonly<Partial<TextDisplayEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
