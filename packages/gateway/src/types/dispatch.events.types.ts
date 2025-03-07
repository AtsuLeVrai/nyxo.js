import type {
  AnyChannelEntity,
  AnyInteractionEntity,
  AnyThreadChannelEntity,
  ApiVersion,
  ApplicationEntity,
  AuditLogEntryEntity,
  AutoModerationActionEntity,
  AutoModerationRuleEntity,
  AutoModerationRuleTriggerType,
  AvatarDecorationDataEntity,
  EmojiEntity,
  EntitlementEntity,
  GuildApplicationCommandPermissionEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildScheduledEventEntity,
  IntegrationEntity,
  InviteTargetType,
  MessageEntity,
  RoleEntity,
  SoundboardSoundEntity,
  StageInstanceEntity,
  StickerEntity,
  SubscriptionEntity,
  ThreadMemberEntity,
  UnavailableGuildEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { Snowflake, type UserEntity } from "@nyxjs/core";
import type { ReactionTypeFlag } from "@nyxjs/rest";
import { z } from "zod";
import { GatewayOpcodes } from "./index.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export interface AutoModerationActionExecutionEntity {
  guild_id: Snowflake;
  action: AutoModerationActionEntity;
  rule_id: Snowflake;
  rule_trigger_type: AutoModerationRuleTriggerType;
  user_id: Snowflake;
  channel_id?: Snowflake;
  message_id?: Snowflake;
  alert_system_message_id?: Snowflake;
  content?: string;
  matched_keyword: string | null;
  matched_content: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export interface ChannelPinsUpdateEntity {
  guild_id?: Snowflake | null;
  channel_id: Snowflake;
  last_pin_timestamp: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export interface ThreadMembersUpdateEntity {
  id: Snowflake;
  guild_id: Snowflake;
  member_count: number;
  added_members?: ThreadMemberEntity[];
  removed_member_ids?: string[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export interface ThreadMemberUpdateEntity extends ThreadMemberEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export interface ThreadListSyncEntity {
  guild_id: Snowflake;
  channel_ids?: Snowflake[];
  threads: AnyThreadChannelEntity[];
  members: ThreadMemberEntity[];
}

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
  chunk_index: number;
  chunk_count: number;
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
  joined_at: string | null;
  premium_since?: string | null;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
  communication_disabled_until?: string | null;
  flags?: number;
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
  joined_at: string;
  large: boolean;
  unavailable?: boolean;
  member_count: number;
  voice_states: Partial<VoiceStateEntity>[];
  members: GuildMemberEntity[];
  channels: AnyChannelEntity[];
  threads: AnyThreadChannelEntity[];
  presences: Partial<UpdatePresenceEntity>[];
  stage_instances: StageInstanceEntity[];
  guild_scheduled_events: GuildScheduledEventEntity[];
  soundboard_sounds: SoundboardSoundEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#hello-hello-structure}
 */
export interface HelloEntity {
  heartbeat_interval: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export const IdentifyConnectionPropertiesEntity = z.object({
  os: z.string(),
  browser: z.string(),
  device: z.string(),
});

export type IdentifyConnectionPropertiesEntity = z.infer<
  typeof IdentifyConnectionPropertiesEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export interface IntegrationDeleteEntity {
  id: Snowflake;
  guild_id: Snowflake;
  application_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export interface IntegrationUpdateEntity extends IntegrationEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export type IntegrationCreateEntity = IntegrationUpdateEntity;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export interface InviteDeleteEntity {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  code: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export interface InviteCreateEntity {
  channel_id: Snowflake;
  code: string;
  created_at: string;
  guild_id?: Snowflake;
  inviter?: UserEntity;
  max_age: number;
  max_uses: number;
  target_type?: InviteTargetType;
  target_user?: UserEntity;
  target_application?: ApplicationEntity;
  temporary: boolean;
  uses: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export interface MessageReactionRemoveEmojiEntity {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  message_id: Snowflake;
  emoji: Partial<EmojiEntity>;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export interface MessageReactionRemoveAllEntity {
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export interface MessageReactionRemoveEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  emoji:
    | Pick<EmojiEntity, "id" | "name">
    | Pick<EmojiEntity, "id" | "name" | "animated">;
  burst: boolean;
  type: ReactionTypeFlag;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export interface MessageReactionAddEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  member?: GuildMemberEntity;
  emoji:
    | Pick<EmojiEntity, "id" | "name">
    | Pick<EmojiEntity, "id" | "name" | "animated">;
  message_author_id?: Snowflake;
  burst: boolean;
  burst_colors?: string[];
  type: ReactionTypeFlag;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export interface MessageDeleteBulkEntity {
  ids: Snowflake[];
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export interface MessageDeleteEntity {
  id: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export interface MessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  mentions?: (UserEntity | Partial<GuildMemberEntity>)[];
  guild_id?: Snowflake;
  member?: Partial<GuildMemberEntity>;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export interface MessagePollVoteRemoveEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  answer_id: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export type MessagePollVoteAddEntity = MessagePollVoteRemoveEntity;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export const ActivityButtonsEntity = z.object({
  label: z.string(),
  url: z.string().url(),
});

export type ActivityButtonsEntity = z.infer<typeof ActivityButtonsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-secrets}
 */
export const ActivitySecretsEntity = z.object({
  join: z.string().optional(),
  spectate: z.string().optional(),
  match: z.string().optional(),
});

export type ActivitySecretsEntity = z.infer<typeof ActivitySecretsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export const ActivityAssetImageEntity = z.object({
  large_text: z.string().optional(),
  large_image: z.string().optional(),
  small_text: z.string().optional(),
  small_image: z.string().optional(),
});

export type ActivityAssetImageEntity = z.infer<typeof ActivityAssetImageEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export const ActivityPartyEntity = z.object({
  id: z.string().optional(),
  size: z.tuple([z.number(), z.number()]).optional(),
});

export type ActivityPartyEntity = z.infer<typeof ActivityPartyEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export const ActivityEmojiEntity = z.object({
  name: z.string(),
  id: Snowflake.optional(),
  animated: z.boolean().optional(),
});

export type ActivityEmojiEntity = z.infer<typeof ActivityEmojiEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export const ActivityTimestampsEntity = z.object({
  start: z.number().int().optional(),
  end: z.number().int().optional(),
});

export type ActivityTimestampsEntity = z.infer<typeof ActivityTimestampsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types}
 */
export enum ActivityType {
  Game = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure}
 */
export const ActivityEntity = z.object({
  name: z.string(),
  type: z.nativeEnum(ActivityType),
  url: z.string().nullish(),
  created_at: z.union([z.number().int(), z.string()]),
  timestamps: ActivityTimestampsEntity.optional(),
  application_id: Snowflake.optional(),
  details: z.string().nullish(),
  state: z.string().nullish(),
  emoji: ActivityEmojiEntity.nullish(),
  party: ActivityPartyEntity.optional(),
  assets: ActivityAssetImageEntity.optional(),
  secrets: ActivitySecretsEntity.optional(),
  instance: z.boolean().optional(),
  flags: z.nativeEnum(ActivityFlags).optional(),
  buttons: z.array(ActivityButtonsEntity).optional(),
});

export type ActivityEntity = z.infer<typeof ActivityEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export interface ClientStatusEntity {
  desktop?: string;
  mobile?: string;
  web?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export interface PresenceEntity {
  user: UserEntity;
  guild_id: Snowflake;
  status: string;
  activities: ActivityEntity[];
  client_status: ClientStatusEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export const UpdateVoiceStateEntity = z.object({
  guild_id: Snowflake,
  channel_id: Snowflake.nullable(),
  self_mute: z.boolean(),
  self_deaf: z.boolean(),
});

export type UpdateVoiceStateEntity = z.infer<typeof UpdateVoiceStateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export const UpdatePresenceStatusType = z.enum([
  "online",
  "dnd",
  "idle",
  "invisible",
  "offline",
]);

export type UpdatePresenceStatusType = z.infer<typeof UpdatePresenceStatusType>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export const UpdatePresenceEntity = z.object({
  since: z.number().nullable(),
  activities: z.array(ActivityEntity),
  status: UpdatePresenceStatusType,
  afk: z.boolean(),
});

export type UpdatePresenceEntity = z.infer<typeof UpdatePresenceEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export const IdentifyEntity = z.object({
  token: z.string(),
  properties: IdentifyConnectionPropertiesEntity,
  compress: z.boolean().optional(),
  large_threshold: z.number().optional(),
  shard: z.tuple([z.number(), z.number()]).optional(),
  presence: UpdatePresenceEntity.optional(),
  intents: z.number().int(),
});

export type IdentifyEntity = z.infer<typeof IdentifyEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export interface ReadyEntity {
  v: ApiVersion;
  user: UserEntity;
  guilds: UnavailableGuildEntity[];
  session_id: string;
  resume_gateway_url: string;
  shard?: [number, number];
  application: Pick<ApplicationEntity, "id" | "flags">;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export const RequestGuildMembersEntity = z.object({
  guild_id: Snowflake,
  query: z.string().optional(),
  limit: z.number().int(),
  presences: z.boolean().optional(),
  user_ids: z.union([Snowflake, z.array(Snowflake)]).optional(),
  nonce: z.string().optional(),
});

export type RequestGuildMembersEntity = z.infer<
  typeof RequestGuildMembersEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export const RequestSoundboardSoundsEntity = z.object({
  guild_ids: z.array(Snowflake),
});

export type RequestSoundboardSoundsEntity = z.infer<
  typeof RequestSoundboardSoundsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#resume-resume-structure}
 */
export const ResumeEntity = z.object({
  token: z.string(),
  session_id: z.string(),
  seq: z.number().int(),
});

export type ResumeEntity = z.infer<typeof ResumeEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start-typing-start-event-fields}
 */
export interface TypingEntity {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  user_id: Snowflake;
  timestamp: number;
  member?: GuildMemberEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export interface VoiceServerUpdateEntity {
  token: string;
  guild_id: Snowflake;
  endpoint: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationType {
  Premium = 0,
  Basic = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEntity {
  channel_id: Snowflake;
  guild_id: Snowflake;
  user_id: Snowflake;
  emoji?: EmojiEntity | null;
  animation_type?: VoiceChannelEffectSendAnimationType;
  animation_id?: number;
  sound_id?: Snowflake | number;
  sound_volume?: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export interface WebhookUpdateEntity {
  guild_id: Snowflake;
  channel_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#receive-events}
 */
export interface GatewayReceiveEvents {
  READY: ReadyEntity;
  RESUMED: boolean;
  APPLICATION_COMMAND_PERMISSIONS_UPDATE: GuildApplicationCommandPermissionEntity;
  AUTO_MODERATION_RULE_CREATE: AutoModerationRuleEntity;
  AUTO_MODERATION_RULE_UPDATE: AutoModerationRuleEntity;
  AUTO_MODERATION_RULE_DELETE: AutoModerationRuleEntity;
  AUTO_MODERATION_ACTION_EXECUTION: AutoModerationActionExecutionEntity;
  CHANNEL_CREATE: AnyChannelEntity;
  CHANNEL_UPDATE: AnyChannelEntity;
  CHANNEL_DELETE: AnyChannelEntity;
  CHANNEL_PINS_UPDATE: ChannelPinsUpdateEntity;
  THREAD_CREATE:
    | (AnyThreadChannelEntity & { newly_created: boolean })
    | (AnyThreadChannelEntity & ThreadMemberEntity);
  THREAD_UPDATE: Omit<AnyThreadChannelEntity, "last_message_id">;
  THREAD_DELETE: Pick<
    AnyThreadChannelEntity,
    "id" | "guild_id" | "parent_id" | "type"
  >;
  THREAD_LIST_SYNC: ThreadListSyncEntity;
  THREAD_MEMBER_UPDATE: ThreadMemberUpdateEntity;
  THREAD_MEMBERS_UPDATE: ThreadMembersUpdateEntity;
  ENTITLEMENT_CREATE: EntitlementEntity;
  ENTITLEMENT_UPDATE: EntitlementEntity;
  ENTITLEMENT_DELETE: EntitlementEntity;
  GUILD_CREATE: GuildCreateEntity | UnavailableGuildEntity;
  GUILD_UPDATE: GuildEntity;
  GUILD_DELETE: UnavailableGuildEntity;
  GUILD_AUDIT_LOG_ENTRY_CREATE: GuildAuditLogEntryCreateEntity;
  GUILD_BAN_ADD: GuildBanAddEntity;
  GUILD_BAN_REMOVE: GuildBanRemoveEntity;
  GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEntity;
  GUILD_STICKERS_UPDATE: GuildStickersUpdateEntity;
  GUILD_INTEGRATIONS_UPDATE: GuildIntegrationsUpdateEntity;
  GUILD_MEMBER_ADD: GuildMemberAddEntity;
  GUILD_MEMBER_REMOVE: GuildMemberRemoveEntity;
  GUILD_MEMBER_UPDATE: GuildMemberUpdateEntity;
  GUILD_MEMBERS_CHUNK: GuildMembersChunkEntity;
  GUILD_ROLE_CREATE: GuildRoleCreateEntity;
  GUILD_ROLE_UPDATE: GuildRoleUpdateEntity;
  GUILD_ROLE_DELETE: GuildRoleDeleteEntity;
  GUILD_SCHEDULED_EVENT_CREATE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_UPDATE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_DELETE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_USER_ADD: GuildScheduledEventUserAddEntity;
  GUILD_SCHEDULED_EVENT_USER_REMOVE: GuildScheduledEventUserRemoveEntity;
  GUILD_SOUNDBOARD_SOUND_CREATE: SoundboardSoundEntity;
  GUILD_SOUNDBOARD_SOUND_UPDATE: SoundboardSoundEntity;
  GUILD_SOUNDBOARD_SOUND_DELETE: GuildSoundboardSoundDeleteEntity;
  GUILD_SOUNDBOARD_SOUNDS_UPDATE: GuildSoundboardSoundsUpdateEntity;
  SOUNDBOARD_SOUNDS: SoundboardSoundsEntity;
  INTEGRATION_CREATE: IntegrationCreateEntity;
  INTEGRATION_UPDATE: IntegrationUpdateEntity;
  INTEGRATION_DELETE: IntegrationDeleteEntity;
  INVITE_CREATE: InviteCreateEntity;
  INVITE_DELETE: InviteDeleteEntity;
  MESSAGE_CREATE: MessageCreateEntity;
  MESSAGE_UPDATE: MessageCreateEntity;
  MESSAGE_DELETE: MessageDeleteEntity;
  MESSAGE_DELETE_BULK: MessageDeleteBulkEntity;
  MESSAGE_REACTION_ADD: MessageReactionAddEntity;
  MESSAGE_REACTION_REMOVE: MessageReactionRemoveEntity;
  MESSAGE_REACTION_REMOVE_ALL: MessageReactionRemoveAllEntity;
  MESSAGE_REACTION_REMOVE_EMOJI: MessageReactionRemoveEmojiEntity;
  PRESENCE_UPDATE: PresenceEntity;
  TYPING_START: TypingEntity;
  USER_UPDATE: UserEntity;
  VOICE_CHANNEL_EFFECT_SEND: VoiceChannelEffectSendEntity;
  VOICE_STATE_UPDATE: VoiceStateEntity;
  VOICE_SERVER_UPDATE: VoiceServerUpdateEntity;
  WEBHOOKS_UPDATE: WebhookUpdateEntity;
  INTERACTION_CREATE: AnyInteractionEntity;
  STAGE_INSTANCE_CREATE: StageInstanceEntity;
  STAGE_INSTANCE_UPDATE: StageInstanceEntity;
  STAGE_INSTANCE_DELETE: StageInstanceEntity;
  SUBSCRIPTION_CREATE: SubscriptionEntity;
  SUBSCRIPTION_UPDATE: SubscriptionEntity;
  SUBSCRIPTION_DELETE: SubscriptionEntity;
  MESSAGE_POLL_VOTE_ADD: MessagePollVoteAddEntity;
  MESSAGE_POLL_VOTE_REMOVE: MessagePollVoteRemoveEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#send-events}
 */
export interface GatewaySendEvents {
  [GatewayOpcodes.Identify]: IdentifyEntity;
  [GatewayOpcodes.Resume]: ResumeEntity;
  [GatewayOpcodes.Heartbeat]: number | null;
  [GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersEntity;
  [GatewayOpcodes.RequestSoundboardSounds]: RequestSoundboardSoundsEntity;
  [GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateEntity;
  [GatewayOpcodes.PresenceUpdate]: UpdatePresenceEntity;
}
