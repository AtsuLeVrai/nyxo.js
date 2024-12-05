import type {
  ChannelEntity,
  GuildEntity,
  GuildFeature,
  GuildMemberEntity,
  Integer,
  LocaleKey,
  RoleEntity,
  Snowflake,
} from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export interface CreateGuildEntity
  extends Pick<
    GuildEntity,
    | "name"
    | "region"
    | "icon"
    | "verification_level"
    | "default_message_notifications"
    | "explicit_content_filter"
    | "roles"
    | "afk_channel_id"
    | "afk_timeout"
    | "system_channel_id"
    | "system_channel_flags"
  > {
  channels: Partial<ChannelEntity>[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export interface ModifyGuildEntity extends Partial<CreateGuildEntity> {
  owner_id?: Snowflake;
  splash?: ImageData | null;
  discovery_splash?: ImageData | null;
  banner?: ImageData | null;
  rules_channel_id?: Snowflake | null;
  public_updates_channel_id?: Snowflake | null;
  preferred_locale?: LocaleKey;
  features?: GuildFeature[];
  description?: string | null;
  premium_progress_bar_enabled?: boolean;
  safety_alerts_channel_id?: Snowflake | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-query-string-params}
 */
export interface GetGuildQueryEntity {
  with_counts?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export interface GetMembersQueryEntity {
  limit?: Integer;
  after?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export interface SearchMembersQueryEntity {
  query: string;
  limit?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export interface AddMemberEntity {
  access_token: string;
  nick?: string;
  roles?: Snowflake[];
  mute?: boolean;
  deaf?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export interface ModifyMemberEntity
  extends Partial<
    Pick<
      GuildMemberEntity,
      | "nick"
      | "roles"
      | "mute"
      | "deaf"
      | "communication_disabled_until"
      | "flags"
    >
  > {
  channel_id?: Snowflake | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member-json-params}
 */
export type ModifyCurrentMemberEntity = Partial<
  Pick<GuildMemberEntity, "nick">
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export type CreateRoleEntity = Pick<
  RoleEntity,
  | "name"
  | "permissions"
  | "color"
  | "hoist"
  | "icon"
  | "unicode_emoji"
  | "mentionable"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export type ModifyRolePositionsEntity = Pick<RoleEntity, "id" | "position">;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export interface GetPruneQueryEntity {
  days?: Integer;
  include_roles?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export interface BeginPruneEntity {
  days?: Integer;
  compute_prune_count?: boolean;
  include_roles?: Snowflake[];
  /**
   * @deprecated Use `include_roles` instead
   */
  reason?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export interface BanCreateEntity {
  /**
   * @deprecated Use `delete_message_seconds` instead
   */
  delete_message_days?: Integer;
  delete_message_seconds?: Integer;
}
