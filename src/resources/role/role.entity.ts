export enum RoleFlags {
  InPrompt = 1 << 0,
}

export interface RoleColorsEntity {
  primary_color: number;
  secondary_color?: number | null;
  tertiary_color?: number | null;
}

export interface RoleTagsEntity {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
  subscription_listing_id?: string;
  available_for_purchase?: null;
  guild_connections?: null;
}

export interface RoleEntity {
  id: string;
  name: string;
  color: number;
  colors: RoleColorsEntity;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTagsEntity;
  flags: RoleFlags;
}
