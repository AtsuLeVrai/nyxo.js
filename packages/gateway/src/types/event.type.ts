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
import { type GatewayCloseCodes, GatewayOpcodes } from "./gateway.type.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#receive-events}
 */
export interface GatewayReceiveEventsMap {
  [GatewayOpcodes.hello]: HelloEntity;
  READY: ReadyEntity;
  RESUMED: boolean;
  [GatewayOpcodes.reconnect]: number;
  [GatewayOpcodes.invalidSession]: boolean;
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
  INTERATION_CREATE: InteractionEntity;
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
export interface GatewaySendEventsMap {
  [GatewayOpcodes.identify]: IdentifyEntity;
  [GatewayOpcodes.resume]: ResumeEntity;
  [GatewayOpcodes.heartbeat]: number | null;
  [GatewayOpcodes.requestGuildMembers]: RequestGuildMembersEntity;
  [GatewayOpcodes.requestSoundboardSounds]: RequestSoundboardSoundsEntity;
  [GatewayOpcodes.voiceStateUpdate]: UpdateVoiceStateEntity;
  [GatewayOpcodes.presenceUpdate]: UpdatePresenceEntity;
}

export interface GatewayEventsMap<
  T extends keyof GatewayReceiveEventsMap = keyof GatewayReceiveEventsMap,
> {
  debug: [message: string];
  warn: [message: string];
  error: [error: Error];
  close: [code: GatewayCloseCodes];
  dispatch: [event: T, data: GatewayReceiveEventsMap[T]];
  connecting: [attempt: number];
  connected: [];
  reconnecting: [attempt: number];
  heartbeat: [sequence: number];
  heartbeatAck: [latency: number];
  heartbeatTimeout: [missedHeartbeats: number];
  sessionStart: [sessionId: string];
  sessionEnd: [sessionId: string, code: number];
  sessionInvalid: [resumable: boolean];
  shardReady: [shardId: number];
  shardReconnecting: [shardId: number];
  shardResume: [shardId: number];
  shardDisconnect: [shardId: number, code: number];
}
