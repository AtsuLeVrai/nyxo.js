import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type TextDisplayEntity } from "./components.entity.js";

export class TextDisplayBuilder extends BaseBuilder<TextDisplayEntity> {
  constructor(data?: Partial<TextDisplayEntity>) {
    super({
      type: ComponentType.TextDisplay,
      ...data,
    });
  }

  static from(data: TextDisplayEntity): TextDisplayBuilder {
    return new TextDisplayBuilder(data);
  }

  setContent(content: string): this {
    return this.set("content", content);
  }

  appendContent(content: string, separator = ""): this {
    const existingContent = this.get("content") || "";
    const newContent = existingContent ? `${existingContent}${separator}${content}` : content;
    return this.setContent(newContent);
  }

  addHeading(text: string, level: 1 | 2 | 3 = 1, append = false): this {
    const headingText = `${"#".repeat(level)} ${text}`;
    if (append) {
      return this.appendContent(headingText, "\n\n");
    }
    return this.setContent(headingText);
  }

  addBold(text: string, append = false): this {
    const boldText = `**${text}**`;
    if (append) {
      return this.appendContent(boldText, " ");
    }
    return this.setContent(boldText);
  }

  addItalic(text: string, append = false): this {
    const italicText = `*${text}*`;
    if (append) {
      return this.appendContent(italicText, " ");
    }
    return this.setContent(italicText);
  }

  addUnderline(text: string, append = false): this {
    const underlineText = `__${text}__`;
    if (append) {
      return this.appendContent(underlineText, " ");
    }
    return this.setContent(underlineText);
  }

  addStrikethrough(text: string, append = false): this {
    const strikeText = `~~${text}~~`;
    if (append) {
      return this.appendContent(strikeText, " ");
    }
    return this.setContent(strikeText);
  }

  addInlineCode(code: string, append = false): this {
    const codeText = `\`${code}\``;
    if (append) {
      return this.appendContent(codeText, " ");
    }
    return this.setContent(codeText);
  }

  addCodeBlock(code: string, language?: string, append = false): this {
    const codeBlockText = `\`\`\`${language || ""}\n${code}\n\`\`\``;
    if (append) {
      return this.appendContent(codeBlockText, "\n\n");
    }
    return this.setContent(codeBlockText);
  }

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

  addLink(text: string, url: string, append = false): this {
    const linkText = `[${text}](${url})`;
    if (append) {
      return this.appendContent(linkText, " ");
    }
    return this.setContent(linkText);
  }

  addBulletList(items: string[], append = false): this {
    const listText = items.map((item) => `• ${item}`).join("\n");
    if (append) {
      return this.appendContent(listText, "\n\n");
    }
    return this.setContent(listText);
  }

  addNumberedList(items: string[], append = false): this {
    const listText = items.map((item, index) => `${index + 1}. ${item}`).join("\n");
    if (append) {
      return this.appendContent(listText, "\n\n");
    }
    return this.setContent(listText);
  }

  addLineBreak(): this {
    return this.appendContent("", "\n");
  }

  addParagraphBreak(): this {
    return this.appendContent("", "\n\n");
  }

  setId(id: number): this {
    return this.set("id", id);
  }

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
