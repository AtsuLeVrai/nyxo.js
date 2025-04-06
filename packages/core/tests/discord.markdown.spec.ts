import { describe, expect, it } from "vitest";
import {
  bigHeader,
  bold,
  code,
  codeBlock,
  evenSmallerHeader,
  formatChannel,
  formatCustomEmoji,
  formatGuildNavigation,
  formatRole,
  formatSlashCommand,
  formatTimestamp,
  formatUser,
  italics,
  link,
  type ProgrammingLanguageType,
  quote,
  quoteBlock,
  smallerHeader,
  spoiler,
  strikethrough,
  subText,
  TimestampStyle,
  underline,
} from "../src/index.js";

describe("Discord Markdown Formatters", () => {
  describe("Text Styling", () => {
    it("should format italics text", () => {
      expect(italics("Hello world")).toBe("*Hello world*");
      expect(italics("")).toBe("**");
      expect(italics("Special * characters")).toBe("*Special * characters*");
    });

    it("should format bold text", () => {
      expect(bold("Hello world")).toBe("**Hello world**");
      expect(bold("")).toBe("****");
      expect(bold("Special ** characters")).toBe("**Special ** characters**");
    });

    it("should format underlined text", () => {
      expect(underline("Hello world")).toBe("__Hello world__");
      expect(underline("")).toBe("____");
      expect(underline("Special __ characters")).toBe(
        "__Special __ characters__",
      );
    });

    it("should format strikethrough text", () => {
      expect(strikethrough("Hello world")).toBe("~~Hello world~~");
      expect(strikethrough("")).toBe("~~~~");
      expect(strikethrough("Special ~~ characters")).toBe(
        "~~Special ~~ characters~~",
      );
    });

    it("should format spoiler text", () => {
      expect(spoiler("Hello world")).toBe("||Hello world||");
      expect(spoiler("")).toBe("||||");
      expect(spoiler("Special || characters")).toBe(
        "||Special || characters||",
      );
    });
  });

  describe("Headers", () => {
    it("should format big headers", () => {
      expect(bigHeader("Hello world")).toBe("# Hello world");
      expect(bigHeader("")).toBe("# ");
    });

    it("should format smaller headers", () => {
      expect(smallerHeader("Hello world")).toBe("## Hello world");
      expect(smallerHeader("")).toBe("## ");
    });

    it("should format even smaller headers", () => {
      expect(evenSmallerHeader("Hello world")).toBe("### Hello world");
      expect(evenSmallerHeader("")).toBe("### ");
    });

    it("should format subtext", () => {
      expect(subText("Hello world")).toBe("-# Hello world");
      expect(subText("")).toBe("-# ");
    });
  });

  describe("Links", () => {
    it("should format hyperlinks", () => {
      expect(link("Discord", "https://discord.com")).toBe(
        "[Discord](https://discord.com)",
      );
      expect(link("", "")).toBe("[]()");
      expect(link("Link with [brackets]", "https://example.com")).toBe(
        "[Link with [brackets]](https://example.com)",
      );
      expect(link("Link", "url with (parentheses)")).toBe(
        "[Link](url with (parentheses))",
      );
    });
  });

  describe("Code", () => {
    it("should format inline code", () => {
      expect(code("const x = 1;")).toBe("`const x = 1;`");
      expect(code("")).toBe("``");
      expect(code("text with `backticks`")).toBe("`text with `backticks``");
    });

    it("should format code blocks with default language", () => {
      expect(codeBlock("const x = 1;")).toBe("```plaintext\nconst x = 1;\n```");
      expect(codeBlock("")).toBe("```plaintext\n\n```");
    });

    it("should format code blocks with specific language", () => {
      expect(codeBlock("const x = 1;", "javascript")).toBe(
        "```javascript\nconst x = 1;\n```",
      );
      expect(codeBlock("func main() {}", "go")).toBe(
        "```go\nfunc main() {}\n```",
      );

      // Test a variety of languages
      const languages: ProgrammingLanguageType[] = [
        "python",
        "typescript",
        "rust",
        "java",
        "c++",
        "html",
        "css",
        "sql",
      ];
      for (const lang of languages) {
        expect(codeBlock("code example", lang)).toBe(
          `\`\`\`${lang}\ncode example\n\`\`\``,
        );
      }
    });

    it("should handle multiline code blocks", () => {
      const multilineCode = "function test() {\n  return true;\n}";
      expect(codeBlock(multilineCode, "javascript")).toBe(
        `\`\`\`javascript\n${multilineCode}\n\`\`\``,
      );
    });
  });

  describe("Quotes", () => {
    it("should format single-line quotes", () => {
      expect(quote("Hello world")).toBe("> Hello world");
      expect(quote("")).toBe("> ");
    });

    it("should format multi-line quote blocks", () => {
      expect(quoteBlock("Hello\nworld")).toBe(">>> Hello\nworld");
      expect(quoteBlock("")).toBe(">>> ");

      const longQuote = "Line 1\nLine 2\nLine 3";
      expect(quoteBlock(longQuote)).toBe(`>>> ${longQuote}`);
    });
  });

  describe("Mentions", () => {
    it("should format user mentions", () => {
      expect(formatUser("123456789012345678")).toBe("<@123456789012345678>");
      expect(formatUser("987654321098765432")).toBe("<@987654321098765432>");
    });

    it("should format channel mentions", () => {
      expect(formatChannel("123456789012345678")).toBe("<#123456789012345678>");
      expect(formatChannel("987654321098765432")).toBe("<#987654321098765432>");
    });

    it("should format role mentions", () => {
      expect(formatRole("123456789012345678")).toBe("<@&123456789012345678>");
      expect(formatRole("987654321098765432")).toBe("<@&987654321098765432>");
    });
  });

  describe("Slash Commands", () => {
    it("should format basic slash commands", () => {
      expect(formatSlashCommand("help", "123456789012345678")).toBe(
        "</help:123456789012345678>",
      );
      expect(formatSlashCommand("ban", "987654321098765432")).toBe(
        "</ban:987654321098765432>",
      );
    });

    it("should format slash commands with subcommands", () => {
      expect(
        formatSlashCommand(
          "settings",
          "123456789012345678",
          undefined,
          "privacy",
        ),
      ).toBe("</settings privacy:123456789012345678>");
      expect(
        formatSlashCommand("config", "987654321098765432", undefined, "view"),
      ).toBe("</config view:987654321098765432>");
    });

    it("should format slash commands with subcommand groups and subcommands", () => {
      expect(
        formatSlashCommand("permissions", "123456789012345678", "role", "view"),
      ).toBe("</permissions role view:123456789012345678>");
      expect(
        formatSlashCommand("admin", "987654321098765432", "user", "ban"),
      ).toBe("</admin user ban:987654321098765432>");
    });
  });

  describe("Custom Emojis", () => {
    it("should format static custom emojis", () => {
      expect(formatCustomEmoji("heart", "123456789012345678")).toBe(
        "<:heart:123456789012345678>",
      );
      expect(formatCustomEmoji("pepe", "987654321098765432")).toBe(
        "<:pepe:987654321098765432>",
      );
    });

    it("should format animated custom emojis", () => {
      expect(formatCustomEmoji("wave", "123456789012345678", true)).toBe(
        "<a:wave:123456789012345678>",
      );
      expect(formatCustomEmoji("dance", "987654321098765432", true)).toBe(
        "<a:dance:987654321098765432>",
      );
    });
  });

  describe("Timestamps", () => {
    it("should format timestamps with default style", () => {
      expect(formatTimestamp(1618932219)).toBe("<t:1618932219>");
      expect(formatTimestamp(1672531200)).toBe("<t:1672531200>");
    });

    it("should format timestamps with specific styles", () => {
      expect(formatTimestamp(1618932219, TimestampStyle.ShortTime)).toBe(
        "<t:1618932219:t>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.LongTime)).toBe(
        "<t:1618932219:T>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.ShortDate)).toBe(
        "<t:1618932219:d>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.LongDate)).toBe(
        "<t:1618932219:D>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.ShortDateTime)).toBe(
        "<t:1618932219:f>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.LongDateTime)).toBe(
        "<t:1618932219:F>",
      );
      expect(formatTimestamp(1618932219, TimestampStyle.RelativeTime)).toBe(
        "<t:1618932219:R>",
      );
    });
  });

  describe("Guild Navigation", () => {
    it("should format guild navigation links", () => {
      expect(formatGuildNavigation("123456789012345678", "customize")).toBe(
        "<123456789012345678:customize>",
      );
      expect(formatGuildNavigation("123456789012345678", "browse")).toBe(
        "<123456789012345678:browse>",
      );
      expect(formatGuildNavigation("123456789012345678", "guide")).toBe(
        "<123456789012345678:guide>",
      );
      expect(formatGuildNavigation("123456789012345678", "linked-roles")).toBe(
        "<123456789012345678:linked-roles>",
      );

      // Test specific linked role
      const linkedRoleId = "987654321098765432";
      expect(
        formatGuildNavigation(
          "123456789012345678",
          `linked-roles:${linkedRoleId}`,
        ),
      ).toBe(`<123456789012345678:linked-roles:${linkedRoleId}>`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings appropriately for all formatters", () => {
      // Already tested in individual sections, but can add more comprehensive cases if needed
    });

    it("should handle strings with special characters", () => {
      const specialChars = "Special chars: !@#$%^&*()_+{}|:\"<>?[];',./";
      expect(bold(specialChars)).toBe(`**${specialChars}**`);
      expect(italics(specialChars)).toBe(`*${specialChars}*`);
      // Add more as needed
    });
  });

  describe("Function Types", () => {
    it("should have correct return types", () => {
      // These tests are more about TypeScript type checking than runtime behavior
      // TypeScript will catch any type errors during compilation
      const italicsResult = italics("test");
      const boldResult = bold("test");
      const underlineResult = underline("test");
      // etc.

      // Just assert that the functions return strings (TypeScript will handle the rest)
      expect(typeof italicsResult).toBe("string");
      expect(typeof boldResult).toBe("string");
      expect(typeof underlineResult).toBe("string");
    });
  });
});
