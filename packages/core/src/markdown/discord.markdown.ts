/**
 * Represents a validated Discord Snowflake ID.
 *
 * A Snowflake is a unique 64-bit identifier used by Discord,
 * encoded as a string of numeric characters.
 * Structure: `(timestamp_ms - DISCORD_EPOCH) << 22 | worker_id << 17 | process_id << 12 | increment`
 *
 * Validation rules:
 * - Must contain only digits
 * - Must be at least 17 digits long
 * - The extracted timestamp must be valid (after Discord epoch, before now + 1h)
 *
 * @remarks
 * The internal structure allows for extracting information such as creation timestamp,
 * worker ID, process ID, and increment.
 *
 * @example
 * ```typescript
 * // Example of a valid Discord Snowflake
 * const messageId: Snowflake = "175928847299117063";
 * ```
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export type Snowflake = string;

/**
 * Type representing italicized text in Discord markdown.
 *
 * In Discord, text surrounded by single asterisks is displayed in italics.
 */
export type Italics = `*${string}*`;

/**
 * Creates italicized text using Discord markdown.
 *
 * @param text - The text to be italicized
 * @returns The text wrapped in single asterisks
 *
 * @example
 * italics("Hello world") // Returns "*Hello world*"
 */
export function italics(text: string): Italics {
  return `*${text}*`;
}

/**
 * Type representing bold text in Discord markdown.
 *
 * In Discord, text surrounded by double asterisks is displayed in bold.
 */
export type Bold = `**${string}**`;

/**
 * Creates bold text using Discord markdown.
 *
 * @param text - The text to be bolded
 * @returns The text wrapped in double asterisks
 *
 * @example
 * bold("Hello world") // Returns "**Hello world**"
 */
export function bold(text: string): Bold {
  return `**${text}**`;
}

/**
 * Type representing underlined text in Discord markdown.
 *
 * In Discord, text surrounded by double underscores is displayed with an underline.
 */
export type Underline = `__${string}__`;

/**
 * Creates underlined text using Discord markdown.
 *
 * @param text - The text to be underlined
 * @returns The text wrapped in double underscores
 *
 * @example
 * underline("Hello world") // Returns "__Hello world__"
 */
export function underline(text: string): Underline {
  return `__${text}__`;
}

/**
 * Type representing strikethrough text in Discord markdown.
 *
 * In Discord, text surrounded by double tildes is displayed with a strikethrough.
 */
export type Strikethrough = `~~${string}~~`;

/**
 * Creates strikethrough text using Discord markdown.
 *
 * @param text - The text to have a strikethrough effect
 * @returns The text wrapped in double tildes
 *
 * @example
 * strikethrough("Hello world") // Returns "~~Hello world~~"
 */
export function strikethrough(text: string): Strikethrough {
  return `~~${text}~~`;
}

/**
 * Type representing spoiler text in Discord markdown.
 *
 * In Discord, text surrounded by double vertical bars is hidden as a spoiler
 * until clicked by the user.
 */
export type Spoiler = `||${string}||`;

/**
 * Creates spoiler text using Discord markdown.
 *
 * @param text - The text to be hidden as a spoiler
 * @returns The text wrapped in double vertical bars
 *
 * @example
 * spoiler("Hello world") // Returns "||Hello world||"
 */
export function spoiler(text: string): Spoiler {
  return `||${text}||`;
}

/**
 * Type representing a large header (heading 1) in Discord markdown.
 *
 * In Discord, text preceded by a hash symbol and a space is displayed as a large header.
 */
export type BigHeader = `# ${string}`;

/**
 * Creates a large header (heading 1) using Discord markdown.
 *
 * @param text - The text to be displayed as a large header
 * @returns The text preceded by a hash symbol and a space
 *
 * @example
 * bigHeader("Hello world") // Returns "# Hello world"
 */
export function bigHeader(text: string): BigHeader {
  return `# ${text}`;
}

/**
 * Type representing a medium header (heading 2) in Discord markdown.
 *
 * In Discord, text preceded by two hash symbols and a space is displayed as a medium header.
 */
export type SmallerHeader = `## ${string}`;

/**
 * Creates a medium header (heading 2) using Discord markdown.
 *
 * @param text - The text to be displayed as a medium header
 * @returns The text preceded by two hash symbols and a space
 *
 * @example
 * smallerHeader("Hello world") // Returns "## Hello world"
 */
export function smallerHeader(text: string): SmallerHeader {
  return `## ${text}`;
}

/**
 * Type representing a small header (heading 3) in Discord markdown.
 *
 * In Discord, text preceded by three hash symbols and a space is displayed as a small header.
 */
export type EvenSmallerHeader = `### ${string}`;

/**
 * Creates a small header (heading 3) using Discord markdown.
 *
 * @param text - The text to be displayed as a small header
 * @returns The text preceded by three hash symbols and a space
 *
 * @example
 * evenSmallerHeader("Hello world") // Returns "### Hello world"
 */
export function evenSmallerHeader(text: string): EvenSmallerHeader {
  return `### ${text}`;
}

/**
 * Type representing subtext in Discord markdown.
 *
 * In Discord, text preceded by a dash, a hash symbol, and a space is displayed as subtext.
 */
export type SubHeader = `-# ${string}`;

/**
 * Creates subtext using Discord markdown.
 *
 * @param text - The text to be displayed as subtext
 * @returns The text preceded by a dash, a hash symbol, and a space
 *
 * @example
 * subText("Hello world") // Returns "-# Hello world"
 */
export function subText(text: string): SubHeader {
  return `-# ${text}`;
}

/**
 * Type representing a hyperlink in Discord markdown.
 *
 * In Discord, a hyperlink is formatted with the link text in square brackets
 * followed by the URL in parentheses.
 */
export type Link = `[${string}](${string})`;

/**
 * Creates a hyperlink using Discord markdown.
 *
 * @param text - The text to be displayed for the link
 * @param url - The URL that the link points to
 * @returns The formatted hyperlink
 *
 * @example
 * link("Discord", "https://discord.com") // Returns "[Discord](https://discord.com)"
 */
export function link(text: string, url: string): Link {
  return `[${text}](${url})`;
}

/**
 * Type representing inline code in Discord markdown.
 *
 * In Discord, text surrounded by backticks is displayed as inline code.
 */
export type Code = `\`${string}\``;

/**
 * Creates inline code using Discord markdown.
 *
 * @param text - The text to be displayed as inline code
 * @returns The text wrapped in backticks
 *
 * @example
 * code("const x = 1;") // Returns "`const x = 1;`"
 */
export function code(text: string): Code {
  return `\`${text}\``;
}

/**
 * Type representing the supported programming languages for code blocks in Discord.
 *
 * Discord supports syntax highlighting for various programming languages in code blocks.
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
 * Type representing a code block in Discord markdown.
 *
 * In Discord, text surrounded by triple backticks with an optional language specifier
 * is displayed as a code block with syntax highlighting.
 */
export type CodeBlock = `\`\`\`${ProgrammingLanguageType}\n${string}\n\`\`\``;

/**
 * Creates a code block with optional syntax highlighting using Discord markdown.
 *
 * @param text - The code to be displayed in the code block
 * @param language - The programming language for syntax highlighting (defaults to "plaintext")
 * @returns The formatted code block
 *
 * @example
 * codeBlock("const x = 1;", "javascript")
 * // Returns "```javascript
 * // const x = 1;
 * // ```"
 */
export function codeBlock(
  text: string,
  language: ProgrammingLanguageType = "plaintext",
): CodeBlock {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Type representing a single-line quote in Discord markdown.
 *
 * In Discord, text preceded by a greater-than symbol and a space is displayed as a quote.
 */
export type Quote = `> ${string}`;

/**
 * Creates a single-line quote using Discord markdown.
 *
 * @param text - The text to be displayed as a quote
 * @returns The text preceded by a greater-than symbol and a space
 *
 * @example
 * quote("Hello world") // Returns "> Hello world"
 */
export function quote(text: string): Quote {
  return `> ${text}`;
}

/**
 * Type representing a multi-line quote block in Discord markdown.
 *
 * In Discord, text preceded by three greater-than symbols and a space
 * is displayed as a multi-line quote block.
 */
export type QuoteBlock = `>>> ${string}`;

/**
 * Creates a multi-line quote block using Discord markdown.
 *
 * @param text - The text to be displayed as a quote block
 * @returns The text preceded by three greater-than symbols and a space
 *
 * @example
 * quoteBlock("Hello\nworld") // Returns ">>> Hello\nworld"
 */
export function quoteBlock(text: string): QuoteBlock {
  return `>>> ${text}`;
}

/**
 * Type representing a formatted user mention in Discord markdown.
 *
 * In Discord, a user ID wrapped in <@ and > creates a clickable user mention
 * that will highlight and notify the mentioned user.
 */
export type FormattedUser = `<@${Snowflake}>`;

/**
 * Creates a user mention using Discord markdown.
 *
 * @param userId - The ID of the user to mention
 * @returns The formatted user mention
 *
 * @example
 * formatUser("123456789012345678") // Returns "<@123456789012345678>"
 */
export function formatUser(userId: Snowflake): FormattedUser {
  return `<@${userId}>`;
}

/**
 * Type representing a formatted channel mention in Discord markdown.
 *
 * In Discord, a channel ID wrapped in <# and > creates a clickable channel mention
 * that will link to the specified channel.
 */
export type FormattedChannel = `<#${Snowflake}>`;

/**
 * Creates a channel mention using Discord markdown.
 *
 * @param channelId - The ID of the channel to mention
 * @returns The formatted channel mention
 *
 * @example
 * formatChannel("123456789012345678") // Returns "<#123456789012345678>"
 */
export function formatChannel(channelId: Snowflake): FormattedChannel {
  return `<#${channelId}>`;
}

/**
 * Type representing a formatted role mention in Discord markdown.
 *
 * In Discord, a role ID wrapped in <@& and > creates a clickable role mention
 * that will highlight all users with that role.
 */
export type FormattedRole = `<@&${Snowflake}>`;

/**
 * Creates a role mention using Discord markdown.
 *
 * @param roleId - The ID of the role to mention
 * @returns The formatted role mention
 *
 * @example
 * formatRole("123456789012345678") // Returns "<@&123456789012345678>"
 */
export function formatRole(roleId: Snowflake): FormattedRole {
  return `<@&${roleId}>`;
}

/**
 * Type representing a formatted slash command mention in Discord markdown.
 *
 * In Discord, a command formatted with the command name and ID creates
 * a clickable slash command mention that will display the command info.
 */
export type FormattedSlashCommand =
  | `</${string}:${Snowflake}>`
  | `</${string} ${string}:${Snowflake}>`
  | `</${string} ${string} ${string}:${Snowflake}>`;

/**
 * Creates a formatted slash command mention using Discord markdown.
 *
 * @param commandName - The name of the slash command
 * @param commandId - The ID of the slash command
 * @param subCommandGroupName - Optional name of the sub-command group
 * @param subCommandName - Optional name of the sub-command
 * @returns The formatted slash command mention
 *
 * @example
 * // Basic command
 * formatSlashCommand("help", "123456789012345678")
 * // Returns "</help:123456789012345678>"
 *
 * // Command with subcommand
 * formatSlashCommand("settings", "123456789012345678", null, "privacy")
 * // Returns "</settings privacy:123456789012345678>"
 *
 * // Command with subcommand group and subcommand
 * formatSlashCommand("permissions", "123456789012345678", "role", "view")
 * // Returns "</permissions role view:123456789012345678>"
 */
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandGroupName?: string,
  subCommandName?: string,
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
 * Type representing a formatted custom emoji in Discord markdown.
 *
 * In Discord, a custom emoji is formatted with the emoji name and ID,
 * with an optional 'a:' prefix for animated emojis.
 */
export type FormattedCustomEmoji =
  | `<:${string}:${Snowflake}>`
  | `<a:${string}:${Snowflake}>`;

/**
 * Creates a formatted custom emoji using Discord markdown.
 *
 * @param emojiName - The name of the custom emoji
 * @param emojiId - The ID of the custom emoji
 * @param animated - Whether the emoji is animated
 * @returns The formatted custom emoji
 *
 * @example
 * // Static emoji
 * formatCustomEmoji("heart", "123456789012345678")
 * // Returns "<:heart:123456789012345678>"
 *
 * // Animated emoji
 * formatCustomEmoji("wave", "123456789012345678", true)
 * // Returns "<a:wave:123456789012345678>"
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
 * Enum representing the different timestamp styles available in Discord.
 *
 * Discord supports various formats for displaying timestamps, including short and long
 * formats for time, date, and relative time.
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export enum TimestampStyle {
  /** Displays the time in 24-hour format (e.g., "16:20") */
  ShortTime = "t",

  /** Displays the time in 12-hour format with AM/PM (e.g., "4:20 PM") */
  LongTime = "T",

  /** Displays the date in short format (e.g., "20/04/2021") */
  ShortDate = "d",

  /** Displays the date in long format (e.g., "20 April 2021") */
  LongDate = "D",

  /** Displays the date and time in short format (e.g., "20 April 2021 16:20") */
  ShortDateTime = "f",

  /** Displays the date and time in long format with day of week (e.g., "Tuesday, 20 April 2021 16:20") */
  LongDateTime = "F",

  /** Displays the time relative to the current time (e.g., "2 hours ago", "in 3 days") */
  RelativeTime = "R",
}

/**
 * Type representing a formatted timestamp in Discord markdown.
 *
 * In Discord, a timestamp is formatted with a Unix timestamp and an optional style.
 */
export type FormattedTimestamp =
  | `<t:${number}>`
  | `<t:${number}:${TimestampStyle}>`;

/**
 * Creates a formatted timestamp using Discord markdown.
 *
 * @param timestamp - The Unix timestamp in seconds
 * @param style - Optional style to format the timestamp
 * @returns The formatted timestamp
 *
 * @example
 * // Default format
 * formatTimestamp(1618932219)
 * // Returns "<t:1618932219>"
 *
 * // Relative time format
 * formatTimestamp(1618932219, TimestampStyle.RelativeTime)
 * // Returns "<t:1618932219:R>"
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
 * Type representing the different guild navigation types available in Discord.
 *
 * Discord supports various navigation targets within guilds, including customization,
 * browsing, guides, and linked roles.
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationType =
  | "customize" // Navigate to server customization
  | "browse" // Navigate to server channel/category browser
  | "guide" // Navigate to server guide/tutorial
  | "linked-roles" // Navigate to all linked roles
  | `linked-roles:${Snowflake}`; // Navigate to a specific linked role

/**
 * Type representing a formatted guild navigation link in Discord markdown.
 *
 * In Discord, a guild navigation link is formatted with the guild ID and navigation type.
 */
export type FormattedGuildNavigation = `<${Snowflake}:${GuildNavigationType}>`;

/**
 * Creates a formatted guild navigation link using Discord markdown.
 *
 * @param id - The ID of the guild
 * @param type - The type of navigation target within the guild
 * @returns The formatted guild navigation link
 *
 * @example
 * // Navigate to server customization
 * formatGuildNavigation("123456789012345678", "customize")
 * // Returns "<123456789012345678:customize>"
 *
 * // Navigate to a specific linked role
 * formatGuildNavigation("123456789012345678", "linked-roles:987654321098765432")
 * // Returns "<123456789012345678:linked-roles:987654321098765432>"
 */
export function formatGuildNavigation(
  id: Snowflake,
  type: GuildNavigationType,
): FormattedGuildNavigation {
  return `<${id}:${type}>`;
}
