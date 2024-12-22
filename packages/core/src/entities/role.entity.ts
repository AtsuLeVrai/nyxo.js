import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  InPrompt = 1 << 0,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export interface RoleTags {
  bot_id?: Snowflake;
  integration_id?: Snowflake;
  premium_subscriber?: null;
  subscription_listing_id?: Snowflake;
  available_for_purchase?: null;
  guild_connections?: null;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export interface RoleEntity {
  id: Snowflake;
  name: string;
  color: Integer;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: Integer;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTags;
  flags: RoleFlags;
}
