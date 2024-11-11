import type { ApiVersions, GatewayCloseCodes, GatewayIntentResolvable } from "@nyxjs/core";
import type { GatewayOptions, PresenceUpdateEventFields } from "@nyxjs/gateway";
import type { RateLimitInfo, RestOptions } from "@nyxjs/rest";
import type WebSocket from "ws";
import type {
    AutoModerationActionExecution,
    AutoModerationRule,
    Ban,
    Channel,
    ChannelPins,
    Emoji,
    Entitlement,
    Guild,
    GuildMember,
    GuildOnboarding,
    GuildOnboardingPrompt,
    GuildScheduledEvent,
    GuildScheduledEventUser,
    Integration,
    Invite,
    Message,
    MessagePollVote,
    Overwrite,
    Reaction,
    Ready,
    Role,
    SoundboardSound,
    StageInstance,
    Sticker,
    Subscription,
    ThreadChannel,
    ThreadListSync,
    ThreadMember,
    ThreadMembers,
    TypingStart,
    User,
    VoiceChannelEffectSend,
    VoiceServer,
    VoiceState,
    Webhook,
} from "../structures/index.js";

export interface ClientOptions {
    gateway?: Partial<Omit<GatewayOptions, "intents" | "v">>;
    intents: GatewayIntentResolvable;
    rest?: Partial<Omit<RestOptions, "version">>;
    version?: ApiVersions;
}

export interface ClientState {
    isConnecting: boolean;
    isConnected: boolean;
    isReconnecting: boolean;
}

export interface ClientEvents {
    applicationCommandPermissionUpdate: [];
    autoModerationActionExecute: [action: AutoModerationActionExecution];
    autoModerationRuleCreate: [rule: AutoModerationRule];
    autoModerationRuleDelete: [rule: AutoModerationRule];
    autoModerationRuleUpdate: [oldRule: AutoModerationRule, newRule: AutoModerationRule];
    channelCreate: [channel: Channel];
    channelDelete: [channel: Channel];
    channelOverwriteCreate: [overwrite: Overwrite];
    channelOverwriteDelete: [overwrite: Overwrite];
    channelOverwriteUpdate: [oldOverwrite: Overwrite, newOverwrite: Overwrite];
    channelPinsUpdate: [oldPins: ChannelPins, newPins: ChannelPins];
    channelUpdate: [oldChannel: Channel, newChannel: Channel];
    close: [code: GatewayCloseCodes, reason: string];
    debug: [message: string];
    emojiCreate: [emoji: Emoji];
    emojiDelete: [emoji: Emoji];
    emojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
    entitlementCreate: [entitlement: Entitlement];
    entitlementDelete: [entitlement: Entitlement];
    entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
    error: [error: Error | string];
    guildAuditLogEntryCreate: [];
    guildBanAdd: [ban: Ban];
    guildBanRemove: [ban: Ban];
    guildCreate: [guild: Guild];
    guildDelete: [guild: Guild];
    guildMemberAdd: [member: GuildMember];
    guildMemberRemove: [member: GuildMember];
    guildMemberUpdate: [oldMember: GuildMember, newMember: GuildMember];
    guildScheduledEventCreate: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventDelete: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventUpdate: [oldScheduledEvent: GuildScheduledEvent, newScheduledEvent: GuildScheduledEvent];
    guildScheduledEventUserAdd: [user: GuildScheduledEventUser];
    guildScheduledEventUserRemove: [user: GuildScheduledEventUser];
    guildUpdate: [oldGuild: Guild, newGuild: Guild];
    interactionCreate: [];
    integrationCreate: [integration: Integration];
    integrationDelete: [integration: Integration];
    integrationUpdate: [oldIntegration: Integration, newIntegration: Integration];
    invalidSession: [invalidated: boolean];
    inviteCreate: [invite: Invite];
    inviteDelete: [invite: Invite];
    inviteUpdate: [oldInvite: Invite, newInvite: Invite];
    messageCreate: [message: Message];
    messageDelete: [message: Message];
    messageDeleteBulk: [];
    messagePollVoteAdd: [poll: MessagePollVote];
    messagePollVoteRemove: [poll: MessagePollVote];
    messageReactionAdd: [reaction: Reaction];
    messageReactionRemove: [reaction: Reaction];
    messageReactionRemoveAll: [];
    messageReactionRemoveEmoji: [];
    messageUpdate: [oldMessage: Message, newMessage: Message];
    missedAck: [message: string];
    onboardingCreate: [onboarding: GuildOnboarding];
    onboardingPromptCreate: [onboardingPrompt: GuildOnboardingPrompt];
    onboardingPromptDelete: [onboardingPrompt: GuildOnboardingPrompt];
    onboardingPromptUpdate: [oldOnboardingPrompt: GuildOnboardingPrompt, newOnboardingPrompt: GuildOnboardingPrompt];
    onboardingUpdate: [oldOnboarding: GuildOnboarding, newOnboarding: GuildOnboarding];
    presenceUpdate: [presence: PresenceUpdateEventFields];
    rateLimit: [rateLimitInfo: RateLimitInfo];
    raw: [data: WebSocket.RawData, isBinary: boolean];
    ready: [ready: Ready];
    roleCreate: [role: Role];
    roleDelete: [role: Role];
    roleUpdate: [oldRole: Role, newRole: Role];
    soundboardSoundCreate: [soundboard: SoundboardSound];
    soundboardSoundDelete: [soundboard: SoundboardSound];
    soundboardSoundUpdate: [oldSoundboard: SoundboardSound, newSoundboard: SoundboardSound];
    stageInstanceCreate: [stage: StageInstance];
    stageInstanceDelete: [stage: StageInstance];
    stageInstanceUpdate: [oldStage: StageInstance, newStage: StageInstance];
    stickerCreate: [sticker: Sticker];
    stickerDelete: [sticker: Sticker];
    stickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
    subscriptionCreate: [subscription: Subscription];
    subscriptionDelete: [subscription: Subscription];
    subscriptionUpdate: [oldSubscription: Subscription, newSubscription: Subscription];
    threadCreate: [thread: ThreadChannel];
    threadDelete: [thread: ThreadChannel];
    threadListSync: [list: ThreadListSync];
    threadMemberUpdate: [oldMember: ThreadMember, newMember: ThreadMember];
    threadMembersUpdate: [members: ThreadMembers];
    threadUpdate: [oldThread: ThreadChannel, newThread: ThreadChannel];
    typingStart: [typing: TypingStart];
    userUpdate: [oldUser: User, newUser: User];
    voiceChannelEffectSend: [effect: VoiceChannelEffectSend];
    voiceServerUpdate: [server: VoiceServer];
    voiceStateUpdate: [state: VoiceState];
    warn: [message: string];
    webhookCreate: [webhook: Webhook];
    webhookDelete: [webhook: Webhook];
    webhookUpdate: [oldWebhook: Webhook, newWebhook: Webhook];
}
