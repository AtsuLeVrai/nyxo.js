import type { Integer, Snowflake, UserEntity } from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export interface GetUserGuildQueryEntity {
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
  with_counts?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export interface ModifyUserOptionsEntity extends Pick<UserEntity, "username"> {
  avatar?: ImageData | null;
  banner?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm-json-params}
 */
export interface CreateDmOptionsEntity {
  recipient_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export interface CreateGroupDmOptionsEntity {
  access_tokens: string[];
  nicks: Record<Snowflake, string>;
}
