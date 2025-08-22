import type { Snowflake } from "../common/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
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

export interface CreateGuildEmojiRequest {
  name: string;
  image: DataUri;
  roles?: Snowflake[];
}

export interface ModifyGuildEmojiRequest {
  name?: string;
  roles?: Snowflake[] | null;
}

export interface CreateApplicationEmojiRequest {
  name: string;
  image: DataUri;
}

export interface ModifyApplicationEmojiRequest {
  name: string;
}

export interface ListApplicationEmojisResponse {
  items: EmojiObject[];
}

export const EmojiRoutes = {
  // GET /guilds/{guild.id}/emojis - List Guild Emojis
  listGuildEmojis: ((guildId: Snowflake) => `/guilds/${guildId}/emojis`) as EndpointFactory<
    `/guilds/${string}/emojis`,
    ["GET"],
    EmojiObject[]
  >,

  // GET /guilds/{guild.id}/emojis/{emoji.id} - Get Guild Emoji
  getGuildEmoji: ((guildId: Snowflake, emojiId: Snowflake) =>
    `/guilds/${guildId}/emojis/${emojiId}`) as EndpointFactory<
    `/guilds/${string}/emojis/${string}`,
    ["GET", "PATCH", "DELETE"],
    EmojiObject,
    true, // reason support
    false,
    ModifyGuildEmojiRequest
  >,

  // POST /guilds/{guild.id}/emojis - Create Guild Emoji
  createGuildEmoji: ((guildId: Snowflake) => `/guilds/${guildId}/emojis`) as EndpointFactory<
    `/guilds/${string}/emojis`,
    ["POST"],
    EmojiObject,
    true, // reason support
    false,
    CreateGuildEmojiRequest
  >,

  // GET /applications/{application.id}/emojis - List Application Emojis
  listApplicationEmojis: ((applicationId: Snowflake) =>
    `/applications/${applicationId}/emojis`) as EndpointFactory<
    `/applications/${string}/emojis`,
    ["GET"],
    ListApplicationEmojisResponse
  >,

  // GET /applications/{application.id}/emojis/{emoji.id} - Get Application Emoji
  getApplicationEmoji: ((applicationId: Snowflake, emojiId: Snowflake) =>
    `/applications/${applicationId}/emojis/${emojiId}`) as EndpointFactory<
    `/applications/${string}/emojis/${string}`,
    ["GET", "PATCH", "DELETE"],
    EmojiObject,
    false,
    false,
    ModifyApplicationEmojiRequest
  >,

  // POST /applications/{application.id}/emojis - Create Application Emoji
  createApplicationEmoji: ((applicationId: Snowflake) =>
    `/applications/${applicationId}/emojis`) as EndpointFactory<
    `/applications/${string}/emojis`,
    ["POST"],
    EmojiObject,
    false,
    false,
    CreateApplicationEmojiRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;

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
