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

describe("Discord Markdown Utilities", () => {
  describe("Basic Text Formatting", () => {
    describe("italics", () => {
      it("wraps text in single asterisks", () => {
        const result = italics("Hello world");
        expect(result).toBe("*Hello world*");
      });

      it("works with empty strings", () => {
        const result = italics("");
        expect(result).toBe("**");
      });

      it("works with special characters", () => {
        const result = italics("Text with $pecial ch@racters!");
        expect(result).toBe("*Text with $pecial ch@racters!*");
      });
    });

    describe("bold", () => {
      it("wraps text in double asterisks", () => {
        const result = bold("Hello world");
        expect(result).toBe("**Hello world**");
      });

      it("works with empty strings", () => {
        const result = bold("");
        expect(result).toBe("****");
      });

      it("works with special characters", () => {
        const result = bold("Text with $pecial ch@racters!");
        expect(result).toBe("**Text with $pecial ch@racters!**");
      });
    });

    describe("underline", () => {
      it("wraps text in double underscores", () => {
        const result = underline("Hello world");
        expect(result).toBe("__Hello world__");
      });

      it("works with empty strings", () => {
        const result = underline("");
        expect(result).toBe("____");
      });

      it("works with special characters", () => {
        const result = underline("Text with $pecial ch@racters!");
        expect(result).toBe("__Text with $pecial ch@racters!__");
      });
    });

    describe("strikethrough", () => {
      it("wraps text in double tildes", () => {
        const result = strikethrough("Hello world");
        expect(result).toBe("~~Hello world~~");
      });

      it("works with empty strings", () => {
        const result = strikethrough("");
        expect(result).toBe("~~~~");
      });

      it("works with special characters", () => {
        const result = strikethrough("Text with $pecial ch@racters!");
        expect(result).toBe("~~Text with $pecial ch@racters!~~");
      });
    });

    describe("spoiler", () => {
      it("wraps text in double vertical bars", () => {
        const result = spoiler("Hello world");
        expect(result).toBe("||Hello world||");
      });

      it("works with empty strings", () => {
        const result = spoiler("");
        expect(result).toBe("||||");
      });

      it("works with special characters", () => {
        const result = spoiler("Text with $pecial ch@racters!");
        expect(result).toBe("||Text with $pecial ch@racters!||");
      });
    });
  });

  describe("Headers", () => {
    describe("bigHeader", () => {
      it("precedes text with a hash and space", () => {
        const result = bigHeader("Hello world");
        expect(result).toBe("# Hello world");
      });

      it("works with empty strings", () => {
        const result = bigHeader("");
        expect(result).toBe("# ");
      });

      it("works with special characters", () => {
        const result = bigHeader("Text with $pecial ch@racters!");
        expect(result).toBe("# Text with $pecial ch@racters!");
      });
    });

    describe("smallerHeader", () => {
      it("precedes text with two hashes and a space", () => {
        const result = smallerHeader("Hello world");
        expect(result).toBe("## Hello world");
      });

      it("works with empty strings", () => {
        const result = smallerHeader("");
        expect(result).toBe("## ");
      });

      it("works with special characters", () => {
        const result = smallerHeader("Text with $pecial ch@racters!");
        expect(result).toBe("## Text with $pecial ch@racters!");
      });
    });

    describe("evenSmallerHeader", () => {
      it("precedes text with three hashes and a space", () => {
        const result = evenSmallerHeader("Hello world");
        expect(result).toBe("### Hello world");
      });

      it("works with empty strings", () => {
        const result = evenSmallerHeader("");
        expect(result).toBe("### ");
      });

      it("works with special characters", () => {
        const result = evenSmallerHeader("Text with $pecial ch@racters!");
        expect(result).toBe("### Text with $pecial ch@racters!");
      });
    });

    describe("subText", () => {
      it("precedes text with a dash, hash, and space", () => {
        const result = subText("Hello world");
        expect(result).toBe("-# Hello world");
      });

      it("works with empty strings", () => {
        const result = subText("");
        expect(result).toBe("-# ");
      });

      it("works with special characters", () => {
        const result = subText("Text with $pecial ch@racters!");
        expect(result).toBe("-# Text with $pecial ch@racters!");
      });
    });
  });

  describe("Links and Code", () => {
    describe("link", () => {
      it("formats text and URL into a Markdown link", () => {
        const result = link("Discord", "https://discord.com");
        expect(result).toBe("[Discord](https://discord.com)");
      });

      it("works with empty strings", () => {
        const result = link("", "");
        expect(result).toBe("[]()");
      });

      it("works with special characters in text", () => {
        const result = link(
          "Text with $pecial ch@racters!",
          "https://discord.com",
        );
        expect(result).toBe(
          "[Text with $pecial ch@racters!](https://discord.com)",
        );
      });

      it("works with special characters in URL", () => {
        const result = link(
          "Discord",
          "https://discord.com?query=test&param=value",
        );
        expect(result).toBe(
          "[Discord](https://discord.com?query=test&param=value)",
        );
      });
    });

    describe("code", () => {
      it("wraps text in backticks", () => {
        const result = code("const x = 1;");
        expect(result).toBe("`const x = 1;`");
      });

      it("works with empty strings", () => {
        const result = code("");
        expect(result).toBe("``");
      });

      it("works with special characters", () => {
        const result = code("Text with $pecial ch@racters!");
        expect(result).toBe("`Text with $pecial ch@racters!`");
      });
    });

    describe("codeBlock", () => {
      it("wraps text in triple backticks with language", () => {
        const result = codeBlock("const x = 1;", "javascript");
        expect(result).toBe("```javascript\nconst x = 1;\n```");
      });

      it("uses plaintext as default language", () => {
        const result = codeBlock("Hello world");
        expect(result).toBe("```plaintext\nHello world\n```");
      });

      it("works with empty strings", () => {
        const result = codeBlock("");
        expect(result).toBe("```plaintext\n\n```");
      });

      it("works with multiline text", () => {
        const result = codeBlock("line 1\nline 2\nline 3", "python");
        expect(result).toBe("```python\nline 1\nline 2\nline 3\n```");
      });

      it("works with all supported languages", () => {
        // Test a sampling of languages from the ProgrammingLanguageType enum
        const languages: ProgrammingLanguageType[] = [
          "python",
          "javascript",
          "java",
          "cpp",
          "csharp",
          "ruby",
          "php",
          "swift",
          "go",
          "rust",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];

        for (const lang of languages) {
          const result = codeBlock("// Code example", lang);
          expect(result).toBe(`\`\`\`${lang}\n// Code example\n\`\`\``);
        }
      });
    });
  });

  describe("Quotes", () => {
    describe("quote", () => {
      it("precedes text with a greater-than sign and space", () => {
        const result = quote("Hello world");
        expect(result).toBe("> Hello world");
      });

      it("works with empty strings", () => {
        const result = quote("");
        expect(result).toBe("> ");
      });

      it("works with special characters", () => {
        const result = quote("Text with $pecial ch@racters!");
        expect(result).toBe("> Text with $pecial ch@racters!");
      });
    });

    describe("quoteBlock", () => {
      it("precedes text with three greater-than signs and space", () => {
        const result = quoteBlock("Hello world");
        expect(result).toBe(">>> Hello world");
      });

      it("works with empty strings", () => {
        const result = quoteBlock("");
        expect(result).toBe(">>> ");
      });

      it("works with multiline text", () => {
        const result = quoteBlock("line 1\nline 2\nline 3");
        expect(result).toBe(">>> line 1\nline 2\nline 3");
      });

      it("works with special characters", () => {
        const result = quoteBlock("Text with $pecial ch@racters!");
        expect(result).toBe(">>> Text with $pecial ch@racters!");
      });
    });
  });

  describe("Discord Entities", () => {
    describe("formatUser", () => {
      it("formats a user ID into a user mention", () => {
        const result = formatUser("123456789012345678");
        expect(result).toBe("<@123456789012345678>");
      });

      it("works with empty strings", () => {
        const result = formatUser("");
        expect(result).toBe("<@>");
      });
    });

    describe("formatChannel", () => {
      it("formats a channel ID into a channel mention", () => {
        const result = formatChannel("123456789012345678");
        expect(result).toBe("<#123456789012345678>");
      });

      it("works with empty strings", () => {
        const result = formatChannel("");
        expect(result).toBe("<#>");
      });
    });

    describe("formatRole", () => {
      it("formats a role ID into a role mention", () => {
        const result = formatRole("123456789012345678");
        expect(result).toBe("<@&123456789012345678>");
      });

      it("works with empty strings", () => {
        const result = formatRole("");
        expect(result).toBe("<@&>");
      });
    });

    describe("formatSlashCommand", () => {
      it("formats a basic command correctly", () => {
        const result = formatSlashCommand("help", "123456789012345678");
        expect(result).toBe("</help:123456789012345678>");
      });

      it("formats a command with subcommand correctly", () => {
        const result = formatSlashCommand(
          "settings",
          "123456789012345678",
          "privacy",
        );
        expect(result).toBe("</settings privacy:123456789012345678>");
      });

      it("formats a command with subcommand group and subcommand correctly", () => {
        const result = formatSlashCommand(
          "permissions",
          "123456789012345678",
          "role",
          "view",
        );
        expect(result).toBe("</permissions view role:123456789012345678>");
      });

      it("works with empty strings", () => {
        const result = formatSlashCommand("", "");
        expect(result).toBe("</:>");
      });
    });

    describe("formatCustomEmoji", () => {
      it("formats a static custom emoji correctly", () => {
        const result = formatCustomEmoji("heart", "123456789012345678");
        expect(result).toBe("<:heart:123456789012345678>");
      });

      it("formats an animated custom emoji correctly", () => {
        const result = formatCustomEmoji("wave", "123456789012345678", true);
        expect(result).toBe("<a:wave:123456789012345678>");
      });

      it("works with empty strings", () => {
        const result = formatCustomEmoji("", "");
        expect(result).toBe("<::>");
      });
    });
  });

  describe("Timestamps", () => {
    describe("formatTimestamp", () => {
      it("formats a timestamp with default style", () => {
        const result = formatTimestamp(1618932219);
        expect(result).toBe("<t:1618932219>");
      });

      it("formats a timestamp with short time style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.ShortTime);
        expect(result).toBe("<t:1618932219:t>");
      });

      it("formats a timestamp with long time style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.LongTime);
        expect(result).toBe("<t:1618932219:T>");
      });

      it("formats a timestamp with short date style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.ShortDate);
        expect(result).toBe("<t:1618932219:d>");
      });

      it("formats a timestamp with long date style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.LongDate);
        expect(result).toBe("<t:1618932219:D>");
      });

      it("formats a timestamp with short date-time style", () => {
        const result = formatTimestamp(
          1618932219,
          TimestampStyle.ShortDateTime,
        );
        expect(result).toBe("<t:1618932219:f>");
      });

      it("formats a timestamp with long date-time style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.LongDateTime);
        expect(result).toBe("<t:1618932219:F>");
      });

      it("formats a timestamp with relative time style", () => {
        const result = formatTimestamp(1618932219, TimestampStyle.RelativeTime);
        expect(result).toBe("<t:1618932219:R>");
      });

      it("works with zero timestamp", () => {
        const result = formatTimestamp(0);
        expect(result).toBe("<t:0>");
      });
    });
  });

  describe("Guild Navigation", () => {
    describe("formatGuildNavigation", () => {
      it("formats guild navigation with customize type", () => {
        const result = formatGuildNavigation("123456789012345678", "customize");
        expect(result).toBe("<123456789012345678:customize>");
      });

      it("formats guild navigation with browse type", () => {
        const result = formatGuildNavigation("123456789012345678", "browse");
        expect(result).toBe("<123456789012345678:browse>");
      });

      it("formats guild navigation with guide type", () => {
        const result = formatGuildNavigation("123456789012345678", "guide");
        expect(result).toBe("<123456789012345678:guide>");
      });

      it("formats guild navigation with linked-roles type", () => {
        const result = formatGuildNavigation(
          "123456789012345678",
          "linked-roles",
        );
        expect(result).toBe("<123456789012345678:linked-roles>");
      });

      it("formats guild navigation with specific linked role", () => {
        const result = formatGuildNavigation(
          "123456789012345678",
          "linked-roles:987654321098765432",
        );
        expect(result).toBe(
          "<123456789012345678:linked-roles:987654321098765432>",
        );
      });

      it("works with empty strings", () => {
        const result = formatGuildNavigation("", "customize" as any);
        expect(result).toBe("<:customize>");
      });
    });
  });

  describe("Real-world Usage Examples", () => {
    it("demonstrates combining formatting options", () => {
      // Create a message with bold, italic, and underlined text
      const formattedText = `${bold("This is bold")} and ${italics("this is italic")} and ${underline("this is underlined")}`;
      expect(formattedText).toBe(
        "**This is bold** and *this is italic* and __this is underlined__",
      );

      // Create a message with a code block
      const codeExample = codeBlock(
        `function helloWorld() {\n  console.log('Hello, world!');\n}`,
        "javascript",
      );
      expect(codeExample).toBe(
        "```javascript\nfunction helloWorld() {\n  console.log('Hello, world!');\n}\n```",
      );

      // Create a message with a quote
      const quotedText = quote("This is a famous quote");
      expect(quotedText).toBe("> This is a famous quote");
    });

    it("demonstrates creating a structured announcement", () => {
      // Create a server announcement with headers, formatting, and mentions
      const serverName = "Awesome Discord Server";
      const announcementChannel = "123456789012345678";
      const moderatorRole = "234567890123456789";

      const announcement = [
        bigHeader(`Welcome to ${serverName}!`),
        "",
        "Please take a moment to read our server rules:",
        "",
        smallerHeader("Server Rules"),
        "1. Be respectful to all members",
        "2. No spamming or excessive self-promotion",
        "3. Keep content in the appropriate channels",
        "",
        `For help, please ask in ${formatChannel(announcementChannel)}`,
        "",
        `${formatRole(moderatorRole)} moderators are here to help!`,
        "",
        spoiler("Secret message: You are awesome!"),
      ].join("\n");

      expect(announcement).toContain("# Welcome to Awesome Discord Server!");
      expect(announcement).toContain("## Server Rules");
      expect(announcement).toContain("<#123456789012345678>");
      expect(announcement).toContain("<@&234567890123456789>");
      expect(announcement).toContain("||Secret message: You are awesome!||");
    });

    it("demonstrates creating a profile card with embeds", () => {
      // Discord uses markdown for embedding content in messages
      // This would typically be sent via an API with proper embed structures
      // but we can demonstrate the text portions that use markdown

      const userId = "123456789012345678";
      const username = "CoolUser";
      const joinDate = 1618932219; // April 20, 2021

      const profileText = [
        bold("User Profile"),
        "",
        `User: ${formatUser(userId)}`,
        `Username: ${code(username)}`,
        `Joined: ${formatTimestamp(joinDate, TimestampStyle.LongDateTime)}`,
        `Status: ${italics("Online")}`,
        "",
        quoteBlock("A wise person once said something profound"),
      ].join("\n");

      expect(profileText).toContain("**User Profile**");
      expect(profileText).toContain("<@123456789012345678>");
      expect(profileText).toContain("`CoolUser`");
      expect(profileText).toContain("<t:1618932219:F>");
      expect(profileText).toContain("*Online*");
      expect(profileText).toContain(
        ">>> A wise person once said something profound",
      );
    });

    it("demonstrates creating a help message for a bot command", () => {
      const commandId = "123456789012345678";
      const botCommandPrefix = "!";

      const helpMessage = [
        bigHeader("Bot Help"),
        "",
        `Use ${formatSlashCommand("help", commandId)} for assistance, or the legacy prefix ${code(`${botCommandPrefix}help`)}`,
        "",
        smallerHeader("Available Commands"),
        `${code(`${botCommandPrefix}ping`)} - Check if the bot is online`,
        `${code(`${botCommandPrefix}info`)} - Display bot information`,
        `${code(`${botCommandPrefix}stats`)} - Show server statistics`,
        "",
        "For advanced commands, try:",
        codeBlock(
          `${botCommandPrefix}config set welcome-channel #welcome\n${botCommandPrefix}role add @User @Role\n${botCommandPrefix}purge 10`,
          "bash",
        ),
      ].join("\n");

      expect(helpMessage).toContain("# Bot Help");
      expect(helpMessage).toContain("</help:123456789012345678>");
      expect(helpMessage).toContain("`!help`");
      expect(helpMessage).toContain("## Available Commands");
      expect(helpMessage).toContain("```bash");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty inputs for all functions", () => {
      // Test all formatting functions with empty strings
      expect(italics("")).toBe("**");
      expect(bold("")).toBe("****");
      expect(underline("")).toBe("____");
      expect(strikethrough("")).toBe("~~~~");
      expect(spoiler("")).toBe("||||");
      expect(bigHeader("")).toBe("# ");
      expect(smallerHeader("")).toBe("## ");
      expect(evenSmallerHeader("")).toBe("### ");
      expect(subText("")).toBe("-# ");
      expect(link("", "")).toBe("[]()");
      expect(code("")).toBe("``");
      expect(codeBlock("")).toBe("```plaintext\n\n```");
      expect(quote("")).toBe("> ");
      expect(quoteBlock("")).toBe(">>> ");
      expect(formatUser("")).toBe("<@>");
      expect(formatChannel("")).toBe("<#>");
      expect(formatRole("")).toBe("<@&>");
      expect(formatSlashCommand("", "")).toBe("</:>");
      expect(formatCustomEmoji("", "")).toBe("<::>");
      expect(formatTimestamp(0)).toBe("<t:0>");
      expect(formatGuildNavigation("", "customize" as any)).toBe(
        "<:customize>",
      );
    });

    it("handles unicode characters correctly", () => {
      // Test with emoji and other unicode characters
      const textWithEmoji = "Hello 👋 world! 🌍✨";
      expect(bold(textWithEmoji)).toBe(`**${textWithEmoji}**`);
      expect(italics(textWithEmoji)).toBe(`*${textWithEmoji}*`);
      expect(code(textWithEmoji)).toBe(`\`${textWithEmoji}\``);

      // Test with non-Latin characters
      const nonLatinText = "こんにちは世界! Привет мир! مرحبا بالعالم!";
      expect(bold(nonLatinText)).toBe(`**${nonLatinText}**`);
      expect(italics(nonLatinText)).toBe(`*${nonLatinText}*`);
      expect(code(nonLatinText)).toBe(`\`${nonLatinText}\``);
    });

    it("handles markdown characters in input correctly", () => {
      // Test with text that already contains markdown characters
      const textWithMarkdown = "Text with * and ** and __ and ~~ characters";
      expect(bold(textWithMarkdown)).toBe(`**${textWithMarkdown}**`);
      expect(italics(textWithMarkdown)).toBe(`*${textWithMarkdown}*`);
      expect(code(textWithMarkdown)).toBe(`\`${textWithMarkdown}\``);

      // Text with backticks (which would break code blocks)
      const textWithBackticks = "Code: `const x = 1;`";
      expect(code(textWithBackticks)).toBe("`Code: `const x = 1;``");
      // Note: This would actually render incorrectly in Discord
      // but that's a limitation of the markdown system itself
    });

    it("handles extremely long inputs", () => {
      // Create a very long string
      const longText = "a".repeat(1000);

      // Test with very long text
      expect(bold(longText)).toBe(`**${longText}**`);
      expect(italics(longText)).toBe(`*${longText}*`);
      expect(code(longText)).toBe(`\`${longText}\``);
      expect(codeBlock(longText)).toBe(`\`\`\`plaintext\n${longText}\n\`\`\``);

      // Discord may have actual limits on message lengths,
      // but our formatting functions should handle any valid string
    });
  });
});
