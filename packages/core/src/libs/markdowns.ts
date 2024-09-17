/**
 * Formats text in italics.
 * @param {string} text - The text to format.
 * @returns {`_${string}_`} The formatted text.
 */
export function italics(text: string): `_${string}_` {
    return `_${text}_`;
}

/**
 * Formats text in bold.
 * @param {string} text - The text to format.
 * @returns {`**${string}**`} The formatted text.
 */
export function bold(text: string): `**${string}**` {
    return `**${text}**`;
}

/**
 * Formats text with underline.
 * @param {string} text - The text to format.
 * @returns {`__${string}__`} The formatted text.
 */
export function underline(text: string): `__${string}__` {
    return `__${text}__`;
}

/**
 * Formats text with strikethrough.
 * @param {string} text - The text to format.
 * @returns {`~~${string}~~`} The formatted text.
 */
export function strikethrough(text: string): `~~${string}~~` {
    return `~~${text}~~`;
}

/**
 * Formats text as a spoiler.
 * @param {string} text - The text to format.
 * @returns {`||${string}||`} The formatted text.
 */
export function spoiler(text: string): `||${string}||` {
    return `||${text}||`;
}

/**
 * Formats text as a big header.
 * @param {string} text - The text to format.
 * @returns {`# ${string}`} The formatted text.
 */
export function bigHeader(text: string): `# ${string}` {
    return `# ${text}`;
}

/**
 * Formats text as a small header.
 * @param {string} text - The text to format.
 * @returns {`## ${string}`} The formatted text.
 */
export function smallHeader(text: string): `## ${string}` {
    return `## ${text}`;
}

/**
 * Formats text as an even smaller header.
 * @param {string} text - The text to format.
 * @returns {`### ${string}`} The formatted text.
 */
export function evenSmallerHeader(text: string): `### ${string}` {
    return `### ${text}`;
}

/**
 * Formats text as a subheader.
 * @param {string} text - The text to format.
 * @returns {`-# ${string}`} The formatted text.
 */
export function subHeader(text: string): `-# ${string}` {
    return `-# ${text}`;
}

/**
 * Formats text as a link.
 * @param {string} text - The text to display.
 * @param {string} url - The URL the link points to.
 * @returns {`[${string}](${string})`} The formatted link.
 */
export function link(text: string, url: string): `[${string}](${string})` {
    return `[${text}](${url})`;
}

/**
 * Formats text as inline code.
 * @param {string} text - The text to format.
 * @returns {`\`${string}\``} The formatted text.
 */
export function code(text: string): `\`${string}\`` {
    return `\`${text}\``;
}

/**
 * Formats text as a code block.
 * @param {string} text - The text to format.
 * @param {string} [language] - The language of the code block.
 * @returns {`\`\`\`${string}\n${string}\n\`\`\``} The formatted code block.
 */
export function codeBlock(text: string, language?: string): `\`\`\`${string}\n${string}\n\`\`\`` {
    return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Formats text as a quote.
 * @param {string} text - The text to format.
 * @returns {`> ${string}`} The formatted quote.
 */
export function quote(text: string): `> ${string}` {
    return `> ${text}`;
}

/**
 * Formats text as a block quote.
 * @param {string} text - The text to format.
 * @returns {`>>> ${string}`} The formatted block quote.
 */
export function quoteBlock(text: string): `>>> ${string}` {
    return `>>> ${text}`;
}
