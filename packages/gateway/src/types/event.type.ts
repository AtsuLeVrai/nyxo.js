import type {
  AutoModerationRuleEntity,
  ChannelEntity,
  EntitlementEntity,
  GuildApplicationCommandPermissionEntity,
  GuildEntity,
  GuildScheduledEventEntity,
  InteractionEntity,
  SoundboardSoundEntity,
  StageInstanceEntity,
  SubscriptionEntity,
  ThreadMemberEntity,
  UnavailableGuildEntity,
  UserEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { GatewayOpcodes } from "../constants/index.js";
import type {
  AutoModerationActionExecutionEntity,
  ChannelPinsUpdateEntity,
  GuildAuditLogEntryCreateEntity,
  GuildBanAddEntity,
  GuildBanRemoveEntity,
  GuildCreateEntity,
  GuildEmojisUpdateEntity,
  GuildIntegrationsUpdateEntity,
  GuildMemberAddEntity,
  GuildMemberRemoveEntity,
  GuildMemberUpdateEntity,
  GuildMembersChunkEntity,
  GuildRoleCreateEntity,
  GuildRoleDeleteEntity,
  GuildRoleUpdateEntity,
  GuildScheduledEventUserAddEntity,
  GuildScheduledEventUserRemoveEntity,
  GuildSoundboardSoundDeleteEntity,
  GuildSoundboardSoundsUpdateEntity,
  GuildStickersUpdateEntity,
  HelloEntity,
  IdentifyEntity,
  IntegrationCreateEntity,
  IntegrationDeleteEntity,
  IntegrationUpdateEntity,
  InviteCreateEntity,
  InviteDeleteEntity,
  MessageCreateEntity,
  MessageDeleteBulkEntity,
  MessageDeleteEntity,
  MessagePollVoteAddEntity,
  MessagePollVoteRemoveEntity,
  MessageReactionAddEntity,
  MessageReactionRemoveAllEntity,
  MessageReactionRemoveEmojiEntity,
  MessageReactionRemoveEntity,
  PresenceEntity,
  ReadyEntity,
  RequestGuildMembersEntity,
  RequestSoundboardSoundsEntity,
  ResumeEntity,
  SoundboardSoundsEntity,
  ThreadListSyncEntity,
  ThreadMemberUpdateEntity,
  ThreadMembersUpdateEntity,
  TypingEntity,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
  VoiceChannelEffectSendEntity,
  VoiceServerUpdateEntity,
  WebhookUpdateEntity,
} from "../events/index.js";
import type { ShardStats } from "../schemas/index.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#receive-events}
 */
export interface GatewayReceiveEvents {
  [GatewayOpcodes.Hello]: HelloEntity;
  READY: ReadyEntity;
  RESUMED: boolean;
  [GatewayOpcodes.Reconnect]: number;
  [GatewayOpcodes.InvalidSession]: boolean;
  APPLICATION_COMMAND_PERMISSIONS_UPDATE: GuildApplicationCommandPermissionEntity;
  AUTO_MODERATION_RULE_CREATE: AutoModerationRuleEntity;
  AUTO_MODERATION_RULE_UPDATE: AutoModerationRuleEntity;
  AUTO_MODERATION_RULE_DELETE: AutoModerationRuleEntity;
  AUTO_MODERATION_ACTION_EXECUTION: AutoModerationActionExecutionEntity;
  CHANNEL_CREATE: ChannelEntity;
  CHANNEL_UPDATE: ChannelEntity;
  CHANNEL_DELETE: ChannelEntity;
  CHANNEL_PINS_UPDATE: ChannelPinsUpdateEntity;
  THREAD_CREATE:
    | (ChannelEntity & { newly_created: boolean })
    | (ChannelEntity & ThreadMemberEntity);
  THREAD_UPDATE: Omit<ChannelEntity, "last_message_id">;
  THREAD_DELETE: Pick<ChannelEntity, "id" | "guild_id" | "parent_id" | "type">;
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
  TYPEING_START: TypingEntity;
  USER_UPDATE: UserEntity;
  VOICE_CHANNEL_EFFECT_SEND: VoiceChannelEffectSendEntity;
  VOICE_STATE_UPDATE: VoiceStateEntity;
  VOICE_SERVER_UPDATE: VoiceServerUpdateEntity;
  WEBHOOKS_UPDATE: WebhookUpdateEntity;
  INTERACTION_CREATE: InteractionEntity;
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

export interface GatewayEvents {
  shardSpawn: (shardId: number) => void;
  shardReady: (shardId: number) => void;
  shardDisconnect: (shardId: number) => void;
  shardReconnect: (shardId: number) => void;
  shardResume: (shardId: number) => void;
  statsUpdate: (stats: ShardStats) => void;
  connecting: (attempt: number) => void;
  connected: () => void;
  reconnecting: (attempt: number) => void;
  dispatch: <K extends keyof GatewayReceiveEvents>(
    event: K,
    data: GatewayReceiveEvents[K],
  ) => void;
  sessionStart: (sessionId: string, data: ReadyEntity) => void;
  sessionEnd: (sessionId: string, code: number) => void;
  sessionInvalid: (resumable: boolean) => void;
  close: (code: number) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
}
