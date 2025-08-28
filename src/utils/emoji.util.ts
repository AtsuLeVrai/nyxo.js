import type { EmojiEntity } from "../resources/index.js";

/**
 * @description Flexible input types for Discord emoji resolution, supporting Unicode, custom emojis, and partial emoji objects.
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export type EmojiResolvable =
  | string
  | Pick<EmojiEntity, "id" | "name" | "animated">
  | Partial<Pick<EmojiEntity, "id" | "name" | "animated">>;

// Pre-compiled regex patterns for performance optimization
const DISCORD_CUSTOM_EMOJI_PATTERN = /<(a)?:([a-zA-Z0-9_]{2,32}):(\d{17,21})>/;
const PLAIN_CUSTOM_EMOJI_PATTERN = /^([a-zA-Z0-9_]{2,32}):(\d{17,21})$/;
const ENCODED_CUSTOM_EMOJI_PATTERN = /^(.{2,32}):(\d{17,21})$/;

/**
 * @description Encodes Discord emoji for URL-safe transmission in reaction API requests.
 * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
 *
 * @param emoji - Emoji to encode (Unicode string, Discord format, or emoji object)
 * @returns URL-encoded emoji string formatted for Discord reaction endpoints
 * @throws {TypeError} When emoji format cannot be resolved
 */
export function encodeEmojiForReaction(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);

  // Custom emoji: encode as "name:id"
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  // Unicode emoji: encode as-is
  return encodeURIComponent(resolved.name as string);
}

/**
 * @description Decodes URL-encoded emoji string from Discord API responses back to structured data.
 *
 * @param encoded - URL-encoded emoji string from Discord reaction endpoints
 * @returns Structured emoji object with name, ID, and animation properties
 */
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

/**
 * @description Resolves various Discord emoji input formats to normalized emoji object structure.
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 *
 * @param emoji - Input emoji in any supported format (Unicode, Discord format, or partial object)
 * @returns Normalized emoji object with name, ID, and animation properties
 * @throws {TypeError} When emoji input cannot be parsed or is in invalid format
 */
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
