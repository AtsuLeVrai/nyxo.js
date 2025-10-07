import type { FileInput, SetNonNullable } from "../utils/index.js";
import type { UserObject } from "./user.js";

export interface EmojiObject {
  readonly id: string | null;

  readonly name: string | null;

  readonly roles?: string[];

  readonly user?: UserObject;

  readonly require_colons?: boolean;

  readonly managed?: boolean;

  readonly animated?: boolean;

  readonly available?: boolean;
}

export interface ListApplicationEmojisResponse {
  readonly items: EmojiObject[];
}

export interface CreateGuildEmojiJSONParams
  extends SetNonNullable<Pick<EmojiObject, "name" | "roles">> {
  readonly image: FileInput;
}

export interface ModifyGuildEmojiJSONParams
  extends Partial<Pick<CreateGuildEmojiJSONParams, "name">> {
  readonly roles?: string[] | null;
}

export type CreateApplicationEmojiJSONParams = Omit<CreateGuildEmojiJSONParams, "roles">;

export type ModifyApplicationEmojiJSONParams = Pick<CreateApplicationEmojiJSONParams, "name">;

export type EmojiResolvable =
  | string
  | Pick<EmojiObject, "id" | "name" | "animated">
  | Partial<Pick<EmojiObject, "id" | "name" | "animated">>;

export function encodeEmoji(emoji: EmojiResolvable): string {
  const resolved = resolveEmoji(emoji);
  if (resolved.id) {
    return encodeURIComponent(`${resolved.name}:${resolved.id}`);
  }

  return encodeURIComponent(resolved.name as string);
}

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
