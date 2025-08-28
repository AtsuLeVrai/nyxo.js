import { describe, expect, it } from "vitest";
import {
  type Bold,
  bold,
  bulletPoint,
  type CodeLanguage,
  code,
  codeBlock,
  formatChannel,
  formatCustomEmoji,
  formatGuildNavigation,
  formatRole,
  formatSlashCommand,
  formatTimestamp,
  formatUser,
  type GuildNavigationType,
  h1,
  h2,
  h3,
  type Italic,
  italic,
  italicAlt,
  link,
  linkWithTooltip,
  numberedPoint,
  quote,
  quoteBlock,
  spoiler,
  strikethrough,
  subheading,
  type TimestampStyle,
  underline,
} from "./markdown.util.js";

describe("Discord Markdown Utilities", () => {
  describe("Text Formatting", () => {
    describe("italic", () => {
      it("should format text with asterisk italic syntax", () => {
        const result = italic("Hello World");
        expect(result).toBe("*Hello World*");

        // Type assertion to ensure correct return type
        const typedResult: Italic<"Hello World"> = result;
        expect(typedResult).toBe("*Hello World*");
      });

      it("should handle empty strings", () => {
        const result = italic("");
        expect(result).toBe("**");
      });

      it("should handle special characters", () => {
        const result = italic("Hello @everyone! 🎉");
        expect(result).toBe("*Hello @everyone! 🎉*");
      });

      it("should preserve whitespace", () => {
        const result = italic("  spaced text  ");
        expect(result).toBe("*  spaced text  *");
      });
    });

    describe("italicAlt", () => {
      it("should format text with underscore italic syntax", () => {
        const result = italicAlt("Alternative italic");
        expect(result).toBe("_Alternative italic_");
      });

      it("should handle multiline text", () => {
        const result = italicAlt("Line 1\nLine 2");
        expect(result).toBe("_Line 1\nLine 2_");
      });
    });

    describe("bold", () => {
      it("should format text with double asterisk bold syntax", () => {
        const result = bold("Important text");
        expect(result).toBe("**Important text**");
      });

      it("should handle numbers and symbols", () => {
        const result = bold("Version 2.0.1 (FINAL)");
        expect(result).toBe("**Version 2.0.1 (FINAL)**");
      });

      it("should maintain type safety", () => {
        const text = "Strong message" as const;
        const result = bold(text);
        const typedResult: Bold<typeof text> = result;
        expect(typedResult).toBe("**Strong message**");
      });
    });

    describe("underline", () => {
      it("should format text with double underscore syntax", () => {
        const result = underline("Underlined text");
        expect(result).toBe("__Underlined text__");
      });

      it("should work with URLs", () => {
        const result = underline("https://discord.com");
        expect(result).toBe("__https://discord.com__");
      });
    });

    describe("strikethrough", () => {
      it("should format text with double tilde syntax", () => {
        const result = strikethrough("Crossed out");
        expect(result).toBe("~~Crossed out~~");
      });

      it("should handle longer sentences", () => {
        const result = strikethrough("This feature is deprecated and will be removed");
        expect(result).toBe("~~This feature is deprecated and will be removed~~");
      });
    });

    describe("spoiler", () => {
      it("should format text with double pipe syntax", () => {
        const result = spoiler("Secret information");
        expect(result).toBe("||Secret information||");
      });

      it("should work with plot spoilers", () => {
        const result = spoiler("The main character dies in the end");
        expect(result).toBe("||The main character dies in the end||");
      });
    });
  });

  describe("Headers", () => {
    describe("h1", () => {
      it("should format text as large header", () => {
        const result = h1("Main Title");
        expect(result).toBe("# Main Title");
      });

      it("should handle headers with numbers", () => {
        const result = h1("Chapter 1: Introduction");
        expect(result).toBe("# Chapter 1: Introduction");
      });
    });

    describe("h2", () => {
      it("should format text as medium header", () => {
        const result = h2("Section Header");
        expect(result).toBe("## Section Header");
      });
    });

    describe("h3", () => {
      it("should format text as small header", () => {
        const result = h3("Subsection");
        expect(result).toBe("### Subsection");
      });
    });

    describe("subheading", () => {
      it("should format text as Discord subheading", () => {
        const result = subheading("Minor heading");
        expect(result).toBe("-# Minor heading");
      });

      it("should work with descriptive subheadings", () => {
        const result = subheading("Configuration Options");
        expect(result).toBe("-# Configuration Options");
      });
    });
  });

  describe("Links", () => {
    describe("link", () => {
      it("should create basic hyperlink", () => {
        const result = link("Discord", "https://discord.com");
        expect(result).toBe("[Discord](https://discord.com)");
      });

      it("should handle complex URLs with parameters", () => {
        const result = link("Search Results", "https://google.com/search?q=discord+bot");
        expect(result).toBe("[Search Results](https://google.com/search?q=discord+bot)");
      });

      it("should maintain type safety for both parameters", () => {
        const text = "GitHub" as const;
        const url = "https://github.com" as const;
        const result = link(text, url);
        expect(result).toBe("[GitHub](https://github.com)");
      });
    });

    describe("linkWithTooltip", () => {
      it("should create hyperlink with hover tooltip", () => {
        const result = linkWithTooltip("Click here", "https://example.com", "Opens in new tab");
        expect(result).toBe('[Click here](https://example.com "Opens in new tab")');
      });

      it("should handle special characters in tooltip", () => {
        const result = linkWithTooltip(
          "Download",
          "https://files.com/app.zip",
          "Size: 50MB (v1.2.3)",
        );
        expect(result).toBe('[Download](https://files.com/app.zip "Size: 50MB (v1.2.3)")');
      });
    });
  });

  describe("Code Formatting", () => {
    describe("code", () => {
      it("should format text as inline code", () => {
        const result = code("console.log()");
        expect(result).toBe("`console.log()`");
      });

      it("should handle code with special characters", () => {
        const result = code("npm install @types/node");
        expect(result).toBe("`npm install @types/node`");
      });

      it("should preserve code spacing", () => {
        const result = code("  indented code  ");
        expect(result).toBe("`  indented code  `");
      });
    });

    describe("codeBlock", () => {
      it("should create code block with default language", () => {
        const result = codeBlock("const x = 5;");
        expect(result).toBe("```plaintext\nconst x = 5;\n```");
      });

      it("should create code block with specified language", () => {
        const result = codeBlock('function hello() { return "world"; }', "javascript");
        expect(result).toBe('```javascript\nfunction hello() { return "world"; }\n```');
      });

      it("should support TypeScript syntax highlighting", () => {
        const code = "interface User {\n  id: string;\n  name: string;\n}";
        const result = codeBlock(code, "typescript");
        expect(result).toBe(
          "```typescript\ninterface User {\n  id: string;\n  name: string;\n}\n```",
        );
      });

      it("should handle multi-line code correctly", () => {
        const code =
          "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)";
        const result = codeBlock(code, "python");
        expect(result).toBe(
          "```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```",
        );
      });

      it("should work with various supported languages", () => {
        const languages: CodeLanguage[] = ["java", "rust", "go", "sql", "json", "yaml"];

        for (const lang of languages) {
          const result = codeBlock("sample code", lang);
          expect(result).toBe(`\`\`\`${lang}\nsample code\n\`\`\``);
        }
      });
    });
  });

  describe("Quotes", () => {
    describe("quote", () => {
      it("should format text as single-line quote", () => {
        const result = quote("This is a quote");
        expect(result).toBe("> This is a quote");
      });

      it("should handle quotes with author attribution", () => {
        const result = quote("The only way to do great work is to love what you do. - Steve Jobs");
        expect(result).toBe("> The only way to do great work is to love what you do. - Steve Jobs");
      });
    });

    describe("quoteBlock", () => {
      it("should format text as multi-line quote block", () => {
        const result = quoteBlock("This is a longer quote that spans multiple lines");
        expect(result).toBe(">>> This is a longer quote that spans multiple lines");
      });

      it("should handle actual multi-line content", () => {
        const content = "First line of quote\nSecond line of quote\nThird line of quote";
        const result = quoteBlock(content);
        expect(result).toBe(">>> First line of quote\nSecond line of quote\nThird line of quote");
      });
    });
  });

  describe("Lists", () => {
    describe("bulletPoint", () => {
      it("should format text as bullet point", () => {
        const result = bulletPoint("First item");
        expect(result).toBe("- First item");
      });

      it("should handle complex list items", () => {
        const result = bulletPoint("Install Node.js (v18+ recommended)");
        expect(result).toBe("- Install Node.js (v18+ recommended)");
      });
    });

    describe("numberedPoint", () => {
      it("should format text as numbered list item", () => {
        const result = numberedPoint("First step", 1);
        expect(result).toBe("1. First step");
      });

      it("should handle different numbers correctly", () => {
        const items = [
          numberedPoint("Setup environment", 1),
          numberedPoint("Install dependencies", 2),
          numberedPoint("Configure settings", 3),
          numberedPoint("Deploy application", 10),
        ];

        expect(items).toEqual([
          "1. Setup environment",
          "2. Install dependencies",
          "3. Configure settings",
          "10. Deploy application",
        ]);
      });

      it("should maintain type safety for number parameter", () => {
        const number = 42 as const;
        const result = numberedPoint("Answer to everything", number);
        expect(result).toBe("42. Answer to everything");
      });
    });
  });

  describe("Mentions and Special Formatting", () => {
    describe("formatUser", () => {
      it("should format user mention with snowflake ID", () => {
        const result = formatUser("123456789012345678");
        expect(result).toBe("<@123456789012345678>");
      });

      it("should handle different user ID formats", () => {
        const userIds = ["12345", "987654321098765432", "111111111111111111"];
        for (const id of userIds) {
          const result = formatUser(id);
          expect(result).toBe(`<@${id}>`);
        }
      });
    });

    describe("formatChannel", () => {
      it("should format channel mention with snowflake ID", () => {
        const result = formatChannel("987654321098765432");
        expect(result).toBe("<#987654321098765432>");
      });
    });

    describe("formatRole", () => {
      it("should format role mention with snowflake ID", () => {
        const result = formatRole("456789012345678901");
        expect(result).toBe("<@&456789012345678901>");
      });
    });

    describe("formatSlashCommand", () => {
      it("should format basic slash command", () => {
        const result = formatSlashCommand("help", "123456789012345678");
        expect(result).toBe("</help:123456789012345678>");
      });

      it("should format slash command with subcommand", () => {
        const result = formatSlashCommand("music", "987654321098765432", "play");
        expect(result).toBe("</music play:987654321098765432>");
      });

      it("should format slash command with subcommand group", () => {
        const result = formatSlashCommand("admin", "111111111111111111", "ban", "user");
        expect(result).toBe("</admin user ban:111111111111111111>");
      });
    });

    describe("formatCustomEmoji", () => {
      it("should format static custom emoji", () => {
        const result = formatCustomEmoji("thumbsup", "123456789012345678");
        expect(result).toBe("<:thumbsup:123456789012345678>");
      });

      it("should format animated custom emoji", () => {
        const result = formatCustomEmoji("party", "987654321098765432", true);
        expect(result).toBe("<a:party:987654321098765432>");
      });

      it("should default to static when animated parameter is false", () => {
        const result = formatCustomEmoji("smile", "456789012345678901", false);
        expect(result).toBe("<:smile:456789012345678901>");
      });
    });

    describe("formatTimestamp", () => {
      it("should format basic timestamp", () => {
        const result = formatTimestamp(1640995200);
        expect(result).toBe("<t:1640995200>");
      });

      it("should format timestamp with style", () => {
        const styles: TimestampStyle[] = ["t", "T", "d", "D", "f", "F", "R"];

        for (const style of styles) {
          const result = formatTimestamp(1640995200, style);
          expect(result).toBe(`<t:1640995200:${style}>`);
        }
      });

      it("should handle different timestamp values", () => {
        const timestamps = [0, 1000000000, 1640995200, 2000000000];

        for (const timestamp of timestamps) {
          const result = formatTimestamp(timestamp);
          expect(result).toBe(`<t:${timestamp}>`);

          const resultWithStyle = formatTimestamp(timestamp, "R");
          expect(resultWithStyle).toBe(`<t:${timestamp}:R>`);
        }
      });
    });

    describe("formatGuildNavigation", () => {
      it("should format guild navigation for customize", () => {
        const result = formatGuildNavigation("123456789012345678", "customize");
        expect(result).toBe("<123456789012345678:customize>");
      });

      it("should format guild navigation for browse", () => {
        const result = formatGuildNavigation("987654321098765432", "browse");
        expect(result).toBe("<987654321098765432:browse>");
      });

      it("should handle linked-roles navigation", () => {
        const result = formatGuildNavigation("456789012345678901", "linked-roles");
        expect(result).toBe("<456789012345678901:linked-roles>");
      });

      it("should handle specific linked-role navigation", () => {
        const result = formatGuildNavigation(
          "111111111111111111",
          "linked-roles:222222222222222222" as GuildNavigationType,
        );
        expect(result).toBe("<111111111111111111:linked-roles:222222222222222222>");
      });
    });
  });

  describe("Complex Combinations and Edge Cases", () => {
    it("should handle nested formatting combinations", () => {
      const boldText = bold("important");
      const italicText = italic("note");
      const codeText = code("variable");

      expect(boldText).toBe("**important**");
      expect(italicText).toBe("*note*");
      expect(codeText).toBe("`variable`");
    });

    it("should create complex message with multiple formats", () => {
      const user = formatUser("123456789012345678");
      const channel = formatChannel("987654321098765432");
      const timestamp = formatTimestamp(1640995200, "R");

      const message = `${user} posted in ${channel} ${timestamp}`;
      expect(message).toBe(
        "<@123456789012345678> posted in <#987654321098765432> <t:1640995200:R>",
      );
    });

    it("should handle empty string inputs gracefully", () => {
      expect(bold("")).toBe("****");
      expect(italic("")).toBe("**");
      expect(code("")).toBe("``");
      expect(h1("")).toBe("# ");
      expect(bulletPoint("")).toBe("- ");
    });

    it("should preserve Unicode characters", () => {
      const unicodeText = "🎉 Hello 世界 🌟";
      expect(bold(unicodeText)).toBe("**🎉 Hello 世界 🌟**");
      expect(spoiler(unicodeText)).toBe("||🎉 Hello 世界 🌟||");
    });

    it("should handle very long strings", () => {
      const longText = "a".repeat(1000);
      const result = italic(longText);
      expect(result).toBe(`*${longText}*`);
      expect(result.length).toBe(1002); // 1000 + 2 asterisks
    });

    it("should work with Discord-specific content", () => {
      const discordMessage = [
        h1("Server Rules"),
        bulletPoint("Be respectful to all members"),
        bulletPoint("No spam or excessive mentions"),
        bulletPoint(`Use ${formatChannel("123456789012345678")} for bot commands`),
        "",
        bold("Moderators:"),
        formatUser("111111111111111111"),
        formatUser("222222222222222222"),
      ].join("\n");

      expect(discordMessage).toContain("# Server Rules");
      expect(discordMessage).toContain("- Be respectful");
      expect(discordMessage).toContain("<#123456789012345678>");
      expect(discordMessage).toContain("**Moderators:**");
      expect(discordMessage).toContain("<@111111111111111111>");
    });

    it("should maintain type consistency across operations", () => {
      // This test verifies that TypeScript types are preserved
      const text = "TypeScript" as const;
      const boldResult = bold(text);
      const italicResult = italic(text);

      // These should compile without issues due to proper typing
      const boldType: Bold<typeof text> = boldResult;
      const italicType: Italic<typeof text> = italicResult;

      expect(boldType).toBe("**TypeScript**");
      expect(italicType).toBe("*TypeScript*");
    });
  });

  describe("Type Safety Validation", () => {
    it("should enforce correct TimestampStyle types", () => {
      const validStyles: TimestampStyle[] = ["t", "T", "d", "D", "f", "F", "R"];
      const timestamp = 1640995200;

      for (const style of validStyles) {
        const result = formatTimestamp(timestamp, style);
        expect(result).toBe(`<t:${timestamp}:${style}>`);
      }
    });

    it("should handle template literal types correctly", () => {
      // Test that the functions return the exact template literal types
      const testText = "test" as const;

      const boldResult = bold(testText);
      const italicResult = italic(testText);
      const codeResult = code(testText);

      // TypeScript should infer these as exact literal types
      expect(boldResult).toBe("**test**");
      expect(italicResult).toBe("*test*");
      expect(codeResult).toBe("`test`");
    });
  });
});
