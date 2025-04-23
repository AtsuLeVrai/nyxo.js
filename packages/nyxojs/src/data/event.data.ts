import type {
  BanEntity,
  EmojiEntity,
  GuildMemberEntity,
  InviteEntity,
  Snowflake,
  WebhookEntity,
} from "@nyxojs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  GuildEmojisUpdateEntity,
  GuildStickersUpdateEntity,
  InviteCreateEntity,
} from "@nyxojs/gateway";
import type { RestEvents } from "@nyxojs/rest";
import type { Store } from "@nyxojs/store";
import {
  type AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  Ban,
  Emoji,
  Entitlement,
  Guild,
  GuildAuditLogEntry,
  GuildMember,
  GuildScheduledEvent,
  GuildScheduledEventUser,
  Integration,
  Invite,
  Message,
  Ready,
  Role,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadMember,
  TypingStart,
  User,
  VoiceChannelEffectSend,
  Webhook,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import { ChannelFactory, InteractionFactory } from "../factories/index.js";
import type { CacheManager } from "../managers/index.js";
import type { ClientEvents, GuildBased } from "../types/index.js";

/**
 * Represents a mapping between a Gateway event and a Client event
 */
interface EventMapping<
  T extends keyof GatewayReceiveEvents,
  U extends keyof ClientEvents,
> {
  /**
   * Gateway event name
   */
  gatewayEvent: T;

  /**
   * Client event name that this maps to
   */
  clientEvent: U;

  /**
   * Transform function to convert gateway event data to client event data
   */
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[U];
}

/**
 * Creates a strongly-typed mapping between Gateway and Client events
 */
function defineEvent<
  T extends keyof GatewayReceiveEvents,
  U extends keyof ClientEvents,
>(
  gatewayEvent: T,
  clientEvent: U,
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[U],
): EventMapping<T, U> {
  return { gatewayEvent, clientEvent, transform };
}

/**
 * Generic handler for DELETE operations
 * Gets entity from cache and removes it
 */
function handleDeleteEvent<T>(
  client: Client,
  entityId: Snowflake,
  cacheKey: keyof CacheManager,
): [T | null] {
  if (!entityId) {
    return [null];
  }

  const store = client.cache[cacheKey] as unknown as Store<Snowflake, T>;
  const cachedEntity = store.get?.(entityId) ?? null;

  if (cachedEntity && store.delete) {
    store.delete(entityId);
  }

  return [cachedEntity];
}

/**
 * Generic handler for UPDATE operations
 * Creates new entity, retrieves old entity from cache, and updates cache
 */
function handleUpdateEvent<T extends { id?: Snowflake; clone?: () => T }>(
  client: Client,
  data: object,
  cacheKey: keyof CacheManager,
  EntityFactory: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    | ((client: Client, data: any) => T)
    | (new (
        client: Client,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        data: any,
      ) => T),
): [T | null, T] {
  // Create new entity using constructor or factory
  const newEntity =
    typeof EntityFactory === "function" &&
    EntityFactory.prototype?.constructor === EntityFactory
      ? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        new (EntityFactory as new (client: Client, data: any) => T)(
          client,
          data,
        )
      : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (EntityFactory as (client: Client, data: any) => T)(client, data);

  const entityId = newEntity.id;
  if (!entityId) {
    return [null, newEntity];
  }

  // Get entity from cache
  const store = client.cache[cacheKey] as unknown as Store<Snowflake, T>;
  const cachedEntity = store.get?.(entityId);

  // Clone cachedEntity if it exists
  const oldEntity = cachedEntity?.clone
    ? cachedEntity.clone()
    : (cachedEntity ?? null);

  return [oldEntity, newEntity];
}

/**
 * Handles emoji update events with efficient change detection
 */
function handleEmojiUpdate(
  client: Client,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any,
): [GuildEmojisUpdateEntity] {
  const { guild_id: guildId, emojis: newEmojis } = data;

  // Get cached emojis for this guild
  const cachedEmojis = Array.from(client.cache.emojis.values()).filter(
    (emoji) => emoji.guildId === guildId,
  );

  // Create maps for efficient lookup
  const newEmojiMap = new Map<Snowflake, GuildBased<EmojiEntity>>();
  const cachedEmojiMap = new Map<Snowflake, Emoji>();

  // Populate maps
  for (const emoji of newEmojis) {
    if (emoji.id) {
      newEmojiMap.set(emoji.id, { ...emoji, guild_id: guildId });
    }
  }

  for (const emoji of cachedEmojis) {
    if (emoji.id) {
      cachedEmojiMap.set(emoji.id, emoji);
    }
  }

  // Process changes: created, updated, and deleted emojis
  processEntityChanges<Emoji>(
    client,
    newEmojiMap,
    cachedEmojiMap,
    (data) => new Emoji(client, data),
    "emojis",
    "emojiCreate",
    "emojiUpdate",
    "emojiDelete",
  );

  return [data];
}

/**
 * Handles sticker update events with efficient change detection
 */
function handleStickerUpdate(
  client: Client,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any,
): [GuildStickersUpdateEntity] {
  const { guild_id: guildId, stickers: newStickers } = data;

  // Get cached stickers for this guild
  const cachedStickers = Array.from(client.cache.stickers.values()).filter(
    (sticker) => sticker.guildId === guildId,
  );

  // Create maps for efficient lookup
  const newStickerMap = new Map();
  const cachedStickerMap = new Map();

  // Populate maps
  for (const sticker of newStickers) {
    if (sticker.id) {
      newStickerMap.set(sticker.id, { ...sticker, guildId });
    }
  }

  for (const sticker of cachedStickers) {
    if (sticker.id) {
      cachedStickerMap.set(sticker.id, sticker);
    }
  }

  // Process changes: created, updated, and deleted stickers
  processEntityChanges(
    client,
    newStickerMap,
    cachedStickerMap,
    (data) => new Sticker(client, data),
    "stickers",
    "stickerCreate",
    "stickerUpdate",
    "stickerDelete",
  );

  return [data];
}

/**
 * Generic function to process entity changes (create, update, delete)
 * Reduces code duplication between emoji and sticker handlers
 */
function processEntityChanges<T>(
  client: Client,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  newEntitiesMap: Map<any, any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  cachedEntitiesMap: Map<any, any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  createEntity: (data: any) => T,
  cacheKey: keyof CacheManager,
  createEventName: keyof ClientEvents,
  updateEventName: keyof ClientEvents,
  deleteEventName: keyof ClientEvents,
): void {
  // Handle created entities
  for (const [id, entityData] of newEntitiesMap.entries()) {
    if (!cachedEntitiesMap.has(id)) {
      const newEntity = createEntity(entityData);
      // @ts-expect-error
      client.emit(createEventName, newEntity);
    }
  }

  // Handle updated entities
  for (const [id, entityData] of newEntitiesMap.entries()) {
    if (cachedEntitiesMap.has(id)) {
      const [oldEntity, newEntity] = handleUpdateEvent(
        client,
        entityData,
        cacheKey,
        // @ts-expect-error
        createEntity,
      );

      // @ts-expect-error
      client.emit(updateEventName, oldEntity, newEntity);
    }
  }

  // Handle deleted entities
  for (const [id] of cachedEntitiesMap.entries()) {
    if (!newEntitiesMap.has(id)) {
      const [deletedEntity] = handleDeleteEvent(client, id, cacheKey);
      // @ts-expect-error
      client.emit(deleteEventName, deletedEntity);
    }
  }
}

/**
 * Standard mappings of Discord Gateway events to client events.
 * Each mapping defines how raw Gateway events are transformed into client events.
 */
export const StandardGatewayDispatchEventMappings = [
  // Ready events
  defineEvent("READY", "ready", (client, data) => [new Ready(client, data)]),

  // Application events
  defineEvent(
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    (_client, data) => [data],
  ),

  // Auto Moderation events
  defineEvent(
    "AUTO_MODERATION_RULE_CREATE",
    "autoModerationRuleCreate",
    (client, data) => [new AutoModerationRule(client, data)],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_UPDATE",
    "autoModerationRuleUpdate",
    (client, data) =>
      handleUpdateEvent(
        client,
        data,
        "autoModerationRules",
        AutoModerationRule,
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
    (client, data) => [new AutoModerationActionExecution(client, data)],
  ),

  // Channel events
  defineEvent("CHANNEL_CREATE", "channelCreate", (client, data) => [
    ChannelFactory.create(client, data),
  ]),
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.create),
  ),
  defineEvent("CHANNEL_DELETE", "channelDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (_client, data) => [
    data,
  ]),

  // Thread events
  defineEvent("THREAD_CREATE", "threadCreate", (client, data) => [
    ChannelFactory.create(client, data) as AnyThreadChannel,
  ]),
  defineEvent("THREAD_UPDATE", "threadUpdate", (client, data) =>
    handleUpdateEvent(client, data, "channels", ChannelFactory.createThread),
  ),
  defineEvent("THREAD_DELETE", "threadDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "channels"),
  ),
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (_client, data) => [data]),
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (client, data) =>
    handleUpdateEvent(client, data, "threadMembers", ThreadMember),
  ),
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (_client, data) => [data],
  ),

  // Entitlement events
  defineEvent("ENTITLEMENT_CREATE", "entitlementCreate", (client, data) => [
    new Entitlement(client, data),
  ]),
  defineEvent("ENTITLEMENT_UPDATE", "entitlementUpdate", (client, data) =>
    handleUpdateEvent(client, data, "entitlements", Entitlement),
  ),
  defineEvent("ENTITLEMENT_DELETE", "entitlementDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "entitlements"),
  ),

  // Guild events
  defineEvent("GUILD_CREATE", "guildCreate", (client, data) => [
    new Guild(client, data as GuildCreateEntity),
  ]),
  defineEvent("GUILD_UPDATE", "guildUpdate", (client, data) =>
    handleUpdateEvent(client, data as GuildCreateEntity, "guilds", Guild),
  ),
  defineEvent("GUILD_DELETE", "guildDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "guilds"),
  ),
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (client, data) => [new GuildAuditLogEntry(client, data)],
  ),

  // Ban events
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (client, data) => [
    new Ban(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    } as GuildBased<BanEntity>),
  ]),
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (client, data) => [
    new Ban(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    } as GuildBased<BanEntity>),
  ]),

  // Emoji and Sticker events (using custom handlers)
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", handleEmojiUpdate),
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    handleStickerUpdate,
  ),

  // Guild Member events
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (client, data) => [
    new GuildMember(client, data),
  ]),
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (client, data) =>
    handleUpdateEvent(
      client,
      data as GuildBased<GuildMemberEntity>,
      "members",
      GuildMember,
    ),
  ),
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (client, data) =>
    handleDeleteEvent(client, `${data.guild_id}:${data.user.id}`, "members"),
  ),
  defineEvent("GUILD_MEMBERS_CHUNK", "guildMembersChunk", (_client, data) => [
    data,
  ]),

  // Role events
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => [
    new Role(client, {
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
      Role,
    ),
  ),
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) =>
    handleDeleteEvent(client, data.role_id, "roles"),
  ),

  // Scheduled Event events
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (client, data) => [new GuildScheduledEvent(client, data)],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_UPDATE",
    "guildScheduledEventUpdate",
    (client, data) =>
      handleUpdateEvent(client, data, "scheduledEvents", GuildScheduledEvent),
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_DELETE",
    "guildScheduledEventDelete",
    (client, data) => handleDeleteEvent(client, data.id, "scheduledEvents"),
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (client, data) => [new GuildScheduledEventUser(client, data)],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (client, data) => [new GuildScheduledEventUser(client, data)],
  ),

  // Soundboard events
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    "guildSoundboardSoundCreate",
    (client, data) => [new SoundboardSound(client, data)],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (client, data) =>
      handleUpdateEvent(client, data, "soundboards", SoundboardSound),
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
      const sounds = data.soundboard_sounds.map(
        (soundData) =>
          new SoundboardSound(client, {
            ...soundData,
            guild_id: data.guild_id,
          }),
      );
      return [sounds];
    },
  ),
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (client, data) => {
    const soundboardSounds = data.soundboard_sounds.map(
      (sound) =>
        new SoundboardSound(client, { ...sound, guild_id: data.guild_id }),
    );
    return [soundboardSounds];
  }),

  // Integration events
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (client, data) => [
    new Integration(client, data),
  ]),
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (client, data) =>
    handleUpdateEvent(client, data, "integrations", Integration),
  ),
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "integrations"),
  ),

  // Invite events
  defineEvent("INVITE_CREATE", "inviteCreate", (client, data) => [
    new Invite(client, data as InviteEntity & InviteCreateEntity),
  ]),
  defineEvent("INVITE_DELETE", "inviteDelete", (client, data) => [
    new Invite(client, data as InviteEntity & InviteCreateEntity),
  ]),

  // Message events
  defineEvent("MESSAGE_CREATE", "messageCreate", (client, data) => [
    new Message(client, data),
  ]),
  defineEvent("MESSAGE_UPDATE", "messageUpdate", (client, data) =>
    handleUpdateEvent(client, data, "messages", Message),
  ),
  defineEvent("MESSAGE_DELETE", "messageDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "messages"),
  ),
  defineEvent("MESSAGE_DELETE_BULK", "messageDeleteBulk", (client, data) => [
    data.ids.map((id) => {
      const [message] = handleDeleteEvent(client, id, "messages");
      return message;
    }) as Message[],
  ]),

  // Reaction events
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

  // Poll events
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

  // User events
  defineEvent("TYPING_START", "typingStart", (client, data) => [
    new TypingStart(client, data),
  ]),
  defineEvent("USER_UPDATE", "userUpdate", (client, data) =>
    handleUpdateEvent(client, data, "users", User),
  ),

  // Voice events
  defineEvent(
    "VOICE_CHANNEL_EFFECT_SEND",
    "voiceChannelEffectSend",
    (client, data) => [new VoiceChannelEffectSend(client, data)],
  ),
  defineEvent("VOICE_STATE_UPDATE", "voiceStateUpdate", (_client, data) => [
    data,
  ]),
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (_client, data) => [
    data,
  ]),

  // Webhook events
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (client, data) =>
    handleUpdateEvent(client, data as WebhookEntity, "webhooks", Webhook),
  ),

  // Interaction events
  defineEvent("INTERACTION_CREATE", "interactionCreate", (client, data) => [
    InteractionFactory.create(client, data),
  ]),

  // Stage events
  defineEvent(
    "STAGE_INSTANCE_CREATE",
    "stageInstanceCreate",
    (client, data) => [new StageInstance(client, data)],
  ),
  defineEvent("STAGE_INSTANCE_UPDATE", "stageInstanceUpdate", (client, data) =>
    handleUpdateEvent(client, data, "stageInstances", StageInstance),
  ),
  defineEvent("STAGE_INSTANCE_DELETE", "stageInstanceDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "stageInstances"),
  ),

  // Subscription events
  defineEvent("SUBSCRIPTION_CREATE", "subscriptionCreate", (client, data) => [
    new Subscription(client, data),
  ]),
  defineEvent("SUBSCRIPTION_UPDATE", "subscriptionUpdate", (client, data) =>
    handleUpdateEvent(client, data, "subscriptions", Subscription),
  ),
  defineEvent("SUBSCRIPTION_DELETE", "subscriptionDelete", (client, data) =>
    handleDeleteEvent(client, data.id, "subscriptions"),
  ),
] as const;

/**
 * Events to forward directly from REST client to main client
 */
export const RestKeyofEventMappings: (keyof RestEvents)[] = [
  "requestStart",
  "requestSuccess",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "retry",
] as const;

/**
 * Events to forward directly from Gateway client to main client
 */
export const GatewayKeyofEventMappings: (keyof GatewayEvents)[] = [
  "heartbeatSent",
  "heartbeatAcknowledge",
  "heartbeatTimeout",
  "sessionStart",
  "sessionResume",
  "sessionInvalidate",
  "shardResume",
  "shardReconnect",
  "shardReady",
  "shardDisconnect",
  "wsClose",
  "wsError",
  "dispatch",
] as const;
