export function italics(text: string): `*${string}*` {
  return `*${text}*`;
}

export function bold(text: string): `**${string}**` {
  return `**${text}**`;
}

export function underline(text: string): `__${string}__` {
  return `__${text}__`;
}

export function strikethrough(text: string): `~~${string}~~` {
  return `~~${text}~~`;
}

export function spoiler(text: string): `||${string}||` {
  return `||${text}||`;
}

export function bigHeader(text: string): `# ${string}` {
  return `# ${text}`;
}

export function smallerHeader(text: string): `## ${string}` {
  return `## ${text}`;
}

export function evenSmallerHeader(text: string): `### ${string}` {
  return `### ${text}`;
}

export function subText(text: string): `-# ${string}` {
  return `-# ${text}`;
}

export function link(
  text: string,
  url: string | URL,
): `[${string}](${string})` {
  return `[${text}](${url instanceof URL ? url.toString() : url})`;
}

export function code(text: string): `\`${string}\`` {
  return `\`${text}\``;
}

export function codeBlock(
  text: string,
  language?: string,
): `\`\`\`${string}\n${string}\n\`\`\`` {
  return `\`\`\`${language ?? ""}\n${text}\n\`\`\``;
}

export function quote(text: string): `> ${string}` {
  return `> ${text}`;
}

export function quoteBlock(text: string): `>>> ${string}` {
  return `>>> ${text}`;
}
