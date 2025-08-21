import type { Snowflake } from "../common/index.js";

export type Italics<T extends string> = `*${T}*`;
export function italics<T extends string>(text: T): Italics<T> {
  return `*${text}*`;
}

export type ItalicsAlt<T extends string> = `_${T}_`;
export function italicsAlt<T extends string>(text: T): ItalicsAlt<T> {
  return `_${text}_`;
}

export type Bold<T extends string> = `**${T}**`;
export function bold<T extends string>(text: T): Bold<T> {
  return `**${text}**`;
}

export type Underline<T extends string> = `__${T}__`;
export function underline<T extends string>(text: T): Underline<T> {
  return `__${text}__`;
}

export type Strikethrough<T extends string> = `~~${T}~~`;
export function strikethrough<T extends string>(text: T): Strikethrough<T> {
  return `~~${text}~~`;
}

export type Spoiler<T extends string> = `||${T}||`;
export function spoiler<T extends string>(text: T): Spoiler<T> {
  return `||${text}||`;
}

export type BigHeader<T extends string> = `# ${T}`;
export function bigHeader<T extends string>(text: T): BigHeader<T> {
  return `# ${text}`;
}

export type SmallerHeader<T extends string> = `## ${T}`;
export function smallerHeader<T extends string>(text: T): SmallerHeader<T> {
  return `## ${text}`;
}

export type EvenSmallerHeader<T extends string> = `### ${T}`;
export function evenSmallerHeader<T extends string>(text: T): EvenSmallerHeader<T> {
  return `### ${text}`;
}

export type SubHeader<T extends string> = `-# ${T}`;
export function subText<T extends string>(text: T): SubHeader<T> {
  return `-# ${text}`;
}

export type Link<TText extends string, TUrl extends string> = `[${TText}](${TUrl})`;
export function link<TText extends string, TUrl extends string>(
  text: TText,
  url: TUrl,
): Link<TText, TUrl> {
  return `[${text}](${url})`;
}

export type MaskedLink<
  TText extends string,
  TUrl extends string,
  THover extends string,
> = `[${TText}](${TUrl} "${THover}")`;
export function maskedLink<TText extends string, TUrl extends string, THover extends string>(
  text: TText,
  url: TUrl,
  hover: THover,
): MaskedLink<TText, TUrl, THover> {
  return `[${text}](${url} "${hover}")`;
}

export type Code<T extends string> = `\`${T}\``;
export function code<T extends string>(text: T): Code<T> {
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

export type CodeBlock<
  T extends string,
  L extends ProgrammingLanguageType,
> = `\`\`\`${L}\n${T}\n\`\`\``;
export function codeBlock<T extends string, L extends ProgrammingLanguageType = "plaintext">(
  text: T,
  language: L = "plaintext" as L,
): CodeBlock<T, L> {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

export type Quote<T extends string> = `> ${T}`;
export function quote<T extends string>(text: T): Quote<T> {
  return `> ${text}`;
}

export type QuoteBlock<T extends string> = `>>> ${T}`;
export function quoteBlock<T extends string>(text: T): QuoteBlock<T> {
  return `>>> ${text}`;
}

export type BulletPoint<T extends string> = `- ${T}`;
export function bulletPoint<T extends string>(text: T): BulletPoint<T> {
  return `- ${text}`;
}

export type NumberedPoint<T extends string, N extends number> = `${N}. ${T}`;
export function numberedPoint<T extends string, N extends number>(
  text: T,
  number: N,
): NumberedPoint<T, N> {
  return `${number}. ${text}`;
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
  | `</${string}:${Snowflake}>`
  | `</${string} ${string}:${Snowflake}>`
  | `</${string} ${string} ${string}:${Snowflake}>`;
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

export type FormattedCustomEmoji = `<:${string}:${Snowflake}>` | `<a:${string}:${Snowflake}>`;
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

export enum TimestampStyle {
  ShortTime = "t",
  LongTime = "T",
  ShortDate = "d",
  LongDate = "D",
  ShortDateTime = "f",
  LongDateTime = "F",
  RelativeTime = "R",
}

export type FormattedTimestamp = `<t:${number}>` | `<t:${number}:${TimestampStyle}>`;
export function formatTimestamp(timestamp: number, style?: TimestampStyle): FormattedTimestamp {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }

  return `<t:${timestamp}>`;
}

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
