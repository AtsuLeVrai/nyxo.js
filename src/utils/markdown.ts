export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${string}`;

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

export type Italic<T extends string> = `*${T}*`;
export type ItalicAlt<T extends string> = `_${T}_`;
export type Bold<T extends string> = `**${T}**`;
export type Underline<T extends string> = `__${T}__`;
export type Strikethrough<T extends string> = `~~${T}~~`;
export type Spoiler<T extends string> = `||${T}||`;

export type H1<T extends string> = `# ${T}`;
export type H2<T extends string> = `## ${T}`;
export type H3<T extends string> = `### ${T}`;
export type Subheading<T extends string> = `-# ${T}`;

export type Link<T extends string, U extends string> = `[${T}](${U})`;
export type LinkWithTooltip<
  T extends string,
  U extends string,
  H extends string,
> = `[${T}](${U} "${H}")`;

export type Code<T extends string> = `\`${T}\``;
export type CodeBlock<T extends string, L extends CodeLanguage> = `\`\`\`${L}\n${T}\n\`\`\``;

export type Quote<T extends string> = `> ${T}`;
export type QuoteBlock<T extends string> = `>>> ${T}`;

export type BulletPoint<T extends string> = `- ${T}`;
export type NumberedPoint<T extends string, N extends number> = `${N}. ${T}`;

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

export function italic<T extends string>(text: T): Italic<T> {
  return `*${text}*`;
}

export function italicAlt<T extends string>(text: T): ItalicAlt<T> {
  return `_${text}_`;
}

export function bold<T extends string>(text: T): Bold<T> {
  return `**${text}**`;
}

export function underline<T extends string>(text: T): Underline<T> {
  return `__${text}__`;
}

export function strikethrough<T extends string>(text: T): Strikethrough<T> {
  return `~~${text}~~`;
}

export function spoiler<T extends string>(text: T): Spoiler<T> {
  return `||${text}||`;
}

export function h1<T extends string>(text: T): H1<T> {
  return `# ${text}`;
}

export function h2<T extends string>(text: T): H2<T> {
  return `## ${text}`;
}

export function h3<T extends string>(text: T): H3<T> {
  return `### ${text}`;
}

export function subheading<T extends string>(text: T): Subheading<T> {
  return `-# ${text}`;
}

export function link<T extends string, U extends string>(text: T, url: U): Link<T, U> {
  return `[${text}](${url})`;
}

export function linkWithTooltip<T extends string, U extends string, H extends string>(
  text: T,
  url: U,
  tooltip: H,
): LinkWithTooltip<T, U, H> {
  return `[${text}](${url} "${tooltip}")`;
}

export function code<T extends string>(text: T): Code<T> {
  return `\`${text}\``;
}

export function codeBlock<T extends string, L extends CodeLanguage = "plaintext">(
  text: T,
  language: L = "plaintext" as L,
): CodeBlock<T, L> {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

export function quote<T extends string>(text: T): Quote<T> {
  return `> ${text}`;
}

export function quoteBlock<T extends string>(text: T): QuoteBlock<T> {
  return `>>> ${text}`;
}

export function bulletPoint<T extends string>(text: T): BulletPoint<T> {
  return `- ${text}`;
}

export function numberedPoint<T extends string, N extends number>(
  text: T,
  number: N,
): NumberedPoint<T, N> {
  return `${number}. ${text}`;
}

export function formatUser<T extends string>(userId: T): FormattedUser<T> {
  return `<@${userId}>`;
}

export function formatChannel<T extends string>(channelId: T): FormattedChannel<T> {
  return `<#${channelId}>`;
}

export function formatRole<T extends string>(roleId: T): FormattedRole<T> {
  return `<@&${roleId}>`;
}

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

export function formatTimestamp<T extends number>(
  timestamp: T,
  style?: TimestampStyle,
): FormattedTimestamp<T> {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }
  return `<t:${timestamp}>`;
}

export function formatGuildNavigation<T extends string>(
  id: T,
  type: GuildNavigationType,
): FormattedGuildNavigation<T> {
  return `<${id}:${type}>`;
}
