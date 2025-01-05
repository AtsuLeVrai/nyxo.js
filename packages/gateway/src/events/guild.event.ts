import {
  AnyChannelSchema,
  AnyThreadChannelSchema,
  AuditLogEntrySchema,
  AvatarDecorationDataSchema,
  EmojiSchema,
  GuildMemberSchema,
  GuildScheduledEventSchema,
  GuildSchema,
  RoleSchema,
  SnowflakeSchema,
  SoundboardSoundSchema,
  StageInstanceSchema,
  StickerSchema,
  UserSchema,
  VoiceStateSchema,
} from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceSchema } from "./gateway.event.js";
import { PresenceSchema } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export const SoundboardSoundsSchema = z
  .object({
    soundboard_sounds: z.array(SoundboardSoundSchema),
    guild_id: SnowflakeSchema,
  })
  .strict();

export type SoundboardSoundsEntity = z.infer<typeof SoundboardSoundsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sounds-update-guild-soundboard-sounds-update-event-fields}
 */
export const GuildSoundboardSoundsUpdateSchema = SoundboardSoundsSchema;

export type GuildSoundboardSoundsUpdateEntity = z.infer<
  typeof GuildSoundboardSoundsUpdateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export const GuildSoundboardSoundDeleteSchema = z
  .object({
    sound_id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
  })
  .strict();

export type GuildSoundboardSoundDeleteEntity = z.infer<
  typeof GuildSoundboardSoundDeleteSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export const GuildScheduledEventUserRemoveSchema = z
  .object({
    guild_scheduled_event_id: SnowflakeSchema,
    user_id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
  })
  .strict();

export type GuildScheduledEventUserRemoveEntity = z.infer<
  typeof GuildScheduledEventUserRemoveSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add-guild-scheduled-event-user-add-event-fields}
 */
export const GuildScheduledEventUserAddSchema =
  GuildScheduledEventUserRemoveSchema;

export type GuildScheduledEventUserAddEntity = z.infer<
  typeof GuildScheduledEventUserAddSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export const GuildRoleDeleteSchema = z
  .object({
    role_id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
  })
  .strict();

export type GuildRoleDeleteEntity = z.infer<typeof GuildRoleDeleteSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export const GuildRoleUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    role: RoleSchema,
  })
  .strict();

export type GuildRoleUpdateEntity = z.infer<typeof GuildRoleUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-create-guild-role-create-event-fields}
 */
export const GuildRoleCreateSchema = GuildRoleUpdateSchema;

export type GuildRoleCreateEntity = z.infer<typeof GuildRoleCreateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export const GuildMembersChunkSchema = z
  .object({
    guild_id: SnowflakeSchema,
    members: z.array(GuildMemberSchema),
    chunk_index: z.number(),
    chunk_count: z.number(),
    not_found: z.array(SnowflakeSchema).optional(),
    presences: z.array(PresenceSchema).optional(),
    nonce: z.string().optional(),
  })
  .strict();

export type GuildMembersChunkEntity = z.infer<typeof GuildMembersChunkSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export const GuildMemberUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    roles: z.array(SnowflakeSchema),
    user: UserSchema,
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
    avatar_decoration_data: AvatarDecorationDataSchema.nullish(),
  })
  .strict();

export type GuildMemberUpdateEntity = z.infer<typeof GuildMemberUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export const GuildMemberRemoveSchema = z
  .object({
    guild_id: SnowflakeSchema,
    user: UserSchema,
  })
  .strict();

export type GuildMemberRemoveEntity = z.infer<typeof GuildMemberRemoveSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export const GuildMemberAddSchema = GuildMemberSchema.extend({
  guild_id: SnowflakeSchema,
}).strict();

export type GuildMemberAddEntity = z.infer<typeof GuildMemberAddSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export const GuildIntegrationsUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
  })
  .strict();

export type GuildIntegrationsUpdateEntity = z.infer<
  typeof GuildIntegrationsUpdateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export const GuildStickersUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    stickers: z.array(StickerSchema),
  })
  .strict();

export type GuildStickersUpdateEntity = z.infer<
  typeof GuildStickersUpdateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export const GuildEmojisUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    emojis: z.array(EmojiSchema),
  })
  .strict();

export type GuildEmojisUpdateEntity = z.infer<typeof GuildEmojisUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-remove-guild-ban-remove-event-fields}
 */
export const GuildBanRemoveSchema = z
  .object({
    guild_id: SnowflakeSchema,
    user: UserSchema,
  })
  .strict();

export type GuildBanRemoveEntity = z.infer<typeof GuildBanRemoveSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export const GuildBanAddSchema = z
  .object({
    guild_id: SnowflakeSchema,
    user: UserSchema,
  })
  .strict();

export type GuildBanAddEntity = z.infer<typeof GuildBanAddSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export const GuildAuditLogEntryCreateSchema = AuditLogEntrySchema.extend({
  guild_id: SnowflakeSchema,
}).strict();

export type GuildAuditLogEntryCreateEntity = z.infer<
  typeof GuildAuditLogEntryCreateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create-guild-create-extra-fields}
 */
export const GuildCreateSchema = GuildSchema.extend({
  joined_at: z.string(),
  large: z.boolean(),
  unavailable: z.boolean().optional(),
  member_count: z.number(),
  voice_states: z.array(VoiceStateSchema.partial()),
  members: z.array(GuildMemberSchema),
  channels: z.array(AnyChannelSchema),
  threads: z.array(AnyThreadChannelSchema),
  presences: z.array(UpdatePresenceSchema.partial()),
  stage_instances: z.array(StageInstanceSchema),
  guild_scheduled_events: z.array(GuildScheduledEventSchema),
  soundboard_sounds: z.array(SoundboardSoundSchema),
}).strict();

export type GuildCreateEntity = z.infer<typeof GuildCreateSchema>;
