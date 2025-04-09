import type { Snowflake } from "@nyxjs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
} from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { Store } from "@nyxjs/store";
import {
  type AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  Entitlement,
  Guild,
  GuildMember,
  GuildScheduledEvent,
  Integration,
  Message,
  MessagePollVote,
  Ready,
  Role,
  SoundboardSound,
  StageInstance,
  Subscription,
  TypingStart,
  User,
  VoiceChannelEffectSend,
  VoiceServer,
  VoiceState,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import { ChannelFactory, InteractionFactory } from "../factories/index.js";
import type { CacheManager } from "../managers/index.js";
import type { ClientEvents } from "../types/index.js";

/**
 * Gateway to client event mapping configuration
 */
interface GatewayEventMapping<
  T extends keyof GatewayReceiveEvents,
  E extends keyof ClientEvents,
> {
  /**
   * Gateway event name
   */
  gatewayEvent: T;

  /**
   * Client event name that this maps to
   */
  clientEvent: E;

  /**
   * Transform function to convert gateway event data to client event data
   */
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[E];
}

/**
 * Typed utility function to define an event mapping more easily.
 * This function creates a strongly-typed connection between Discord Gateway events
 * and the client's event system, ensuring type safety throughout the event pipeline.
 *
 * @param gatewayEvent - The name of the Discord Gateway event
 * @param clientEvent - The name of the corresponding client event
 * @param transform - Data transformation function that converts raw gateway data to client event data
 * @returns A typed event configuration object
 *
 * @example
 * ```typescript
 * // Define a simple event mapping
 * defineEvent("GUILD_CREATE", "guildCreate", (client, data) => [Guild.from(client, data)]);
 * ```
 */
function defineEvent<
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
 * Utility function to handle DELETE events for any entity type
 * @param client - Client instance
 * @param entityId - ID of the entity being deleted
 * @param cacheKey - Key to access the appropriate cache store (e.g., 'channels', 'guilds')
 * @returns - The cached entity before deletion, or null if not in cache
 */
function handleDeleteEvent<
  K extends keyof CacheManager,
  T = CacheManager[K] extends Store<Snowflake, infer U> ? U : never,
>(client: Client, entityId: Snowflake, cacheKey: K): [T | null] {
  // Get the cached version before deleting
  const store = client.cache[cacheKey] as Store<Snowflake, T>;
  const cachedEntity = store?.get?.(entityId) ?? null;

  // Remove from cache
  if (cachedEntity) {
    store?.delete?.(entityId);
  }

  return [cachedEntity];
}

/**
 * Utility function to handle UPDATE events for any entity type
 * @param client - Client instance
 * @param data - Raw entity data from the API
 * @param cacheKey - Key to access the appropriate cache store
 * @param factory - Factory function to create entity instances
 * @returns - Array with old entity (or null) and new entity
 */
function handleUpdateEvent<
  // biome-ignore lint/suspicious/noExplicitAny: Complex generic type
  F extends (client: Client, data: any) => any,
  T = ReturnType<F>,
  D = Parameters<F>[1],
>(
  client: Client,
  data: D,
  cacheKey: keyof CacheManager,
  factory: F,
): [T | null, T] {
  // Create new instance from updated data
  const newEntity = factory(client, data);

  // Get ID from the entity (assuming entities have an 'id' property)
  const entityId = (newEntity as unknown as { id: Snowflake }).id;

  // Get the cached version before updating
  const store = client.cache[cacheKey] as Store<Snowflake, T>;
  const cachedEntity = store?.get?.(entityId);

  // Clone the cached entity if it exists
  let oldEntity: T | null = null;
  if (cachedEntity) {
    // Assuming entities have a clone method
    oldEntity =
      (cachedEntity as unknown as { clone(): T }).clone?.() || cachedEntity;
  }

  return [oldEntity, newEntity];
}

/**
 * Standard mappings of Discord Gateway events to client events.
 *
 * These mappings define how raw Gateway events are transformed into client events.
 * Each mapping includes:
 * 1. The original Gateway event name
 * 2. The client event name
 * 3. A transform function that processes the data and updates the cache
 *
 * The transform functions handle:
 * - Creating the appropriate class instances from raw data
 * - Updating the client's cache with new/updated/deleted entities
 * - Preserving old entities for events that need "before" and "after" states
 * - Returning an array of arguments to be passed to event handlers
 */
export const StandardGatewayDispatchEventMappings = [
  /**
   * Ready event - emitted when the client has successfully connected to the gateway
   * and is ready to receive events.
   */
  defineEvent("READY", "ready", (client, data) => [Ready.from(client, data)]),

  /**
   * Application command permissions update event - emitted when application command
   * permissions are updated.
   */
  defineEvent(
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    (_client, data) => [data],
  ),

  /**
   * Auto moderation rule create event - emitted when an auto moderation rule is created.
   * Adds the new rule to the cache.
   */
  defineEvent(
    "AUTO_MODERATION_RULE_CREATE",
    "autoModerationRuleCreate",
    (client, data) => [AutoModerationRule.from(client, data)],
  ),

  /**
   * Auto moderation rule update event - emitted when an auto moderation rule is updated.
   * Updates the cached rule and provides both old and new versions.
   */
  defineEvent(
    "AUTO_MODERATION_RULE_UPDATE",
    "autoModerationRuleUpdate",
    (client, data) =>
      handleUpdateEvent(
        client,
        data,
        "autoModerationRules",
        AutoModerationRule.from,
      ),
  ),

  /**
   * Auto moderation rule delete event - emitted when an auto moderation rule is deleted.
   * Removes the rule from the cache.
   */
  defineEvent(
    "AUTO_MODERATION_RULE_DELETE",
    "autoModerationRuleDelete",
    (client, data) => handleDeleteEvent(client, data.id, "autoModerationRules"),
  ),

  /**
   * Auto moderation action execution event - emitted when auto moderation takes action.
   */
  defineEvent(
    "AUTO_MODERATION_ACTION_EXECUTION",
    "autoModerationActionExecution",
    (client, data) => [AutoModerationActionExecution.from(client, data)],
  ),

  /**
   * Channel create event - emitted when a channel is created.
   * Adds the new channel to the cache.
   */
  defineEvent("CHANNEL_CREATE", "channelCreate", (client, data) => [
    ChannelFactory.create(client, data),
  ]),

  /**
   * Channel update event - emitted when a channel is updated.
   * Updates the channel in the cache and provides both old and new versions.
   */
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.create),
  ),

  /**
   * Channel delete event - emitted when a channel is deleted.
   * Removes the channel from the cache.
   */
  defineEvent("CHANNEL_DELETE", "channelDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),

  /**
   * Channel pins update event - emitted when a message is pinned or unpinned.
   */
  defineEvent(
    "CHANNEL_PINS_UPDATE",
    "channelPinsUpdate",
    (_client, _data) => {},
  ),

  /**
   * Thread create event - emitted when a thread is created.
   * Adds the new thread to the cache.
   */
  defineEvent("THREAD_CREATE", "threadCreate", (client, data) => [
    ChannelFactory.create(client, data) as AnyThreadChannel,
  ]),

  /**
   * Thread update event - emitted when a thread is updated.
   * Updates the thread in the cache and provides both old and new versions.
   */
  defineEvent("THREAD_UPDATE", "threadUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.create),
  ),

  /**
   * Thread delete event - emitted when a thread is deleted.
   * Removes the thread from the cache.
   */
  defineEvent("THREAD_DELETE", "threadDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),

  /**
   * Thread list sync event - emitted when threads are synced.
   */
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (_client, _data) => {}),

  /**
   * Thread member update event - emitted when a thread member is updated.
   */
  defineEvent(
    "THREAD_MEMBER_UPDATE",
    "threadMemberUpdate",
    (_client, _data) => {},
  ),

  /**
   * Thread members update event - emitted when multiple thread members are updated.
   */
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (_client, _data) => {},
  ),

  /**
   * Entitlement create event - emitted when an entitlement is created.
   * Adds the new entitlement to the cache.
   */
  defineEvent("ENTITLEMENT_CREATE", "entitlementCreate", (client, data) => [
    Entitlement.from(client, data),
  ]),

  /**
   * Entitlement update event - emitted when an entitlement is updated.
   * Updates the entitlement in the cache and provides both old and new versions.
   */
  defineEvent("ENTITLEMENT_UPDATE", "entitlementUpdate", (client, data) =>
    handleUpdateEvent(client, data, "entitlements", Entitlement.from),
  ),

  /**
   * Entitlement delete event - emitted when an entitlement is deleted.
   * Removes the entitlement from the cache.
   */
  defineEvent("ENTITLEMENT_DELETE", "entitlementDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "entitlements"),
  ),

  /**
   * Guild create event - emitted when a guild becomes available.
   * Adds the guild and its related entities to the cache.
   */
  defineEvent("GUILD_CREATE", "guildCreate", (client, data) => [
    Guild.from(client, data as GuildCreateEntity),
  ]),

  /**
   * Guild update event - emitted when a guild is updated.
   * Updates the guild in the cache and provides both old and new versions.
   */
  defineEvent("GUILD_UPDATE", "guildUpdate", (client, data) =>
    handleUpdateEvent(client, data, "guilds", Guild.from),
  ),

  /**
   * Guild delete event - emitted when a guild becomes unavailable or the bot is removed.
   * Removes the guild and optionally its related entities from the cache.
   */
  defineEvent("GUILD_DELETE", "guildDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "guilds"),
  ),

  /**
   * Guild audit log entry create event - emitted when an audit log entry is created.
   */
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (_client, data) => [data],
  ),

  /**
   * Guild ban add event - emitted when a user is banned from a guild.
   */
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (_client, _data) => {}),

  /**
   * Guild ban remove event - emitted when a user is unbanned from a guild.
   */
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (_client, _data) => {}),

  /**
   * Guild emojis update event - emitted when a guild's emojis are updated.
   * This event is special as it needs to trigger individual emoji events.
   */
  defineEvent(
    "GUILD_EMOJIS_UPDATE",
    "guildEmojisUpdate",
    (_client, _data) => {},
  ),

  /**
   * Guild stickers update event - emitted when a guild's stickers are updated.
   * Similar to emoji updates, this triggers individual sticker events.
   */
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (_client, _data) => {},
  ),

  /**
   * Guild integrations update event - emitted when a guild's integrations are updated.
   */
  defineEvent(
    "GUILD_INTEGRATIONS_UPDATE",
    "guildIntegrationsUpdate",
    (_client, _data) => {},
  ),

  /**
   * Guild member add event - emitted when a user joins a guild.
   * Adds the member to the cache.
   */
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (client, data) => [
    GuildMember.from(client, data),
  ]),

  /**
   * Guild member update event - emitted when a guild member is updated.
   * Updates the member in the cache.
   */
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (client, data) =>
    handleUpdateEvent(client, data, "members", GuildMember.from),
  ),

  /**
   * Guild member remove event - emitted when a user leaves a guild.
   * Removes the member from the cache.
   */
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (client, data) =>
    handleDeleteEvent(client, `${data.guild_id}:${data.user.id}`, "members"),
  ),

  /**
   * Guild members chunk event - emitted in response to Guild Request Members.
   */
  defineEvent(
    "GUILD_MEMBERS_CHUNK",
    "guildMembersChunk",
    (_client, _data) => {},
  ),

  /**
   * Guild role create event - emitted when a guild role is created.
   * Adds the role to the cache.
   */
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => [
    Role.from(client, {
      guild_id: data.guild_id,
      ...data.role,
    }),
  ]),

  /**
   * Guild role update event - emitted when a guild role is updated.
   * Updates the role in the cache.
   */
  defineEvent("GUILD_ROLE_UPDATE", "guildRoleUpdate", (client, data) =>
    handleUpdateEvent(
      client,
      {
        guild_id: data.guild_id,
        ...data.role,
      },
      "roles",
      Role.from,
    ),
  ),

  /**
   * Guild role delete event - emitted when a guild role is deleted.
   * Removes the role from the cache.
   */
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) =>
    handleDeleteEvent(client, data.role_id, "roles"),
  ),

  /**
   * Guild scheduled event create event - emitted when a scheduled event is created.
   * Adds the event to the cache.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (client, data) => [GuildScheduledEvent.from(client, data)],
  ),

  /**
   * Guild scheduled event update event - emitted when a scheduled event is updated.
   * Updates the event in the cache and provides both old and new versions.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_UPDATE",
    "guildScheduledEventUpdate",
    (client, data) =>
      handleUpdateEvent(
        client,
        data,
        "scheduledEvents",
        GuildScheduledEvent.from,
      ),
  ),

  /**
   * Guild scheduled event delete event - emitted when a scheduled event is deleted.
   * Removes the event from the cache.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_DELETE",
    "guildScheduledEventDelete",
    (client, data) => handleDeleteEvent(client, data.id, "scheduledEvents"),
  ),

  /**
   * Guild scheduled event user add event - emitted when a user subscribes to an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (_client, _data) => {},
  ),

  /**
   * Guild scheduled event user remove event - emitted when a user unsubscribes from an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (_client, _data) => {},
  ),

  /**
   * Guild soundboard sound create event - emitted when a soundboard sound is created.
   * Adds the sound to the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    "guildSoundboardSoundCreate",
    (client, data) => [SoundboardSound.from(client, data)],
  ),

  /**
   * Guild soundboard sound update event - emitted when a soundboard sound is updated.
   * Updates the sound in the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (client, data) =>
      handleUpdateEvent(client, data, "soundboards", SoundboardSound.from),
  ),

  /**
   * Guild soundboard sound delete event - emitted when a soundboard sound is deleted.
   * Removes the sound from the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    "guildSoundboardSoundDelete",
    (client, data) => handleDeleteEvent(client, data.sound_id, "soundboards"),
  ),

  /**
   * Guild soundboard sounds update event - emitted when multiple sounds are updated.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    "guildSoundboardSoundsUpdate",
    (_client, _data) => {},
  ),

  /**
   * Soundboard sounds event - emitted for soundboard sounds.
   */
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (_client, _data) => {}),

  /**
   * Integration create event - emitted when an integration is created.
   * Adds the integration to the cache.
   */
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (client, data) => [
    Integration.from(client, data),
  ]),

  /**
   * Integration update event - emitted when an integration is updated.
   * Updates the integration in the cache.
   */
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (client, data) =>
    handleUpdateEvent(client, data, "integrations", Integration.from),
  ),

  /**
   * Integration delete event - emitted when an integration is deleted.
   * Removes the integration from the cache.
   */
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "integrations"),
  ),

  /**
   * Invite create event - emitted when an invite is created.
   * Adds the invite to the cache.
   */
  defineEvent("INVITE_CREATE", "inviteCreate", (_client, _data) => {}),

  /**
   * Invite delete event - emitted when an invite is deleted.
   * Removes the invite from the cache.
   */
  defineEvent("INVITE_DELETE", "inviteDelete", (_client, _data) => {}),

  /**
   * Message create event - emitted when a message is sent.
   * Adds the message to the cache.
   */
  defineEvent("MESSAGE_CREATE", "messageCreate", (client, data) => [
    Message.from(client, data),
  ]),

  /**
   * Message update event - emitted when a message is edited.
   * Updates the message in the cache and provides both old and new versions.
   */
  defineEvent("MESSAGE_UPDATE", "messageUpdate", (client, data) =>
    handleUpdateEvent(client, data, "messages", Message.from),
  ),

  /**
   * Message delete event - emitted when a message is deleted.
   * Removes the message from the cache.
   */
  defineEvent("MESSAGE_DELETE", "messageDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "messages"),
  ),

  /**
   * Message delete bulk event - emitted when multiple messages are deleted at once.
   * Removes the messages from the cache.
   */
  defineEvent(
    "MESSAGE_DELETE_BULK",
    "messageDeleteBulk",
    (_client, _data) => {},
  ),

  /**
   * Message reaction add event - emitted when a reaction is added to a message.
   */
  defineEvent(
    "MESSAGE_REACTION_ADD",
    "messageReactionAdd",
    (_client, _data) => {},
  ),

  /**
   * Message reaction remove event - emitted when a reaction is removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE",
    "messageReactionRemove",
    (_client, _data) => {},
  ),

  /**
   * Message reaction remove all event - emitted when all reactions are removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_ALL",
    "messageReactionRemoveAll",
    (_client, _data) => {},
  ),

  /**
   * Message reaction remove emoji event - emitted when all reactions of a specific emoji are removed.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_EMOJI",
    "messageReactionRemoveEmoji",
    (_client, _data) => {},
  ),

  /**
   * Message poll vote add event - emitted when a user votes on a poll.
   */
  defineEvent("MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd", (client, data) => [
    MessagePollVote.from(client, data),
  ]),

  /**
   * Message poll vote remove event - emitted when a user removes their vote from a poll.
   */
  defineEvent(
    "MESSAGE_POLL_VOTE_REMOVE",
    "messagePollVoteRemove",
    (client, data) => [MessagePollVote.from(client, data)],
  ),

  /**
   * Presence update event - emitted when a user's presence is updated.
   * Updates the presence in the cache.
   */
  defineEvent("PRESENCE_UPDATE", "presenceUpdate", (_client, _data) => {}),

  /**
   * Typing start event - emitted when a user starts typing.
   */
  defineEvent("TYPING_START", "typingStart", (client, data) => [
    TypingStart.from(client, data),
  ]),

  /**
   * User update event - emitted when properties about the current user change.
   * Updates the user in the cache and provides both old and new versions.
   */
  defineEvent("USER_UPDATE", "userUpdate", (client, data) =>
    handleUpdateEvent(client, data, "users", User.from),
  ),

  /**
   * Voice channel effect send event - emitted when a voice channel effect is sent.
   */
  defineEvent(
    "VOICE_CHANNEL_EFFECT_SEND",
    "voiceChannelEffectSend",
    (client, data) => [VoiceChannelEffectSend.from(client, data)],
  ),

  /**
   * Voice state update event - emitted when a user's voice state changes.
   * Updates the voice state in the cache and provides both old and new versions.
   */
  defineEvent("VOICE_STATE_UPDATE", "voiceStateUpdate", (client, data) =>
    handleUpdateEvent(client, data, "voiceStates", VoiceState.from),
  ),

  /**
   * Voice server update event - emitted when a guild's voice server is updated.
   */
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (client, data) =>
    handleUpdateEvent(client, data, "voiceServers", VoiceServer.from),
  ),

  /**
   * Webhooks update event - emitted when a guild webhook is created, updated, or deleted.
   */
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (_client, _data) => {}),

  /**
   * Interaction create event - emitted when an interaction is created.
   * Uses the InteractionFactory to create the appropriate interaction type.
   */
  defineEvent("INTERACTION_CREATE", "interactionCreate", (client, data) => [
    InteractionFactory.create(client, data),
  ]),

  /**
   * Stage instance create event - emitted when a stage instance is created.
   * Adds the stage instance to the cache.
   */
  defineEvent(
    "STAGE_INSTANCE_CREATE",
    "stageInstanceCreate",
    (client, data) => [StageInstance.from(client, data)],
  ),

  /**
   * Stage instance update event - emitted when a stage instance is updated.
   * Updates the stage instance in the cache and provides both old and new versions.
   */
  defineEvent("STAGE_INSTANCE_UPDATE", "stageInstanceUpdate", (client, data) =>
    handleUpdateEvent(client, data, "stageInstances", StageInstance.from),
  ),

  /**
   * Stage instance delete event - emitted when a stage instance is deleted.
   * Removes the stage instance from the cache.
   */
  defineEvent("STAGE_INSTANCE_DELETE", "stageInstanceDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "stageInstances"),
  ),

  /**
   * Subscription create event - emitted when a subscription is created.
   * Adds the subscription to the cache.
   */
  defineEvent("SUBSCRIPTION_CREATE", "subscriptionCreate", (client, data) => [
    Subscription.from(client, data),
  ]),

  /**
   * Subscription update event - emitted when a subscription is updated.
   * Updates the subscription in the cache and provides both old and new versions.
   */
  defineEvent("SUBSCRIPTION_UPDATE", "subscriptionUpdate", (client, data) =>
    handleUpdateEvent(client, data, "subscriptions", Subscription.from),
  ),

  /**
   * Subscription delete event - emitted when a subscription is deleted.
   * Removes the subscription from the cache.
   */
  defineEvent("SUBSCRIPTION_DELETE", "subscriptionDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "subscriptions"),
  ),
] as const;

/**
 * Standard mappings of Discord REST events to client events.
 * These events are forwarded directly from the REST client to the main client.cache.
 */
export const RestKeyofEventMappings: (keyof RestEvents)[] = [
  "requestStart",
  "requestSuccess",
  "requestFailure",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "retry",
] as const;

/**
 * Standard mappings of Discord Gateway events to client events.
 * These events are forwarded directly from the Gateway client to the main client.cache.
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
] as const;
