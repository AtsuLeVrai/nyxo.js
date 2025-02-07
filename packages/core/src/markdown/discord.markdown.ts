import type { Snowflake } from "../managers/index.js";

export type Italics = `*${string}*`;
export function italics(text: string): Italics {
  return `*${text}*`;
}

export type Bold = `**${string}**`;
export function bold(text: string): Bold {
  return `**${text}**`;
}

export type Underline = `__${string}__`;
export function underline(text: string): Underline {
  return `__${text}__`;
}

export type Strikethrough = `~~${string}~~`;
export function strikethrough(text: string): Strikethrough {
  return `~~${text}~~`;
}

export type Spoiler = `||${string}||`;
export function spoiler(text: string): Spoiler {
  return `||${text}||`;
}

export type BigHeader = `# ${string}`;
export function bigHeader(text: string): BigHeader {
  return `# ${text}`;
}

export type SmallerHeader = `## ${string}`;
export function smallerHeader(text: string): SmallerHeader {
  return `## ${text}`;
}

export type EvenSmallerHeader = `### ${string}`;
export function evenSmallerHeader(text: string): EvenSmallerHeader {
  return `### ${text}`;
}

export type SubHeader = `-# ${string}`;
export function subText(text: string): SubHeader {
  return `-# ${text}`;
}

export type Link = `[${string}](${string})`;
export function link(text: string, url: string): Link {
  return `[${text}](${url})`;
}

export type Code = `\`${string}\``;
export function code(text: string): Code {
  return `\`${text}\``;
}

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

export type CodeBlock = `\`\`\`${ProgrammingLanguageType}\n${string}\n\`\`\``;
export function codeBlock(
  text: string,
  language: ProgrammingLanguageType = "plaintext",
): CodeBlock {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

export type Quote = `> ${string}`;
export function quote(text: string): Quote {
  return `> ${text}`;
}

export type QuoteBlock = `>>> ${string}`;
export function quoteBlock(text: string): QuoteBlock {
  return `>>> ${text}`;
}

export type FormattedUser = `<@${Snowflake}>`;
export function formatUser(userId: Snowflake): FormattedUser {
  return `<@${userId}>`;
}

export type FormattedChannel = `<#${Snowflake}>`;
export function formatChannel(channelId: Snowflake): FormattedChannel {
  return `<#${channelId}>`;
}

export type FormattedRole = `<@&${Snowflake}>`;
export function formatRole(roleId: Snowflake): FormattedRole {
  return `<@&${roleId}>`;
}

export type FormattedSlashCommand =
  | `</${string}:${Snowflake}`
  | `</${string} ${string}:${Snowflake}`
  | `</${string} ${string} ${string}:${Snowflake}`;
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandGroupName?: string,
  subCommandName?: string,
): FormattedSlashCommand {
  if (subCommandGroupName && subCommandName) {
    return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>` as `</${string} ${string} ${string}:${Snowflake}`;
  }

  if (subCommandName) {
    return `</${commandName} ${subCommandName}:${commandId}>` as `</${string} ${string}:${Snowflake}`;
  }

  return `</${commandName}:${commandId}>` as `</${string}:${Snowflake}`;
}

export type FormattedCustomEmoji =
  | `<:${string}:${Snowflake}`
  | `<a:${string}:${Snowflake}`;
export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
  animated?: boolean,
): FormattedCustomEmoji {
  if (animated) {
    return `<a:${emojiName}:${emojiId}>` as `<a:${string}:${Snowflake}`;
  }

  return `<:${emojiName}:${emojiId}>` as `<:${string}:${Snowflake}`;
}

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export enum TimestampStyle {
  ShortTime = "t",
  LongTime = "T",
  ShortDate = "d",
  LongDate = "D",
  ShortDateTime = "f",
  LongDateTime = "F",
  RelativeTime = "R",
}

export type FormattedTimestamp =
  | `<t:${number}>`
  | `<t:${number}:${TimestampStyle}>`;
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
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${Snowflake}`;

export type FormattedGuildNavigation = `<${Snowflake}:${GuildNavigationType}>`;
export function formatGuildNavigation(
  id: Snowflake,
  type: GuildNavigationType,
): FormattedGuildNavigation {
  return `<${id}:${type}>`;
}
