import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type TextDisplayEntity } from "./components.entity.js";

/**
 * @description Professional builder for Discord text display components with rich markdown support.
 * Used in Components v2 messages for formatted text content.
 * @see {@link https://discord.com/developers/docs/components/reference#text-display}
 */
export class TextDisplayBuilder extends BaseBuilder<TextDisplayEntity> {
  constructor(data?: Partial<TextDisplayEntity>) {
    super({
      type: ComponentType.TextDisplay,
      ...data,
    });
  }

  /**
   * @description Creates a text display builder from existing data.
   * @param data - Existing text display entity data
   * @returns New text display builder instance
   */
  static from(data: TextDisplayEntity): TextDisplayBuilder {
    return new TextDisplayBuilder(data);
  }

  /**
   * @description Sets the markdown-formatted text content.
   * @param content - Markdown text with Discord formatting support
   * @returns This builder instance for method chaining
   */
  setContent(content: string): this {
    return this.set("content", content);
  }

  /**
   * @description Appends content to existing text with optional separator.
   * @param content - Content to append
   * @param separator - Separator between existing and new content
   * @returns This builder instance for method chaining
   */
  appendContent(content: string, separator = ""): this {
    const existingContent = this.get("content") || "";
    const newContent = existingContent ? `${existingContent}${separator}${content}` : content;
    return this.setContent(newContent);
  }

  /**
   * @description Adds or appends a markdown heading.
   * @param text - Heading text
   * @param level - Heading level (1-3)
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addHeading(text: string, level: 1 | 2 | 3 = 1, append = false): this {
    const headingText = `${"#".repeat(level)} ${text}`;
    if (append) {
      return this.appendContent(headingText, "\n\n");
    }
    return this.setContent(headingText);
  }

  /**
   * @description Adds or appends bold text.
   * @param text - Text to make bold
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addBold(text: string, append = false): this {
    const boldText = `**${text}**`;
    if (append) {
      return this.appendContent(boldText, " ");
    }
    return this.setContent(boldText);
  }

  /**
   * @description Adds or appends italic text.
   * @param text - Text to make italic
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addItalic(text: string, append = false): this {
    const italicText = `*${text}*`;
    if (append) {
      return this.appendContent(italicText, " ");
    }
    return this.setContent(italicText);
  }

  /**
   * @description Adds or appends underlined text.
   * @param text - Text to underline
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addUnderline(text: string, append = false): this {
    const underlineText = `__${text}__`;
    if (append) {
      return this.appendContent(underlineText, " ");
    }
    return this.setContent(underlineText);
  }

  /**
   * @description Adds or appends strikethrough text.
   * @param text - Text to strike through
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addStrikethrough(text: string, append = false): this {
    const strikeText = `~~${text}~~`;
    if (append) {
      return this.appendContent(strikeText, " ");
    }
    return this.setContent(strikeText);
  }

  /**
   * @description Adds or appends inline code.
   * @param code - Code text
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addInlineCode(code: string, append = false): this {
    const codeText = `\`${code}\``;
    if (append) {
      return this.appendContent(codeText, " ");
    }
    return this.setContent(codeText);
  }

  /**
   * @description Adds or appends a code block with optional language.
   * @param code - Code content
   * @param language - Programming language for syntax highlighting
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addCodeBlock(code: string, language?: string, append = false): this {
    const codeBlockText = `\`\`\`${language || ""}\n${code}\n\`\`\``;
    if (append) {
      return this.appendContent(codeBlockText, "\n\n");
    }
    return this.setContent(codeBlockText);
  }

  /**
   * @description Adds or appends a blockquote.
   * @param text - Quote text
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addBlockquote(text: string, append = false): this {
    const quoteText = text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
    if (append) {
      return this.appendContent(quoteText, "\n\n");
    }
    return this.setContent(quoteText);
  }

  /**
   * @description Adds or appends a hyperlink.
   * @param text - Link text
   * @param url - Link URL
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addLink(text: string, url: string, append = false): this {
    const linkText = `[${text}](${url})`;
    if (append) {
      return this.appendContent(linkText, " ");
    }
    return this.setContent(linkText);
  }

  /**
   * @description Adds or appends a bulleted list.
   * @param items - List items
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addBulletList(items: string[], append = false): this {
    const listText = items.map((item) => `• ${item}`).join("\n");
    if (append) {
      return this.appendContent(listText, "\n\n");
    }
    return this.setContent(listText);
  }

  /**
   * @description Adds or appends a numbered list.
   * @param items - List items
   * @param append - Whether to append to existing content
   * @returns This builder instance for method chaining
   */
  addNumberedList(items: string[], append = false): this {
    const listText = items.map((item, index) => `${index + 1}. ${item}`).join("\n");
    if (append) {
      return this.appendContent(listText, "\n\n");
    }
    return this.setContent(listText);
  }

  /**
   * @description Adds a line break to existing content.
   * @returns This builder instance for method chaining
   */
  addLineBreak(): this {
    return this.appendContent("", "\n");
  }

  /**
   * @description Adds a paragraph break (double line break) to existing content.
   * @returns This builder instance for method chaining
   */
  addParagraphBreak(): this {
    return this.appendContent("", "\n\n");
  }

  /**
   * @description Sets the unique component identifier within the message.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Validates text display data before building.
   * @throws {Error} When text display configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;
    if (!data.content) {
      throw new Error("Text display must have content");
    }

    if (typeof data.content !== "string") {
      throw new Error("Text display content must be a string");
    }

    // Warn about very long content that might be truncated
    if (data.content.length > 4000) {
    }
  }
}
