/**
 * Wraps text in italic markdown syntax.
 *
 * @param text - The text to be italicized
 * @returns Text wrapped in single asterisks
 *
 * @example
 * ```typescript
 * italics('Hello') // Returns: *Hello*
 * ```
 */
export function italics(text: string): `*${string}*` {
  return `*${text}*`;
}

/**
 * Wraps text in bold markdown syntax.
 *
 * @param text - The text to be bolded
 * @returns Text wrapped in double asterisks
 *
 * @example
 * ```typescript
 * bold('Hello') // Returns: **Hello**
 * ```
 */
export function bold(text: string): `**${string}**` {
  return `**${text}**`;
}

/**
 * Wraps text in underline markdown syntax.
 *
 * @param text - The text to be underlined
 * @returns Text wrapped in double underscores
 *
 * @example
 * ```typescript
 * underline('Hello') // Returns: __Hello__
 * ```
 */
export function underline(text: string): `__${string}__` {
  return `__${text}__`;
}

/**
 * Wraps text in strikethrough markdown syntax.
 *
 * @param text - The text to be struck through
 * @returns Text wrapped in double tildes
 *
 * @example
 * ```typescript
 * strikethrough('Hello') // Returns: ~~Hello~~
 * ```
 */
export function strikethrough(text: string): `~~${string}~~` {
  return `~~${text}~~`;
}

/**
 * Wraps text in spoiler markdown syntax.
 *
 * @param text - The text to be marked as a spoiler
 * @returns Text wrapped in double pipes
 *
 * @example
 * ```typescript
 * spoiler('Hello') // Returns: ||Hello||
 * ```
 */
export function spoiler(text: string): `||${string}||` {
  return `||${text}||`;
}

/**
 * Creates a top-level (h1) markdown header.
 *
 * @param text - The header text
 * @returns Text prefixed with a single hash and space
 *
 * @example
 * ```typescript
 * bigHeader('Introduction') // Returns: # Introduction
 * ```
 */
export function bigHeader(text: string): `# ${string}` {
  return `# ${text}`;
}

/**
 * Creates a second-level (h2) markdown header.
 *
 * @param text - The header text
 * @returns Text prefixed with two hashes and space
 *
 * @example
 * ```typescript
 * smallerHeader('Features') // Returns: ## Features
 * ```
 */
export function smallerHeader(text: string): `## ${string}` {
  return `## ${text}`;
}

/**
 * Creates a third-level (h3) markdown header.
 *
 * @param text - The header text
 * @returns Text prefixed with three hashes and space
 *
 * @example
 * ```typescript
 * evenSmallerHeader('Details') // Returns: ### Details
 * ```
 */
export function evenSmallerHeader(text: string): `### ${string}` {
  return `### ${text}`;
}

/**
 * Creates a sub-text notation.
 *
 * @param text - The text to be formatted as sub-text
 * @returns Text prefixed with -# and space
 *
 * @example
 * ```typescript
 * subText('Note') // Returns: -# Note
 * ```
 */
export function subText(text: string): `-# ${string}` {
  return `-# ${text}`;
}

/**
 * Creates a markdown link.
 *
 * @param text - The link text to display
 * @param url - The URL to link to (string or URL object)
 * @returns Formatted markdown link
 *
 * @example
 * ```typescript
 * link('Google', 'https://google.com') // Returns: [Google](https://google.com)
 * link('Example', new URL('https://example.com')) // Returns: [Example](https://example.com)
 * ```
 */
export function link(
  text: string,
  url: string | URL,
): `[${string}](${string})` {
  return `[${text}](${url instanceof URL ? url.toString() : url})`;
}

/**
 * Wraps text in inline code markdown syntax.
 *
 * @param text - The text to be formatted as inline code
 * @returns Text wrapped in backticks
 *
 * @example
 * ```typescript
 * code('const x = 1') // Returns: `const x = 1`
 * ```
 */
export function code(text: string): `\`${string}\`` {
  return `\`${text}\``;
}

/**
 * Creates a markdown code block.
 *
 * @param text - The text to be formatted as a code block
 * @param language - Optional language identifier for syntax highlighting
 * @returns Text wrapped in triple backticks with optional language
 *
 * @example
 * ```typescript
 * codeBlock('const x = 1;', 'typescript')
 * // Returns:
 * // ```typescript
 * // const x = 1;
 * // ```
 *
 * codeBlock('Hello World')
 * // Returns:
 * // ```
 * // Hello World
 * // ```
 * ```
 */
export function codeBlock(
  text: string,
  language?: string,
): `\`\`\`${string}\n${string}\n\`\`\`` {
  return `\`\`\`${language ?? ""}\n${text}\n\`\`\``;
}

/**
 * Creates a single-line markdown quote.
 *
 * @param text - The text to be quoted
 * @returns Text prefixed with > and space
 *
 * @example
 * ```typescript
 * quote('Hello World') // Returns: > Hello World
 * ```
 */
export function quote(text: string): `> ${string}` {
  return `> ${text}`;
}

/**
 * Creates a markdown block quote.
 *
 * @param text - The text to be block quoted
 * @returns Text prefixed with >>> and space
 *
 * @example
 * ```typescript
 * quoteBlock('Hello World') // Returns: >>> Hello World
 * ```
 */
export function quoteBlock(text: string): `>>> ${string}` {
  return `>>> ${text}`;
}
