import type { FileInput, SetNonNullable } from "../utils/index.js";
import type { UserObject } from "./user.js";

/**
 * Discord emoji object representing both standard Unicode emoji and custom guild emoji.
 * Supports static and animated custom emoji with role-based access restrictions.
 *
 * Custom emoji have snowflake IDs, while standard Unicode emoji have null IDs.
 * Premium emoji with subscription roles count toward a separate limit of 25 per guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object} for emoji object specification
 */
export interface EmojiObject {
  /** Unique emoji identifier (null for standard Unicode emoji) */
  readonly id: string | null;
  /** Emoji name (can be null in reaction objects for deleted custom emoji) */
  readonly name: string | null;
  /** Array of role IDs allowed to use this emoji */
  readonly roles?: string[];
  /** User who created this emoji (if accessible) */
  readonly user?: UserObject;
  /** Whether emoji must be wrapped in colons for usage */
  readonly require_colons?: boolean;
  /** Whether emoji is managed by an integration */
  readonly managed?: boolean;
  /** Whether emoji is animated (GIF format) */
  readonly animated?: boolean;
  /** Whether emoji is available for use (may be false due to lost Server Boosts) */
  readonly available?: boolean;
}

/**
 * Response structure for application emoji list endpoint.
 * Contains emoji objects owned by the application in an items array.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis} for list application emojis endpoint
 */
export interface ListApplicationEmojisResponse {
  /** Array of emoji objects owned by the application */
  readonly items: EmojiObject[];
}

/**
 * Request parameters for creating a new guild emoji.
 * Requires CREATE_GUILD_EXPRESSIONS permission and supports role restrictions.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji} for create guild emoji endpoint
 */
export interface CreateGuildEmojiJSONParams
  extends SetNonNullable<Pick<EmojiObject, "name" | "roles">> {
  /** 128x128 emoji image data (max 256 KiB, supports JPEG/PNG/GIF/WebP/AVIF) */
  readonly image: FileInput;
}

/**
 * Request parameters for modifying an existing guild emoji.
 * All parameters are optional, allowing partial updates to emoji properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji} for modify guild emoji endpoint
 */
export interface ModifyGuildEmojiJSONParams
  extends Partial<Pick<CreateGuildEmojiJSONParams, "name">> {
  /** Role IDs allowed to use this emoji (null to remove restrictions) */
  readonly roles?: string[] | null;
}

/**
 * Request parameters for creating a new application emoji.
 * Application emoji can only be used by the owning application and don't require external emoji permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji} for create application emoji endpoint
 */
export type CreateApplicationEmojiJSONParams = Omit<CreateGuildEmojiJSONParams, "roles">;

/**
 * Request parameters for modifying an existing application emoji.
 * Currently only supports updating the emoji name.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji} for modify application emoji endpoint
 */
export type ModifyApplicationEmojiJSONParams = Pick<CreateApplicationEmojiJSONParams, "name">;

/**
 * Flexible emoji representation supporting various input formats for emoji resolution.
 * Accepts emoji strings, Discord format, Unicode emoji, or partial emoji objects.
 *
 * @see {@link resolveEmoji} for emoji resolution logic
 */
export type EmojiResolvable =
  | string
  | Pick<EmojiObject, "id" | "name" | "animated">
  | Partial<Pick<EmojiObject, "id" | "name" | "animated">>;

/**
 * Encodes emoji data for use in HTTP reaction endpoints.
 * Formats custom emoji as "name:id" and Unicode emoji as the emoji character.
 *
 * @param emoji - Emoji to encode for API requests
 * @returns URL-encoded emoji string for reaction endpoints
 * @throws {TypeError} When emoji format is invalid
 * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction} for reaction endpoint usage
 */
export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  return encodeURIComponent(resolved.name as string);
}

/**
 * Decodes emoji data from HTTP reaction endpoint responses.
 * Parses "name:id" format for custom emoji and plain strings for Unicode emoji.
 *
 * @param encoded - URL-encoded emoji string from API response
 * @returns Decoded emoji object with id, name, and animated properties
 * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions} for reaction response format
 */
export function decodeEmoji(encoded: string): Pick<EmojiObject, "id" | "name" | "animated"> {
  const ENCODED_CUSTOM_EMOJI_PATTERN = /^(.{2,32}):(\d{17,21})$/;

  const decoded = decodeURIComponent(encoded);
  const customEmojiMatch = decoded.match(ENCODED_CUSTOM_EMOJI_PATTERN);

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
 * Resolves various emoji input formats into a standardized emoji object.
 * Supports Discord format (&lt;:name:id&gt;), plain format (name:id), Unicode emoji, and objects.
 *
 * @param emoji - Input emoji in any supported format
 * @returns Resolved emoji object with id, name, and animated properties
 * @throws {TypeError} When emoji format is invalid or unrecognized
 * @see {@link EmojiResolvable} for supported input formats
 */
export function resolveEmoji(
  emoji: EmojiResolvable,
): Pick<EmojiObject, "id" | "name" | "animated"> {
  if (typeof emoji === "object" && emoji !== null && "name" in emoji) {
    return {
      name: String(emoji.name || ""),
      id: emoji.id ?? null,
      animated: emoji.animated ?? false,
    };
  }

  const DISCORD_CUSTOM_EMOJI_PATTERN = /<(a)?:([a-zA-Z0-9_]{2,32}):(\d{17,21})>/;
  if (typeof emoji === "string") {
    const discordFormatMatch = emoji.match(DISCORD_CUSTOM_EMOJI_PATTERN);
    if (discordFormatMatch) {
      return {
        name: discordFormatMatch[2] as string,
        id: discordFormatMatch[3] as string,
        animated: discordFormatMatch[1] === "a",
      };
    }

    const PLAIN_CUSTOM_EMOJI_PATTERN = /^([a-zA-Z0-9_]{2,32}):(\d{17,21})$/;
    const plainFormatMatch = emoji.match(PLAIN_CUSTOM_EMOJI_PATTERN);
    if (plainFormatMatch) {
      return {
        name: plainFormatMatch[1] as string,
        id: plainFormatMatch[2] as string,
        animated: false,
      };
    }

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
