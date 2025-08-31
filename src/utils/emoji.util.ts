import type { EmojiEntity } from "../resources/index.js";

export type EmojiResolvable =
  | string
  | Pick<EmojiEntity, "id" | "name" | "animated">
  | Partial<Pick<EmojiEntity, "id" | "name" | "animated">>;

// Pre-compiled regex patterns for performance optimization
const DISCORD_CUSTOM_EMOJI_PATTERN = /<(a)?:([a-zA-Z0-9_]{2,32}):(\d{17,21})>/;
const PLAIN_CUSTOM_EMOJI_PATTERN = /^([a-zA-Z0-9_]{2,32}):(\d{17,21})$/;
const ENCODED_CUSTOM_EMOJI_PATTERN = /^(.{2,32}):(\d{17,21})$/;

export function encodeEmojiForReaction(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);

  // Custom emoji: encode as "name:id"
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  // Unicode emoji: encode as-is
  return encodeURIComponent(resolved.name as string);
}

export function decodeEmojiFromReaction(
  encoded: string,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
  const decoded = decodeURIComponent(encoded);
  const customEmojiMatch = decoded.match(ENCODED_CUSTOM_EMOJI_PATTERN);

  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1] as string,
      id: customEmojiMatch[2] as string,
      animated: false, // API doesn't preserve animation state in reactions
    };
  }

  // Unicode emoji
  return {
    name: decoded,
    id: null,
    animated: false,
  };
}

export function resolveEmoji(
  emoji: EmojiResolvable,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
  // Handle emoji object input
  if (typeof emoji === "object" && emoji !== null && "name" in emoji) {
    return {
      name: String(emoji.name || ""),
      id: emoji.id ?? null,
      animated: emoji.animated ?? false,
    };
  }

  if (typeof emoji === "string") {
    // Discord custom emoji format: <a:name:id> or <:name:id>
    const discordFormatMatch = emoji.match(DISCORD_CUSTOM_EMOJI_PATTERN);
    if (discordFormatMatch) {
      return {
        name: discordFormatMatch[2] as string,
        id: discordFormatMatch[3] as string,
        animated: discordFormatMatch[1] === "a",
      };
    }

    // Plain custom emoji format: name:id
    const plainFormatMatch = emoji.match(PLAIN_CUSTOM_EMOJI_PATTERN);
    if (plainFormatMatch) {
      return {
        name: plainFormatMatch[1] as string,
        id: plainFormatMatch[2] as string,
        animated: false,
      };
    }

    // Unicode emoji or plain text (validate non-empty)
    if (emoji.length > 0) {
      return {
        name: emoji,
        id: null,
        animated: false,
      };
    }
  }

  throw new TypeError(
    `Invalid emoji format: ${String(emoji)}. Expected Unicode string, Discord format (<:name:id>), or emoji object.`,
  );
}
