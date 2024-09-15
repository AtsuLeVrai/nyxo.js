import type {
    GuildMemberAddEventFields,
    GuildMembersChunkEventFields,
    MessageDeleteBulkEventFields,
    PresenceUpdateEventFields,
    ReadyEventFields,
    ResumeStructure,
    ThreadListSyncEventFields,
    ThreadMembersUpdateEventFields,
    TypingStartEventFields,
    VoiceChannelEffectSendEventFields,
    VoiceServerUpdateEventFields,
} from "@nyxjs/ws";
import type { AllChannelTypes } from "../libs/Channels";
import type { GuildApplicationCommandPermissions } from "../structures/ApplicationCommands";
import type { AuditLogEntry } from "../structures/Audits";
import type { ChannelOverwrite, TextChannel, ThreadChannel, ThreadMember } from "../structures/Channels";
import type { Emoji } from "../structures/Emojis";
import type { Entitlement } from "../structures/Entitlements";
import type { GuildOnboarding, OnboardingPrompt } from "../structures/GuildOnboarding";
import type { GuildScheduledEvent, GuildScheduledEventUser } from "../structures/GuildScheduledEvent";
import type { Ban, Guild, GuildMember, UnavailableGuild } from "../structures/Guilds";
import type { Integration } from "../structures/Integrations";
import type { Interaction } from "../structures/Interactions";
import type { Invite } from "../structures/Invites";
import type { Message, Reaction } from "../structures/Messages";
import type { AutoModerationAction, AutoModerationRule } from "../structures/Moderations";
import type { Poll } from "../structures/Polls";
import type { Role } from "../structures/Roles";
import type { StageInstance } from "../structures/Stages";
import type { Sticker } from "../structures/Stickers";
import type { Subscription } from "../structures/Subscriptions";
import type { User } from "../structures/Users";
import type { VoiceState } from "../structures/Voices";
import type { Webhook } from "../structures/Webhooks";

export type ClientEvents = {
    applicationCommandPermissionsUpdate: [
        oldCommand: GuildApplicationCommandPermissions,
        newCommand: GuildApplicationCommandPermissions,
    ];
    autoModerationActionExecution: [action: AutoModerationAction];
    autoModerationBlockMessage: [];
    autoModerationFlagToChannel: [];
    autoModerationRuleCreate: [rule: AutoModerationRule];
    autoModerationRuleDelete: [rule: AutoModerationRule];
    autoModerationRuleUpdate: [oldRule: AutoModerationRule, newRule: AutoModerationRule];
    autoModerationUserCommunicationDisabled: [];
    channelCreate: [channel: AllChannelTypes];
    channelDelete: [channel: AllChannelTypes];
    channelOverwriteCreate: [overwrite: ChannelOverwrite];
    channelOverwriteDelete: [overwrite: ChannelOverwrite];
    channelOverwriteUpdate: [oldOverwrite: ChannelOverwrite, newOverwrite: ChannelOverwrite];
    channelPinsUpdate: [pins: TextChannel];
    channelUpdate: [oldChannel: AllChannelTypes, newChannel: AllChannelTypes];
    creatorMonetizationRequestCreated: [];
    creatorMonetizationTermsAccepted: [];
    debug: [message: string];
    entitlementCreate: [entitlement: Entitlement];
    entitlementDelete: [entitlement: Entitlement];
    entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
    error: [error: Error];
    guildAuditLogEntryCreate: [audit: AuditLogEntry];
    guildBanAdd: [Ban];
    guildBanRemove: [Ban];
    guildBotAdd: [bot: GuildMember];
    guildCreate: [guild: Guild | UnavailableGuild];
    guildDelete: [guild: Guild];
    guildEmojiCreate: [emoji: Emoji];
    guildEmojiDelete: [emoji: Emoji];
    guildEmojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
    guildHomeSettingsCreate: [];
    guildHomeSettingsUpdate: [];
    guildMemberAdd: [member: GuildMember & GuildMemberAddEventFields];
    guildMemberDisconnect: [member: GuildMember];
    guildMemberKick: [member: GuildMember];
    guildMemberMove: [member: GuildMember];
    guildMemberPrune: [member: GuildMember];
    guildMemberRemove: [member: GuildMember];
    guildMemberUpdate: [oldMember: GuildMember, newMember: GuildMember];
    guildMembersChunk: [chunk: GuildMembersChunkEventFields];
    guildOnboardingCreate: [onboarding: GuildOnboarding];
    guildOnboardingPromptCreate: [prompt: OnboardingPrompt];
    guildOnboardingPromptDelete: [prompt: OnboardingPrompt];
    guildOnboardingPromptUpdate: [oldPrompt: OnboardingPrompt, newPrompt: OnboardingPrompt];
    guildOnboardingUpdate: [oldOnboarding: GuildOnboarding, newOnboarding: GuildOnboarding];
    guildRoleCreate: [role: Role];
    guildRoleDelete: [role: Role];
    guildRoleUpdate: [oldRole: Role, newRole: Role];
    guildScheduledEventCreate: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventDelete: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventUpdate: [oldScheduledEvent: GuildScheduledEvent, newScheduledEvent: GuildScheduledEvent];
    guildScheduledEventUserAdd: [user: GuildScheduledEventUser];
    guildScheduledEventUserRemove: [user: GuildScheduledEventUser];
    guildStickerCreate: [sticker: Sticker];
    guildStickerDelete: [sticker: Sticker];
    guildStickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
    guildUpdate: [oldGuild: Guild, newGuild: Guild];
    integrationCreate: [integration: Integration];
    integrationDelete: [integration: Integration];
    integrationUpdate: [oldIntegration: Integration, newIntegration: Integration];
    interactionCreate: [interaction: Interaction];
    invalidateSession: [invalidate: boolean];
    inviteCreate: [invite: Invite];
    inviteDelete: [invite: Invite];
    inviteUpdate: [oldInvite: Invite, newInvite: Invite];
    messageCreate: [message: Message];
    messageDelete: [message: Message];
    messageDeleteBulk: [message: MessageDeleteBulkEventFields];
    messagePin: [message: Message];
    messagePollVoteAdd: [poll: Poll];
    messagePollVoteRemove: [poll: Poll];
    messageReactionAdd: [reaction: Reaction];
    messageReactionRemove: [reaction: Reaction];
    messageReactionRemoveAll: [reaction: Reaction];
    messageReactionRemoveEmoji: [reaction: Reaction];
    messageUnpin: [message: Message];
    messageUpdate: [oldMessage: Message, newMessage: Message];
    presenceUpdate: [presence: PresenceUpdateEventFields];
    ready: [ready: ReadyEventFields];
    reconnect: [reconnect: null];
    resumed: [resume: ResumeStructure];
    stageInstanceCreate: [stage: StageInstance];
    stageInstanceDelete: [stage: StageInstance];
    stageInstanceUpdate: [oldStage: StageInstance, newStage: StageInstance];
    subscriptionCreate: [subscription: Subscription];
    subscriptionDelete: [subscription: Subscription];
    subscriptionUpdate: [oldSubscription: Subscription, newSubscription: Subscription];
    threadCreate: [thread: ThreadChannel];
    threadDelete: [thread: ThreadChannel];
    threadListSync: [list: ThreadListSyncEventFields];
    threadMemberUpdate: [oldMember: ThreadMember, newMember: ThreadMember];
    threadMembersUpdate: [members: ThreadMembersUpdateEventFields];
    threadUpdate: [oldThread: ThreadChannel, newThread: ThreadChannel];
    typingStart: [typing: TypingStartEventFields];
    userUpdate: [oldUser: User, newUser: User];
    voiceChannelEffectSend: [effect: VoiceChannelEffectSendEventFields];
    voiceServerUpdate: [oldVoiceServer: VoiceServerUpdateEventFields, newVoiceServer: VoiceServerUpdateEventFields];
    voiceStateUpdate: [oldVoiceState: VoiceState, newVoiceState: VoiceState];
    warn: [message: string];
    webhookCreate: [webhook: Webhook];
    webhookDelete: [webhook: Webhook];
    webhookUpdate: [oldWebhook: Webhook, newWebhook: Webhook];
};
