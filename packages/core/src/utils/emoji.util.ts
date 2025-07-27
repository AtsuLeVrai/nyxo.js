import type { EmojiEntity } from "../entities/index.js";

/**
 * Input types that can be resolved to an emoji.
 * Supports Unicode, Discord format, or emoji objects.
 *
 * @public
 */
export type EmojiResolvable =
  | string
  | Pick<EmojiEntity, "id" | "name" | "animated">
  | Partial<Pick<EmojiEntity, "id" | "name" | "animated">>;

/**
 * Encodes emoji for Discord API URLs.
 *
 * @param emoji - Emoji to encode
 * @returns Encoded emoji for API
 *
 * @example
 * ```typescript
 * encodeEmoji('🔥'); // '%F0%9F%94%A5'
 * encodeEmoji({ name: 'discord', id: '1234567890' }); // 'discord%3A1234567890'
 * encodeEmoji('<:megumin:1234567890>'); // 'megumin%3A1234567890'
 * ```
 *
 * @public
 */
export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);

  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  return encodeURIComponent(resolved.name as string);
}

/**
 * Decodes URL-encoded emoji.
 *
 * @param encoded - URL-encoded emoji
 * @returns Decoded emoji object
 *
 * @example
 * ```typescript
 * decodeEmoji('%F0%9F%94%A5'); // { name: '🔥', id: null, animated: false }
 * decodeEmoji('discord%3A1234567890'); // { name: 'discord', id: '1234567890', animated: false }
 * ```
 *
 * @public
 */
export function decodeEmoji(
  encoded: string,
): Pick<EmojiEntity, "id" | "name" | "animated"> {
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

/**
 * Resolves different emoji formats to uniform object.
 *
 * @param emoji - Emoji to resolve
 * @returns Normalized emoji object
 *
 * @example
 * ```typescript
 * resolveEmoji('🔥'); // { name: '🔥', id: null, animated: false }
 * resolveEmoji('<:discord:1234567890>'); // { name: 'discord', id: '1234567890', animated: false }
 * resolveEmoji('<a:blob:9876543210>'); // { name: 'blob', id: '9876543210', animated: true }
 * ```
 *
 * @public
 */
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
