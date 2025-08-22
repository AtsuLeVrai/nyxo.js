import type { Snowflake } from "../common/index.js";

export enum RoleFlags {
  InPrompt = 1 << 0,
}

export interface RoleColorsObject {
  primary_color: number;
  secondary_color: number | null;
  tertiary_color: number | null;
}

export interface RoleTagsObject {
  bot_id?: Snowflake;
  integration_id?: Snowflake;
  premium_subscriber?: null;
  subscription_listing_id?: Snowflake;
  available_for_purchase?: null;
  guild_connections?: null;
}

export interface RoleObject {
  id: Snowflake;
  name: string;
  /** @deprecated integer representation of hexadecimal color code */
  color: number;
  colors: RoleColorsObject;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTagsObject;
  flags: RoleFlags;
}
