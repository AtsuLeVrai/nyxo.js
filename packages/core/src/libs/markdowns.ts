/**
 * Formats text in italics.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function italics(text: string): `_${string}_` {
    return `_${text}_`;
}

/**
 * Formats text in bold.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function bold(text: string): `**${string}**` {
    return `**${text}**`;
}

/**
 * Formats text with underline.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function underline(text: string): `__${string}__` {
    return `__${text}__`;
}

/**
 * Formats text with strikethrough.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function strikethrough(text: string): `~~${string}~~` {
    return `~~${text}~~`;
}

/**
 * Formats text as a spoiler.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function spoiler(text: string): `||${string}||` {
    return `||${text}||`;
}

/**
 * Formats text as a big header.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function bigHeader(text: string): `# ${string}` {
    return `# ${text}`;
}

/**
 * Formats text as a small header.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function smallHeader(text: string): `## ${string}` {
    return `## ${text}`;
}

/**
 * Formats text as an even smaller header.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function evenSmallerHeader(text: string): `### ${string}` {
    return `### ${text}`;
}

/**
 * Formats text as a subheader.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function subHeader(text: string): `-# ${string}` {
    return `-# ${text}`;
}

/**
 * Formats text as a link.
 *
 * @param text - The text to display.
 * @param url - The URL the link points to.
 * @returns The formatted link.
 */
export function link(text: string, url: string): `[${string}](${string})` {
    return `[${text}](${url})`;
}

/**
 * Formats text as inline code.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function code(text: string): `\`${string}\`` {
    return `\`${text}\``;
}

/**
 * Formats text as a code block.
 *
 * @param text - The text to format.
 * @param language - The language of the code block.
 * @returns The formatted text.
 */
export function codeBlock(text: string, language?: string): `\`\`\`${string}\n${string}\n\`\`\`` {
    return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Formats text as a quote.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function quote(text: string): `> ${string}` {
    return `> ${text}`;
}

/**
 * Formats text as a block quote.
 *
 * @param text - The text to format.
 * @returns The formatted text.
 */
export function quoteBlock(text: string): `>>> ${string}` {
    return `>>> ${text}`;
}
