import type { Snowflake } from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface GuildEmojiCreateEntity {
  name: string;
  image: ImageData;
  roles?: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface GuildEmojiModifyEntity {
  name?: string;
  roles?: Snowflake[] | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export interface ApplicationEmojiCreateEntity {
  name: string;
  image: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export interface ApplicationEmojiModifyEntity {
  name: string;
}
