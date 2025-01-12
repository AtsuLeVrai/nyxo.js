import {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  AuditLogEntryEntity,
  AvatarDecorationDataEntity,
  EmojiEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildScheduledEventEntity,
  RoleEntity,
  Snowflake,
  SoundboardSoundEntity,
  StageInstanceEntity,
  StickerEntity,
  UserEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "./gateway.event.js";
import { PresenceEntity } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export const SoundboardSoundsEntity = z.object({
  soundboard_sounds: z.array(SoundboardSoundEntity),
  guild_id: Snowflake,
});

export type SoundboardSoundsEntity = z.infer<typeof SoundboardSoundsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sounds-update-guild-soundboard-sounds-update-event-fields}
 */
export const GuildSoundboardSoundsUpdateEntity = SoundboardSoundsEntity;

export type GuildSoundboardSoundsUpdateEntity = z.infer<
  typeof GuildSoundboardSoundsUpdateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export const GuildSoundboardSoundDeleteEntity = z.object({
  sound_id: Snowflake,
  guild_id: Snowflake,
});

export type GuildSoundboardSoundDeleteEntity = z.infer<
  typeof GuildSoundboardSoundDeleteEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export const GuildScheduledEventUserRemoveEntity = z.object({
  guild_scheduled_event_id: Snowflake,
  user_id: Snowflake,
  guild_id: Snowflake,
});

export type GuildScheduledEventUserRemoveEntity = z.infer<
  typeof GuildScheduledEventUserRemoveEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add-guild-scheduled-event-user-add-event-fields}
 */
export const GuildScheduledEventUserAddEntity =
  GuildScheduledEventUserRemoveEntity;

export type GuildScheduledEventUserAddEntity = z.infer<
  typeof GuildScheduledEventUserAddEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export const GuildRoleDeleteEntity = z.object({
  role_id: Snowflake,
  guild_id: Snowflake,
});

export type GuildRoleDeleteEntity = z.infer<typeof GuildRoleDeleteEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export const GuildRoleUpdateEntity = z.object({
  guild_id: Snowflake,
  role: RoleEntity,
});

export type GuildRoleUpdateEntity = z.infer<typeof GuildRoleUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-create-guild-role-create-event-fields}
 */
export const GuildRoleCreateEntity = GuildRoleUpdateEntity;

export type GuildRoleCreateEntity = z.infer<typeof GuildRoleCreateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export const GuildMembersChunkEntity = z.object({
  guild_id: Snowflake,
  members: z.array(GuildMemberEntity),
  chunk_index: z.number(),
  chunk_count: z.number(),
  not_found: z.array(Snowflake).optional(),
  presences: z.array(PresenceEntity).optional(),
  nonce: z.string().optional(),
});

export type GuildMembersChunkEntity = z.infer<typeof GuildMembersChunkEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export const GuildMemberUpdateEntity = z.object({
  guild_id: Snowflake,
  roles: z.array(Snowflake),
  user: UserEntity,
  nick: z.string().nullish(),
  avatar: z.string().nullable(),
  banner: z.string().nullable(),
  joined_at: z.string().nullable(),
  premium_since: z.string().nullish(),
  deaf: z.boolean().optional(),
  mute: z.boolean().optional(),
  pending: z.boolean().optional(),
  communication_disabled_until: z.string().nullish(),
  flags: z.number().optional(),
  avatar_decoration_data: AvatarDecorationDataEntity.nullish(),
});

export type GuildMemberUpdateEntity = z.infer<typeof GuildMemberUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export const GuildMemberRemoveEntity = z.object({
  guild_id: Snowflake,
  user: UserEntity,
});

export type GuildMemberRemoveEntity = z.infer<typeof GuildMemberRemoveEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export const GuildMemberAddEntity = GuildMemberEntity.extend({
  guild_id: Snowflake,
});

export type GuildMemberAddEntity = z.infer<typeof GuildMemberAddEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export const GuildIntegrationsUpdateEntity = z.object({
  guild_id: Snowflake,
});

export type GuildIntegrationsUpdateEntity = z.infer<
  typeof GuildIntegrationsUpdateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export const GuildStickersUpdateEntity = z.object({
  guild_id: Snowflake,
  stickers: z.array(StickerEntity),
});

export type GuildStickersUpdateEntity = z.infer<
  typeof GuildStickersUpdateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export const GuildEmojisUpdateEntity = z.object({
  guild_id: Snowflake,
  emojis: z.array(EmojiEntity),
});

export type GuildEmojisUpdateEntity = z.infer<typeof GuildEmojisUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-remove-guild-ban-remove-event-fields}
 */
export const GuildBanRemoveEntity = z.object({
  guild_id: Snowflake,
  user: UserEntity,
});

export type GuildBanRemoveEntity = z.infer<typeof GuildBanRemoveEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export const GuildBanAddEntity = z.object({
  guild_id: Snowflake,
  user: UserEntity,
});

export type GuildBanAddEntity = z.infer<typeof GuildBanAddEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export const GuildAuditLogEntryCreateEntity = AuditLogEntryEntity.extend({
  guild_id: Snowflake,
});

export type GuildAuditLogEntryCreateEntity = z.infer<
  typeof GuildAuditLogEntryCreateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create-guild-create-extra-fields}
 */
export const GuildCreateEntity = GuildEntity.extend({
  joined_at: z.string(),
  large: z.boolean(),
  unavailable: z.boolean().optional(),
  member_count: z.number(),
  voice_states: z.array(VoiceStateEntity.partial()),
  members: z.array(GuildMemberEntity),
  channels: z.array(AnyChannelEntity),
  threads: z.array(AnyThreadChannelEntity),
  presences: z.array(UpdatePresenceEntity.partial()),
  stage_instances: z.array(StageInstanceEntity),
  guild_scheduled_events: z.array(GuildScheduledEventEntity),
  soundboard_sounds: z.array(SoundboardSoundEntity),
});

export type GuildCreateEntity = z.infer<typeof GuildCreateEntity>;
