import type { EmojiEntity } from "../resources/index.js";

export type EmojiResolvable =
  | string
  | Pick<EmojiEntity, "id" | "name" | "animated">
  | Partial<Pick<EmojiEntity, "id" | "name" | "animated">>;

export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }
  return encodeURIComponent(resolved.name as string);
}

export function decodeEmoji(encoded: string): Pick<EmojiEntity, "id" | "name" | "animated"> {
  const decoded = decodeURIComponent(encoded);
  const customEmojiMatch = decoded.match(/^(.+):(\d+)$/);
  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1] as string,
      id: customEmojiMatch[2] as string,
      animated: false,
    };
  }
  return {
    name: decoded,
    id: null,
    animated: false,
  };
}

export function resolveEmoji(
  emoji: EmojiResolvable,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
  if (typeof emoji !== "string" && "name" in emoji) {
    return {
      name: String(emoji.name),
      id: emoji.id ?? null,
      animated: emoji.animated ?? false,
    };
  }
  if (typeof emoji === "string") {
    const customEmojiMatch = emoji.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
    if (customEmojiMatch) {
      return {
        name: customEmojiMatch[2] as string,
        id: customEmojiMatch[3] as string,
        animated: customEmojiMatch[1] === "a",
      };
    }
    const plainCustomEmojiMatch = emoji.match(/^([a-zA-Z0-9_]+):(\d+)$/);
    if (plainCustomEmojiMatch) {
      return {
        name: plainCustomEmojiMatch[1] as string,
        id: plainCustomEmojiMatch[2] as string,
        animated: false,
      };
    }
    return {
      name: emoji,
      id: null,
      animated: false,
    };
  }
  throw new Error(`Invalid emoji format: ${String(emoji)}`);
}
