import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export interface EmojiEntity {
  id: Snowflake | null;
  name: string | null;
  roles?: Snowflake[];
  user?: UserEntity;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}
