import type {
  BanEntity,
  EmojiEntity,
  InviteEntity,
  Snowflake,
} from "@nyxjs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  InviteCreateEntity,
} from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { Store } from "@nyxjs/store";
import type { RequiredKeysOf } from "type-fest";
import {
  type AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  Ban,
  ChannelPins,
  Emoji,
  Entitlement,
  Guild,
  GuildAuditLogEntry,
  GuildMember,
  GuildScheduledEvent,
  Integration,
  Invite,
  Message,
  MessagePollVote,
  Ready,
  Role,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadListSync,
  ThreadMember,
  TypingStart,
  User,
  VoiceChannelEffectSend,
  VoiceServer,
  VoiceState,
  Webhook,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import { ChannelFactory, InteractionFactory } from "../factories/index.js";
import type { CacheManager } from "../managers/index.js";
import type { ClientEvents, GuildBased } from "../types/index.js";

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
  defineEvent("READY", "ready", (client, data) => [Ready.from(client, data)]),
  defineEvent(
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    (_client, data) => [data],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_CREATE",
    "autoModerationRuleCreate",
    (client, data) => [AutoModerationRule.from(client, data)],
  ),
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
  defineEvent(
    "AUTO_MODERATION_RULE_DELETE",
    "autoModerationRuleDelete",
    (client, data) => handleDeleteEvent(client, data.id, "autoModerationRules"),
  ),
  defineEvent(
    "AUTO_MODERATION_ACTION_EXECUTION",
    "autoModerationActionExecution",
    (client, data) => [AutoModerationActionExecution.from(client, data)],
  ),
  defineEvent("CHANNEL_CREATE", "channelCreate", (client, data) => [
    ChannelFactory.create(client, data),
  ]),
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.create),
  ),
  defineEvent("CHANNEL_DELETE", "channelDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (client, data) => [
    ChannelPins.from(client, data),
  ]),
  defineEvent("THREAD_CREATE", "threadCreate", (client, data) => [
    ChannelFactory.create(client, data) as AnyThreadChannel,
  ]),
  defineEvent("THREAD_UPDATE", "threadUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.create),
  ),
  defineEvent("THREAD_DELETE", "threadDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (client, data) => [
    ThreadListSync.from(client, data),
  ]),
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (client, data) =>
    handleUpdateEvent(client, data, "threadMembers", ThreadMember.from),
  ),
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (_client, data) => [data],
  ),
  defineEvent("ENTITLEMENT_CREATE", "entitlementCreate", (client, data) => [
    Entitlement.from(client, data),
  ]),
  defineEvent("ENTITLEMENT_UPDATE", "entitlementUpdate", (client, data) =>
    handleUpdateEvent(client, data, "entitlements", Entitlement.from),
  ),
  defineEvent("ENTITLEMENT_DELETE", "entitlementDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "entitlements"),
  ),
  defineEvent("GUILD_CREATE", "guildCreate", (client, data) => [
    Guild.from(client, data as GuildCreateEntity),
  ]),
  defineEvent("GUILD_UPDATE", "guildUpdate", (client, data) =>
    handleUpdateEvent(client, data, "guilds", Guild.from),
  ),
  defineEvent("GUILD_DELETE", "guildDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "guilds"),
  ),
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (client, data) => [GuildAuditLogEntry.from(client, data)],
  ),
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (client, data) => [
    Ban.from(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    } as GuildBased<BanEntity>),
  ]),
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (client, data) => [
    Ban.from(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    } as GuildBased<BanEntity>),
  ]),
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", (client, data) => {
    const guildId = data.guild_id;
    const newEmojis = data.emojis;

    // Retrieve cached emojis for this guild
    const cachedEmojis = Array.from(client.cache.emojis.values()).filter(
      (emoji) => emoji.guildId === guildId,
    );

    // Create maps for efficient lookup
    const newEmojiMap = new Map<Snowflake, GuildBased<EmojiEntity>>();
    for (const emoji of newEmojis) {
      const formattedEmoji = { ...emoji, guild_id: guildId };
      if (emoji.id) {
        newEmojiMap.set(emoji.id, formattedEmoji);
      }
    }

    const cachedEmojiMap = new Map<Snowflake, Emoji>();
    for (const emoji of cachedEmojis) {
      if (emoji.id) {
        cachedEmojiMap.set(emoji.id, emoji);
      }
    }

    // Handle created emojis
    for (const [id, emojiData] of newEmojiMap.entries()) {
      if (!cachedEmojiMap.has(id)) {
        // Emoji created - use the factory directly
        const newEmoji = Emoji.from(client, emojiData);
        client.emit("emojiCreate", newEmoji);

        // Update cache (handled by the Emoji.from factory)
      }
    }

    // Handle updated emojis
    for (const [id, emojiData] of newEmojiMap.entries()) {
      if (cachedEmojiMap.has(id)) {
        // Use handleUpdateEvent to get both old and new versions
        const [oldEmoji, newEmoji] = handleUpdateEvent(
          client,
          emojiData,
          "emojis",
          Emoji.from,
        );

        // Emit the update event
        client.emit("emojiUpdate", oldEmoji, newEmoji);
      }
    }

    // Handle deleted emojis
    for (const [id, _] of cachedEmojiMap.entries()) {
      if (!newEmojiMap.has(id)) {
        // Use handleDeleteEvent to remove from cache and get old entity
        const [deletedEmoji] = handleDeleteEvent(client, id, "emojis");

        // Emit the delete event
        client.emit("emojiDelete", deletedEmoji);
      }
    }

    // Return the original event data
    return [data];
  }),
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (client, data) => {
      const guildId = data.guild_id;
      const newStickers = data.stickers;

      // Retrieve cached stickers for this guild
      const cachedStickers = Array.from(client.cache.stickers.values()).filter(
        (sticker) => sticker.guildId === guildId,
      );

      // Create maps for efficient lookup
      const newStickerMap = new Map();
      for (const sticker of newStickers) {
        const formattedSticker = { ...sticker, guild_id: guildId };
        if (sticker.id) {
          newStickerMap.set(sticker.id, formattedSticker);
        }
      }

      const cachedStickerMap = new Map();
      for (const sticker of cachedStickers) {
        if (sticker.id) {
          cachedStickerMap.set(sticker.id, sticker);
        }
      }

      // Handle created stickers
      for (const [id, stickerData] of newStickerMap.entries()) {
        if (!cachedStickerMap.has(id)) {
          // Sticker created - use the factory directly
          const newSticker = Sticker.from(client, stickerData);
          client.emit("stickerCreate", newSticker);
        }
      }

      // Handle updated stickers
      for (const [id, stickerData] of newStickerMap.entries()) {
        if (cachedStickerMap.has(id)) {
          // Use handleUpdateEvent to get both old and new versions
          const [oldSticker, newSticker] = handleUpdateEvent(
            client,
            stickerData,
            "stickers",
            Sticker.from,
          );

          // Emit the update event
          client.emit("stickerUpdate", oldSticker, newSticker);
        }
      }

      // Handle deleted stickers
      for (const [id, _] of cachedStickerMap.entries()) {
        if (!newStickerMap.has(id)) {
          // Use handleDeleteEvent to remove from cache and get old entity
          const [deletedSticker] = handleDeleteEvent(client, id, "stickers");

          // Emit the delete event
          client.emit("stickerDelete", deletedSticker);
        }
      }

      // Return the original event data
      return [data];
    },
  ),
  // defineEvent(
  //   "GUILD_INTEGRATIONS_UPDATE",
  //   "guildIntegrationsUpdate",
  //   (_client, _data) => {},
  // ),
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (client, data) => [
    GuildMember.from(client, data),
  ]),
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (client, data) =>
    handleUpdateEvent(client, data, "members", GuildMember.from),
  ),
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (client, data) =>
    handleDeleteEvent(client, `${data.guild_id}:${data.user.id}`, "members"),
  ),
  defineEvent("GUILD_MEMBERS_CHUNK", "guildMembersChunk", (_client, data) => [
    data,
  ]),
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => [
    Role.from(client, {
      guild_id: data.guild_id,
      ...data.role,
    }),
  ]),
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
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) =>
    handleDeleteEvent(client, data.role_id, "roles"),
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (client, data) => [GuildScheduledEvent.from(client, data)],
  ),
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
  defineEvent(
    "GUILD_SCHEDULED_EVENT_DELETE",
    "guildScheduledEventDelete",
    (client, data) => handleDeleteEvent(client, data.id, "scheduledEvents"),
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (_client, _data) => {},
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (_client, _data) => {},
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    "guildSoundboardSoundCreate",
    (client, data) => [SoundboardSound.from(client, data)],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (client, data) =>
      handleUpdateEvent(client, data, "soundboards", SoundboardSound.from),
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    "guildSoundboardSoundDelete",
    (client, data) => handleDeleteEvent(client, data.sound_id, "soundboards"),
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    "guildSoundboardSoundsUpdate",
    (client, data) => {
      const sounds = data.soundboard_sounds.map((soundData) =>
        SoundboardSound.from(client, {
          ...soundData,
          guild_id: data.guild_id,
        }),
      );

      return [sounds];
    },
  ),
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (client, data) => {
    const soundboardSounds = data.soundboard_sounds.map((sound) =>
      SoundboardSound.from(client, sound),
    );
    return [soundboardSounds];
  }),
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (client, data) => [
    Integration.from(client, data),
  ]),
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (client, data) =>
    handleUpdateEvent(client, data, "integrations", Integration.from),
  ),
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "integrations"),
  ),
  defineEvent("INVITE_CREATE", "inviteCreate", (client, data) => [
    Invite.from(client, data as InviteEntity & InviteCreateEntity),
  ]),
  defineEvent("INVITE_DELETE", "inviteDelete", (client, data) => [
    Invite.from(client, data as InviteEntity & InviteCreateEntity),
  ]),
  defineEvent("MESSAGE_CREATE", "messageCreate", (client, data) => [
    Message.from(client, data),
  ]),
  defineEvent("MESSAGE_UPDATE", "messageUpdate", (client, data) =>
    handleUpdateEvent(client, data, "messages", Message.from),
  ),
  defineEvent("MESSAGE_DELETE", "messageDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "messages"),
  ),
  defineEvent("MESSAGE_DELETE_BULK", "messageDeleteBulk", (client, data) => [
    data.ids.map((id) => {
      const [message] = handleDeleteEvent(client, id, "messages");
      return message;
    }),
  ]),
  defineEvent(
    "MESSAGE_REACTION_ADD",
    "messageReactionAdd",
    (_client, _data) => {},
  ),
  defineEvent(
    "MESSAGE_REACTION_REMOVE",
    "messageReactionRemove",
    (_client, _data) => {},
  ),
  defineEvent(
    "MESSAGE_REACTION_REMOVE_ALL",
    "messageReactionRemoveAll",
    (_client, _data) => {},
  ),
  defineEvent(
    "MESSAGE_REACTION_REMOVE_EMOJI",
    "messageReactionRemoveEmoji",
    (_client, _data) => {},
  ),
  defineEvent("MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd", (client, data) => [
    MessagePollVote.from(client, data),
  ]),
  defineEvent(
    "MESSAGE_POLL_VOTE_REMOVE",
    "messagePollVoteRemove",
    (client, data) => [MessagePollVote.from(client, data)],
  ),
  defineEvent("PRESENCE_UPDATE", "presenceUpdate", (_client, _data) => {}),
  defineEvent("TYPING_START", "typingStart", (client, data) => [
    TypingStart.from(client, data),
  ]),
  defineEvent("USER_UPDATE", "userUpdate", (client, data) =>
    handleUpdateEvent(client, data, "users", User.from),
  ),
  defineEvent(
    "VOICE_CHANNEL_EFFECT_SEND",
    "voiceChannelEffectSend",
    (client, data) => [VoiceChannelEffectSend.from(client, data)],
  ),
  defineEvent("VOICE_STATE_UPDATE", "voiceStateUpdate", (client, data) =>
    handleUpdateEvent(client, data, "voiceStates", VoiceState.from),
  ),
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (client, data) =>
    handleUpdateEvent(client, data, "voiceServers", VoiceServer.from),
  ),
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (client, data) =>
    handleUpdateEvent(client, data, "webhooks", Webhook.from),
  ),
  defineEvent("INTERACTION_CREATE", "interactionCreate", (client, data) => [
    InteractionFactory.create(client, data),
  ]),
  defineEvent(
    "STAGE_INSTANCE_CREATE",
    "stageInstanceCreate",
    (client, data) => [StageInstance.from(client, data)],
  ),
  defineEvent("STAGE_INSTANCE_UPDATE", "stageInstanceUpdate", (client, data) =>
    handleUpdateEvent(client, data, "stageInstances", StageInstance.from),
  ),
  defineEvent("STAGE_INSTANCE_DELETE", "stageInstanceDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "stageInstances"),
  ),
  defineEvent("SUBSCRIPTION_CREATE", "subscriptionCreate", (client, data) => [
    Subscription.from(client, data),
  ]),
  defineEvent("SUBSCRIPTION_UPDATE", "subscriptionUpdate", (client, data) =>
    handleUpdateEvent(client, data, "subscriptions", Subscription.from),
  ),
  defineEvent("SUBSCRIPTION_DELETE", "subscriptionDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "subscriptions"),
  ),
] as const;

/**
 * Standard mappings of Discord REST events to client events.
 * These events are forwarded directly from the REST client to the main client.cache.
 */
export const RestKeyofEventMappings: RequiredKeysOf<RestEvents>[] = [
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
export const GatewayKeyofEventMappings: RequiredKeysOf<GatewayEvents>[] = [
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
