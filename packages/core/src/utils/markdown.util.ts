import type { Snowflake } from "./snowflake.util.js";

/**
 * Italicized text in Discord markdown.
 * Surrounded by single asterisks.
 *
 * @public
 */
export type Italics = `*${string}*`;

/**
 * Creates italicized text using Discord markdown.
 *
 * @param text - Text to italicize
 * @returns Text wrapped in single asterisks
 *
 * @example
 * ```typescript
 * italics("Hello world") // "*Hello world*"
 * ```
 *
 * @public
 */
export function italics(text: string): Italics {
  return `*${text}*`;
}

/**
 * Bold text in Discord markdown.
 * Surrounded by double asterisks.
 *
 * @public
 */
export type Bold = `**${string}**`;

/**
 * Creates bold text using Discord markdown.
 *
 * @param text - Text to bold
 * @returns Text wrapped in double asterisks
 *
 * @example
 * ```typescript
 * bold("Hello world") // "**Hello world**"
 * ```
 *
 * @public
 */
export function bold(text: string): Bold {
  return `**${text}**`;
}

/**
 * Underlined text in Discord markdown.
 * Surrounded by double underscores.
 *
 * @public
 */
export type Underline = `__${string}__`;

/**
 * Creates underlined text using Discord markdown.
 *
 * @param text - Text to underline
 * @returns Text wrapped in double underscores
 *
 * @example
 * ```typescript
 * underline("Hello world") // "__Hello world__"
 * ```
 *
 * @public
 */
export function underline(text: string): Underline {
  return `__${text}__`;
}

/**
 * Strikethrough text in Discord markdown.
 * Surrounded by double tildes.
 *
 * @public
 */
export type Strikethrough = `~~${string}~~`;

/**
 * Creates strikethrough text using Discord markdown.
 *
 * @param text - Text for strikethrough effect
 * @returns Text wrapped in double tildes
 *
 * @example
 * ```typescript
 * strikethrough("Hello world") // "~~Hello world~~"
 * ```
 *
 * @public
 */
export function strikethrough(text: string): Strikethrough {
  return `~~${text}~~`;
}

/**
 * Spoiler text in Discord markdown.
 * Surrounded by double vertical bars.
 *
 * @public
 */
export type Spoiler = `||${string}||`;

/**
 * Creates spoiler text using Discord markdown.
 *
 * @param text - Text to hide as spoiler
 * @returns Text wrapped in double vertical bars
 *
 * @example
 * ```typescript
 * spoiler("Hello world") // "||Hello world||"
 * ```
 *
 * @public
 */
export function spoiler(text: string): Spoiler {
  return `||${text}||`;
}

/**
 * Large header in Discord markdown.
 * Preceded by hash symbol and space.
 *
 * @public
 */
export type BigHeader = `# ${string}`;

/**
 * Creates large header using Discord markdown.
 *
 * @param text - Text for large header
 * @returns Text preceded by hash and space
 *
 * @example
 * ```typescript
 * bigHeader("Hello world") // "# Hello world"
 * ```
 *
 * @public
 */
export function bigHeader(text: string): BigHeader {
  return `# ${text}`;
}

/**
 * Medium header in Discord markdown.
 * Preceded by two hash symbols and space.
 *
 * @public
 */
export type SmallerHeader = `## ${string}`;

/**
 * Creates medium header using Discord markdown.
 *
 * @param text - Text for medium header
 * @returns Text preceded by two hashes and space
 *
 * @example
 * ```typescript
 * smallerHeader("Hello world") // "## Hello world"
 * ```
 *
 * @public
 */
export function smallerHeader(text: string): SmallerHeader {
  return `## ${text}`;
}

/**
 * Small header in Discord markdown.
 * Preceded by three hash symbols and space.
 *
 * @public
 */
export type EvenSmallerHeader = `### ${string}`;

/**
 * Creates small header using Discord markdown.
 *
 * @param text - Text for small header
 * @returns Text preceded by three hashes and space
 *
 * @example
 * ```typescript
 * evenSmallerHeader("Hello world") // "### Hello world"
 * ```
 *
 * @public
 */
export function evenSmallerHeader(text: string): EvenSmallerHeader {
  return `### ${text}`;
}

/**
 * Subtext in Discord markdown.
 * Preceded by dash, hash, and space.
 *
 * @public
 */
export type SubHeader = `-# ${string}`;

/**
 * Creates subtext using Discord markdown.
 *
 * @param text - Text for subtext
 * @returns Text preceded by dash, hash, and space
 *
 * @example
 * ```typescript
 * subText("Hello world") // "-# Hello world"
 * ```
 *
 * @public
 */
export function subText(text: string): SubHeader {
  return `-# ${text}`;
}

/**
 * Hyperlink in Discord markdown.
 * Text in brackets followed by URL in parentheses.
 *
 * @public
 */
export type Link = `[${string}](${string})`;

/**
 * Creates hyperlink using Discord markdown.
 *
 * @param text - Display text for link
 * @param url - URL that link points to
 * @returns Formatted hyperlink
 *
 * @example
 * ```typescript
 * link("Discord", "https://discord.com") // "[Discord](https://discord.com)"
 * ```
 *
 * @public
 */
export function link(text: string, url: string): Link {
  return `[${text}](${url})`;
}

/**
 * Inline code in Discord markdown.
 * Surrounded by backticks.
 *
 * @public
 */
export type Code = `\`${string}\``;

/**
 * Creates inline code using Discord markdown.
 *
 * @param text - Text for inline code
 * @returns Text wrapped in backticks
 *
 * @example
 * ```typescript
 * code("const x = 1;") // "`const x = 1;`"
 * ```
 *
 * @public
 */
export function code(text: string): Code {
  return `\`${text}\``;
}

/**
 * Programming languages supported for Discord code blocks.
 * Enables syntax highlighting in code blocks.
 *
 * @public
 */
export type ProgrammingLanguageType =
  | "python"
  | "javascript"
  | "js"
  | "java"
  | "c"
  | "cpp"
  | "c++"
  | "csharp"
  | "cs"
  | "ruby"
  | "rb"
  | "php"
  | "swift"
  | "kotlin"
  | "go"
  | "rust"
  | "scala"
  | "perl"
  | "r"
  | "matlab"
  | "typescript"
  | "ts"
  | "bash"
  | "shell"
  | "powershell"
  | "zsh"
  | "sh"
  | "html"
  | "css"
  | "xml"
  | "json"
  | "graphql"
  | "sql"
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "haskell"
  | "lua"
  | "erlang"
  | "clojure"
  | "fsharp"
  | "dart"
  | "objective-c"
  | "groovy"
  | "yaml"
  | "dockerfile"
  | "ini"
  | "lisp"
  | "elixir"
  | "elm"
  | "actionscript"
  | "ada"
  | "applescript"
  | "asm"
  | "awk"
  | "brainfuck"
  | "coffeescript"
  | "crystal"
  | "d"
  | "fortran"
  | "julia"
  | "nim"
  | "ocaml"
  | "prolog"
  | "purescript"
  | "qsharp"
  | "racket"
  | "reason"
  | "scheme"
  | "sml"
  | "toml"
  | "ansible"
  | "chef"
  | "puppet"
  | "terraform"
  | "basic"
  | "cobol"
  | "pascal"
  | "solidity"
  | "vyper"
  | "cuda"
  | "scilab"
  | "plaintext";

/**
 * Code block in Discord markdown.
 * Surrounded by triple backticks with optional language.
 *
 * @public
 */
export type CodeBlock = `\`\`\`${ProgrammingLanguageType}\n${string}\n\`\`\``;

/**
 * Creates code block with syntax highlighting.
 *
 * @param text - Code for the block
 * @param language - Programming language for highlighting
 * @returns Formatted code block
 *
 * @example
 * ```typescript
 * codeBlock("const x = 1;", "javascript")
 * // Returns "```javascript\nconst x = 1;\n```"
 * ```
 *
 * @public
 */
export function codeBlock(
  text: string,
  language: ProgrammingLanguageType = "plaintext",
): CodeBlock {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Single-line quote in Discord markdown.
 * Preceded by greater-than symbol and space.
 *
 * @public
 */
export type Quote = `> ${string}`;

/**
 * Creates single-line quote using Discord markdown.
 *
 * @param text - Text for quote
 * @returns Text preceded by greater-than and space
 *
 * @example
 * ```typescript
 * quote("Hello world") // "> Hello world"
 * ```
 *
 * @public
 */
export function quote(text: string): Quote {
  return `> ${text}`;
}

/**
 * Multi-line quote block in Discord markdown.
 * Preceded by three greater-than symbols and space.
 *
 * @public
 */
export type QuoteBlock = `>>> ${string}`;

/**
 * Creates multi-line quote block using Discord markdown.
 *
 * @param text - Text for quote block
 * @returns Text preceded by three greater-than symbols and space
 *
 * @example
 * ```typescript
 * quoteBlock("Hello\nworld") // ">>> Hello\nworld"
 * ```
 *
 * @public
 */
export function quoteBlock(text: string): QuoteBlock {
  return `>>> ${text}`;
}

/**
 * Formatted user mention in Discord markdown.
 * User ID wrapped in angle brackets with @ prefix.
 *
 * @public
 */
export type FormattedUser = `<@${Snowflake}>`;

/**
 * Creates user mention using Discord markdown.
 *
 * @param userId - ID of user to mention
 * @returns Formatted user mention
 *
 * @example
 * ```typescript
 * formatUser("123456789012345678") // "<@123456789012345678>"
 * ```
 *
 * @public
 */
export function formatUser(userId: Snowflake): FormattedUser {
  return `<@${userId}>`;
}

/**
 * Formatted channel mention in Discord markdown.
 * Channel ID wrapped in angle brackets with # prefix.
 *
 * @public
 */
export type FormattedChannel = `<#${Snowflake}>`;

/**
 * Creates channel mention using Discord markdown.
 *
 * @param channelId - ID of channel to mention
 * @returns Formatted channel mention
 *
 * @example
 * ```typescript
 * formatChannel("123456789012345678") // "<#123456789012345678>"
 * ```
 *
 * @public
 */
export function formatChannel(channelId: Snowflake): FormattedChannel {
  return `<#${channelId}>`;
}

/**
 * Formatted role mention in Discord markdown.
 * Role ID wrapped in angle brackets with @& prefix.
 *
 * @public
 */
export type FormattedRole = `<@&${Snowflake}>`;

/**
 * Creates role mention using Discord markdown.
 *
 * @param roleId - ID of role to mention
 * @returns Formatted role mention
 *
 * @example
 * ```typescript
 * formatRole("123456789012345678") // "<@&123456789012345678>"
 * ```
 *
 * @public
 */
export function formatRole(roleId: Snowflake): FormattedRole {
  return `<@&${roleId}>`;
}

/**
 * Formatted slash command mention in Discord markdown.
 * Command with optional subcommands and ID.
 *
 * @public
 */
export type FormattedSlashCommand =
  | `</${string}:${Snowflake}>`
  | `</${string} ${string}:${Snowflake}>`
  | `</${string} ${string} ${string}:${Snowflake}>`;

/**
 * Creates formatted slash command mention.
 *
 * @param commandName - Name of slash command
 * @param commandId - ID of slash command
 * @param subCommandName - Optional subcommand name
 * @param subCommandGroupName - Optional subcommand group name
 * @returns Formatted slash command mention
 *
 * @example
 * ```typescript
 * formatSlashCommand("help", "123456789012345678")
 * // "</help:123456789012345678>"
 *
 * formatSlashCommand("settings", "123456789012345678", "privacy")
 * // "</settings privacy:123456789012345678>"
 * ```
 *
 * @public
 */
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandName?: string,
  subCommandGroupName?: string,
): FormattedSlashCommand {
  if (subCommandGroupName && subCommandName) {
    return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
  }

  if (subCommandName) {
    return `</${commandName} ${subCommandName}:${commandId}>`;
  }

  return `</${commandName}:${commandId}>`;
}

/**
 * Formatted custom emoji in Discord markdown.
 * Emoji name and ID with optional animated prefix.
 *
 * @public
 */
export type FormattedCustomEmoji =
  | `<:${string}:${Snowflake}>`
  | `<a:${string}:${Snowflake}>`;

/**
 * Creates formatted custom emoji.
 *
 * @param emojiName - Name of custom emoji
 * @param emojiId - ID of custom emoji
 * @param animated - Whether emoji is animated
 * @returns Formatted custom emoji
 *
 * @example
 * ```typescript
 * formatCustomEmoji("heart", "123456789012345678")
 * // "<:heart:123456789012345678>"
 *
 * formatCustomEmoji("wave", "123456789012345678", true)
 * // "<a:wave:123456789012345678>"
 * ```
 *
 * @public
 */
export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
  animated?: boolean,
): FormattedCustomEmoji {
  if (animated) {
    return `<a:${emojiName}:${emojiId}>`;
  }

  return `<:${emojiName}:${emojiId}>`;
}

/**
 * Timestamp styles available in Discord.
 * Controls how timestamps are displayed.
 *
 * @public
 */
export enum TimestampStyle {
  /** 24-hour format (16:20) */
  ShortTime = "t",
  /** 12-hour format with AM/PM (4:20 PM) */
  LongTime = "T",
  /** Short date format (20/04/2021) */
  ShortDate = "d",
  /** Long date format (20 April 2021) */
  LongDate = "D",
  /** Short date and time (20 April 2021 16:20) */
  ShortDateTime = "f",
  /** Long date and time with weekday (Tuesday, 20 April 2021 16:20) */
  LongDateTime = "F",
  /** Relative time (2 hours ago, in 3 days) */
  RelativeTime = "R",
}

/**
 * Formatted timestamp in Discord markdown.
 * Unix timestamp with optional style.
 *
 * @public
 */
export type FormattedTimestamp =
  | `<t:${number}>`
  | `<t:${number}:${TimestampStyle}>`;

/**
 * Creates formatted timestamp using Discord markdown.
 *
 * @param timestamp - Unix timestamp in seconds
 * @param style - Optional style for timestamp
 * @returns Formatted timestamp
 *
 * @example
 * ```typescript
 * formatTimestamp(1618932219)
 * // "<t:1618932219>"
 *
 * formatTimestamp(1618932219, TimestampStyle.RelativeTime)
 * // "<t:1618932219:R>"
 * ```
 *
 * @public
 */
export function formatTimestamp(
  timestamp: number,
  style?: TimestampStyle,
): FormattedTimestamp {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }

  return `<t:${timestamp}>`;
}

/**
 * Guild navigation types available in Discord.
 * Different navigation targets within guilds.
 *
 * @public
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${Snowflake}`;

/**
 * Formatted guild navigation link in Discord markdown.
 * Guild ID with navigation type.
 *
 * @public
 */
export type FormattedGuildNavigation = `<${Snowflake}:${GuildNavigationType}>`;

/**
 * Creates formatted guild navigation link.
 *
 * @param id - ID of guild
 * @param type - Navigation target type
 * @returns Formatted guild navigation link
 *
 * @example
 * ```typescript
 * formatGuildNavigation("123456789012345678", "customize")
 * // "<123456789012345678:customize>"
 *
 * formatGuildNavigation("123456789012345678", "linked-roles:987654321098765432")
 * // "<123456789012345678:linked-roles:987654321098765432>"
 * ```
 *
 * @public
 */
export function formatGuildNavigation(
  id: Snowflake,
  type: GuildNavigationType,
): FormattedGuildNavigation {
  return `<${id}:${type}>`;
}
