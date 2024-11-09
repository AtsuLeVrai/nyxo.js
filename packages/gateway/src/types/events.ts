import {
    type AuditLogEntryStructure,
    type AutoModerationRuleStructure,
    type ChannelStructure,
    type EntitlementStructure,
    type GatewayCloseCodes,
    GatewayOpcodes,
    type GuildApplicationCommandPermissionsStructure,
    type GuildMemberStructure,
    type GuildScheduledEventStructure,
    type GuildStructure,
    type Integer,
    type IntegrationStructure,
    type InteractionStructure,
    type MessageStructure,
    type SoundboardSoundStructure,
    type StageInstanceStructure,
    type SubscriptionStructure,
    type ThreadMemberStructure,
    type UnavailableGuildStructure,
    type UserStructure,
    type VoiceStateStructure,
} from "@nyxjs/core";
import type WebSocket from "ws";
import type {
    AutoModerationActionExecutionEventFields,
    ChannelPinsUpdateEventFields,
    GuildAuditLogEntryCreateEventExtraFields,
    GuildBanAddEventFields,
    GuildBanRemoveEventFields,
    GuildCreateExtraFields,
    GuildEmojisUpdateEventFields,
    GuildIntegrationsUpdateEventFields,
    GuildMemberAddEventFields,
    GuildMemberRemoveEventFields,
    GuildMemberUpdateEventFields,
    GuildMembersChunkEventFields,
    GuildRoleCreateEventFields,
    GuildRoleDeleteEventFields,
    GuildRoleUpdateEventFields,
    GuildScheduledEventUserAddEventFields,
    GuildScheduledEventUserRemoveEventFields,
    GuildSoundboardSoundDeleteEventFields,
    GuildStickersUpdateEventFields,
    IdentifyStructure,
    IntegrationCreateEventAdditionalFields,
    IntegrationDeleteEventFields,
    IntegrationUpdateEventAdditionalFields,
    InviteCreateEventFields,
    InviteDeleteEventFields,
    MessageCreateExtraFields,
    MessageDeleteBulkEventFields,
    MessageDeleteEventFields,
    MessagePollVoteAddFields,
    MessagePollVoteRemoveFields,
    MessageReactionAddEventFields,
    MessageReactionRemoveAllEventFields,
    MessageReactionRemoveEmojiEventFields,
    MessageReactionRemoveEventFields,
    PresenceUpdateEventFields,
    ReadyEventFields,
    RequestGuildMembersRequestStructure,
    RequestSoundboardSoundsStructure,
    ResumeStructure,
    ThreadListSyncEventFields,
    ThreadMemberUpdateEventExtraFields,
    ThreadMembersUpdateEventFields,
    TypingStartEventFields,
    UpdatePresenceGatewayPresenceUpdateStructure,
    UpdateVoiceStateGatewayVoiceStateUpdateStructure,
    VoiceChannelEffectSendEventFields,
    VoiceServerUpdateEventFields,
    WebhooksUpdateEventFields,
} from "../events/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#receive-events}
 */
export interface GatewayReceiveEvents {
    APPLICATION_COMMAND_PERMISSIONS_UPDATE: GuildApplicationCommandPermissionsStructure;
    AUTO_MODERATION_ACTION_EXECUTION: AutoModerationActionExecutionEventFields;
    AUTO_MODERATION_RULE_CREATE: AutoModerationRuleStructure;
    AUTO_MODERATION_RULE_DELETE: AutoModerationRuleStructure;
    AUTO_MODERATION_RULE_UPDATE: AutoModerationRuleStructure;
    CHANNEL_CREATE: ChannelStructure;
    CHANNEL_DELETE: ChannelStructure;
    CHANNEL_PINS_UPDATE: ChannelPinsUpdateEventFields;
    CHANNEL_UPDATE: ChannelStructure;
    ENTITLEMENT_CREATE: EntitlementStructure;
    ENTITLEMENT_DELETE: EntitlementStructure;
    ENTITLEMENT_UPDATE: EntitlementStructure;
    GUILD_AUDIT_LOG_ENTRY_CREATE: AuditLogEntryStructure & GuildAuditLogEntryCreateEventExtraFields;
    GUILD_BAN_ADD: GuildBanAddEventFields;
    GUILD_BAN_REMOVE: GuildBanRemoveEventFields;
    GUILD_CREATE: UnavailableGuildStructure | (GuildCreateExtraFields & GuildStructure);
    GUILD_DELETE: UnavailableGuildStructure;
    GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEventFields;
    GUILD_INTEGRATIONS_UPDATE: GuildIntegrationsUpdateEventFields;
    GUILD_MEMBERS_CHUNK: GuildMembersChunkEventFields;
    GUILD_MEMBER_ADD: GuildMemberAddEventFields & GuildMemberStructure;
    GUILD_MEMBER_REMOVE: GuildMemberRemoveEventFields;
    GUILD_MEMBER_UPDATE: GuildMemberUpdateEventFields;
    GUILD_ROLE_CREATE: GuildRoleCreateEventFields;
    GUILD_ROLE_DELETE: GuildRoleDeleteEventFields;
    GUILD_ROLE_UPDATE: GuildRoleUpdateEventFields;
    GUILD_SCHEDULED_EVENT_CREATE: GuildScheduledEventStructure;
    GUILD_SCHEDULED_EVENT_DELETE: GuildScheduledEventStructure;
    GUILD_SCHEDULED_EVENT_UPDATE: GuildScheduledEventStructure;
    GUILD_SCHEDULED_EVENT_USER_ADD: GuildScheduledEventUserAddEventFields;
    GUILD_SCHEDULED_EVENT_USER_REMOVE: GuildScheduledEventUserRemoveEventFields;
    GUILD_SOUNDBOARD_SOUNDS_UPDATE: SoundboardSoundStructure[];
    GUILD_SOUNDBOARD_SOUND_CREATE: SoundboardSoundStructure;
    GUILD_SOUNDBOARD_SOUND_DELETE: GuildSoundboardSoundDeleteEventFields;
    GUILD_SOUNDBOARD_SOUND_UPDATE: SoundboardSoundStructure;
    GUILD_STICKERS_UPDATE: GuildStickersUpdateEventFields;
    GUILD_UPDATE: GuildStructure;
    INTEGRATION_CREATE: IntegrationCreateEventAdditionalFields & IntegrationStructure;
    INTEGRATION_DELETE: IntegrationDeleteEventFields;
    INTEGRATION_UPDATE: IntegrationStructure & IntegrationUpdateEventAdditionalFields;
    INTERACTION_CREATE: InteractionStructure;
    INVITE_CREATE: InviteCreateEventFields;
    INVITE_DELETE: InviteDeleteEventFields;
    MESSAGE_CREATE: MessageCreateExtraFields & MessageStructure;
    MESSAGE_DELETE: MessageDeleteEventFields;
    MESSAGE_DELETE_BULK: MessageDeleteBulkEventFields;
    MESSAGE_POLL_VOTE_ADD: MessagePollVoteAddFields;
    MESSAGE_POLL_VOTE_REMOVE: MessagePollVoteRemoveFields;
    MESSAGE_REACTION_ADD: MessageReactionAddEventFields;
    MESSAGE_REACTION_REMOVE: MessageReactionRemoveEventFields;
    MESSAGE_REACTION_REMOVE_ALL: MessageReactionRemoveAllEventFields;
    MESSAGE_REACTION_REMOVE_EMOJI: MessageReactionRemoveEmojiEventFields;
    MESSAGE_UPDATE: MessageStructure;
    PRESENCE_UPDATE: PresenceUpdateEventFields;
    READY: ReadyEventFields;
    STAGE_INSTANCE_CREATE: StageInstanceStructure;
    STAGE_INSTANCE_DELETE: StageInstanceStructure;
    STAGE_INSTANCE_UPDATE: StageInstanceStructure;
    SUBSCRIPTION_CREATE: SubscriptionStructure;
    SUBSCRIPTION_DELETE: SubscriptionStructure;
    SUBSCRIPTION_UPDATE: SubscriptionStructure;
    THREAD_CREATE:
        | (ChannelStructure &
              ThreadMemberStructure & {
                  newly_created: boolean;
              })
        | (ChannelStructure & {
              newly_created: boolean;
          })
        | (ChannelStructure & ThreadMemberStructure);
    THREAD_DELETE: Pick<ChannelStructure, "guild_id" | "id" | "parent_id" | "type">;
    THREAD_LIST_SYNC: ThreadListSyncEventFields;
    THREAD_MEMBERS_UPDATE: ThreadMembersUpdateEventFields;
    THREAD_MEMBER_UPDATE: ThreadMemberStructure & ThreadMemberUpdateEventExtraFields;
    THREAD_UPDATE: ChannelStructure;
    TYPING_START: TypingStartEventFields;
    USER_UPDATE: UserStructure;
    VOICE_CHANNEL_EFFECT_SEND: VoiceChannelEffectSendEventFields;
    VOICE_SERVER_UPDATE: VoiceServerUpdateEventFields;
    VOICE_STATE_UPDATE: VoiceStateStructure;
    WEBHOOKS_UPDATE: WebhooksUpdateEventFields;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#send-events}
 */
export interface GatewaySendEvents {
    [GatewayOpcodes.Identify]: IdentifyStructure;
    [GatewayOpcodes.Resume]: ResumeStructure;
    [GatewayOpcodes.Heartbeat]: Integer | null;
    [GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersRequestStructure;
    [GatewayOpcodes.RequestSoundboardSounds]: RequestSoundboardSoundsStructure;
    [GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateGatewayVoiceStateUpdateStructure;
    [GatewayOpcodes.PresenceUpdate]: UpdatePresenceGatewayPresenceUpdateStructure;
}

export interface GatewayEvents<K extends keyof GatewayReceiveEvents = keyof GatewayReceiveEvents> {
    /**
     * Event triggered when the connection is closed.
     *
     * @param code - The close code.
     * @param reason - The reason for the closure.
     */
    close: [code: GatewayCloseCodes, reason: string];
    /**
     * Event triggered for debugging messages.
     *
     * @param message - The debug message.
     */
    debug: [message: string];
    /**
     * Event triggered when a globals event is received.
     *
     * @param event - The event name.
     * @param data - The event data.
     */
    dispatch: [event: K, data: GatewayReceiveEvents[K]];
    /**
     * Event triggered when an error occurs.
     *
     * @param error - The error object.
     */
    error: [error: Error | string];
    /**
     * Event triggered for warnings.
     *
     * @param warning - The warning message.
     */
    warn: [warning: string];
    /**
     * Event triggered when a message is received.
     *
     * @param data - The raw data.
     * @param isBinary - Whether the data is binary.
     */
    raw: [data: WebSocket.RawData, isBinary: boolean];
    /**
     * Event triggered when an ACK is missed.
     *
     * @param message - The message.
     */
    missedAck: [message: string];
}
