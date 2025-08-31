import type { GatewayReceiveEvents } from "../gateway/index.js";
import type { Client } from "./client.js";
import type { ClientEvents } from "./client.types.js";

interface EventMapping<
  T extends keyof GatewayReceiveEvents = keyof GatewayReceiveEvents,
  U extends keyof ClientEvents = keyof ClientEvents,
> {
  clientEvent: U;
  gatewayEvent: T;
  transform: (client: Client, data: unknown) => ClientEvents[U];
}

function defineEvent<T extends keyof GatewayReceiveEvents, U extends keyof ClientEvents>(
  clientEvent: U,
  gatewayEvent: T,
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[U],
): EventMapping<T, U> {
  return {
    clientEvent,
    gatewayEvent,
    transform: transform as EventMapping<T, U>["transform"],
  };
}

export const GatewayEventHandlers: readonly EventMapping[] = [
  defineEvent("autoModerationRuleCreate", "AUTO_MODERATION_RULE_CREATE", (_client, data) => [data]),
  defineEvent("autoModerationRuleDelete", "AUTO_MODERATION_RULE_DELETE", (_client, data) => [data]),
  defineEvent("autoModerationRuleUpdate", "AUTO_MODERATION_RULE_UPDATE", (_client, data) => [
    data,
    data,
  ]),
  defineEvent(
    "autoModerationActionExecution",
    "AUTO_MODERATION_ACTION_EXECUTION",
    (_client, data) => [data],
  ),
  defineEvent("channelCreate", "CHANNEL_CREATE", (_client, data) => [data]),
  defineEvent("channelDelete", "CHANNEL_DELETE", (_client, data) => [data]),
  defineEvent("channelUpdate", "CHANNEL_UPDATE", (_client, data) => [data, data]),
  defineEvent("channelPinsUpdate", "CHANNEL_PINS_UPDATE", (_client, data) => [data]),
  defineEvent("threadCreate", "THREAD_CREATE", (_client, data) => [data]),
  defineEvent("threadDelete", "THREAD_DELETE", (_client, data) => [data]),
  defineEvent("threadUpdate", "THREAD_UPDATE", (_client, data) => [data, data]),
  defineEvent("threadListSync", "THREAD_LIST_SYNC", (_, data) => [data]),
  defineEvent("threadMemberUpdate", "THREAD_MEMBER_UPDATE", (_client, data) => [data, data]),
  defineEvent("threadMembersUpdate", "THREAD_MEMBERS_UPDATE", (_, data) => [data]),
  defineEvent("entitlementCreate", "ENTITLEMENT_CREATE", (_client, data) => [data]),
  defineEvent("entitlementDelete", "ENTITLEMENT_DELETE", (_client, data) => [data]),
  defineEvent("entitlementUpdate", "ENTITLEMENT_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildCreate", "GUILD_CREATE", (_client, data) => [data]),
  defineEvent("guildDelete", "GUILD_DELETE", (_client, data) => [data]),
  defineEvent("guildUpdate", "GUILD_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildAuditLogEntryCreate", "GUILD_AUDIT_LOG_ENTRY_CREATE", (_client, data) => [
    data,
  ]),
  defineEvent("guildBanAdd", "GUILD_BAN_ADD", (_client, data) => [data]),
  defineEvent("guildBanRemove", "GUILD_BAN_REMOVE", (_client, data) => [data]),
  defineEvent("guildEmojisUpdate", "GUILD_EMOJIS_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildStickersUpdate", "GUILD_STICKERS_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildMemberAdd", "GUILD_MEMBER_ADD", (_client, data) => [data]),
  defineEvent("guildMemberRemove", "GUILD_MEMBER_REMOVE", (_client, data) => [data]),
  defineEvent("guildMemberUpdate", "GUILD_MEMBER_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildMembersChunk", "GUILD_MEMBERS_CHUNK", (_, data) => [data]),
  defineEvent("guildRoleCreate", "GUILD_ROLE_CREATE", (_client, data) => [data]),
  defineEvent("guildRoleDelete", "GUILD_ROLE_DELETE", (_client, data) => [data]),
  defineEvent("guildRoleUpdate", "GUILD_ROLE_UPDATE", (_client, data) => [data, data]),
  defineEvent("guildScheduledEventCreate", "GUILD_SCHEDULED_EVENT_CREATE", (_client, data) => [
    data,
  ]),
  defineEvent("guildScheduledEventDelete", "GUILD_SCHEDULED_EVENT_DELETE", (_client, data) => [
    data,
  ]),
  defineEvent("guildScheduledEventUpdate", "GUILD_SCHEDULED_EVENT_UPDATE", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("guildScheduledEventUserAdd", "GUILD_SCHEDULED_EVENT_USER_ADD", (_client, data) => [
    data,
  ]),
  defineEvent(
    "guildScheduledEventUserRemove",
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    (_client, data) => [data],
  ),
  defineEvent("guildSoundboardSoundCreate", "GUILD_SOUNDBOARD_SOUND_CREATE", (_client, data) => [
    data,
  ]),
  defineEvent("guildSoundboardSoundDelete", "GUILD_SOUNDBOARD_SOUND_DELETE", (_client, data) => [
    data,
  ]),
  defineEvent("guildSoundboardSoundUpdate", "GUILD_SOUNDBOARD_SOUND_UPDATE", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("guildSoundboardSoundsUpdate", "GUILD_SOUNDBOARD_SOUNDS_UPDATE", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("soundboardSounds", "SOUNDBOARD_SOUNDS", (_client, data) => [data]),
  defineEvent("integrationCreate", "INTEGRATION_CREATE", (_client, data) => [data]),
  defineEvent("integrationDelete", "INTEGRATION_DELETE", (_client, data) => [data]),
  defineEvent("integrationUpdate", "INTEGRATION_UPDATE", (_client, data) => [data, data]),
  defineEvent("inviteCreate", "INVITE_CREATE", (_client, data) => [data]),
  defineEvent("inviteDelete", "INVITE_DELETE", (_client, data) => [data]),
  defineEvent("messageCreate", "MESSAGE_CREATE", (_client, data) => [data]),
  defineEvent("messageDelete", "MESSAGE_DELETE", (_client, data) => [data]),
  defineEvent("messageUpdate", "MESSAGE_UPDATE", (_client, data) => [data, data]),
  defineEvent("messageDeleteBulk", "MESSAGE_DELETE_BULK", (_client, data) => [data]),
  defineEvent("messageReactionAdd", "MESSAGE_REACTION_ADD", (_client, data) => [data]),
  defineEvent("messageReactionRemove", "MESSAGE_REACTION_REMOVE", (_client, data) => [data]),
  defineEvent("messageReactionRemoveAll", "MESSAGE_REACTION_REMOVE_ALL", (_client, data) => [data]),
  defineEvent("messageReactionRemoveEmoji", "MESSAGE_REACTION_REMOVE_EMOJI", (_client, data) => [
    data,
  ]),
  defineEvent("messagePollVoteAdd", "MESSAGE_POLL_VOTE_ADD", (_client, data) => [data]),
  defineEvent("messagePollVoteRemove", "MESSAGE_POLL_VOTE_REMOVE", (_client, data) => [data]),
  defineEvent("stageInstanceCreate", "STAGE_INSTANCE_CREATE", (_client, data) => [data]),
  defineEvent("stageInstanceDelete", "STAGE_INSTANCE_DELETE", (_client, data) => [data]),
  defineEvent("stageInstanceUpdate", "STAGE_INSTANCE_UPDATE", (_client, data) => [data, data]),
  defineEvent("subscriptionCreate", "SUBSCRIPTION_CREATE", (_client, data) => [data]),
  defineEvent("subscriptionDelete", "SUBSCRIPTION_DELETE", (_client, data) => [data]),
  defineEvent("subscriptionUpdate", "SUBSCRIPTION_UPDATE", (_client, data) => [data, data]),
  defineEvent("userUpdate", "USER_UPDATE", (_client, data) => [data, data]),
  defineEvent("voiceChannelEffectSend", "VOICE_CHANNEL_EFFECT_SEND", (_client, data) => [data]),
  defineEvent("voiceStateUpdate", "VOICE_STATE_UPDATE", (_client, data) => [data, data]),
  defineEvent("voiceServerUpdate", "VOICE_SERVER_UPDATE", (_client, data) => [data]),
  defineEvent("webhooksUpdate", "WEBHOOKS_UPDATE", (_client, data) => [data]),
  defineEvent("ready", "READY", (_client, data) => [data]),
  defineEvent("interactionCreate", "INTERACTION_CREATE", (_client, data) => [data]),
  defineEvent(
    "applicationCommandPermissionsUpdate",
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    (_client, data) => [data, data],
  ),
  defineEvent("typingStart", "TYPING_START", (_client, data) => [data]),
  defineEvent("resumed", "RESUMED", (_client, data) => [data]),
  defineEvent("guildIntegrationsUpdate", "GUILD_INTEGRATIONS_UPDATE", (_client, data) => [data]),
  defineEvent("presenceUpdate", "PRESENCE_UPDATE", (_client, data) => [data, data]),
] as const;
