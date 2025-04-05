import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  MessageCreateEntity,
} from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import {
  Entitlement,
  Guild,
  Message,
  Ready,
  Subscription,
  User,
  VoiceState,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import type { GatewayEventMapping } from "../handlers/index.js";
import type { ClientEvents } from "../types/index.js";

/**
 * Typed utility function to define an event more easily
 *
 * @param gatewayEvent The name of the Discord Gateway event
 * @param clientEvent The name of the corresponding client event
 * @param transform Data transformation function
 * @returns A typed event configuration
 */
export function defineEvent<
  T extends keyof GatewayReceiveEvents,
  E extends keyof ClientEvents,
>(
  gatewayEvent: T,
  clientEvent: E,
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[E],
): GatewayEventMapping<T, E> {
  return {
    gatewayEvent,
    clientEvent,
    transform,
  };
}

/**
 * Standard mappings of Discord Gateway events to client events
 */
export const StandardGatewayDispatchEventMappings = [
  defineEvent("READY", "ready", (client, data) => [Ready.from(client, data)]),
  defineEvent("RESUMED", "resumed", (_client, data) => [data]),
  defineEvent(
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    (_client, data) => [data],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_CREATE",
    "autoModerationRuleCreate",
    (_client, data) => [data],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_UPDATE",
    "autoModerationRuleUpdate",
    (_client, data) => [null, data],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_DELETE",
    "autoModerationRuleDelete",
    (_client, data) => [data],
  ),
  defineEvent(
    "AUTO_MODERATION_ACTION_EXECUTION",
    "autoModerationActionExecution",
    (_client, data) => [data],
  ),
  defineEvent("CHANNEL_CREATE", "channelCreate", (_client, data) => [data]),
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("CHANNEL_DELETE", "channelDelete", (_client, data) => [data]),
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (_client, data) => [
    data,
  ]),
  defineEvent("THREAD_CREATE", "threadCreate", (_client, data) => [data]),
  defineEvent("THREAD_UPDATE", "threadUpdate", (_client, data) => [data, data]),
  defineEvent("THREAD_DELETE", "threadDelete", (_client, data) => [data]),
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (_client, data) => [data]),
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (_client, data) => [
    null,
    data,
  ]),
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (_client, data) => [data],
  ),
  defineEvent("ENTITLEMENT_CREATE", "entitlementCreate", (client, data) => {
    const entitlement = Entitlement.from(client, data);
    if (client.entitlements?.set) {
      client.entitlements.set(entitlement.id, entitlement);
    }
    return [entitlement];
  }),
  defineEvent("ENTITLEMENT_UPDATE", "entitlementUpdate", (client, data) => {
    const newEntitlement = Entitlement.from(client, data);

    let oldEntitlement: Entitlement | null = null;
    const cachedEntitlements = client.entitlements?.get?.(newEntitlement.id);
    if (cachedEntitlements) {
      oldEntitlement = cachedEntitlements.clone?.() || cachedEntitlements;
    }

    if (client.entitlements?.set) {
      client.entitlements.set(newEntitlement.id, newEntitlement);
    }

    return [oldEntitlement, newEntitlement];
  }),
  defineEvent("ENTITLEMENT_DELETE", "entitlementDelete", (client, data) => {
    const deletedEntitlement = Entitlement.from(client, data);

    const cachedEntitlements = client.entitlements?.get?.(
      deletedEntitlement.id,
    );
    if (cachedEntitlements && client.entitlements?.delete) {
      client.entitlements.delete(deletedEntitlement.id);
    }

    return [deletedEntitlement];
  }),
  defineEvent("GUILD_CREATE", "guildCreate", (client, data) => {
    const guild = Guild.from(client, data as GuildCreateEntity);
    if (client.guilds?.set) {
      client.guilds.set(guild.id, guild);
    }
    return [guild];
  }),
  defineEvent("GUILD_UPDATE", "guildUpdate", (client, data) => {
    const newGuild = Guild.from(client, data as GuildCreateEntity);
    let oldGuild: Guild | null = null;
    const cachedGuild = client.guilds?.get?.(newGuild.id);
    if (cachedGuild) {
      oldGuild = cachedGuild.clone?.() || cachedGuild;
    }
    if (client.guilds?.set) {
      client.guilds.set(newGuild.id, newGuild);
    }
    return [oldGuild, newGuild];
  }),
  defineEvent("GUILD_DELETE", "guildDelete", (_client, data) => [data]),
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (_client, data) => [data],
  ),
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (_client, data) => [data]),
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (_client, data) => [data]),
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", (_client, data) => [
    data,
    data,
  ]),
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (_client, data) => [data, data],
  ),
  defineEvent(
    "GUILD_INTEGRATIONS_UPDATE",
    "guildIntegrationsUpdate",
    (_client, data) => [data],
  ),
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (_client, data) => [data]),
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (_client, data) => [
    data,
  ]),
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("GUILD_MEMBERS_CHUNK", "guildMembersChunk", (_client, data) => [
    data,
  ]),
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (_client, data) => [
    data,
  ]),
  defineEvent("GUILD_ROLE_UPDATE", "guildRoleUpdate", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (_client, data) => [
    data,
  ]),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_UPDATE",
    "guildScheduledEventUpdate",
    (_client, data) => [data, data],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_DELETE",
    "guildScheduledEventDelete",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    "guildSoundboardSoundCreate",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (_client, data) => [data, data],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    "guildSoundboardSoundDelete",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    "guildSoundboardSoundsUpdate",
    (_client, data) => [data],
  ),
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (_client, data) => [
    data,
  ]),
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (_client, data) => [
    data,
  ]),
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (_client, data) => [
    data,
    data,
  ]),
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (_client, data) => [
    data,
  ]),
  defineEvent("INVITE_CREATE", "inviteCreate", (_client, data) => [data]),
  defineEvent("INVITE_DELETE", "inviteDelete", (_client, data) => [data]),
  defineEvent("MESSAGE_CREATE", "messageCreate", (client, data) => {
    const message = Message.from(client, data);
    if (client.messages?.set) {
      client.messages.set(message.id, message);
    }
    return [message];
  }),
  defineEvent("MESSAGE_UPDATE", "messageUpdate", (client, data) => {
    const newMessage = Message.from(client, data);

    let oldMessage: Message | null = null;
    const cachedMessage = client.messages?.get?.(newMessage.id);
    if (cachedMessage) {
      oldMessage = cachedMessage.clone?.() || cachedMessage;
    }

    if (client.messages?.set) {
      client.messages.set(newMessage.id, newMessage);
    }

    return [oldMessage, newMessage];
  }),
  defineEvent("MESSAGE_DELETE", "messageDelete", (client, data) => {
    const deletedMessage = Message.from(client, data as MessageCreateEntity);

    const cachedMessage = client.messages?.get?.(deletedMessage.id);
    if (cachedMessage && client.messages?.delete) {
      client.messages.delete(deletedMessage.id);
    }

    return [deletedMessage];
  }),
  defineEvent("MESSAGE_DELETE_BULK", "messageDeleteBulk", (_client, data) => [
    data,
  ]),
  defineEvent("MESSAGE_REACTION_ADD", "messageReactionAdd", (_client, data) => [
    data,
  ]),
  defineEvent(
    "MESSAGE_REACTION_REMOVE",
    "messageReactionRemove",
    (_client, data) => [data],
  ),
  defineEvent(
    "MESSAGE_REACTION_REMOVE_ALL",
    "messageReactionRemoveAll",
    (_client, data) => [data],
  ),
  defineEvent(
    "MESSAGE_REACTION_REMOVE_EMOJI",
    "messageReactionRemoveEmoji",
    (_client, data) => [data],
  ),
  defineEvent(
    "MESSAGE_POLL_VOTE_ADD",
    "messagePollVoteAdd",
    (_client, data) => [data],
  ),
  defineEvent(
    "MESSAGE_POLL_VOTE_REMOVE",
    "messagePollVoteRemove",
    (_client, data) => [data],
  ),
  defineEvent("PRESENCE_UPDATE", "presenceUpdate", (_client, data) => {
    return [data, data];
  }),
  defineEvent("TYPING_START", "typingStart", (_client, data) => [data]),
  defineEvent("USER_UPDATE", "userUpdate", (client, data) => {
    const newUser = User.from(client, data);

    let oldUser: User | null = null;
    const cachedUser = client.users?.get?.(newUser.id);
    if (cachedUser) {
      oldUser = cachedUser.clone?.() || cachedUser;
    }

    if (client.users?.set) {
      client.users.set(newUser.id, newUser);
    }

    return [oldUser, newUser];
  }),
  defineEvent(
    "VOICE_CHANNEL_EFFECT_SEND",
    "voiceChannelEffectSend",
    (_client, data) => [data],
  ),
  defineEvent("VOICE_STATE_UPDATE", "voiceStateUpdate", (client, data) => {
    const newState = VoiceState.from(client, data);
    let oldState: VoiceState | null = null;

    const cachedState = client.voiceStates?.get?.(newState.userId);
    if (cachedState) {
      oldState = cachedState.clone?.() || cachedState;
    }
    if (client.voiceStates?.set) {
      client.voiceStates.set(newState.userId, newState);
    }

    return [oldState, newState];
  }),
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (_client, data) => [
    data,
  ]),
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (_client, data) => [data]),
  defineEvent("INTERACTION_CREATE", "interactionCreate", (_client, data) => [
    data,
  ]),
  defineEvent(
    "STAGE_INSTANCE_CREATE",
    "stageInstanceCreate",
    (_client, data) => [data],
  ),
  defineEvent(
    "STAGE_INSTANCE_UPDATE",
    "stageInstanceUpdate",
    (_client, data) => {
      return [data, data];
    },
  ),
  defineEvent(
    "STAGE_INSTANCE_DELETE",
    "stageInstanceDelete",
    (_client, data) => {
      return [data];
    },
  ),
  defineEvent("SUBSCRIPTION_CREATE", "subscriptionCreate", (client, data) => {
    const subscription = Subscription.from(client, data);
    if (client.subscriptions?.set) {
      client.subscriptions.set(subscription.id, subscription);
    }
    return [subscription];
  }),
  defineEvent("SUBSCRIPTION_UPDATE", "subscriptionUpdate", (client, data) => {
    const newSubscription = Subscription.from(client, data);

    let oldSubscription: Subscription | null = null;
    const cachedSubscription = client.subscriptions?.get?.(newSubscription.id);
    if (cachedSubscription) {
      oldSubscription = cachedSubscription.clone?.() || cachedSubscription;
    }

    if (client.subscriptions?.set) {
      client.subscriptions.set(newSubscription.id, newSubscription);
    }

    return [oldSubscription, newSubscription];
  }),
  defineEvent("SUBSCRIPTION_DELETE", "subscriptionDelete", (client, data) => {
    const deletedSubscription = Subscription.from(client, data);

    const cachedSubscription = client.subscriptions?.get?.(
      deletedSubscription.id,
    );
    if (cachedSubscription && client.subscriptions?.delete) {
      client.subscriptions.delete(deletedSubscription.id);
    }

    return [deletedSubscription];
  }),
];

/**
 * Standard mappings of Discord REST events to client events
 */
export const RestKeyofEventMappings: (keyof RestEvents)[] = [
  "requestStart",
  "requestSuccess",
  "requestFailure",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "queueComplete",
  "queueTimeout",
  "queueReject",
  "retry",
];

/**
 * Standard mappings of Discord Gateway events to client events
 */
export const GatewayKeyofEventMappings: (keyof GatewayEvents)[] = [
  "connectionAttempt",
  "connectionSuccess",
  "connectionFailure",
  "reconnectionScheduled",
  "heartbeatSent",
  "heartbeatAcknowledge",
  "heartbeatTimeout",
  "sessionStart",
  "sessionResume",
  "sessionInvalidate",
  "shardCreate",
  "shardReady",
  "shardDisconnect",
  "rateLimitDetected",
  "error",
  "dispatch",
];
