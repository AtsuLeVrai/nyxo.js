import type {
  AuditLogEntryEntity,
  AvatarDecorationDataEntity,
  ChannelEntity,
  EmojiEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildMemberFlags,
  GuildScheduledEventEntity,
  Integer,
  Iso8601,
  RoleEntity,
  Snowflake,
  SoundboardSoundEntity,
  StageInstanceEntity,
  StickerEntity,
  UserEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import type { UpdatePresenceEntity } from "./gateway.event.js";
import type { PresenceEntity } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export interface SoundboardSoundsEntity {
  soundboard_sounds: SoundboardSoundEntity[];
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sounds-update-guild-soundboard-sounds-update-event-fields}
 */
export type GuildSoundboardSoundsUpdateEntity = SoundboardSoundsEntity;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export interface GuildSoundboardSoundDeleteEntity {
  sound_id: Snowflake;
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export interface GuildScheduledEventUserRemoveEntity {
  guild_scheduled_event_id: Snowflake;
  user_id: Snowflake;
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add-guild-scheduled-event-user-add-event-fields}
 */
export type GuildScheduledEventUserAddEntity =
  GuildScheduledEventUserRemoveEntity;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export interface GuildRoleDeleteEntity {
  role_id: Snowflake;
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export interface GuildRoleUpdateEntity {
  guild_id: Snowflake;
  role: RoleEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-create-guild-role-create-event-fields}
 */
export type GuildRoleCreateEntity = GuildRoleUpdateEntity;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export interface GuildMembersChunkEntity {
  guild_id: Snowflake;
  members: GuildMemberEntity[];
  chunk_index: Integer;
  chunk_count: Integer;
  not_found?: Snowflake[];
  presences?: PresenceEntity[];
  nonce?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export interface GuildMemberUpdateEntity {
  guild_id: Snowflake;
  roles: Snowflake[];
  user: UserEntity;
  nick?: string | null;
  avatar: string | null;
  banner: string | null;
  joined_at: Iso8601 | null;
  premium_since?: Iso8601 | null;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
  communication_disabled_until?: Iso8601 | null;
  flags?: GuildMemberFlags;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export interface GuildMemberRemoveEntity {
  guild_id: Snowflake;
  user: UserEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export interface GuildMemberAddEntity extends GuildMemberEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export interface GuildIntegrationsUpdateEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export interface GuildStickersUpdateEntity {
  guild_id: Snowflake;
  stickers: StickerEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export interface GuildEmojisUpdateEntity {
  guild_id: Snowflake;
  emojis: EmojiEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-remove-guild-ban-remove-event-fields}
 */
export interface GuildBanRemoveEntity {
  guild_id: Snowflake;
  user: UserEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export interface GuildBanAddEntity {
  guild_id: Snowflake;
  user: UserEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export interface GuildAuditLogEntryCreateEntity extends AuditLogEntryEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create-guild-create-extra-fields}
 */
export interface GuildCreateEntity extends GuildEntity {
  joined_at: Iso8601;
  large: boolean;
  unavailable?: boolean;
  member_count: Integer;
  voice_states: Partial<VoiceStateEntity>[];
  members: GuildMemberEntity[];
  channels: ChannelEntity[];
  threads: ChannelEntity[];
  presences: Partial<UpdatePresenceEntity>[];
  stage_instances: StageInstanceEntity[];
  guild_scheduled_events: GuildScheduledEventEntity[];
  soundboard_sounds: SoundboardSoundEntity[];
}
