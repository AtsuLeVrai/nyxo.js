import { ComponentType, type TextDisplayEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { TextDisplaySchema } from "../schemas/index.js";

/**
 * A builder for creating Discord text display components.
 *
 * Text displays allow you to add formatted text to your message.
 * This component supports markdown and is similar to the message `content` field,
 * but allows for more control over the layout of your message.
 *
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class TextDisplayBuilder {
  /** The internal text display data being constructed */
  readonly #data: Partial<z.input<typeof TextDisplaySchema>> = {
    type: ComponentType.TextDisplay,
  };

  /**
   * Creates a new TextDisplayBuilder instance.
   *
   * @param data - Optional initial data to populate the text display with
   */
  constructor(data?: z.input<typeof TextDisplaySchema>) {
    if (data) {
      // Validate the initial data
      const result = TextDisplaySchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new TextDisplayBuilder from existing text display data.
   *
   * @param data - The text display data to use
   * @returns A new TextDisplayBuilder instance with the provided data
   */
  static from(data: z.input<typeof TextDisplaySchema>): TextDisplayBuilder {
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
    const result = TextDisplaySchema.shape.content.safeParse(content);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.content = result.data;
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
    if (level < 1 || level > 6) {
      throw new Error("Heading level must be between 1 and 3");
    }

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
    const result = TextDisplaySchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final text display entity object.
   *
   * @returns The complete text display entity
   * @throws Error if the text display configuration is invalid
   */
  build(): TextDisplayEntity {
    // Validate the entire text display
    const result = TextDisplaySchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the text display.
   *
   * @returns A read-only copy of the text display data
   */
  toJson(): Readonly<Partial<z.input<typeof TextDisplaySchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
