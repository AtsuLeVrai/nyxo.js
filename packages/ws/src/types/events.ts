import type { GatewayOpcodes, Integer } from "@nyxjs/core";
import type {
	AuditLogEntryStructure,
	AutoModerationRuleStructure,
	ChannelStructure,
	EntitlementStructure,
	GuildApplicationCommandPermissionsStructure,
	GuildMemberStructure,
	GuildScheduledEventStructure,
	GuildStructure,
	IntegrationStructure,
	InteractionStructure,
	MessageStructure,
	StageInstanceStructure,
	ThreadMemberStructure,
	UnavailableGuildStructure,
	UserStructure,
	VoiceStateStructure,
} from "@nyxjs/rest";
import type {
	ChannelPinsUpdateEventFields,
	ThreadListSyncEventFields,
	ThreadMembersUpdateEventFields,
	ThreadMemberUpdateEventExtraFields,
} from "../events/channels";
import type {
	GuildAuditLogEntryCreateEventExtraFields,
	GuildBanAddEventFields,
	GuildBanRemoveEventFields,
	GuildCreateExtraFields,
	GuildEmojisUpdateEventFields,
	GuildIntegrationsUpdateEventFields,
	GuildMemberAddEventFields,
	GuildMemberRemoveEventFields,
	GuildMembersChunkEventFields,
	GuildMemberUpdateEventFields,
	GuildRoleCreateEventFields,
	GuildRoleDeleteEventFields,
	GuildRoleUpdateEventFields,
	GuildScheduledEventUserAddEventFields,
	GuildScheduledEventUserRemoveEventFields,
	GuildStickersUpdateEventFields,
	RequestGuildMembersRequestStructure,
} from "../events/guilds";
import type { HelloStructure } from "../events/hello";
import type { IdentifyStructure } from "../events/identity";
import type {
	IntegrationCreateEventAdditionalFields,
	IntegrationDeleteEventFields,
	IntegrationUpdateEventAdditionalFields,
} from "../events/integrations";
import type { InviteCreateEventFields, InviteDeleteEventFields } from "../events/invites";
import type {
	MessageCreateExtraFields,
	MessageDeleteBulkEventFields,
	MessageDeleteEventFields,
	MessageReactionAddEventFields,
	MessageReactionRemoveAllEventFields,
	MessageReactionRemoveEmojiEventFields,
	MessageReactionRemoveEventFields,
} from "../events/messages";
import type { AutoModerationActionExecutionEventFields } from "../events/moderations";
import type { MessagePollVoteAddFields, MessagePollVoteRemoveFields } from "../events/polls";
import type {
	PresenceUpdateEventFields,
	TypingStartEventFields,
	UpdatePresenceGatewayPresenceUpdateStructure,
} from "../events/presences";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import type {
	UpdateVoiceStateGatewayVoiceStateUpdateStructure,
	VoiceChannelEffectSendEventFields,
	VoiceServerUpdateEventFields,
} from "../events/voices";
import type { WebhooksUpdateEventFields } from "../events/webhooks";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#receive-events}
 */
export type GatewayReceiveEvents = {
	[GatewayOpcodes.Hello]: HelloStructure;
	[GatewayOpcodes.Resume]: ResumeStructure;
	[GatewayOpcodes.Reconnect]: null;
	[GatewayOpcodes.InvalidSession]: boolean;
	"APPLICATION_COMMAND_PERMISSIONS_UPDATE": GuildApplicationCommandPermissionsStructure;
	"AUTO_MODERATION_ACTION_EXECUTION": AutoModerationActionExecutionEventFields;
	"AUTO_MODERATION_RULE_CREATE": AutoModerationRuleStructure;
	"AUTO_MODERATION_RULE_DELETE": AutoModerationRuleStructure;
	"AUTO_MODERATION_RULE_UPDATE": AutoModerationRuleStructure;
	"CHANNEL_CREATE": ChannelStructure;
	"CHANNEL_DELETE": ChannelStructure;
	"CHANNEL_PINS_UPDATE": ChannelPinsUpdateEventFields;
	"CHANNEL_UPDATE": ChannelStructure;
	"ENTITLEMENT_CREATE": EntitlementStructure;
	"ENTITLEMENT_DELETE": EntitlementStructure;
	"ENTITLEMENT_UPDATE": EntitlementStructure;
	"GUILD_AUDIT_LOG_ENTRY_CREATE": AuditLogEntryStructure & GuildAuditLogEntryCreateEventExtraFields;
	"GUILD_BAN_ADD": GuildBanAddEventFields;
	"GUILD_BAN_REMOVE": GuildBanRemoveEventFields;
	"GUILD_CREATE": UnavailableGuildStructure | GuildCreateExtraFields & GuildStructure;
	"GUILD_DELETE": UnavailableGuildStructure;
	"GUILD_EMOJIS_UPDATE": GuildEmojisUpdateEventFields;
	"GUILD_INTEGRATIONS_UPDATE": GuildIntegrationsUpdateEventFields;
	"GUILD_MEMBERS_CHUNK": GuildMembersChunkEventFields;
	"GUILD_MEMBER_ADD": GuildMemberAddEventFields & GuildMemberStructure;
	"GUILD_MEMBER_REMOVE": GuildMemberRemoveEventFields;
	"GUILD_MEMBER_UPDATE": GuildMemberUpdateEventFields;
	"GUILD_ROLE_CREATE": GuildRoleCreateEventFields;
	"GUILD_ROLE_DELETE": GuildRoleDeleteEventFields;
	"GUILD_ROLE_UPDATE": GuildRoleUpdateEventFields;
	"GUILD_SCHEDULED_EVENT_CREATE": GuildScheduledEventStructure;
	"GUILD_SCHEDULED_EVENT_DELETE": GuildScheduledEventStructure;
	"GUILD_SCHEDULED_EVENT_UPDATE": GuildScheduledEventStructure;
	"GUILD_SCHEDULED_EVENT_USER_ADD": GuildScheduledEventUserAddEventFields;
	"GUILD_SCHEDULED_EVENT_USER_REMOVE": GuildScheduledEventUserRemoveEventFields;
	"GUILD_STICKERS_UPDATE": GuildStickersUpdateEventFields;
	"GUILD_UPDATE": GuildStructure;
	"INTEGRATION_CREATE": IntegrationCreateEventAdditionalFields & IntegrationStructure;
	"INTEGRATION_DELETE": IntegrationDeleteEventFields;
	"INTEGRATION_UPDATE": IntegrationStructure & IntegrationUpdateEventAdditionalFields;
	"INTERACTION_CREATE": InteractionStructure;
	"INVITE_CREATE": InviteCreateEventFields;
	"INVITE_DELETE": InviteDeleteEventFields;
	"MESSAGE_CREATE": MessageCreateExtraFields & MessageStructure;
	"MESSAGE_DELETE": MessageDeleteEventFields;
	"MESSAGE_DELETE_BULK": MessageDeleteBulkEventFields;
	"MESSAGE_POLL_VOTE_ADD": MessagePollVoteAddFields;
	"MESSAGE_POLL_VOTE_REMOVE": MessagePollVoteRemoveFields;
	"MESSAGE_REACTION_ADD": MessageReactionAddEventFields;
	"MESSAGE_REACTION_REMOVE": MessageReactionRemoveEventFields;
	"MESSAGE_REACTION_REMOVE_ALL": MessageReactionRemoveAllEventFields;
	"MESSAGE_REACTION_REMOVE_EMOJI": MessageReactionRemoveEmojiEventFields;
	"MESSAGE_UPDATE": MessageStructure;
	"PRESENCE_UPDATE": PresenceUpdateEventFields;
	"READY": ReadyEventFields;
	"STAGE_INSTANCE_CREATE": StageInstanceStructure;
	"STAGE_INSTANCE_DELETE": StageInstanceStructure;
	"STAGE_INSTANCE_UPDATE": StageInstanceStructure;
	"THREAD_CREATE": ChannelStructure & {
		newly_created: boolean;
	} | ChannelStructure & ThreadMemberStructure | ChannelStructure & ThreadMemberStructure & {
		newly_created: boolean;
	};
	"THREAD_DELETE": Pick<ChannelStructure, "guild_id" | "id" | "parent_id" | "type">;
	"THREAD_LIST_SYNC": ThreadListSyncEventFields;
	"THREAD_MEMBERS_UPDATE": ThreadMembersUpdateEventFields;
	"THREAD_MEMBER_UPDATE": ThreadMemberStructure & ThreadMemberUpdateEventExtraFields;
	"TYPING_START": TypingStartEventFields;
	"USER_UPDATE": UserStructure;
	"VOICE_CHANNEL_EFFECT_SEND": VoiceChannelEffectSendEventFields;
	"VOICE_SERVER_UPDATE": VoiceServerUpdateEventFields;
	"VOICE_STATE_UPDATE": VoiceStateStructure;
	"WEBHOOKS_UPDATE": WebhooksUpdateEventFields;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#send-events}
 */
export type GatewaySendEvents = {
	[GatewayOpcodes.Identify]: IdentifyStructure;
	[GatewayOpcodes.Resume]: ResumeStructure;
	[GatewayOpcodes.Heartbeat]: Integer | null;
	[GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersRequestStructure;
	[GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateGatewayVoiceStateUpdateStructure;
	[GatewayOpcodes.PresenceUpdate]: UpdatePresenceGatewayPresenceUpdateStructure;
};
