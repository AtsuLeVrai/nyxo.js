import type { GatewayEventHandlers, PresenceEntity } from "@nyxjs/gateway";
import type { RestEventHandlers } from "@nyxjs/rest";
import type {
  AutoModerationRule,
  Ban,
  ChannelPins,
  Emoji,
  Entitlement,
  Guild,
  GuildMember,
  GuildScheduledEvent,
  GuildScheduledEventUser,
  Integration,
  Interaction,
  Invite,
  Message,
  Ready,
  Role,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadListSync,
  ThreadMember,
  Typing,
  UnavailableGuild,
  User,
  VoiceServer,
  VoiceState,
} from "../class/index.js";
import type { AnyChannel, AnyThreadChannel } from "../utils/index.js";

export interface CacheHitMiss {
  key: string;
  value: unknown;
  className: string;
}

export interface ClientEventHandlers
  extends RestEventHandlers,
    GatewayEventHandlers {
  cacheHit: [hit: CacheHitMiss];
  cacheMiss: [hit: CacheHitMiss];
  ready: [ready: Ready];
  resumed: [resumed: boolean];
  applicationCommandPermissionsUpdate: [
    oldPermissions: unknown,
    newPermissions: unknown,
  ];
  autoModerationRuleCreate: [rule: AutoModerationRule];
  autoModerationRuleUpdate: [
    oldRule: AutoModerationRule,
    newRule: AutoModerationRule,
  ];
  autoModerationRuleDelete: [rule: AutoModerationRule];
  autoModerationActionExecution: [action: unknown];
  channelCreate: [channel: AnyChannel];
  channelUpdate: [oldChannel: AnyChannel, newChannel: AnyChannel];
  channelDelete: [channel: AnyChannel];
  channelPinsUpdate: [pins: ChannelPins];
  threadCreate: [thread: AnyThreadChannel];
  threadUpdate: [oldThread: AnyThreadChannel, newThread: AnyThreadChannel];
  threadDelete: [thread: AnyThreadChannel];
  threadListSync: [sync: ThreadListSync];
  threadMemberUpdate: [oldMember: ThreadMember, newMember: ThreadMember];
  threadMembersUpdate: [update: unknown];
  entitlementCreate: [entitlement: Entitlement];
  entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
  entitlementDelete: [entitlement: Entitlement];
  guildCreate: [guild: Guild | UnavailableGuild];
  guildUpdate: [oldGuild: Guild, newGuild: Guild];
  guildDelete: [guild: Guild];
  guildAuditLogEntryCreate: [entry: unknown];
  guildBanAdd: [ban: Ban];
  guildBanRemove: [ban: Ban];
  guildEmojisUpdate: [oldEmojis: Emoji, newEmojis: Emoji];
  guildStickersUpdate: [oldStickers: Sticker, newStickers: Sticker];
  guildIntegrationsUpdate: [
    oldIntegrations: Integration,
    newIntegrations: Integration,
  ];
  guildMemberAdd: [member: GuildMember];
  guildMemberRemove: [member: GuildMember];
  guildMemberUpdate: [oldMember: GuildMember, newMember: GuildMember];
  guildMembersChunk: [chunk: unknown];
  guildRoleCreate: [role: Role];
  guildRoleUpdate: [oldRole: Role, newRole: Role];
  guildRoleDelete: [role: Role];
  guildScheduledEventCreate: [event: GuildScheduledEvent];
  guildScheduledEventUpdate: [
    oldEvent: GuildScheduledEvent,
    newEvent: GuildScheduledEvent,
  ];
  guildScheduledEventDelete: [event: GuildScheduledEvent];
  guildScheduledEventUserAdd: [user: GuildScheduledEventUser];
  guildScheduledEventUserRemove: [user: GuildScheduledEventUser];
  guildSoundboardSoundCreate: [sound: SoundboardSound];
  guildSoundboardSoundUpdate: [
    oldSound: SoundboardSound,
    newSound: SoundboardSound,
  ];
  guildSoundboardSoundDelete: [sound: SoundboardSound];
  guildSoundboardSoundsUpdate: [update: unknown];
  soundboardSounds: [sounds: unknown];
  integrationCreate: [integration: Integration];
  integrationUpdate: [oldIntegration: Integration, newIntegration: Integration];
  integrationDelete: [integration: Integration];
  inviteCreate: [invite: Invite];
  inviteDelete: [invite: Invite];
  messageCreate: [message: Message];
  messageUpdate: [oldMessage: Message, newMessage: Message];
  messageDelete: [message: Message];
  messageDeleteBulk: [messages: unknown];
  messageReactionAdd: [reaction: unknown];
  messageReactionRemove: [reaction: unknown];
  messageReactionRemoveAll: [reactions: unknown];
  messageReactionRemoveEmoji: [reaction: unknown];
  presenceUpdate: [oldPresence: PresenceEntity, newPresence: PresenceEntity];
  typingStart: [typing: Typing];
  userUpdate: [oldUser: User, newUser: User];
  voiceChannelEffectSend: [effect: unknown];
  voiceStateUpdate: [oldState: VoiceState, newState: VoiceState];
  voiceServerUpdate: [update: VoiceServer];
  webhooksUpdate: [webhooks: unknown];
  interactionCreate: [interaction: Interaction];
  stageInstanceCreate: [instance: StageInstance];
  stageInstanceUpdate: [oldInstance: StageInstance, newInstance: StageInstance];
  stageInstanceDelete: [instance: StageInstance];
  subscriptionCreate: [subscription: Subscription];
  subscriptionUpdate: [
    oldSubscription: Subscription,
    newSubscription: Subscription,
  ];
  subscriptionDelete: [subscription: Subscription];
  messagePollVoteAdd: [vote: unknown];
  messagePollVoteRemove: [vote: unknown];
}
