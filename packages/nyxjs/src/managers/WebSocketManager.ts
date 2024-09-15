import type { GatewayOptions, GatewayReceiveEvents } from "@nyxjs/ws";
import { Gateway } from "@nyxjs/ws";
import type { Client } from "../client/Client";
import type { BaseChannel } from "../structures/Channels";

type GATEWAY_CLIENT_EVENTS = [
    ["APPLICATION_COMMAND_PERMISSIONS_UPDATE", "applicationCommandPermissionsUpdate"],
    ["AUTO_MODERATION_ACTION_EXECUTION", "autoModerationActionExecution"],
    ["AUTO_MODERATION_RULE_CREATE", "autoModerationRuleCreate"],
    ["AUTO_MODERATION_RULE_DELETE", "autoModerationRuleDelete"],
    ["AUTO_MODERATION_RULE_UPDATE", "autoModerationRuleUpdate"],
    ["CHANNEL_CREATE", "channelCreate"],
    ["CHANNEL_DELETE", "channelDelete"],
    ["CHANNEL_PINS_UPDATE", "channelPinsUpdate", Pick<BaseChannel, "guildId" | "id" | "lastPinTimestamp">],
    ["CHANNEL_UPDATE", "channelUpdate"],
    ["ENTITLEMENT_CREATE", "entitlementCreate"],
    ["ENTITLEMENT_DELETE", "entitlementDelete"],
    ["ENTITLEMENT_UPDATE", "entitlementUpdate"],
    ["GUILD_AUDIT_LOG_ENTRY_CREATE", "guildAuditLogEntryCreate"],
    ["GUILD_BAN_ADD", "guildBanAdd"],
    ["GUILD_BAN_REMOVE", "guildBanRemove"],
    ["GUILD_CREATE", "guildCreate"],
    ["GUILD_DELETE", "guildDelete"],
    ["GUILD_INTEGRATIONS_UPDATE", "guildIntegrationsUpdate"],
    ["GUILD_MEMBERS_CHUNK", "guildMembersChunk"],
    ["GUILD_MEMBER_ADD", "guildMemberAdd"],
    ["GUILD_MEMBER_REMOVE", "guildMemberRemove"],
    ["GUILD_MEMBER_UPDATE", "guildMemberUpdate"],
    ["GUILD_ROLE_CREATE", "guildRoleCreate"],
    ["GUILD_ROLE_DELETE", "guildRoleDelete"],
    ["GUILD_ROLE_UPDATE", "guildRoleUpdate"],
    ["GUILD_SCHEDULED_EVENT_CREATE", "guildScheduledEventCreate"],
    ["GUILD_SCHEDULED_EVENT_DELETE", "guildScheduledEventDelete"],
    ["GUILD_SCHEDULED_EVENT_UPDATE", "guildScheduledEventUpdate"],
    ["GUILD_SCHEDULED_EVENT_USER_ADD", "guildScheduledEventUserAdd"],
    ["GUILD_SCHEDULED_EVENT_USER_REMOVE", "guildScheduledEventUserRemove"],
    ["GUILD_UPDATE", "guildUpdate"],
    ["INTEGRATION_CREATE", "integrationCreate"],
    ["INTEGRATION_DELETE", "integrationDelete"],
    ["INTEGRATION_UPDATE", "integrationUpdate"],
    ["INTERACTION_CREATE", "interactionCreate"],
    ["INVITE_CREATE", "inviteCreate"],
    ["INVITE_DELETE", "inviteDelete"],
    ["MESSAGE_CREATE", "messageCreate"],
    ["MESSAGE_DELETE", "messageDelete"],
    ["MESSAGE_DELETE_BULK", "messageDeleteBulk"],
    ["MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd"],
    ["MESSAGE_POLL_VOTE_REMOVE", "messagePollVoteRemove"],
    ["MESSAGE_REACTION_ADD", "messageReactionAdd"],
    ["MESSAGE_REACTION_REMOVE", "messageReactionRemove"],
    ["MESSAGE_REACTION_REMOVE_ALL", "messageReactionRemoveAll"],
    ["MESSAGE_REACTION_REMOVE_EMOJI", "messageReactionRemoveEmoji"],
    ["MESSAGE_UPDATE", "messageUpdate"],
    ["PRESENCE_UPDATE", "presenceUpdate"],
    ["READY", "ready"],
    ["STAGE_INSTANCE_CREATE", "stageInstanceCreate"],
    ["STAGE_INSTANCE_DELETE", "stageInstanceDelete"],
    ["STAGE_INSTANCE_UPDATE", "stageInstanceUpdate"],
    ["SUBSCRIPTION_CREATE", "subscriptionCreate"],
    ["SUBSCRIPTION_DELETE", "subscriptionDelete"],
    ["SUBSCRIPTION_UPDATE", "subscriptionUpdate"],
    ["THREAD_CREATE", "threadCreate"],
    ["THREAD_DELETE", "threadDelete"],
    ["THREAD_LIST_SYNC", "threadListSync"],
    ["THREAD_MEMBERS_UPDATE", "threadMembersUpdate"],
    ["THREAD_MEMBER_UPDATE", "threadMemberUpdate"],
    ["TYPING_START", "typingStart"],
    ["USER_UPDATE", "userUpdate"],
    ["VOICE_CHANNEL_EFFECT_SEND", "voiceChannelEffectSend"],
    ["VOICE_SERVER_UPDATE", "voiceServerUpdate"],
    ["VOICE_STATE_UPDATE", "voiceStateUpdate"],
];

export class WebSocketManager extends Gateway {
    public constructor(
        private readonly client: Client,
        token: string,
        options: GatewayOptions
    ) {
        super(token, options);
    }

    public init(): void {
        void this.connect();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.on("debug", (message) => this.client.emit("debug", message));
        this.on("error", (error) => this.client.emit("error", error));
        this.on("warn", (message) => this.client.emit("warn", message));
        this.on("dispatch", this.handleDispatch.bind(this));
    }

    private handleDispatch(event: keyof GatewayReceiveEvents, ...data: unknown[]): void {
        // const clientEvent = this.eventMap.get(event);
        // if (clientEvent) {
        //     this.client.emit(clientEvent, ...data);
        // }
    }
}
