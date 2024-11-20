import type { Snowflake } from "../formatting/index.js";
import type { UserEntity } from "./users.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object-emoji-structure}
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
