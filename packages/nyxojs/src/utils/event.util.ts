import type {
  EmojiEntity,
  InviteEntity,
  Snowflake,
  StickerEntity,
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
import { BaseClass } from "../bases/index.js";
import {
  type AnyThreadChannel,
  AutoModeration,
  AutoModerationActionExecution,
  Ban,
  Emoji,
  Entitlement,
  Guild,
  GuildAuditLogEntry,
  GuildMember,
  Integration,
  Invite,
  Message,
  MessagePollVote,
  MessageReaction,
  MessageReactionRemoveAll,
  MessageReactionRemoveEmoji,
  Ready,
  Role,
  ScheduledEvent,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadMember,
  User,
  VoiceChannelEffect,
  VoiceState,
  Webhook,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import type { CacheEntityType } from "../managers/index.js";
import type { ClientEvents } from "../types/index.js";
import { channelFactory } from "./channel.util.js";
import { interactionFactory } from "./interaction.util.js";

/**
 * Represents a mapping between a Gateway event and a Client event
 */
interface EventMapping {
  /**
   * Client event name that this maps to
   */
  clientEvent: keyof ClientEvents;

  /**
   * Transform function to convert gateway event data to client event data
   */
  transform: (
    client: Client,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ) => ClientEvents[keyof ClientEvents];
}

/**
 * Creates a strongly-typed mapping between Gateway and Client events
 */
function defineEvent<
  T extends keyof GatewayReceiveEvents,
  U extends keyof ClientEvents,
>(
  clientEvent: U,
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[U],
): EventMapping {
  return {
    clientEvent,
    transform: transform as unknown as (
      client: Client,
      data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
    ) => ClientEvents[keyof ClientEvents],
  };
}

/**
 * Generic handler for DELETE operations
 * Gets entity from cache and removes it
 */
function handleDeleteEvent<T>(
  client: Client,
  cacheKey: CacheEntityType,
  entityId: Snowflake,
): [T | null] {
  const store = client.cache[cacheKey] as unknown as Store<Snowflake, T>;
  const cachedEntity = store.get(entityId) ?? null;

  if (cachedEntity) {
    store.delete(entityId);
  }

  return [cachedEntity];
}

// Type for a class constructor that creates an entity
type ClassConstructor<T extends BaseClass<any>> = new (
  client: Client,
  data: any,
) => T;

// Type for a factory function that creates an entity
type FactoryFunction<T extends BaseClass<any>> = (
  client: Client,
  data: any,
) => T;

// Type that can be either a class constructor
type EntityCreator<T extends BaseClass<any>> =
  | ClassConstructor<T>
  | FactoryFunction<T>;

/**
 * Checks if the provided creator is a class constructor
 */
function isClassConstructor<T extends BaseClass<any>>(
  creator: EntityCreator<T>,
): creator is ClassConstructor<T> {
  return (
    typeof creator === "function" &&
    creator.prototype?.constructor === creator &&
    (creator.prototype instanceof BaseClass ||
      Object.getPrototypeOf(creator.prototype) === BaseClass.prototype)
  );
}
/**
 * Generic handler for UPDATE operations
 * Creates new entity, retrieves old entity from cache, and updates cache
 */
function handleUpdateEvent<T extends BaseClass<any>>(
  client: Client,
  data: object,
  cacheKey: CacheEntityType,
  EntityFactory: EntityCreator<T>,
): [T | null, T] {
  // Create new entity using constructor or factory
  const newEntity = isClassConstructor(EntityFactory)
    ? new EntityFactory(client, data)
    : EntityFactory(client, data);
  const cacheInfo = newEntity.getCacheInfo();
  if (!cacheInfo?.id) {
    return [null, newEntity];
  }

  // Get entity from cache
  const store = client.cache[cacheKey] as unknown as Store<Snowflake, T>;
  const oldEntity = store.get(cacheInfo.id) ?? null;

  return [oldEntity, newEntity];
}

/**
 * Efficiently handles bulk updates of entities (emojis, stickers)
 * Compares new elements with cached elements and processes the changes
 */
function handleBulkUpdate<T extends BaseClass<any>>(
  client: Client,
  data: GuildEmojisUpdateEntity | GuildStickersUpdateEntity,
  entityField: "emojis" | "stickers",
  cacheKey: CacheEntityType,
  EntityClass: new (client: Client, data: any) => T,
  eventNames: {
    create: keyof ClientEvents;
    update: keyof ClientEvents;
    delete: keyof ClientEvents;
  },
): [any] {
  const guildId = data.guild_id;
  // @ts-expect-error - The data is not typed correctly
  const newEntities = data[entityField] as (StickerEntity | EmojiEntity)[];

  // Retrieve cached entities for this guild
  // @ts-expect-error - The cacheKey is a string, but the client.cache is a Map
  const cachedEntities = Array.from(client.cache[cacheKey].values()).filter(
    (entity: any) => entity.guildId === guildId,
  );

  // Create maps for efficient lookup
  const newMap = new Map();
  const cachedMap = new Map();

  // Prepare new elements
  for (const entity of newEntities) {
    if (entity.id) {
      newMap.set(entity.id, { ...entity, guild_id: guildId });
    }
  }

  // Prepare cached elements
  for (const entity of cachedEntities) {
    if (entity.id) {
      cachedMap.set(entity.id, entity);
    }
  }

  // Process created elements
  for (const [id, entityData] of newMap.entries()) {
    if (!cachedMap.has(id)) {
      const newEntity = new EntityClass(client, entityData);
      client.emit(eventNames.create, newEntity as any);
    }
  }

  // Process updated elements
  for (const [id, entityData] of newMap.entries()) {
    if (cachedMap.has(id)) {
      const [oldEntity, newEntity] = handleUpdateEvent(
        client,
        entityData,
        cacheKey,
        EntityClass,
      );

      client.emit(eventNames.update, oldEntity as any, newEntity as any);
    }
  }

  // Process deleted elements
  for (const [id] of cachedMap.entries()) {
    if (!newMap.has(id)) {
      const [deletedEntity] = handleDeleteEvent(client, cacheKey, id);
      client.emit(eventNames.delete, deletedEntity as any);
    }
  }

  return [data];
}

/**
 * Maps of Gateway events to client events.
 * Each mapping defines how raw Gateway events are transformed into client events.
 */
export const GatewayDispatchEventMap = new Map<
  keyof GatewayReceiveEvents,
  EventMapping
>([
  [
    "READY",
    defineEvent<"READY", "ready">("ready", (client, data) => [
      new Ready(client, data),
    ]),
  ],
  [
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    defineEvent<
      "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
      "applicationCommandPermissionsUpdate"
    >("applicationCommandPermissionsUpdate", (_, data) => [data]),
  ],
  [
    "AUTO_MODERATION_RULE_CREATE",
    defineEvent<"AUTO_MODERATION_RULE_CREATE", "autoModerationRuleCreate">(
      "autoModerationRuleCreate",
      (client, data) => [new AutoModeration(client, data)],
    ),
  ],
  [
    "AUTO_MODERATION_RULE_UPDATE",
    defineEvent<"AUTO_MODERATION_RULE_UPDATE", "autoModerationRuleUpdate">(
      "autoModerationRuleUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "autoModerationRules", AutoModeration),
    ),
  ],
  [
    "AUTO_MODERATION_RULE_DELETE",
    defineEvent<"AUTO_MODERATION_RULE_DELETE", "autoModerationRuleDelete">(
      "autoModerationRuleDelete",
      (client, data) =>
        handleDeleteEvent(client, "autoModerationRules", data.id),
    ),
  ],
  [
    "AUTO_MODERATION_ACTION_EXECUTION",
    defineEvent<
      "AUTO_MODERATION_ACTION_EXECUTION",
      "autoModerationActionExecution"
    >("autoModerationActionExecution", (client, data) => [
      new AutoModerationActionExecution(client, data),
    ]),
  ],
  [
    "CHANNEL_CREATE",
    defineEvent<"CHANNEL_CREATE", "channelCreate">(
      "channelCreate",
      (client, data) => [channelFactory(client, data)],
    ),
  ],
  [
    "CHANNEL_UPDATE",
    defineEvent<"CHANNEL_UPDATE", "channelUpdate">(
      "channelUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "channels", channelFactory),
    ),
  ],
  [
    "CHANNEL_DELETE",
    defineEvent<"CHANNEL_DELETE", "channelDelete">(
      "channelDelete",
      (client, data) => handleDeleteEvent(client, "channels", data.id),
    ),
  ],
  [
    "CHANNEL_PINS_UPDATE",
    defineEvent<"CHANNEL_PINS_UPDATE", "channelPinsUpdate">(
      "channelPinsUpdate",
      (_, data) => [data],
    ),
  ],
  [
    "THREAD_CREATE",
    defineEvent<"THREAD_CREATE", "threadCreate">(
      "threadCreate",
      (client, data) => [channelFactory(client, data) as AnyThreadChannel],
    ),
  ],
  [
    "THREAD_UPDATE",
    defineEvent<"THREAD_UPDATE", "threadUpdate">(
      "threadUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "channels", channelFactory) as [
          AnyThreadChannel | null,
          AnyThreadChannel,
        ],
    ),
  ],
  [
    "THREAD_DELETE",
    defineEvent<"THREAD_DELETE", "threadDelete">(
      "threadDelete",
      (client, data) => handleDeleteEvent(client, "channels", data.id),
    ),
  ],
  [
    "THREAD_LIST_SYNC",
    defineEvent<"THREAD_LIST_SYNC", "threadListSync">(
      "threadListSync",
      (_, data) => [data],
    ),
  ],
  [
    "THREAD_MEMBER_UPDATE",
    defineEvent<"THREAD_MEMBER_UPDATE", "threadMemberUpdate">(
      "threadMemberUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "threadMembers", ThreadMember),
    ),
  ],
  [
    "THREAD_MEMBERS_UPDATE",
    defineEvent<"THREAD_MEMBERS_UPDATE", "threadMembersUpdate">(
      "threadMembersUpdate",
      (_, data) => [data],
    ),
  ],
  [
    "ENTITLEMENT_CREATE",
    defineEvent<"ENTITLEMENT_CREATE", "entitlementCreate">(
      "entitlementCreate",
      (client, data) => [new Entitlement(client, data)],
    ),
  ],
  [
    "ENTITLEMENT_UPDATE",
    defineEvent<"ENTITLEMENT_UPDATE", "entitlementUpdate">(
      "entitlementUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "entitlements", Entitlement),
    ),
  ],
  [
    "ENTITLEMENT_DELETE",
    defineEvent<"ENTITLEMENT_DELETE", "entitlementDelete">(
      "entitlementDelete",
      (client, data) => handleDeleteEvent(client, "entitlements", data.id),
    ),
  ],
  [
    "GUILD_CREATE",
    defineEvent<"GUILD_CREATE", "guildCreate">(
      "guildCreate",
      (client, data) => [new Guild(client, data as GuildCreateEntity)],
    ),
  ],
  [
    "GUILD_UPDATE",
    defineEvent<"GUILD_UPDATE", "guildUpdate">("guildUpdate", (client, data) =>
      handleUpdateEvent(client, data as GuildCreateEntity, "guilds", Guild),
    ),
  ],
  [
    "GUILD_DELETE",
    defineEvent<"GUILD_DELETE", "guildDelete">("guildDelete", (client, data) =>
      handleDeleteEvent(client, "guilds", data.id),
    ),
  ],
  [
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    defineEvent<"GUILD_AUDIT_LOG_ENTRY_CREATE", "guildAuditLogEntryCreate">(
      "guildAuditLogEntryCreate",
      (client, data) => [new GuildAuditLogEntry(client, data)],
    ),
  ],
  [
    "GUILD_BAN_ADD",
    defineEvent<"GUILD_BAN_ADD", "guildBanAdd">(
      "guildBanAdd",
      (client, data) => [
        new Ban(client, {
          guild_id: data.guild_id,
          user: data.user,
          reason: null,
        }),
      ],
    ),
  ],
  [
    "GUILD_BAN_REMOVE",
    defineEvent<"GUILD_BAN_REMOVE", "guildBanRemove">(
      "guildBanRemove",
      (client, data) => [
        new Ban(client, {
          guild_id: data.guild_id,
          user: data.user,
          reason: null,
        }),
      ],
    ),
  ],
  [
    "GUILD_EMOJIS_UPDATE",
    defineEvent<"GUILD_EMOJIS_UPDATE", "guildEmojisUpdate">(
      "guildEmojisUpdate",
      (client, data) =>
        handleBulkUpdate(client, data, "emojis", "emojis", Emoji, {
          create: "emojiCreate",
          update: "emojiUpdate",
          delete: "emojiDelete",
        }),
    ),
  ],
  [
    "GUILD_STICKERS_UPDATE",
    defineEvent<"GUILD_STICKERS_UPDATE", "guildStickersUpdate">(
      "guildStickersUpdate",
      (client, data) =>
        handleBulkUpdate(client, data, "stickers", "stickers", Sticker, {
          create: "stickerCreate",
          update: "stickerUpdate",
          delete: "stickerDelete",
        }),
    ),
  ],
  [
    "GUILD_MEMBER_ADD",
    defineEvent<"GUILD_MEMBER_ADD", "guildMemberAdd">(
      "guildMemberAdd",
      (client, data) => [new GuildMember(client, data)],
    ),
  ],
  [
    "GUILD_MEMBER_UPDATE",
    defineEvent<"GUILD_MEMBER_UPDATE", "guildMemberUpdate">(
      "guildMemberUpdate",
      (client, data) => handleUpdateEvent(client, data, "members", GuildMember),
    ),
  ],
  [
    "GUILD_MEMBER_REMOVE",
    defineEvent<"GUILD_MEMBER_REMOVE", "guildMemberRemove">(
      "guildMemberRemove",
      (client, data) =>
        handleDeleteEvent(
          client,
          "members",
          `${data.guild_id}:${data.user.id}`,
        ),
    ),
  ],
  [
    "GUILD_MEMBERS_CHUNK",
    defineEvent<"GUILD_MEMBERS_CHUNK", "guildMembersChunk">(
      "guildMembersChunk",
      (_, data) => [data],
    ),
  ],
  [
    "GUILD_ROLE_CREATE",
    defineEvent<"GUILD_ROLE_CREATE", "guildRoleCreate">(
      "guildRoleCreate",
      (client, data) => [
        new Role(client, {
          guild_id: data.guild_id,
          ...data.role,
        }),
      ],
    ),
  ],
  [
    "GUILD_ROLE_UPDATE",
    defineEvent<"GUILD_ROLE_UPDATE", "guildRoleUpdate">(
      "guildRoleUpdate",
      (client, data) =>
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
  ],
  [
    "GUILD_ROLE_DELETE",
    defineEvent<"GUILD_ROLE_DELETE", "guildRoleDelete">(
      "guildRoleDelete",
      (client, data) => handleDeleteEvent(client, "roles", data.role_id),
    ),
  ],
  [
    "GUILD_SCHEDULED_EVENT_CREATE",
    defineEvent<"GUILD_SCHEDULED_EVENT_CREATE", "guildScheduledEventCreate">(
      "guildScheduledEventCreate",
      (client, data) => [new ScheduledEvent(client, data)],
    ),
  ],
  [
    "GUILD_SCHEDULED_EVENT_UPDATE",
    defineEvent<"GUILD_SCHEDULED_EVENT_UPDATE", "guildScheduledEventUpdate">(
      "guildScheduledEventUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "scheduledEvents", ScheduledEvent),
    ),
  ],
  [
    "GUILD_SCHEDULED_EVENT_DELETE",
    defineEvent<"GUILD_SCHEDULED_EVENT_DELETE", "guildScheduledEventDelete">(
      "guildScheduledEventDelete",
      (client, data) => handleDeleteEvent(client, "scheduledEvents", data.id),
    ),
  ],
  [
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    defineEvent<"GUILD_SCHEDULED_EVENT_USER_ADD", "guildScheduledEventUserAdd">(
      "guildScheduledEventUserAdd",
      (_, data) => [data],
    ),
  ],
  [
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    defineEvent<
      "GUILD_SCHEDULED_EVENT_USER_REMOVE",
      "guildScheduledEventUserRemove"
    >("guildScheduledEventUserRemove", (_, data) => [data]),
  ],
  [
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    defineEvent<"GUILD_SOUNDBOARD_SOUND_CREATE", "guildSoundboardSoundCreate">(
      "guildSoundboardSoundCreate",
      (client, data) => [new SoundboardSound(client, data)],
    ),
  ],
  [
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    defineEvent<"GUILD_SOUNDBOARD_SOUND_UPDATE", "guildSoundboardSoundUpdate">(
      "guildSoundboardSoundUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "soundboards", SoundboardSound),
    ),
  ],
  [
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    defineEvent<"GUILD_SOUNDBOARD_SOUND_DELETE", "guildSoundboardSoundDelete">(
      "guildSoundboardSoundDelete",
      (client, data) => handleDeleteEvent(client, "soundboards", data.sound_id),
    ),
  ],
  [
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    defineEvent<
      "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
      "guildSoundboardSoundsUpdate"
    >("guildSoundboardSoundsUpdate", (client, data) => {
      const sounds = data.soundboard_sounds.map(
        (soundData) =>
          new SoundboardSound(client, {
            ...soundData,
            guild_id: data.guild_id,
          }),
      );
      return [sounds];
    }),
  ],
  [
    "SOUNDBOARD_SOUNDS",
    defineEvent<"SOUNDBOARD_SOUNDS", "soundboardSounds">(
      "soundboardSounds",
      (client, data) => {
        const soundboardSounds = data.soundboard_sounds.map(
          (sound) =>
            new SoundboardSound(client, { ...sound, guild_id: data.guild_id }),
        );
        return [soundboardSounds];
      },
    ),
  ],
  [
    "INTEGRATION_CREATE",
    defineEvent<"INTEGRATION_CREATE", "integrationCreate">(
      "integrationCreate",
      (client, data) => [new Integration(client, data)],
    ),
  ],
  [
    "INTEGRATION_UPDATE",
    defineEvent<"INTEGRATION_UPDATE", "integrationUpdate">(
      "integrationUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "integrations", Integration),
    ),
  ],
  [
    "INTEGRATION_DELETE",
    defineEvent<"INTEGRATION_DELETE", "integrationDelete">(
      "integrationDelete",
      (client, data) => handleDeleteEvent(client, "integrations", data.id),
    ),
  ],
  [
    "INVITE_CREATE",
    defineEvent<"INVITE_CREATE", "inviteCreate">(
      "inviteCreate",
      (client, data) => [
        new Invite(client, data as InviteEntity & InviteCreateEntity),
      ],
    ),
  ],
  [
    "INVITE_DELETE",
    defineEvent<"INVITE_DELETE", "inviteDelete">(
      "inviteDelete",
      (client, data) => handleDeleteEvent(client, "invites", data.code),
    ),
  ],
  [
    "MESSAGE_CREATE",
    defineEvent<"MESSAGE_CREATE", "messageCreate">(
      "messageCreate",
      (client, data) => [new Message(client, data)],
    ),
  ],
  [
    "MESSAGE_UPDATE",
    defineEvent<"MESSAGE_UPDATE", "messageUpdate">(
      "messageUpdate",
      (client, data) => handleUpdateEvent(client, data, "messages", Message),
    ),
  ],
  [
    "MESSAGE_DELETE",
    defineEvent<"MESSAGE_DELETE", "messageDelete">(
      "messageDelete",
      (client, data) => handleDeleteEvent(client, "messages", data.id),
    ),
  ],
  [
    "MESSAGE_DELETE_BULK",
    defineEvent<"MESSAGE_DELETE_BULK", "messageDeleteBulk">(
      "messageDeleteBulk",
      (client, data) => [
        data.ids.map((id) => {
          const [message] = handleDeleteEvent(client, "messages", id);
          return message;
        }) as Message[],
      ],
    ),
  ],
  [
    "MESSAGE_REACTION_ADD",
    defineEvent<"MESSAGE_REACTION_ADD", "messageReactionAdd">(
      "messageReactionAdd",
      (client, data) => [new MessageReaction(client, data)],
    ),
  ],
  [
    "MESSAGE_REACTION_REMOVE",
    defineEvent<"MESSAGE_REACTION_REMOVE", "messageReactionRemove">(
      "messageReactionRemove",
      (client, data) => [new MessageReaction(client, data)],
    ),
  ],
  [
    "MESSAGE_REACTION_REMOVE_ALL",
    defineEvent<"MESSAGE_REACTION_REMOVE_ALL", "messageReactionRemoveAll">(
      "messageReactionRemoveAll",
      (client, data) => [new MessageReactionRemoveAll(client, data)],
    ),
  ],
  [
    "MESSAGE_REACTION_REMOVE_EMOJI",
    defineEvent<"MESSAGE_REACTION_REMOVE_EMOJI", "messageReactionRemoveEmoji">(
      "messageReactionRemoveEmoji",
      (client, data) => [new MessageReactionRemoveEmoji(client, data)],
    ),
  ],
  [
    "MESSAGE_POLL_VOTE_ADD",
    defineEvent<"MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd">(
      "messagePollVoteAdd",
      (client, data) => [new MessagePollVote(client, data)],
    ),
  ],
  [
    "MESSAGE_POLL_VOTE_REMOVE",
    defineEvent<"MESSAGE_POLL_VOTE_REMOVE", "messagePollVoteRemove">(
      "messagePollVoteRemove",
      (client, data) => [new MessagePollVote(client, data)],
    ),
  ],
  [
    "TYPING_START",
    defineEvent<"TYPING_START", "typingStart">("typingStart", (_, data) => [
      data,
    ]),
  ],
  [
    "USER_UPDATE",
    defineEvent<"USER_UPDATE", "userUpdate">("userUpdate", (client, data) =>
      handleUpdateEvent(client, data, "users", User),
    ),
  ],
  [
    "VOICE_CHANNEL_EFFECT_SEND",
    defineEvent<"VOICE_CHANNEL_EFFECT_SEND", "voiceChannelEffectSend">(
      "voiceChannelEffectSend",
      (client, data) => [new VoiceChannelEffect(client, data)],
    ),
  ],
  [
    "VOICE_STATE_UPDATE",
    defineEvent<"VOICE_STATE_UPDATE", "voiceStateUpdate">(
      "voiceStateUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "voiceStates", VoiceState),
    ),
  ],
  [
    "VOICE_SERVER_UPDATE",
    defineEvent<"VOICE_SERVER_UPDATE", "voiceServerUpdate">(
      "voiceServerUpdate",
      (_, data) => [data],
    ),
  ],
  [
    "WEBHOOKS_UPDATE",
    defineEvent<"WEBHOOKS_UPDATE", "webhooksUpdate">(
      "webhooksUpdate",
      (client, data) =>
        handleUpdateEvent(client, data as WebhookEntity, "webhooks", Webhook),
    ),
  ],
  [
    "INTERACTION_CREATE",
    defineEvent<"INTERACTION_CREATE", "interactionCreate">(
      "interactionCreate",
      (client, data) => [interactionFactory(client, data)],
    ),
  ],
  [
    "STAGE_INSTANCE_CREATE",
    defineEvent<"STAGE_INSTANCE_CREATE", "stageInstanceCreate">(
      "stageInstanceCreate",
      (client, data) => [new StageInstance(client, data)],
    ),
  ],
  [
    "STAGE_INSTANCE_UPDATE",
    defineEvent<"STAGE_INSTANCE_UPDATE", "stageInstanceUpdate">(
      "stageInstanceUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "stageInstances", StageInstance),
    ),
  ],
  [
    "STAGE_INSTANCE_DELETE",
    defineEvent<"STAGE_INSTANCE_DELETE", "stageInstanceDelete">(
      "stageInstanceDelete",
      (client, data) => handleDeleteEvent(client, "stageInstances", data.id),
    ),
  ],
  [
    "SUBSCRIPTION_CREATE",
    defineEvent<"SUBSCRIPTION_CREATE", "subscriptionCreate">(
      "subscriptionCreate",
      (client, data) => [new Subscription(client, data)],
    ),
  ],
  [
    "SUBSCRIPTION_UPDATE",
    defineEvent<"SUBSCRIPTION_UPDATE", "subscriptionUpdate">(
      "subscriptionUpdate",
      (client, data) =>
        handleUpdateEvent(client, data, "subscriptions", Subscription),
    ),
  ],
  [
    "SUBSCRIPTION_DELETE",
    defineEvent<"SUBSCRIPTION_DELETE", "subscriptionDelete">(
      "subscriptionDelete",
      (client, data) => handleDeleteEvent(client, "subscriptions", data.id),
    ),
  ],
]);

/**
 * Events to forward directly from REST client to main client
 */
export const RestKeyofEventMappings: (keyof RestEvents)[] = [
  "request",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "retry",
];

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
  "sequenceUpdate",
  "wsOpen",
  "wsMessage",
];
