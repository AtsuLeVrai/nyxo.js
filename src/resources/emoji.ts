import type { SetNonNullable } from "type-fest";
import type { FileInput } from "../core/index.js";
import type { UserObject } from "./user.js";

export interface EmojiObject {
  id: string | null;
  name: string | null;
  roles?: string[];
  user?: UserObject;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export type EmojiResolvable =
  | string
  | Pick<EmojiObject, "id" | "name" | "animated">
  | Partial<Pick<EmojiObject, "id" | "name" | "animated">>;

export interface ListApplicationEmojisResponse {
  items: EmojiObject[];
}

export interface CreateGuildEmojiJSONParams
  extends SetNonNullable<Pick<EmojiObject, "name" | "roles">> {
  image: FileInput;
}

export interface ModifyGuildEmojiJSONParams
  extends Partial<Pick<CreateGuildEmojiJSONParams, "name">> {
  roles?: string[] | null;
}

export type CreateApplicationEmojiJSONParams = Omit<CreateGuildEmojiJSONParams, "roles">;

export type ModifyApplicationEmojiJSONParams = Pick<CreateApplicationEmojiJSONParams, "name">;

/**
 * Checks if an emoji is animated
 * @param emoji The emoji to check
 * @returns true if the emoji is animated
 */
export function isAnimatedEmoji(emoji: EmojiObject): boolean {
  return emoji.animated === true;
}

/**
 * Checks if an emoji is available for use
 * @param emoji The emoji to check
 * @returns true if the emoji is available
 */
export function isEmojiAvailable(emoji: EmojiObject): boolean {
  return emoji.available !== false;
}

/**
 * Checks if an emoji is managed by an integration
 * @param emoji The emoji to check
 * @returns true if the emoji is managed
 */
export function isManagedEmoji(emoji: EmojiObject): boolean {
  return emoji.managed === true;
}

/**
 * Checks if an emoji is a custom emoji (has an ID)
 * @param emoji The emoji to check
 * @returns true if it's a custom emoji
 */
export function isCustomEmoji(emoji: EmojiObject): boolean {
  return emoji.id !== null;
}

/**
 * Checks if an emoji is a standard Unicode emoji
 * @param emoji The emoji to check
 * @returns true if it's a standard emoji
 */
export function isStandardEmoji(emoji: EmojiObject): boolean {
  return emoji.id === null;
}

/**
 * Checks if an emoji requires colons for usage
 * @param emoji The emoji to check
 * @returns true if colons are required
 */
export function requiresColons(emoji: EmojiObject): boolean {
  return emoji.require_colons === true;
}

/**
 * Checks if an emoji has role restrictions
 * @param emoji The emoji to check
 * @returns true if the emoji is restricted to certain roles
 */
export function hasRoleRestrictions(emoji: EmojiObject): boolean {
  return emoji.roles !== undefined && emoji.roles.length > 0;
}

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

/**
 * Decodes an encoded emoji string from a reaction back into its components
 * @param encoded The encoded emoji string (e.g., "name:id" or a Unicode emoji)
 * @returns An object with id, name, and animated properties
 * @throws TypeError if the encoded format is invalid
 */
export function decodeEmojiFromReaction(
  encoded: string,
): Pick<EmojiObject, "id" | "name" | "animated"> {
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
 * Resolves various emoji input formats into a standardized object
 * @param emoji The emoji input (string or object)
 * @returns An object with id, name, and animated properties
 * @throws TypeError if the input format is invalid
 */
export function resolveEmoji(
  emoji: EmojiResolvable,
): Pick<EmojiObject, "id" | "name" | "animated"> {
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
