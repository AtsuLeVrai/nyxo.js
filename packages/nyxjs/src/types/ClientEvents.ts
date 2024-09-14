import type {
    AutoModerationActionExecutionEventFields,
    ChannelPinsUpdateEventFields,
    GuildAuditLogEntryCreateEventExtraFields,
    GuildBanAddEventFields,
    GuildBanRemoveEventFields,
    GuildCreateExtraFields,
    GuildMemberAddEventFields,
    GuildMemberRemoveEventFields,
    GuildMembersChunkEventFields,
    GuildMemberUpdateEventFields,
    GuildRoleCreateEventFields,
    GuildRoleDeleteEventFields,
    GuildRoleUpdateEventFields,
    GuildScheduledEventUserAddEventFields,
    GuildScheduledEventUserRemoveEventFields,
    IntegrationCreateEventAdditionalFields,
    IntegrationDeleteEventFields,
    IntegrationUpdateEventAdditionalFields,
    InviteCreateEventFields,
    InviteDeleteEventFields,
    MessageCreateExtraFields,
    MessageDeleteBulkEventFields,
    MessageDeleteEventFields,
    MessagePollVoteAddFields,
    MessageReactionAddEventFields,
    MessageReactionRemoveAllEventFields,
    MessageReactionRemoveEmojiEventFields,
    MessageReactionRemoveEventFields,
    PresenceUpdateEventFields,
    ReadyEventFields,
    ResumeStructure,
    ThreadListSyncEventFields,
    ThreadMembersUpdateEventFields,
    ThreadMemberUpdateEventExtraFields,
    TypingStartEventFields,
    VoiceChannelEffectSendEventFields,
    VoiceServerUpdateEventFields,
    WebhooksUpdateEventFields,
} from "@nyxjs/ws";
import type { AllChannelTypes } from "../libs/Channels";
import type { GuildApplicationCommandPermissions } from "../structures/ApplicationCommands";
import type { AuditLogEntry } from "../structures/Audits";
import type { Overwrite, ThreadChannel, ThreadMember } from "../structures/Channels";
import type { Emoji } from "../structures/Emojis";
import type { Entitlement } from "../structures/Entitlements";
import type { GuildOnboarding, OnboardingPrompt } from "../structures/GuildOnboarding";
import type { GuildScheduledEvent } from "../structures/GuildScheduledEvent";
import type { Guild, GuildMember, UnavailableGuild } from "../structures/Guilds";
import type { Integration } from "../structures/Integrations";
import type { Interaction } from "../structures/Interactions";
import type { Invite } from "../structures/Invites";
import type { Message } from "../structures/Messages";
import type { AutoModerationRule } from "../structures/Moderations";
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
    autoModerationActionExecution: [action: AutoModerationActionExecutionEventFields];
    autoModerationBlockMessage: [];
    autoModerationFlagToChannel: [];
    autoModerationRuleCreate: [rule: AutoModerationRule];
    autoModerationRuleDelete: [rule: AutoModerationRule];
    autoModerationRuleUpdate: [oldRule: AutoModerationRule, newRule: AutoModerationRule];
    autoModerationUserCommunicationDisabled: [];
    channelCreate: [channel: AllChannelTypes];
    channelDelete: [channel: AllChannelTypes];
    channelOverwriteCreate: [overwrite: Overwrite];
    channelOverwriteDelete: [overwrite: Overwrite];
    channelOverwriteUpdate: [oldOverwrite: Overwrite, newOverwrite: Overwrite];
    channelPinsUpdate: [pins: ChannelPinsUpdateEventFields];
    channelUpdate: [oldChannel: AllChannelTypes, newChannel: AllChannelTypes];
    creatorMonetizationRequestCreated: [];
    creatorMonetizationTermsAccepted: [];
    debug: [message: string];
    entitlementCreate: [entitlement: Entitlement];
    entitlementDelete: [entitlement: Entitlement];
    entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
    error: [error: Error];
    guildAuditLogEntryCreate: [audit: AuditLogEntry & GuildAuditLogEntryCreateEventExtraFields];
    guildBanAdd: [GuildBanAddEventFields];
    guildBanRemove: [GuildBanRemoveEventFields];
    guildBotAdd: [];
    guildCreate: [guild: UnavailableGuild | (Guild & GuildCreateExtraFields)];
    guildDelete: [guild: UnavailableGuild];
    guildEmojiCreate: [emoji: Emoji];
    guildEmojiDelete: [emoji: Emoji];
    guildEmojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
    guildHomeSettingsCreate: [];
    guildHomeSettingsUpdate: [];
    guildIntegrationsUpdate: [];
    guildMemberAdd: [member: GuildMember & GuildMemberAddEventFields];
    guildMemberDisconnect: [];
    guildMemberKick: [];
    guildMemberMove: [];
    guildMemberPrune: [];
    guildMemberRemove: [member: GuildMemberRemoveEventFields];
    guildMemberUpdate: [oldMember: GuildMemberUpdateEventFields, newMember: GuildMemberUpdateEventFields];
    guildMembersChunk: [chunk: GuildMembersChunkEventFields];
    guildOnboardingCreate: [onboarding: GuildOnboarding];
    guildOnboardingPromptCreate: [prompt: OnboardingPrompt];
    guildOnboardingPromptDelete: [prompt: OnboardingPrompt];
    guildOnboardingPromptUpdate: [oldPrompt: OnboardingPrompt, newPrompt: OnboardingPrompt];
    guildOnboardingUpdate: [oldOnboarding: GuildOnboarding, newOnboarding: GuildOnboarding];
    guildRoleCreate: [role: GuildRoleCreateEventFields];
    guildRoleDelete: [role: GuildRoleDeleteEventFields];
    guildRoleUpdate: [oldRole: GuildRoleUpdateEventFields, newRole: GuildRoleUpdateEventFields];
    guildScheduledEventCreate: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventDelete: [scheduledEvent: GuildScheduledEvent];
    guildScheduledEventUpdate: [oldScheduledEvent: GuildScheduledEvent, newScheduledEvent: GuildScheduledEvent];
    guildScheduledEventUserAdd: [user: GuildScheduledEventUserAddEventFields];
    guildScheduledEventUserRemove: [user: GuildScheduledEventUserRemoveEventFields];
    guildStickerCreate: [sticker: Sticker];
    guildStickerDelete: [sticker: Sticker];
    guildStickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
    guildUpdate: [oldGuild: Guild, newGuild: Guild];
    integrationCreate: [integration: Integration & IntegrationCreateEventAdditionalFields];
    integrationDelete: [integration: Integration & IntegrationDeleteEventFields];
    integrationUpdate: [
        oldIntegration: Integration & IntegrationUpdateEventAdditionalFields,
        newIntegration: Integration & IntegrationUpdateEventAdditionalFields,
    ];
    interactionCreate: [interaction: Interaction];
    invalidateSession: [invalidate: boolean];
    inviteCreate: [invite: InviteCreateEventFields];
    inviteDelete: [invite: InviteDeleteEventFields];
    inviteUpdate: [oldInvite: Invite, newInvite: Invite];
    messageCreate: [message: Message & MessageCreateExtraFields];
    messageDelete: [message: MessageDeleteEventFields];
    messageDeleteBulk: [message: MessageDeleteBulkEventFields];
    messagePin: [];
    messagePollVoteAdd: [poll: MessagePollVoteAddFields];
    messagePollVoteRemove: [poll: MessagePollVoteAddFields];
    messageReactionAdd: [reaction: MessageReactionAddEventFields];
    messageReactionRemove: [reaction: MessageReactionRemoveEventFields];
    messageReactionRemoveAll: [reaction: MessageReactionRemoveAllEventFields];
    messageReactionRemoveEmoji: [reaction: MessageReactionRemoveEmojiEventFields];
    messageUnpin: [];
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
    threadMemberUpdate: [member: ThreadMember & ThreadMemberUpdateEventExtraFields];
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
    webhookUpdate: [oldWebhook: Webhook & WebhooksUpdateEventFields, newWebhook: Webhook & WebhooksUpdateEventFields];
};
