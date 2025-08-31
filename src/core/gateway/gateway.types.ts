import { GatewayOpcodes } from "../../enum/index.js";
import type {
  ActivityEntity,
  AnyChannelEntity,
  AnyInteractionEntity,
  AnyThreadBasedChannelEntity,
  AutoModerationActionExecutionEntity,
  AutoModerationRuleEntity,
  ChannelPinsUpdateEntity,
  EntitlementEntity,
  GatewayGuildSoundboardSoundDeleteEntity,
  GatewayInviteCreateEntity,
  GatewayInviteDeleteEntity,
  GatewayMessageCreateEntity,
  GatewayMessageDeleteBulkEntity,
  GatewayMessageDeleteEntity,
  GatewayMessagePollVoteEntity,
  GatewayMessageReactionAddEntity,
  GatewayMessageReactionRemoveAllEntity,
  GatewayMessageReactionRemoveEmojiEntity,
  GatewayMessageReactionRemoveEntity,
  GatewayPresenceUpdateEntity,
  GatewaySoundboardSoundsEntity,
  GatewayTypingStartEntity,
  GatewayVoiceChannelEffectSendEntity,
  GatewayVoiceServerUpdateEntity,
  GatewayWebhooksUpdateEntity,
  GuildApplicationCommandPermissionEntity,
  GuildAuditLogEntryCreateEntity,
  GuildBanEntity,
  GuildCreateEntity,
  GuildEmojisUpdateEntity,
  GuildEntity,
  GuildIntegrationsUpdateEntity,
  GuildMemberAddEntity,
  GuildMemberRemoveEntity,
  GuildMembersChunkEntity,
  GuildMemberUpdateEntity,
  GuildRoleDeleteEntity,
  GuildRoleUpdateEntity,
  GuildScheduledEventEntity,
  GuildScheduledEventUserAddRemoveEntity,
  GuildStickersUpdateEntity,
  IntegrationDeleteEntity,
  IntegrationUpdateEntity,
  ReadyEntity,
  SoundboardSoundEntity,
  StageInstanceEntity,
  SubscriptionEntity,
  ThreadListSyncEntity,
  ThreadMemberEntity,
  ThreadMembersUpdateEntity,
  ThreadMemberUpdateEntity,
  UnavailableGuildEntity,
  UpdatePresenceStatusType,
  UserEntity,
  VoiceStateEntity,
} from "../../resources/index.js";

export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: number | null;
  t: keyof GatewayReceiveEvents | null;
}

export interface IdentifyConnectionProperties {
  os: string;
  browser: string;
  device: string;
}

export interface IdentifyEntity {
  token: string;
  properties: IdentifyConnectionProperties;
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: UpdatePresenceEntity;
  intents: number;
}

export interface ResumeEntity {
  token: string;
  session_id: string;
  seq: number;
}

export interface RequestGuildMembersEntity {
  guild_id: string;
  query?: string;
  limit: number;
  presences?: boolean;
  user_ids?: string | string[];
  nonce?: string;
}

export interface RequestSoundboardSoundsEntity {
  guild_ids: string[];
}

export interface UpdateVoiceStateEntity {
  guild_id: string;
  channel_id: string | null;
  self_mute: boolean;
  self_deaf: boolean;
}

export interface UpdatePresenceEntity {
  since: number | null;
  activities: ActivityEntity[];
  status: UpdatePresenceStatusType;
  afk: boolean;
}

export interface GatewaySendEvents {
  [GatewayOpcodes.Identify]: IdentifyEntity;
  [GatewayOpcodes.Resume]: ResumeEntity;
  [GatewayOpcodes.Heartbeat]: number | null;
  [GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersEntity;
  [GatewayOpcodes.RequestSoundboardSounds]: RequestSoundboardSoundsEntity;
  [GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateEntity;
  [GatewayOpcodes.PresenceUpdate]: UpdatePresenceEntity;
}

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
    | (AnyThreadBasedChannelEntity & { newly_created: boolean })
    | (AnyThreadBasedChannelEntity & ThreadMemberEntity);
  THREAD_UPDATE: Omit<AnyThreadBasedChannelEntity, "last_message_id">;
  THREAD_DELETE: Pick<AnyThreadBasedChannelEntity, "id" | "guild_id" | "parent_id" | "type">;
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
  GUILD_BAN_ADD: GuildBanEntity;
  GUILD_BAN_REMOVE: GuildBanEntity;
  GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEntity;
  GUILD_STICKERS_UPDATE: GuildStickersUpdateEntity;
  GUILD_INTEGRATIONS_UPDATE: GuildIntegrationsUpdateEntity;
  GUILD_MEMBER_ADD: GuildMemberAddEntity;
  GUILD_MEMBER_REMOVE: GuildMemberRemoveEntity;
  GUILD_MEMBER_UPDATE: GuildMemberUpdateEntity;
  GUILD_MEMBERS_CHUNK: GuildMembersChunkEntity;
  GUILD_ROLE_CREATE: GuildRoleUpdateEntity;
  GUILD_ROLE_UPDATE: GuildRoleUpdateEntity;
  GUILD_ROLE_DELETE: GuildRoleDeleteEntity;
  GUILD_SCHEDULED_EVENT_CREATE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_UPDATE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_DELETE: GuildScheduledEventEntity;
  GUILD_SCHEDULED_EVENT_USER_ADD: GuildScheduledEventUserAddRemoveEntity;
  GUILD_SCHEDULED_EVENT_USER_REMOVE: GuildScheduledEventUserAddRemoveEntity;
  GUILD_SOUNDBOARD_SOUND_CREATE: SoundboardSoundEntity;
  GUILD_SOUNDBOARD_SOUND_UPDATE: SoundboardSoundEntity;
  GUILD_SOUNDBOARD_SOUND_DELETE: GatewayGuildSoundboardSoundDeleteEntity;
  GUILD_SOUNDBOARD_SOUNDS_UPDATE: GatewaySoundboardSoundsEntity;
  SOUNDBOARD_SOUNDS: GatewaySoundboardSoundsEntity;
  INTEGRATION_CREATE: IntegrationUpdateEntity;
  INTEGRATION_UPDATE: IntegrationUpdateEntity;
  INTEGRATION_DELETE: IntegrationDeleteEntity;
  INVITE_CREATE: GatewayInviteCreateEntity;
  INVITE_DELETE: GatewayInviteDeleteEntity;
  MESSAGE_CREATE: GatewayMessageCreateEntity;
  MESSAGE_UPDATE: GatewayMessageCreateEntity;
  MESSAGE_DELETE: GatewayMessageDeleteEntity;
  MESSAGE_DELETE_BULK: GatewayMessageDeleteBulkEntity;
  MESSAGE_REACTION_ADD: GatewayMessageReactionAddEntity;
  MESSAGE_REACTION_REMOVE: GatewayMessageReactionRemoveEntity;
  MESSAGE_REACTION_REMOVE_ALL: GatewayMessageReactionRemoveAllEntity;
  MESSAGE_REACTION_REMOVE_EMOJI: GatewayMessageReactionRemoveEmojiEntity;
  PRESENCE_UPDATE: GatewayPresenceUpdateEntity;
  TYPING_START: GatewayTypingStartEntity;
  USER_UPDATE: UserEntity;
  VOICE_CHANNEL_EFFECT_SEND: GatewayVoiceChannelEffectSendEntity;
  VOICE_STATE_UPDATE: VoiceStateEntity;
  VOICE_SERVER_UPDATE: GatewayVoiceServerUpdateEntity;
  WEBHOOKS_UPDATE: GatewayWebhooksUpdateEntity;
  INTERACTION_CREATE: AnyInteractionEntity;
  STAGE_INSTANCE_CREATE: StageInstanceEntity;
  STAGE_INSTANCE_UPDATE: StageInstanceEntity;
  STAGE_INSTANCE_DELETE: StageInstanceEntity;
  SUBSCRIPTION_CREATE: SubscriptionEntity;
  SUBSCRIPTION_UPDATE: SubscriptionEntity;
  SUBSCRIPTION_DELETE: SubscriptionEntity;
  MESSAGE_POLL_VOTE_ADD: GatewayMessagePollVoteEntity;
  MESSAGE_POLL_VOTE_REMOVE: GatewayMessagePollVoteEntity;
}
