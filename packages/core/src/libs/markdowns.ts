/**
 * Italicizes the text.
 *
 * @param text - The text to be italicized
 * @returns The text surrounded by single underscores
 */
export function italic(text: string): `_${string}_` {
    return `_${text}_`;
}

/**
 * Bolds the text.
 *
 * @param text - The text to be bolded
 * @returns The text surrounded by double asterisks
 */
export function bold(text: string): `**${string}**` {
    return `**${text}**`;
}

/**
 * Underlines the text.
 *
 * @param text - The text to be underlined
 * @returns The text surrounded by double underscores
 */
export function underline(text: string): `__${string}__` {
    return `__${text}__`;
}

/**
 * Strikes through the text.
 *
 * @param text - The text to be struck through
 * @returns The text surrounded by double tildes
 */
export function strikeThrough(text: string): `~~${string}~~` {
    return `~~${text}~~`;
}

/**
 * Creates a spoiler (hidden text).
 *
 * @param text - The text to be hidden
 * @returns The text surrounded by double vertical bars
 */
export function spoiler(text: string): `||${string}||` {
    return `||${text}||`;
}

/**
 * Creates a large header (level 1).
 *
 * @param text - The header text
 * @returns The text preceded by a hash and a space
 */
export function bigHeader(text: string): `# ${string}` {
    return `# ${text}`;
}

/**
 * Creates a medium header (level 2).
 *
 * @param text - The header text
 * @returns The text preceded by two hashes and a space
 */
export function smallHeader(text: string): `## ${string}` {
    return `## ${text}`;
}

/**
 * Creates a small header (level 3).
 *
 * @param text - The header text
 * @returns The text preceded by three hashes and a space
 */
export function evenSmallerHeader(text: string): `### ${string}` {
    return `### ${text}`;
}

/**
 * Creates a sub-text.
 *
 * @param text - The text to be formatted as sub-text
 * @returns The text preceded by a dash, a hash, and a space
 */
export function subText(text: string): `-# ${string}` {
    return `-# ${text}`;
}

/**
 * Creates a hyperlink.
 *
 * @param url - The URL of the link
 * @param text - The text to display for the link
 * @returns The link formatted in Markdown
 */
export function link(url: string, text: string): `[${string}](${string})` {
    return `[${text}](${url})`;
}

/**
 * Formats the text as inline code.
 *
 * @param text - The text to be formatted as code
 * @returns The text surrounded by single backticks
 */
export function code(text: string): `\`${string}\`` {
    return `\`${text}\``;
}

/**
 * Creates a code block with syntax highlighting.
 *
 * @param language - The programming language for syntax highlighting
 * @param text - The code to be displayed in the block
 * @returns The code block formatted in Markdown
 */
export function codeBlock(language: string, text: string): `\`\`\`${string}\n${string}\n\`\`\`` {
    return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Creates a simple quote.
 *
 * @param text - The text to be quoted
 * @returns The text preceded by a greater-than sign and a space
 */
export function quote(text: string): `> ${string}` {
    return `> ${text}`;
}

/**
 * Creates a block quote.
 *
 * @param text - The text to be quoted
 * @returns The text preceded by three greater-than signs and a space
 */
export function blockQuote(text: string): `>>> ${string}` {
    return `>>> ${text}`;
}
