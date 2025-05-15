import type { EmojiEntity } from "../entities/index.js";

/**
 * Types of input that can be resolved to an emoji
 */
export type EmojiResolvable =
  | string // Unicode emoji or Discord format (<:name:id>)
  | Pick<EmojiEntity, "id" | "name" | "animated"> // Already resolved emoji object
  | Partial<Pick<EmojiEntity, "id" | "name" | "animated">>; // Partial object

/**
 * Encodes an emoji for use in Discord API URLs.
 *
 * @param emoji - The emoji to encode (unicode, emoji object, or Discord format)
 * @returns The encoded emoji for the API
 *
 * @example
 * ```typescript
 * // Encode a Unicode emoji
 * encodeEmoji('🔥'); // '%F0%9F%94%A5'
 *
 * // Encode a custom emoji via object
 * encodeEmoji({ name: 'discord', id: '1234567890' }); // 'discord%3A1234567890'
 *
 * // Encode a custom emoji via Discord format
 * encodeEmoji('<:megumin:1234567890>'); // 'megumin%3A1234567890'
 * ```
 */
export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);

  // If the emoji has an ID (custom emoji), encode in name:id format
  if (resolved.id) {
    // Format: name:id (URL encoded)
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  // Otherwise it's a standard emoji, just encode the unicode character
  return encodeURIComponent(resolved.name as string);
}

/**
 * Decodes a URL-encoded emoji.
 *
 * @param encoded - The URL-encoded emoji
 * @returns The decoded emoji as an object
 *
 * @example
 * ```typescript
 * // Decode an encoded Unicode emoji
 * decodeEmoji('%F0%9F%94%A5'); // { name: '🔥', id: null, animated: false }
 *
 * // Decode an encoded custom emoji
 * decodeEmoji('discord%3A1234567890'); // { name: 'discord', id: '1234567890', animated: false }
 * ```
 */
export function decodeEmoji(
  encoded: string,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
  const decoded = decodeURIComponent(encoded);

  // Check if it's a custom emoji (name:id format)
  const customEmojiMatch = decoded.match(/^(.+):(\d+)$/);
  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1] as string,
      id: customEmojiMatch[2] as string,
      animated: false, // Can't determine from encoding alone
    };
  }

  // It's a standard emoji
  return {
    name: decoded,
    id: null,
    animated: false,
  };
}

/**
 * Resolves different emoji formats into a uniform ResolvedEmoji object.
 *
 * @param emoji - The emoji to resolve (unicode, emoji object, or Discord format)
 * @returns A normalized ResolvedEmoji object
 *
 * @example
 * ```typescript
 * // Resolve a Unicode emoji
 * resolveEmoji('🔥'); // { name: '🔥', id: null, animated: false }
 *
 * // Resolve a Discord format emoji
 * resolveEmoji('<:discord:1234567890>'); // { name: 'discord', id: '1234567890', animated: false }
 * resolveEmoji('<a:blob:9876543210>'); // { name: 'blob', id: '9876543210', animated: true }
 * ```
 */
export function resolveEmoji(
  emoji: EmojiResolvable,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
  // If it's already a complete emoji object
  if (typeof emoji !== "string" && "name" in emoji) {
    return {
      name: String(emoji.name),
      id: emoji.id ?? null,
      animated: emoji.animated ?? false,
    };
  }

  // If it's a string
  if (typeof emoji === "string") {
    // Check if it's a Discord format emoji <:name:id> or <a:name:id>
    const customEmojiMatch = emoji.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
    if (customEmojiMatch) {
      return {
        name: customEmojiMatch[2] as string,
        id: customEmojiMatch[3] as string,
        animated: customEmojiMatch[1] === "a",
      };
    }

    // Check for name:id format (used by the API)
    const plainCustomEmojiMatch = emoji.match(/^([a-zA-Z0-9_]+):(\d+)$/);
    if (plainCustomEmojiMatch) {
      return {
        name: plainCustomEmojiMatch[1] as string,
        id: plainCustomEmojiMatch[2] as string,
        animated: false, // Can't determine from this format
      };
    }

    // It's a standard emoji (unicode)
    return {
      name: emoji,
      id: null,
      animated: false,
    };
  }

  // If we get here, the input format is invalid
  throw new Error(`Invalid emoji format: ${String(emoji)}`);
}
