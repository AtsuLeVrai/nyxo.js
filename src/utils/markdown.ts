/**
 * Discord Markdown formatting utilities with type-safe string templates and helper functions.
 * Provides comprehensive Discord message formatting capabilities with compile-time type safety.
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting} for Discord formatting reference
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-} for user formatting guide
 */

/**
 * Discord timestamp display styles for different formatting options.
 * Controls how timestamps appear in Discord messages.
 *
 * @see {@link formatTimestamp} for usage with timestamp formatting
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles} for style documentation
 */
export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

/**
 * Discord guild navigation types for server guide and customization links.
 * Used with guild navigation formatting for directing users to specific server sections.
 *
 * @see {@link formatGuildNavigation} for guild navigation link creation
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation} for navigation documentation
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${string}`;

/**
 * Comprehensive list of supported programming languages for Discord code block syntax highlighting.
 * Includes popular languages, markup formats, configuration files, and specialized languages.
 *
 * @see {@link codeBlock} for usage with syntax highlighting
 * @see {@link https://highlightjs.org/static/demo/} for syntax highlighting examples
 */
export type CodeLanguage =
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

// Text formatting type definitions with template literal types for compile-time safety
export type Italic<T extends string> = `*${T}*`;
export type ItalicAlt<T extends string> = `_${T}_`;
export type Bold<T extends string> = `**${T}**`;
export type Underline<T extends string> = `__${T}__`;
export type Strikethrough<T extends string> = `~~${T}~~`;
export type Spoiler<T extends string> = `||${T}||`;

// Header type definitions for different heading levels
export type H1<T extends string> = `# ${T}`;
export type H2<T extends string> = `## ${T}`;
export type H3<T extends string> = `### ${T}`;
export type Subheading<T extends string> = `-# ${T}`;

// Link and URL formatting type definitions
export type Link<T extends string, U extends string> = `[${T}](${U})`;
export type LinkWithTooltip<
  T extends string,
  U extends string,
  H extends string,
> = `[${T}](${U} "${H}")`;

// Code formatting type definitions
export type Code<T extends string> = `\`${T}\``;
export type CodeBlock<T extends string, L extends CodeLanguage> = `\`\`\`${L}\n${T}\n\`\`\``;

// Quote formatting type definitions
export type Quote<T extends string> = `> ${T}`;
export type QuoteBlock<T extends string> = `>>> ${T}`;

// List formatting type definitions
export type BulletPoint<T extends string> = `- ${T}`;
export type NumberedPoint<T extends string, N extends number> = `${N}. ${T}`;

// Discord-specific mention formatting type definitions
export type FormattedUser<T extends string> = `<@${T}>`;
export type FormattedChannel<T extends string> = `<#${T}>`;
export type FormattedRole<T extends string> = `<@&${T}>`;
export type FormattedSlashCommand<T extends string, U extends string> =
  | `</${T}:${U}>`
  | `</${T} ${string}:${U}>`
  | `</${T} ${string} ${string}:${U}>`;
export type FormattedCustomEmoji<T extends string, U extends string> =
  | `<:${T}:${U}>`
  | `<a:${T}:${U}>`;
export type FormattedTimestamp<T extends number> = `<t:${T}>` | `<t:${T}:${TimestampStyle}>`;
export type FormattedGuildNavigation<T extends string> = `<${T}:${GuildNavigationType}>`;

/**
 * Formats text with italic styling using asterisk syntax.
 * Primary Discord italic formatting method.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as italic
 * @returns Italicized text with asterisk wrapping
 *
 * @see {@link italicAlt} for underscore-based italic formatting
 *
 * @example
 * ```typescript
 * const formatted = italic("Hello World"); // "*Hello World*"
 * ```
 */
export function italic<T extends string>(text: T): Italic<T> {
  return `*${text}*`;
}

/**
 * Formats text with italic styling using underscore syntax.
 * Alternative Discord italic formatting method.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as italic
 * @returns Italicized text with underscore wrapping
 *
 * @see {@link italic} for asterisk-based italic formatting
 *
 * @example
 * ```typescript
 * const formatted = italicAlt("Hello World"); // "_Hello World_"
 * ```
 */
export function italicAlt<T extends string>(text: T): ItalicAlt<T> {
  return `_${text}_`;
}

/**
 * Formats text with bold styling using double asterisk syntax.
 * Creates emphasized text that stands out in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as bold
 * @returns Bold text with double asterisk wrapping
 *
 * @example
 * ```typescript
 * const formatted = bold("Important Message"); // "**Important Message**"
 * ```
 */
export function bold<T extends string>(text: T): Bold<T> {
  return `**${text}**`;
}

/**
 * Formats text with underline styling using double underscore syntax.
 * Adds underline decoration to text in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format with underline
 * @returns Underlined text with double underscore wrapping
 *
 * @example
 * ```typescript
 * const formatted = underline("Click Here"); // "__Click Here__"
 * ```
 */
export function underline<T extends string>(text: T): Underline<T> {
  return `__${text}__`;
}

/**
 * Formats text with strikethrough styling using double tilde syntax.
 * Creates crossed-out text effect in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format with strikethrough
 * @returns Strikethrough text with double tilde wrapping
 *
 * @example
 * ```typescript
 * const formatted = strikethrough("Outdated Info"); // "~~Outdated Info~~"
 * ```
 */
export function strikethrough<T extends string>(text: T): Strikethrough<T> {
  return `~~${text}~~`;
}

/**
 * Formats text as a spoiler using double pipe syntax.
 * Creates hidden text that requires user interaction to reveal.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to hide as spoiler
 * @returns Spoiler text with double pipe wrapping
 *
 * @example
 * ```typescript
 * const formatted = spoiler("Plot Twist"); // "||Plot Twist||"
 * ```
 */
export function spoiler<T extends string>(text: T): Spoiler<T> {
  return `||${text}||`;
}

/**
 * Formats text as a level 1 header using single hash syntax.
 * Creates the largest heading size in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content for the main header
 * @returns Level 1 header with hash prefix
 *
 * @example
 * ```typescript
 * const formatted = h1("Main Title"); // "# Main Title"
 * ```
 */
export function h1<T extends string>(text: T): H1<T> {
  return `# ${text}`;
}

/**
 * Formats text as a level 2 header using double hash syntax.
 * Creates a medium-sized heading in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content for the section header
 * @returns Level 2 header with double hash prefix
 *
 * @example
 * ```typescript
 * const formatted = h2("Section Title"); // "## Section Title"
 * ```
 */
export function h2<T extends string>(text: T): H2<T> {
  return `## ${text}`;
}

/**
 * Formats text as a level 3 header using triple hash syntax.
 * Creates a smaller heading size in Discord messages.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content for the subsection header
 * @returns Level 3 header with triple hash prefix
 *
 * @example
 * ```typescript
 * const formatted = h3("Subsection Title"); // "### Subsection Title"
 * ```
 */
export function h3<T extends string>(text: T): H3<T> {
  return `### ${text}`;
}

/**
 * Formats text as a subheading using Discord's special subheading syntax.
 * Creates a smaller, secondary heading style.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content for the subheading
 * @returns Subheading with dash-hash prefix
 *
 * @example
 * ```typescript
 * const formatted = subheading("Small Header"); // "-# Small Header"
 * ```
 */
export function subheading<T extends string>(text: T): Subheading<T> {
  return `-# ${text}`;
}

/**
 * Creates a clickable link using Markdown link syntax.
 * Combines display text with a URL destination.
 *
 * @typeParam T - Display text type for compile-time safety
 * @typeParam U - URL text type for compile-time safety
 * @param text - Text to display as the link
 * @param url - URL destination for the link
 * @returns Formatted Markdown link
 *
 * @see {@link linkWithTooltip} for links with hover tooltips
 *
 * @example
 * ```typescript
 * const formatted = link("Discord", "https://discord.com"); // "[Discord](https://discord.com)"
 * ```
 */
export function link<T extends string, U extends string>(text: T, url: U): Link<T, U> {
  return `[${text}](${url})`;
}

/**
 * Creates a clickable link with a hover tooltip using Markdown syntax.
 * Combines display text, URL destination, and tooltip text.
 *
 * @typeParam T - Display text type for compile-time safety
 * @typeParam U - URL text type for compile-time safety
 * @typeParam H - Tooltip text type for compile-time safety
 * @param text - Text to display as the link
 * @param url - URL destination for the link
 * @param tooltip - Tooltip text shown on hover
 * @returns Formatted Markdown link with tooltip
 *
 * @see {@link link} for basic links without tooltips
 *
 * @example
 * ```typescript
 * const formatted = linkWithTooltip("Discord", "https://discord.com", "Chat Platform");
 * // "[Discord](https://discord.com "Chat Platform")"
 * ```
 */
export function linkWithTooltip<T extends string, U extends string, H extends string>(
  text: T,
  url: U,
  tooltip: H,
): LinkWithTooltip<T, U, H> {
  return `[${text}](${url} "${tooltip}")`;
}

/**
 * Formats text as inline code using backtick syntax.
 * Creates monospace text highlighting for code snippets and technical terms.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as inline code
 * @returns Inline code with backtick wrapping
 *
 * @see {@link codeBlock} for multi-line code formatting
 *
 * @example
 * ```typescript
 * const formatted = code("console.log()"); // "`console.log()`"
 * ```
 */
export function code<T extends string>(text: T): Code<T> {
  return `\`${text}\``;
}

/**
 * Formats text as a code block with optional syntax highlighting.
 * Creates a multi-line code display with language-specific highlighting.
 *
 * @typeParam T - Input text type for compile-time safety
 * @typeParam L - Code language type for syntax highlighting
 * @param text - Code content to format in the block
 * @param language - Programming language for syntax highlighting (defaults to plaintext)
 * @returns Multi-line code block with language specification
 *
 * @see {@link code} for inline code formatting
 * @see {@link CodeLanguage} for supported language options
 *
 * @example
 * ```typescript
 * const jsCode = codeBlock("console.log('Hello');", "javascript");
 * // "```javascript\nconsole.log('Hello');\n```"
 *
 * const plainCode = codeBlock("Some text");
 * // "```plaintext\nSome text\n```"
 * ```
 */
export function codeBlock<T extends string, L extends CodeLanguage = "plaintext">(
  text: T,
  language: L = "plaintext" as L,
): CodeBlock<T, L> {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Formats text as a single-line quote using greater-than syntax.
 * Creates an indented quote block for emphasis or citations.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as quote
 * @returns Single-line quote with greater-than prefix
 *
 * @see {@link quoteBlock} for multi-line quote formatting
 *
 * @example
 * ```typescript
 * const formatted = quote("This is important"); // "> This is important"
 * ```
 */
export function quote<T extends string>(text: T): Quote<T> {
  return `> ${text}`;
}

/**
 * Formats text as a multi-line quote block using triple greater-than syntax.
 * Creates a larger quote section that can contain multiple lines.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content to format as quote block
 * @returns Multi-line quote block with triple greater-than prefix
 *
 * @see {@link quote} for single-line quote formatting
 *
 * @example
 * ```typescript
 * const formatted = quoteBlock("This is a long quote\nthat spans multiple lines");
 * // ">>> This is a long quote\nthat spans multiple lines"
 * ```
 */
export function quoteBlock<T extends string>(text: T): QuoteBlock<T> {
  return `>>> ${text}`;
}

/**
 * Formats text as a bullet point using dash syntax.
 * Creates an unordered list item with bullet styling.
 *
 * @typeParam T - Input text type for compile-time safety
 * @param text - Text content for the bullet point
 * @returns Bullet point with dash prefix
 *
 * @see {@link numberedPoint} for numbered list items
 *
 * @example
 * ```typescript
 * const formatted = bulletPoint("First item"); // "- First item"
 * ```
 */
export function bulletPoint<T extends string>(text: T): BulletPoint<T> {
  return `- ${text}`;
}

/**
 * Formats text as a numbered list item with specified number.
 * Creates an ordered list item with numeric prefix.
 *
 * @typeParam T - Input text type for compile-time safety
 * @typeParam N - Number type for the list position
 * @param text - Text content for the list item
 * @param number - Position number for the list item
 * @returns Numbered list item with number prefix
 *
 * @see {@link bulletPoint} for unordered list items
 *
 * @example
 * ```typescript
 * const formatted = numberedPoint("First step", 1); // "1. First step"
 * ```
 */
export function numberedPoint<T extends string, N extends number>(
  text: T,
  number: N,
): NumberedPoint<T, N> {
  return `${number}. ${text}`;
}

/**
 * Formats a user ID as a Discord user mention.
 * Creates a clickable user reference that highlights and notifies the user.
 *
 * @typeParam T - User ID type for compile-time safety
 * @param userId - Discord user ID (Snowflake format)
 * @returns Formatted user mention
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats} for mention formatting
 *
 * @example
 * ```typescript
 * const formatted = formatUser("123456789012345678"); // "<@123456789012345678>"
 * ```
 */
export function formatUser<T extends string>(userId: T): FormattedUser<T> {
  return `<@${userId}>`;
}

/**
 * Formats a channel ID as a Discord channel mention.
 * Creates a clickable channel reference that links to the specified channel.
 *
 * @typeParam T - Channel ID type for compile-time safety
 * @param channelId - Discord channel ID (Snowflake format)
 * @returns Formatted channel mention
 *
 * @example
 * ```typescript
 * const formatted = formatChannel("123456789012345678"); // "<#123456789012345678>"
 * ```
 */
export function formatChannel<T extends string>(channelId: T): FormattedChannel<T> {
  return `<#${channelId}>`;
}

/**
 * Formats a role ID as a Discord role mention.
 * Creates a clickable role reference that highlights users with the role.
 *
 * @typeParam T - Role ID type for compile-time safety
 * @param roleId - Discord role ID (Snowflake format)
 * @returns Formatted role mention
 *
 * @example
 * ```typescript
 * const formatted = formatRole("123456789012345678"); // "<@&123456789012345678>"
 * ```
 */
export function formatRole<T extends string>(roleId: T): FormattedRole<T> {
  return `<@&${roleId}>`;
}

/**
 * Formats a slash command reference for Discord messages.
 * Creates a clickable command mention with support for subcommands and subcommand groups.
 *
 * @typeParam T - Command name type for compile-time safety
 * @typeParam U - Command ID type for compile-time safety
 * @param commandName - Base name of the slash command
 * @param commandId - Discord command ID (Snowflake format)
 * @param subCommandName - Optional subcommand name
 * @param subCommandGroupName - Optional subcommand group name
 * @returns Formatted slash command mention
 *
 * @example
 * ```typescript
 * const basicCmd = formatSlashCommand("help", "123456789012345678");
 * // "</help:123456789012345678>"
 *
 * const subCmd = formatSlashCommand("config", "123456789012345678", "set");
 * // "</config set:123456789012345678>"
 *
 * const groupCmd = formatSlashCommand("admin", "123456789012345678", "ban", "user");
 * // "</admin user ban:123456789012345678>"
 * ```
 */
export function formatSlashCommand<T extends string, U extends string>(
  commandName: T,
  commandId: U,
  subCommandName?: string,
  subCommandGroupName?: string,
): FormattedSlashCommand<T, U> {
  if (subCommandGroupName && subCommandName) {
    return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
  }
  if (subCommandName) {
    return `</${commandName} ${subCommandName}:${commandId}>`;
  }
  return `</${commandName}:${commandId}>`;
}

/**
 * Formats a custom emoji for Discord messages.
 * Creates a custom emoji reference with support for animated emojis.
 *
 * @typeParam T - Emoji name type for compile-time safety
 * @typeParam U - Emoji ID type for compile-time safety
 * @param emojiName - Name of the custom emoji
 * @param emojiId - Discord emoji ID (Snowflake format)
 * @param animated - Whether the emoji is animated (defaults to false)
 * @returns Formatted custom emoji
 *
 * @example
 * ```typescript
 * const staticEmoji = formatCustomEmoji("thumbsup", "123456789012345678");
 * // "<:thumbsup:123456789012345678>"
 *
 * const animatedEmoji = formatCustomEmoji("loading", "123456789012345678", true);
 * // "<a:loading:123456789012345678>"
 * ```
 */
export function formatCustomEmoji<T extends string, U extends string>(
  emojiName: T,
  emojiId: U,
  animated?: boolean,
): FormattedCustomEmoji<T, U> {
  if (animated) {
    return `<a:${emojiName}:${emojiId}>`;
  }
  return `<:${emojiName}:${emojiId}>`;
}

/**
 * Formats a Unix timestamp for Discord message display.
 * Creates a dynamic timestamp that displays relative time in user's timezone.
 *
 * @typeParam T - Timestamp number type for compile-time safety
 * @param timestamp - Unix timestamp in seconds
 * @param style - Display style for the timestamp (optional)
 * @returns Formatted Discord timestamp
 *
 * @see {@link TimestampStyle} for available display styles
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles} for style examples
 *
 * @example
 * ```typescript
 * const basic = formatTimestamp(1640995200); // "<t:1640995200>"
 * const relative = formatTimestamp(1640995200, "R"); // "<t:1640995200:R>"
 * const longDate = formatTimestamp(1640995200, "F"); // "<t:1640995200:F>"
 * ```
 */
export function formatTimestamp<T extends number>(
  timestamp: T,
  style?: TimestampStyle,
): FormattedTimestamp<T> {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }
  return `<t:${timestamp}>`;
}

/**
 * Formats a guild navigation link for Discord messages.
 * Creates clickable links to specific sections within a Discord server.
 *
 * @typeParam T - Guild ID type for compile-time safety
 * @param id - Discord guild (server) ID (Snowflake format)
 * @param type - Type of guild navigation destination
 * @returns Formatted guild navigation link
 *
 * @see {@link GuildNavigationType} for available navigation types
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation} for navigation documentation
 *
 * @example
 * ```typescript
 * const customize = formatGuildNavigation("123456789012345678", "customize");
 * // "<123456789012345678:customize>"
 *
 * const linkedRoles = formatGuildNavigation("123456789012345678", "linked-roles");
 * // "<123456789012345678:linked-roles>"
 * ```
 */
export function formatGuildNavigation<T extends string>(
  id: T,
  type: GuildNavigationType,
): FormattedGuildNavigation<T> {
  return `<${id}:${type}>`;
}
