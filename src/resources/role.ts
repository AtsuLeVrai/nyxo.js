export enum RoleFlags {
  InPrompt = 1 << 0,
}

export interface RoleColorsObject {
  readonly primary_color: number;

  readonly secondary_color?: number | null;

  readonly tertiary_color?: number | null;
}

export interface RoleTagsObject {
  readonly bot_id?: string;

  readonly integration_id?: string;

  readonly premium_subscriber?: null;

  readonly subscription_listing_id?: string;

  readonly available_for_purchase?: null;

  readonly guild_connections?: null;
}

export interface RoleObject {
  readonly id: string;

  readonly name: string;

  readonly color: number;

  readonly colors: RoleColorsObject;

  readonly hoist: boolean;

  readonly icon?: string | null;

  readonly unicode_emoji?: string | null;

  readonly position: number;

  readonly permissions: string;

  readonly managed: boolean;

  readonly mentionable: boolean;

  readonly tags?: RoleTagsObject;

  readonly flags: RoleFlags;
}
