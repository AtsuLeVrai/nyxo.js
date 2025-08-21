import type { Snowflake } from "../common/index.js";
import type { UserObject } from "./user.js";

export interface EmojiObject {
  id: Snowflake | null;
  name: string | null;
  roles?: Snowflake[];
  user?: UserObject;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export type ResolvedEmoji = Pick<EmojiObject, "id" | "name" | "animated">;

export type EmojiResolvable = string | ResolvedEmoji | Partial<ResolvedEmoji>;

const CUSTOM_EMOJI_REGEX = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;
const PLAIN_CUSTOM_EMOJI_REGEX = /^([a-zA-Z0-9_]+):(\d+)$/;
const DECODE_EMOJI_REGEX = /^(.+):(\d+)$/;

export function isCustomEmoji(emoji: ResolvedEmoji): emoji is ResolvedEmoji & { id: string } {
  return emoji.id !== null;
}

export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name ?? ""}:${resolved.id}`);
  }
  return encodeURIComponent(resolved.name ?? "");
}

export function decodeEmoji(encoded: string): ResolvedEmoji {
  const decoded = decodeURIComponent(encoded);
  const customEmojiMatch = decoded.match(DECODE_EMOJI_REGEX);
  if (customEmojiMatch) {
    return {
      name: customEmojiMatch[1] ?? null,
      id: customEmojiMatch[2] ?? null,
      animated: false,
    };
  }
  return {
    name: decoded,
    id: null,
    animated: false,
  };
}

export function resolveEmoji(emoji: EmojiResolvable): ResolvedEmoji {
  if (typeof emoji !== "string" && "name" in emoji) {
    return {
      name: emoji.name ?? null,
      id: emoji.id ?? null,
      animated: emoji.animated ?? false,
    };
  }
  if (typeof emoji === "string") {
    const customEmojiMatch = emoji.match(CUSTOM_EMOJI_REGEX);
    if (customEmojiMatch) {
      return {
        name: customEmojiMatch[2] ?? null,
        id: customEmojiMatch[3] ?? null,
        animated: customEmojiMatch[1] === "a",
      };
    }
    const plainCustomEmojiMatch = emoji.match(PLAIN_CUSTOM_EMOJI_REGEX);
    if (plainCustomEmojiMatch) {
      return {
        name: plainCustomEmojiMatch[1] ?? null,
        id: plainCustomEmojiMatch[2] ?? null,
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
