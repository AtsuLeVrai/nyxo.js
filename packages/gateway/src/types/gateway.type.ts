import type {
  AnyInteractionEntity,
  AutoModerationRuleEntity,
  ChannelEntity,
  EntitlementEntity,
  GuildApplicationCommandPermissionEntity,
  GuildEntity,
  GuildScheduledEventEntity,
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
import type { ShardEvent } from "../managers/index.js";
import type { HealthStatus } from "../services/index.js";

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

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: number | null;
  t: keyof GatewayReceiveEvents | null;
}

export type SessionEventType = "state" | "close" | "invalid";

export interface SessionEventBase {
  type: SessionEventType;
}

export interface SessionStateEvent extends SessionEventBase {
  type: "state";
  sessionId: string;
  resumeUrl: string;
}

export interface SessionCloseEvent extends SessionEventBase {
  type: "close";
  code: number;
  sessionId: string;
}

export interface SessionInvalidEvent extends SessionEventBase {
  type: "invalid";
  resumable: boolean;
}

export type SessionEvent =
  | SessionStateEvent
  | SessionCloseEvent
  | SessionInvalidEvent;

export interface GatewayEvents {
  sessionUpdate: [session: SessionEvent];
  healthStatus: [health: HealthStatus];
  shardUpdate: [shard: ShardEvent];
  debug: [message: string, context?: Record<string, unknown>];
  error: [message: string | Error, context?: Record<string, unknown>];
  dispatch: <K extends keyof GatewayReceiveEvents>(
    event: K,
    data: GatewayReceiveEvents[K],
  ) => void;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#list-of-intents}
 */
export enum GatewayIntentsBits {
  Guilds = 1 << 0,
  GuildMembers = 1 << 1,
  GuildModeration = 1 << 2,
  GuildExpressions = 1 << 3,
  GuildIntegrations = 1 << 4,
  GuildWebhooks = 1 << 5,
  GuildInvites = 1 << 6,
  GuildVoiceStates = 1 << 7,
  GuildPresences = 1 << 8,
  GuildMessages = 1 << 9,
  GuildMessageReactions = 1 << 10,
  GuildMessageTyping = 1 << 11,
  DirectMessages = 1 << 12,
  DirectMessageReactions = 1 << 13,
  DirectMessageTyping = 1 << 14,
  MessageContent = 1 << 15,
  GuildScheduledEvents = 1 << 16,
  AutoModerationConfiguration = 1 << 20,
  AutoModerationExecution = 1 << 21,
  GuildMessagePolls = 1 << 24,
  DirectMessagePolls = 1 << 25,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
 */
export enum GatewayOpcodes {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
  RequestSoundboardSounds = 31,
}
