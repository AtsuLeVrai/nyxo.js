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

export interface ClientEventHandlers
  extends RestEventHandlers,
    GatewayEventHandlers {
  ready: (ready: Ready) => void;
  resumed: (resumed: boolean) => void;
  applicationCommandPermissionsUpdate: (
    oldPermissions: unknown,
    newPermissions: unknown,
  ) => void;
  autoModerationRuleCreate: (rule: AutoModerationRule) => void;
  autoModerationRuleUpdate: (
    oldRule: AutoModerationRule,
    newRule: AutoModerationRule,
  ) => void;
  autoModerationRuleDelete: (rule: AutoModerationRule) => void;
  autoModerationActionExecution: (action: unknown) => void;
  channelCreate: (channel: AnyChannel) => void;
  channelUpdate: (oldChannel: AnyChannel, newChannel: AnyChannel) => void;
  channelDelete: (channel: AnyChannel) => void;
  channelPinsUpdate: (pins: ChannelPins) => void;
  threadCreate: (thread: AnyThreadChannel) => void;
  threadUpdate: (
    oldThread: AnyThreadChannel,
    newThread: AnyThreadChannel,
  ) => void;
  threadDelete: (thread: AnyThreadChannel) => void;
  threadListSync: (sync: ThreadListSync) => void;
  threadMemberUpdate: (
    oldMember: ThreadMember,
    newMember: ThreadMember,
  ) => void;
  threadMembersUpdate: (update: unknown) => void;
  entitlementCreate: (entitlement: Entitlement) => void;
  entitlementUpdate: (
    oldEntitlement: Entitlement,
    newEntitlement: Entitlement,
  ) => void;
  entitlementDelete: (entitlement: Entitlement) => void;
  guildCreate: (guild: Guild | UnavailableGuild) => void;
  guildUpdate: (oldGuild: Guild, newGuild: Guild) => void;
  guildDelete: (guild: Guild) => void;
  guildAuditLogEntryCreate: (entry: unknown) => void;
  guildBanAdd: (ban: Ban) => void;
  guildBanRemove: (ban: Ban) => void;
  guildEmojisUpdate: (oldEmojis: Emoji, newEmojis: Emoji) => void;
  guildStickersUpdate: (oldStickers: Sticker, newStickers: Sticker) => void;
  guildIntegrationsUpdate: (
    oldIntegrations: Integration,
    newIntegrations: Integration,
  ) => void;
  guildMemberAdd: (member: GuildMember) => void;
  guildMemberRemove: (member: GuildMember) => void;
  guildMemberUpdate: (oldMember: GuildMember, newMember: GuildMember) => void;
  guildMembersChunk: (chunk: unknown) => void;
  guildRoleCreate: (role: Role) => void;
  guildRoleUpdate: (oldRole: Role, newRole: Role) => void;
  guildRoleDelete: (role: Role) => void;
  guildScheduledEventCreate: (event: GuildScheduledEvent) => void;
  guildScheduledEventUpdate: (
    oldEvent: GuildScheduledEvent,
    newEvent: GuildScheduledEvent,
  ) => void;
  guildScheduledEventDelete: (event: GuildScheduledEvent) => void;
  guildScheduledEventUserAdd: (user: GuildScheduledEventUser) => void;
  guildScheduledEventUserRemove: (user: GuildScheduledEventUser) => void;
  guildSoundboardSoundCreate: (sound: SoundboardSound) => void;
  guildSoundboardSoundUpdate: (
    oldSound: SoundboardSound,
    newSound: SoundboardSound,
  ) => void;
  guildSoundboardSoundDelete: (sound: SoundboardSound) => void;
  guildSoundboardSoundsUpdate: (update: unknown) => void;
  soundboardSounds: (sounds: unknown) => void;
  integrationCreate: (integration: Integration) => void;
  integrationUpdate: (
    oldIntegration: Integration,
    newIntegration: Integration,
  ) => void;
  integrationDelete: (integration: Integration) => void;
  inviteCreate: (invite: Invite) => void;
  inviteDelete: (invite: Invite) => void;
  messageCreate: (message: Message) => void;
  messageUpdate: (oldMessage: Message, newMessage: Message) => void;
  messageDelete: (message: Message) => void;
  messageDeleteBulk: (messages: unknown) => void;
  messageReactionAdd: (reaction: unknown) => void;
  messageReactionRemove: (reaction: unknown) => void;
  messageReactionRemoveAll: (reactions: unknown) => void;
  messageReactionRemoveEmoji: (reaction: unknown) => void;
  presenceUpdate: (
    oldPresence: PresenceEntity,
    newPresence: PresenceEntity,
  ) => void;
  typingStart: (typing: Typing) => void;
  userUpdate: (oldUser: User, newUser: User) => void;
  voiceChannelEffectSend: (effect: unknown) => void;
  voiceStateUpdate: (oldState: VoiceState, newState: VoiceState) => void;
  voiceServerUpdate: (update: VoiceServer) => void;
  webhooksUpdate: (webhooks: unknown) => void;
  interactionCreate: (interaction: Interaction) => void;
  stageInstanceCreate: (instance: StageInstance) => void;
  stageInstanceUpdate: (
    oldInstance: StageInstance,
    newInstance: StageInstance,
  ) => void;
  stageInstanceDelete: (instance: StageInstance) => void;
  subscriptionCreate: (subscription: Subscription) => void;
  subscriptionUpdate: (
    oldSubscription: Subscription,
    newSubscription: Subscription,
  ) => void;
  subscriptionDelete: (subscription: Subscription) => void;
  messagePollVoteAdd: (vote: unknown) => void;
  messagePollVoteRemove: (vote: unknown) => void;
}
