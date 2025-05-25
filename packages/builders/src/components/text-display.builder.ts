import { ComponentType, type TextDisplayEntity } from "@nyxojs/core";

/**
 * A builder for creating Discord text display components.
 *
 * Text displays allow you to add formatted text to your message.
 * This component supports markdown and is similar to the message `content` field,
 * but allows for more control over the layout of your message.
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
  constructor(data?: TextDisplayEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new TextDisplayBuilder from existing text display data.
   *
   * @param data - The text display data to use
   * @returns A new TextDisplayBuilder instance with the provided data
   */
  static from(data: TextDisplayEntity): TextDisplayBuilder {
    return new TextDisplayBuilder(data);
  }

  /**
   * Sets the content of the text display.
   * Supports markdown formatting including headers, lists, code blocks, etc.
   *
   * @param content - The content to display
   * @returns The text display builder instance for method chaining
   */
  setContent(content: string): this {
    this.#data.content = content;
    return this;
  }

  /**
   * Appends text to the existing content.
   * This is a convenience method for adding more content without replacing existing text.
   *
   * @param content - The content to append
   * @param separator - Optional separator to add between existing and new content (defaults to nothing)
   * @returns The text display builder instance for method chaining
   */
  appendContent(content: string, separator = ""): this {
    const newContent = this.#data.content
      ? `${this.#data.content}${separator}${content}`
      : content;

    return this.setContent(newContent);
  }

  /**
   * Adds a heading to the content.
   * This is a convenience method for adding a markdown heading.
   *
   * @param text - The heading text
   * @param level - The heading level (1-3)
   * @param append - Whether to append to existing content (defaults to false)
   * @returns The text display builder instance for method chaining
   */
  addHeading(text: string, level: 1 | 2 | 3 = 1, append = false): this {
    const headingText = `${"#".repeat(level)} ${text}`;

    if (append) {
      return this.appendContent(headingText, "\n\n");
    }

    return this.setContent(headingText);
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
   * @returns The complete text display entity
   */
  build(): TextDisplayEntity {
    return this.#data as TextDisplayEntity;
  }

  /**
   * Converts the text display data to an immutable object.
   * @returns A read-only copy of the text display data
   */
  toJson(): Readonly<TextDisplayEntity> {
    return Object.freeze({ ...this.#data }) as TextDisplayEntity;
  }
}
