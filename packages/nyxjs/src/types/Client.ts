import type { ApiVersions, GatewayCloseCodes, GatewayIntentResolvable } from "@nyxjs/core";
import type { GatewayOptions } from "@nyxjs/gateway";
import type { RateLimitInfo, RestOptions } from "@nyxjs/rest";
import type WebSocket from "ws";
import type {
    Ban,
    Emoji,
    Entitlement,
    Guild,
    GuildMember,
    GuildOnboardingPrompt,
    Integration,
    Ready,
    Role,
    SoundboardSound,
    StageInstance,
    Sticker,
    Subscription,
    User,
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
    autoModerationActionExecute: [];
    autoModerationBlockMessage: [];
    autoModerationFlagToChannel: [];
    autoModerationRuleCreate: [];
    autoModerationRuleDelete: [];
    autoModerationRuleUpdate: [];
    autoModerationUserCommunicationDisabled: [];
    botAdd: [];
    channelCreate: [];
    channelDelete: [];
    channelOverwriteCreate: [];
    channelOverwriteDelete: [];
    channelOverwriteUpdate: [];
    channelPinsUpdate: [];
    channelUpdate: [];
    close: [code: GatewayCloseCodes, reason: string];
    creatorMonetizationRequestCreated: [];
    creatorMonetizationTermsAccepted: [];
    debug: [message: string];
    emojiCreate: [emoji: Emoji];
    emojiDelete: [emoji: Emoji];
    emojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
    entitlementCreate: [entitlement: Entitlement];
    entitlementDelete: [entitlement: Entitlement];
    entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
    error: [error: Error];
    guildAuditLogEntryCreate: [];
    guildBanAdd: [ban: Ban];
    guildBanRemove: [ban: Ban];
    guildCreate: [guild: Guild];
    guildDelete: [guild: Guild];
    guildMemberAdd: [member: GuildMember];
    guildMemberRemove: [member: GuildMember];
    guildMemberUpdate: [oldMember: GuildMember, newMember: GuildMember];
    guildScheduledEventCreate: [];
    guildScheduledEventDelete: [];
    guildScheduledEventUpdate: [];
    guildScheduledEventUserAdd: [];
    guildScheduledEventUserRemove: [];
    guildSoundboardSoundCreate: [];
    guildSoundboardSoundDelete: [];
    guildSoundboardSoundUpdate: [];
    guildUpdate: [oldGuild: Guild, newGuild: Guild];
    homeSettingsCreate: [];
    homeSettingsUpdate: [];
    integrationCreate: [integration: Integration];
    integrationDelete: [integration: Integration];
    integrationUpdate: [oldIntegration: Integration, newIntegration: Integration];
    inviteCreate: [];
    inviteDelete: [];
    inviteUpdate: [];
    memberDisconnect: [];
    memberKick: [];
    memberMove: [];
    memberPrune: [];
    messageBulkDelete: [];
    messageCreate: [];
    messageDelete: [];
    messageDeleteBulk: [];
    messagePin: [];
    messagePollVoteAdd: [];
    messagePollVoteRemove: [];
    messageReactionAdd: [];
    messageReactionRemove: [];
    messageReactionRemoveAll: [];
    messageReactionRemoveEmoji: [];
    messageUnpin: [];
    messageUpdate: [];
    missedAck: [message: string];
    onboardingCreate: [];
    onboardingPromptCreate: [onboardingPrompt: GuildOnboardingPrompt];
    onboardingPromptDelete: [onboardingPrompt: GuildOnboardingPrompt];
    onboardingPromptUpdate: [oldOnboardingPrompt: GuildOnboardingPrompt, newOnboardingPrompt: GuildOnboardingPrompt];
    onboardingUpdate: [];
    presenceUpdate: [];
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
    threadCreate: [];
    threadDelete: [];
    threadListSync: [];
    threadMemberUpdate: [];
    threadMembersUpdate: [];
    threadUpdate: [];
    typingStart: [];
    userUpdate: [oldUser: User, newUser: User];
    voiceChannelEffectSend: [];
    voiceServerUpdate: [];
    voiceStateUpdate: [];
    warn: [message: string];
    webhookCreate: [];
    webhookDelete: [];
    webhookUpdate: [];
}
