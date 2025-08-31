import type {
  SoundboardSound,
  StageInstance,
  Subscription,
  User,
  VoiceState,
} from "../../resources/index.js";
import type { GatewayEvents } from "../gateway/index.js";

export interface ClientEvents extends GatewayEvents {
  ready: [ready: unknown];
  resumed: [resumed: unknown];
  applicationCommandPermissionsUpdate: [
    oldApplicationCommandPermissions: unknown,
    newApplicationCommandPermissions: unknown,
  ];
  autoModerationRuleCreate: [autoModerationRule: unknown];
  autoModerationRuleUpdate: [oldAutoModerationRule: unknown, newAutoModerationRule: unknown];
  autoModerationRuleDelete: [autoModerationRule: unknown];
  autoModerationActionExecution: [autoModerationActionExecution: unknown];
  channelCreate: [channel: unknown];
  channelUpdate: [oldChannel: unknown, newChannel: unknown];
  channelDelete: [channel: unknown];
  channelPinsUpdate: [channelPinsUpdate: unknown];
  threadCreate: [thread: unknown];
  threadUpdate: [oldThread: unknown, newThread: unknown];
  threadDelete: [thread: unknown];
  threadListSync: [threadListSync: unknown];
  threadMemberUpdate: [oldThreadMember: unknown, newThreadMember: unknown];
  threadMembersUpdate: [threadMembersUpdate: unknown];
  entitlementCreate: [entitlement: unknown];
  entitlementUpdate: [oldEntitlement: unknown, newEntitlement: unknown];
  entitlementDelete: [entitlement: unknown];
  guildCreate: [guild: unknown];
  guildUpdate: [oldGuild: unknown, newGuild: unknown];
  guildDelete: [guild: unknown];
  guildAuditLogEntryCreate: [guildAuditLogEntry: unknown];
  guildBanAdd: [guildBan: unknown];
  guildBanRemove: [guildBan: unknown];
  guildEmojisUpdate: [oldGuildEmojis: unknown, newGuildEmojis: unknown];
  guildStickersUpdate: [oldGuildStickers: unknown, newGuildStickers: unknown];
  guildIntegrationsUpdate: [guildIntegrationsUpdate: unknown];
  guildMemberAdd: [guildMember: unknown];
  guildMemberRemove: [guildMember: unknown];
  guildMemberUpdate: [oldGuildMember: unknown, newGuildMember: unknown];
  guildMembersChunk: [guildMembersChunk: unknown];
  guildRoleCreate: [guildRole: unknown];
  guildRoleUpdate: [oldGuildRole: unknown, newGuildRole: unknown];
  guildRoleDelete: [guildRole: unknown];
  guildScheduledEventCreate: [guildScheduledEvent: unknown];
  guildScheduledEventUpdate: [oldGuildScheduledEvent: unknown, newGuildScheduledEvent: unknown];
  guildScheduledEventDelete: [guildScheduledEvent: unknown];
  guildScheduledEventUserAdd: [guildScheduledEventUser: unknown];
  guildScheduledEventUserRemove: [guildScheduledEventUser: unknown];
  guildSoundboardSoundCreate: [soundboardSound: unknown];
  guildSoundboardSoundUpdate: [oldSoundboardSound: unknown, newSoundboardSound: unknown];
  guildSoundboardSoundDelete: [soundboardSound: unknown];
  guildSoundboardSoundsUpdate: [oldSoundboardSounds: unknown, newSoundboardSounds: unknown];
  soundboardSounds: [soundboardSounds: SoundboardSound];
  integrationCreate: [integration: unknown];
  integrationUpdate: [oldIntegration: unknown, newIntegration: unknown];
  integrationDelete: [integration: unknown];
  inviteCreate: [invite: unknown];
  inviteDelete: [invite: unknown];
  messageCreate: [message: unknown];
  messageUpdate: [oldMessage: unknown, newMessage: unknown];
  messageDelete: [message: unknown];
  messageDeleteBulk: [messageDeleteBulk: unknown];
  messageReactionAdd: [messageReaction: unknown];
  messageReactionRemove: [messageReaction: unknown];
  messageReactionRemoveAll: [messageReactionRemoveAll: unknown];
  messageReactionRemoveEmoji: [messageReactionRemoveEmoji: unknown];
  presenceUpdate: [oldPresence: unknown, newPresence: unknown];
  typingStart: [typingStart: unknown];
  userUpdate: [oldUser: User, newUser: User];
  voiceChannelEffectSend: [voiceChannelEffect: unknown];
  voiceStateUpdate: [oldVoiceState: VoiceState, newVoiceState: VoiceState];
  voiceServerUpdate: [voiceServerUpdate: unknown];
  webhooksUpdate: [webhooksUpdate: unknown];
  interactionCreate: [interaction: unknown];
  stageInstanceCreate: [stageInstance: StageInstance];
  stageInstanceUpdate: [oldStageInstance: StageInstance, newStageInstance: StageInstance];
  stageInstanceDelete: [stageInstance: StageInstance];
  subscriptionCreate: [subscription: Subscription];
  subscriptionUpdate: [oldSubscription: Subscription, newSubscription: Subscription];
  subscriptionDelete: [subscription: Subscription];
  messagePollVoteAdd: [messagePollVote: unknown];
  messagePollVoteRemove: [messagePollVote: unknown];
}
