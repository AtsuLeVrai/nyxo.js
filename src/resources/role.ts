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

export class Role extends BaseClass<RoleEntity> implements CamelCaseKeys<RoleEntity> {
  readonly id = this.rawData.id;
  readonly name = this.rawData.name;
  readonly color = this.rawData.color;
  readonly colors = this.rawData.colors;
  readonly hoist = this.rawData.hoist;
  readonly icon = this.rawData.icon;
  readonly unicodeEmoji = this.rawData.unicode_emoji;
  readonly position = this.rawData.position;
  readonly permissions = this.rawData.permissions;
  readonly managed = this.rawData.managed;
  readonly mentionable = this.rawData.mentionable;
  readonly tags = this.rawData.tags;
  readonly flags = this.rawData.flags;
}
