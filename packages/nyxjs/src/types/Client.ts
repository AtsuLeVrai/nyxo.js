import type { ApiVersions, GatewayCloseCodes, GatewayIntents, Integer } from "@nyxjs/core";
import type { GatewayOptions } from "@nyxjs/gateway";
import type { RateLimitInfo, RestOptions } from "@nyxjs/rest";
import type WebSocket from "ws";
import type {
    Emoji,
    Entitlement,
    Guild,
    Ready,
    Role,
    SoundboardSound,
    StageInstance,
    Sticker,
    User,
} from "../structures/index.js";

export type ClientOptions = {
    gateway?: Partial<Omit<GatewayOptions, "intents" | "v">>;
    intents: GatewayIntents[] | Integer;
    rest?: Partial<Omit<RestOptions, "version">>;
    version?: ApiVersions;
};

export type ClientState = {
    isConnecting: boolean;
    isConnected: boolean;
    isReconnecting: boolean;
};

export type ClientEvents = {
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
    guildBanAdd: [];
    guildBanRemove: [];
    guildCreate: [guild: Guild];
    guildDelete: [guild: Guild];
    guildMemberAdd: [];
    guildMemberRemove: [];
    guildMemberUpdate: [];
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
    integrationCreate: [];
    integrationDelete: [];
    integrationUpdate: [];
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
    onboardingPromptCreate: [];
    onboardingPromptDelete: [];
    onboardingPromptUpdate: [];
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
    subscriptionCreate: [];
    subscriptionDelete: [];
    subscriptionUpdate: [];
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
};
