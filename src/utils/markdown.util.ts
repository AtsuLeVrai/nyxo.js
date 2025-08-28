/**
 * @description Discord timestamp formatting styles for dynamic time display.
 * Values: `t` (short time), `T` (long time), `d` (short date), `D` (long date),
 * `f` (short datetime), `F` (long datetime), `R` (relative time).
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

/**
 * @description Discord guild navigation types for navigation links.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${string}`;

/**
 * @description Supported programming languages for Discord code block syntax highlighting.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
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

/**
 * @description Discord italic text format using asterisk syntax.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Italic<T extends string> = `*${T}*`;

/**
 * @description Discord italic text format using underscore syntax.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type ItalicAlt<T extends string> = `_${T}_`;

/**
 * @description Discord bold text format using double asterisks.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Bold<T extends string> = `**${T}**`;

/**
 * @description Discord underlined text format using double underscores.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Underline<T extends string> = `__${T}__`;

/**
 * @description Discord strikethrough text format using double tildes.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Strikethrough<T extends string> = `~~${T}~~`;

/**
 * @description Discord spoiler text format using double pipes.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Spoiler<T extends string> = `||${T}||`;

/**
 * @description Discord large header format using single hash.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type H1<T extends string> = `# ${T}`;

/**
 * @description Discord medium header format using double hash.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type H2<T extends string> = `## ${T}`;

/**
 * @description Discord small header format using triple hash.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type H3<T extends string> = `### ${T}`;

/**
 * @description Discord subheading format using dash-hash syntax.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Subheading<T extends string> = `-# ${T}`;

/**
 * @description Discord hyperlink format with text and URL.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Link<T extends string, U extends string> = `[${T}](${U})`;

/**
 * @description Discord hyperlink format with hover tooltip.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type LinkWithTooltip<
  T extends string,
  U extends string,
  H extends string,
> = `[${T}](${U} "${H}")`;

/**
 * @description Discord inline code format using backticks.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Code<T extends string> = `\`${T}\``;

/**
 * @description Discord code block format with syntax highlighting.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type CodeBlock<T extends string, L extends CodeLanguage> = `\`\`\`${L}\n${T}\n\`\`\``;

/**
 * @description Discord single-line quote format using greater-than symbol.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type Quote<T extends string> = `> ${T}`;

/**
 * @description Discord multi-line quote block format using triple greater-than.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type QuoteBlock<T extends string> = `>>> ${T}`;

/**
 * @description Discord bullet point list item format using dash.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type BulletPoint<T extends string> = `- ${T}`;

/**
 * @description Discord numbered list item format with number and period.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 */
export type NumberedPoint<T extends string, N extends number> = `${N}. ${T}`;

/**
 * @description Discord user mention format using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export type FormattedUser<T extends string> = `<@${T}>`;

/**
 * @description Discord channel mention format using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export type FormattedChannel<T extends string> = `<#${T}>`;

/**
 * @description Discord role mention format using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export type FormattedRole<T extends string> = `<@&${T}>`;

/**
 * @description Discord slash command mention format with optional subcommands.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export type FormattedSlashCommand<T extends string, U extends string> =
  | `</${T}:${U}>`
  | `</${T} ${string}:${U}>`
  | `</${T} ${string} ${string}:${U}>`;

/**
 * @description Discord custom emoji format for static and animated emojis.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export type FormattedCustomEmoji<T extends string, U extends string> =
  | `<:${T}:${U}>`
  | `<a:${T}:${U}>`;

/**
 * @description Discord timestamp format with optional styling.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export type FormattedTimestamp<T extends number> = `<t:${T}>` | `<t:${T}:${TimestampStyle}>`;

/**
 * @description Discord guild navigation format for server features.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation}
 */
export type FormattedGuildNavigation<T extends string> = `<${T}:${GuildNavigationType}>`;

/**
 * @description Formats text with Discord italic markdown using asterisks.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as italic
 * @returns Text wrapped in asterisks for italic display
 */
export function italic<T extends string>(text: T): Italic<T> {
  return `*${text}*`;
}

/**
 * @description Formats text with Discord italic markdown using underscores.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as italic
 * @returns Text wrapped in underscores for italic display
 */
export function italicAlt<T extends string>(text: T): ItalicAlt<T> {
  return `_${text}_`;
}

/**
 * @description Formats text with Discord bold markdown.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as bold
 * @returns Text wrapped in double asterisks for bold display
 */
export function bold<T extends string>(text: T): Bold<T> {
  return `**${text}**`;
}

/**
 * @description Formats text with Discord underline markdown.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as underlined
 * @returns Text wrapped in double underscores for underline display
 */
export function underline<T extends string>(text: T): Underline<T> {
  return `__${text}__`;
}

/**
 * @description Formats text with Discord strikethrough markdown.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as strikethrough
 * @returns Text wrapped in double tildes for strikethrough display
 */
export function strikethrough<T extends string>(text: T): Strikethrough<T> {
  return `~~${text}~~`;
}

/**
 * @description Formats text with Discord spoiler markdown.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as spoiler
 * @returns Text wrapped in double pipes for spoiler display
 */
export function spoiler<T extends string>(text: T): Spoiler<T> {
  return `||${text}||`;
}

/**
 * @description Formats text as Discord large header.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as large header
 * @returns Text formatted as H1 header
 */
export function h1<T extends string>(text: T): H1<T> {
  return `# ${text}`;
}

/**
 * @description Formats text as Discord medium header.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as medium header
 * @returns Text formatted as H2 header
 */
export function h2<T extends string>(text: T): H2<T> {
  return `## ${text}`;
}

/**
 * @description Formats text as Discord small header.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as small header
 * @returns Text formatted as H3 header
 */
export function h3<T extends string>(text: T): H3<T> {
  return `### ${text}`;
}

/**
 * @description Formats text as Discord subheading.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as subheading
 * @returns Text formatted as subheading
 */
export function subheading<T extends string>(text: T): Subheading<T> {
  return `-# ${text}`;
}

/**
 * @description Creates Discord hyperlink with text and URL.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Display text for the link
 * @param url - Target URL for the link
 * @returns Formatted hyperlink
 */
export function link<T extends string, U extends string>(text: T, url: U): Link<T, U> {
  return `[${text}](${url})`;
}

/**
 * @description Creates Discord hyperlink with hover tooltip.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Display text for the link
 * @param url - Target URL for the link
 * @param tooltip - Tooltip text shown on hover
 * @returns Formatted hyperlink with tooltip
 */
export function linkWithTooltip<T extends string, U extends string, H extends string>(
  text: T,
  url: U,
  tooltip: H,
): LinkWithTooltip<T, U, H> {
  return `[${text}](${url} "${tooltip}")`;
}

/**
 * @description Formats text as Discord inline code.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as inline code
 * @returns Text wrapped in backticks for code display
 */
export function code<T extends string>(text: T): Code<T> {
  return `\`${text}\``;
}

/**
 * @description Formats text as Discord code block with syntax highlighting.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Code content to format
 * @param language - Programming language for syntax highlighting
 * @returns Formatted code block with syntax highlighting
 */
export function codeBlock<T extends string, L extends CodeLanguage = "plaintext">(
  text: T,
  language: L = "plaintext" as L,
): CodeBlock<T, L> {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * @description Formats text as Discord single-line quote.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as quote
 * @returns Text formatted as single-line quote
 */
export function quote<T extends string>(text: T): Quote<T> {
  return `> ${text}`;
}

/**
 * @description Formats text as Discord multi-line quote block.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as quote block
 * @returns Text formatted as multi-line quote block
 */
export function quoteBlock<T extends string>(text: T): QuoteBlock<T> {
  return `>>> ${text}`;
}

/**
 * @description Formats text as Discord bullet point list item.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as bullet point
 * @returns Text formatted as bullet point list item
 */
export function bulletPoint<T extends string>(text: T): BulletPoint<T> {
  return `- ${text}`;
}

/**
 * @description Formats text as Discord numbered list item.
 * @see {@link https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline}
 * @param text - Text to format as numbered point
 * @param number - Number for the list item
 * @returns Text formatted as numbered list item
 */
export function numberedPoint<T extends string, N extends number>(
  text: T,
  number: N,
): NumberedPoint<T, N> {
  return `${number}. ${text}`;
}

/**
 * @description Formats Discord user mention using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 * @param userId - Discord user snowflake ID
 * @returns Formatted user mention
 */
export function formatUser<T extends string>(userId: T): FormattedUser<T> {
  return `<@${userId}>`;
}

/**
 * @description Formats Discord channel mention using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 * @param channelId - Discord channel snowflake ID
 * @returns Formatted channel mention
 */
export function formatChannel<T extends string>(channelId: T): FormattedChannel<T> {
  return `<#${channelId}>`;
}

/**
 * @description Formats Discord role mention using snowflake ID.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 * @param roleId - Discord role snowflake ID
 * @returns Formatted role mention
 */
export function formatRole<T extends string>(roleId: T): FormattedRole<T> {
  return `<@&${roleId}>`;
}

/**
 * @description Formats Discord slash command mention with optional subcommands.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 * @param commandName - Name of the slash command
 * @param commandId - Discord command snowflake ID
 * @param subCommandName - Optional subcommand name
 * @param subCommandGroupName - Optional subcommand group name
 * @returns Formatted slash command mention
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
 * @description Formats Discord custom emoji for static and animated emojis.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 * @param emojiName - Name of the custom emoji
 * @param emojiId - Discord emoji snowflake ID
 * @param animated - Whether the emoji is animated
 * @returns Formatted custom emoji
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
 * @description Formats Discord timestamp with optional display style.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 * @param timestamp - Unix timestamp in seconds
 * @param style - Optional timestamp display style
 * @returns Formatted Discord timestamp
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
 * @description Formats Discord guild navigation link for server features.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation}
 * @param id - Guild or resource snowflake ID
 * @param type - Navigation type or linked role ID
 * @returns Formatted guild navigation link
 */
export function formatGuildNavigation<T extends string>(
  id: T,
  type: GuildNavigationType,
): FormattedGuildNavigation<T> {
  return `<${id}:${type}>`;
}
