import type {
  AnyChannelEntity,
  EmojiEntity,
  GuildMemberEntity,
  IntegrationEntity,
  InviteEntity,
  RoleEntity,
  Snowflake,
  SoundboardSoundEntity,
  StickerEntity,
  WebhookEntity,
} from "@nyxojs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  InviteCreateEntity,
  MessageCreateEntity,
} from "@nyxojs/gateway";
import type { RestEvents } from "@nyxojs/rest";
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
import type { ClientEvents, GuildBased } from "../types/index.js";
import { channelFactory, interactionFactory } from "./factory.util.js";

/**
 * Represents a mapping configuration between a Gateway event and a Client event.
 *
 * This interface defines how raw Gateway events from Discord's WebSocket API
 * are transformed into strongly-typed client events with proper entity instances.
 * Each mapping specifies the event names and transformation logic.
 *
 * @template T - The Gateway event type (must be a key of GatewayReceiveEvents)
 * @template U - The Client event type (must be a key of ClientEvents)
 *
 * @internal
 */
interface EventMapping<
  T extends keyof GatewayReceiveEvents = keyof GatewayReceiveEvents,
  U extends keyof ClientEvents = keyof ClientEvents,
> {
  /**
   * The name of the client event that will be emitted.
   *
   * This corresponds to the event name that application code will listen for
   * using `client.on(eventName, handler)`. Must be a valid key from ClientEvents.
   *
   * @example `"messageCreate"`, `"guildMemberAdd"`, `"channelUpdate"`
   */
  clientEvent: U;

  /**
   * The name of the Gateway event received from Discord's WebSocket API.
   *
   * This is the raw event name as defined in Discord's Gateway documentation.
   * Must be a valid key from GatewayReceiveEvents.
   *
   * @example `"MESSAGE_CREATE"`, `"GUILD_MEMBER_ADD"`, `"CHANNEL_UPDATE"`
   */
  gatewayEvent: T;

  /**
   * Transform function that converts raw Gateway event data into client event parameters.
   *
   * This function receives the raw payload from Discord's Gateway and transforms it
   * into properly typed entity instances or processed data. The returned array
   * contains the arguments that will be passed to client event listeners.
   *
   * @param client - The client instance for creating entity objects
   * @param data - Raw event data from Discord's Gateway API
   * @returns Array of arguments to pass to client event listeners
   *
   * @example
   * ```typescript
   * // Simple entity creation
   * (client, data) => [new Message(client, data)]
   *
   * // Update event with old and new entities
   * (client, data) => [oldEntity, newEntity]
   *
   * // Raw data passthrough
   * (_, data) => [data]
   * ```
   */
  transform: (client: Client, data: unknown) => ClientEvents[U];
}

/**
 * Creates a strongly-typed mapping between a Gateway event and a Client event.
 *
 * This function provides type safety and autocompletion when defining event mappings.
 * It ensures that the transform function signature matches the expected client event
 * parameters and validates that event names are valid.
 *
 * @template T - The Gateway event type (must be a key of GatewayReceiveEvents)
 * @template U - The Client event type (must be a key of ClientEvents)
 *
 * @param clientEvent - The name of the client event to emit
 * @param gatewayEvent - The name of the Gateway event to handle
 * @param transform - Function to transform Gateway data into client event arguments
 * @returns A typed EventMapping configuration object
 *
 * @see {@link EventMapping} - For the interface definition
 * @see {@link GatewayEventMappings} - For the complete list of mappings
 *
 * @internal
 */
function defineEvent<
  T extends keyof GatewayReceiveEvents,
  U extends keyof ClientEvents,
>(
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

/**
 * Comprehensive array of Gateway event mappings for the Discord client.
 *
 * This array contains all the mappings that define how raw Gateway events from
 * Discord's WebSocket API are transformed into strongly-typed client events.
 * Each mapping handles entity creation, cache management, TTL cleanup, and
 * proper event emission.
 *
 * The mappings are organized by event type:
 * - **CREATE events**: Simple entity instantiation and caching
 * - **UPDATE events**: Cache retrieval, comparison, and entity updates
 * - **DELETE events**: Cache cleanup with try/finally pattern for guaranteed cleanup
 * - **BULK events**: Efficient handling of multiple entity updates (emojis, stickers)
 * - **RAW events**: Direct data passthrough for events that don't need entity processing
 *
 * @example
 * ```typescript
 * // Usage in event dispatcher
 * for (const mapping of GatewayEventMappings) {
 *   if (gatewayEvent === mapping.gatewayEvent) {
 *     const args = mapping.transform(client, rawData);
 *     client.emit(mapping.clientEvent, ...args);
 *     break;
 *   }
 * }
 * ```
 *
 * @see {@link defineEvent} - For creating individual event mappings
 * @see {@link EventMapping} - For the mapping interface definition
 * @see {@link RestEventNames} - For REST client event forwarding
 * @see {@link GatewayEventNames} - For Gateway client event forwarding
 *
 * @public
 */
export const GatewayEventMappings: readonly EventMapping[] = [
  defineEvent(
    "autoModerationRuleCreate",
    "AUTO_MODERATION_RULE_CREATE",
    (client, data) => [new AutoModeration(client, data)],
  ),
  defineEvent(
    "autoModerationRuleDelete",
    "AUTO_MODERATION_RULE_DELETE",
    (client, data) => {
      const store = client.cache.autoModerationRules;
      const cachedData = store?.get(data.id);

      try {
        if (!cachedData) {
          return [new AutoModeration(client, data)];
        }

        return [new AutoModeration(client, cachedData)];
      } finally {
        // Ensure cache cleanup happens after return
        if (cachedData && store) {
          store.delete(data.id);
        }
      }
    },
  ),
  defineEvent(
    "autoModerationRuleUpdate",
    "AUTO_MODERATION_RULE_UPDATE",
    (client, data) => {
      const store = client.cache.autoModerationRules;
      const cachedData = store?.get(data.id);

      if (!cachedData) {
        return [null, new AutoModeration(client, data)];
      }

      return [
        new AutoModeration(client, cachedData),
        new AutoModeration(client, data),
      ];
    },
  ),
  defineEvent(
    "autoModerationActionExecution",
    "AUTO_MODERATION_ACTION_EXECUTION",
    (client, data) => [new AutoModerationActionExecution(client, data)],
  ),
  defineEvent("channelCreate", "CHANNEL_CREATE", (client, data) => [
    channelFactory(client, data),
  ]),
  defineEvent("channelDelete", "CHANNEL_DELETE", (client, data) => {
    const store = client.cache.channels;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [channelFactory(client, data)];
      }

      return [channelFactory(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("channelUpdate", "CHANNEL_UPDATE", (client, data) => {
    const store = client.cache.channels;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, channelFactory(client, data)];
    }

    return [channelFactory(client, cachedData), channelFactory(client, data)];
  }),
  defineEvent("channelPinsUpdate", "CHANNEL_PINS_UPDATE", (_, data) => [data]),
  defineEvent("threadCreate", "THREAD_CREATE", (client, data) => [
    channelFactory(client, data) as AnyThreadChannel,
  ]),
  defineEvent("threadDelete", "THREAD_DELETE", (client, data) => {
    const store = client.cache.channels;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [
          channelFactory(client, data as AnyChannelEntity) as AnyThreadChannel,
        ];
      }

      return [channelFactory(client, cachedData) as AnyThreadChannel];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("threadUpdate", "THREAD_UPDATE", (client, data) => {
    const store = client.cache.channels;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, channelFactory(client, data) as AnyThreadChannel];
    }

    return [
      channelFactory(client, cachedData) as AnyThreadChannel,
      channelFactory(client, data) as AnyThreadChannel,
    ];
  }),
  defineEvent("threadListSync", "THREAD_LIST_SYNC", (_, data) => [data]),
  defineEvent("threadMemberUpdate", "THREAD_MEMBER_UPDATE", (client, data) => {
    const store = client.cache.threadMembers;
    const cachedData = store?.get(
      data.id || `${data.user_id}:${data.guild_id}`,
    );
    if (!cachedData) {
      return [null, new ThreadMember(client, data)];
    }

    return [
      new ThreadMember(client, cachedData),
      new ThreadMember(client, data),
    ];
  }),
  defineEvent("threadMembersUpdate", "THREAD_MEMBERS_UPDATE", (_, data) => [
    data,
  ]),
  defineEvent("entitlementCreate", "ENTITLEMENT_CREATE", (client, data) => [
    new Entitlement(client, data),
  ]),
  defineEvent("entitlementDelete", "ENTITLEMENT_DELETE", (client, data) => {
    const store = client.cache.entitlements;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [new Entitlement(client, data)];
      }

      return [new Entitlement(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("entitlementUpdate", "ENTITLEMENT_UPDATE", (client, data) => {
    const store = client.cache.entitlements;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new Entitlement(client, data)];
    }

    return [new Entitlement(client, cachedData), new Entitlement(client, data)];
  }),
  defineEvent("guildCreate", "GUILD_CREATE", (client, data) => [
    new Guild(client, data as GuildCreateEntity),
  ]),
  defineEvent("guildDelete", "GUILD_DELETE", (client, data) => {
    const store = client.cache.guilds;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [new Guild(client, data as GuildCreateEntity)];
      }

      return [new Guild(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("guildUpdate", "GUILD_UPDATE", (client, data) => {
    const store = client.cache.guilds;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new Guild(client, data as GuildCreateEntity)];
    }

    return [
      new Guild(client, cachedData),
      new Guild(client, data as GuildCreateEntity),
    ];
  }),
  defineEvent(
    "guildAuditLogEntryCreate",
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    (client, data) => [new GuildAuditLogEntry(client, data)],
  ),
  defineEvent("guildBanAdd", "GUILD_BAN_ADD", (client, data) => [
    new Ban(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    }),
  ]),
  defineEvent("guildBanRemove", "GUILD_BAN_REMOVE", (client, data) => [
    new Ban(client, {
      guild_id: data.guild_id,
      user: data.user,
      reason: null,
    }),
  ]),
  defineEvent("guildEmojisUpdate", "GUILD_EMOJIS_UPDATE", (client, data) => {
    const guildId = data.guild_id;
    const newEmojis = data.emojis; // Complete list of current emojis
    const store = client.cache.emojis;

    // 1. Retrieve all cached emojis for this guild
    const cachedEmojis = new Map<Snowflake, GuildBased<EmojiEntity>>();
    if (store) {
      for (const [id, emojiData] of store.entries()) {
        if (emojiData.guild_id === guildId) {
          cachedEmojis.set(id, emojiData);
        }
      }
    }

    // 2. Create map of new emojis with guild_id added
    const newEmojisMap = new Map<Snowflake, GuildBased<EmojiEntity>>();
    for (const emoji of newEmojis) {
      if (emoji.id) {
        newEmojisMap.set(emoji.id, {
          ...emoji,
          guild_id: guildId,
        });
      }
    }

    // 3. Process CREATE and UPDATE events
    for (const [emojiId, newEmojiData] of newEmojisMap.entries()) {
      const cachedEmojiData = cachedEmojis.get(emojiId);

      if (!cachedEmojiData) {
        // CREATE: Emoji didn't exist in cache
        const newEmoji = new Emoji(client, newEmojiData);
        client.emit("emojiCreate", newEmoji);
      } else {
        // UPDATE: Emoji existed, check if it changed
        if (JSON.stringify(cachedEmojiData) !== JSON.stringify(newEmojiData)) {
          const oldEmoji = new Emoji(client, cachedEmojiData);
          const newEmoji = new Emoji(client, newEmojiData);
          client.emit("emojiUpdate", oldEmoji, newEmoji);
        }
      }
    }

    // 4. Process DELETE events
    for (const [emojiId, cachedEmojiData] of cachedEmojis.entries()) {
      if (!newEmojisMap.has(emojiId)) {
        // DELETE: Emoji was cached but no longer in new list
        const deletedEmoji = new Emoji(client, cachedEmojiData);

        // Remove from cache
        if (store) {
          store.delete(emojiId);
        }

        client.emit("emojiDelete", deletedEmoji);
      }
    }

    return [data];
  }),
  defineEvent(
    "guildStickersUpdate",
    "GUILD_STICKERS_UPDATE",
    (client, data) => {
      const guildId = data.guild_id;
      const newStickers = data.stickers; // Complete list of current stickers
      const store = client.cache.stickers;

      // 1. Retrieve all cached stickers for this guild
      const cachedStickers = new Map<Snowflake, StickerEntity>();
      if (store) {
        for (const [id, stickerData] of store.entries()) {
          if (stickerData.guild_id === guildId) {
            cachedStickers.set(id, stickerData);
          }
        }
      }

      // 2. Create map of new stickers with guild_id added
      const newStickersMap = new Map<Snowflake, StickerEntity>();
      for (const sticker of newStickers) {
        if (sticker.id) {
          newStickersMap.set(sticker.id, {
            ...sticker,
            guild_id: guildId,
          });
        }
      }

      // 3. Process CREATE and UPDATE events
      for (const [stickerId, newStickerData] of newStickersMap.entries()) {
        const cachedStickerData = cachedStickers.get(stickerId);

        if (!cachedStickerData) {
          // CREATE: Sticker didn't exist in cache
          const newSticker = new Sticker(client, newStickerData);
          client.emit("stickerCreate", newSticker);
        } else {
          // UPDATE: Sticker existed, check if it changed
          if (
            JSON.stringify(cachedStickerData) !== JSON.stringify(newStickerData)
          ) {
            const oldSticker = new Sticker(client, cachedStickerData);
            const newSticker = new Sticker(client, newStickerData);
            client.emit("stickerUpdate", oldSticker, newSticker);
          }
        }
      }

      // 4. Process DELETE events
      for (const [stickerId, cachedStickerData] of cachedStickers.entries()) {
        if (!newStickersMap.has(stickerId)) {
          // DELETE: Sticker was cached but no longer in new list
          const deletedSticker = new Sticker(client, cachedStickerData);

          // Remove from cache
          if (store) {
            store.delete(stickerId);
          }

          client.emit("stickerDelete", deletedSticker);
        }
      }

      return [data];
    },
  ),
  defineEvent("guildMemberAdd", "GUILD_MEMBER_ADD", (client, data) => [
    new GuildMember(client, data),
  ]),
  defineEvent("guildMemberRemove", "GUILD_MEMBER_REMOVE", (client, data) => {
    const store = client.cache.members;
    const memberId = `${data.guild_id}:${data.user.id}`;
    const cachedData = store?.get(memberId);

    try {
      if (!cachedData) {
        return [
          new GuildMember(client, {
            ...data.user,
            guild_id: data.guild_id,
          } as unknown as GuildBased<GuildMemberEntity>),
        ];
      }

      return [new GuildMember(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(memberId);
      }
    }
  }),
  defineEvent("guildMemberUpdate", "GUILD_MEMBER_UPDATE", (client, data) => {
    const store = client.cache.members;
    const memberId = `${data.guild_id}:${data.user.id}`;
    const cachedData = store?.get(memberId);
    if (!cachedData) {
      return [
        null,
        new GuildMember(client, data as GuildBased<GuildMemberEntity>),
      ];
    }

    return [
      new GuildMember(client, cachedData),
      new GuildMember(client, data as GuildBased<GuildMemberEntity>),
    ];
  }),
  defineEvent("guildMembersChunk", "GUILD_MEMBERS_CHUNK", (_, data) => [data]),
  defineEvent("guildRoleCreate", "GUILD_ROLE_CREATE", (client, data) => [
    new Role(client, { guild_id: data.guild_id, ...data.role }),
  ]),
  defineEvent("guildRoleDelete", "GUILD_ROLE_DELETE", (client, data) => {
    const store = client.cache.roles;
    const cachedData = store?.get(data.role_id);
    try {
      if (!cachedData) {
        return [
          new Role(client, {
            guild_id: data.guild_id,
            id: data.role_id,
          } as GuildBased<RoleEntity>),
        ];
      }

      return [new Role(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.role_id);
      }
    }
  }),
  defineEvent("guildRoleUpdate", "GUILD_ROLE_UPDATE", (client, data) => {
    const store = client.cache.roles;
    const cachedData = store?.get(data.role.id);
    if (!cachedData) {
      return [
        null,
        new Role(client, { guild_id: data.guild_id, ...data.role }),
      ];
    }

    return [
      new Role(client, cachedData),
      new Role(client, { guild_id: data.guild_id, ...data.role }),
    ];
  }),
  defineEvent(
    "guildScheduledEventCreate",
    "GUILD_SCHEDULED_EVENT_CREATE",
    (client, data) => [new ScheduledEvent(client, data)],
  ),
  defineEvent(
    "guildScheduledEventDelete",
    "GUILD_SCHEDULED_EVENT_DELETE",
    (client, data) => {
      const store = client.cache.scheduledEvents;
      const cachedData = store?.get(data.id);
      try {
        if (!cachedData) {
          return [new ScheduledEvent(client, data)];
        }

        return [new ScheduledEvent(client, cachedData)];
      } finally {
        // Ensure cache cleanup happens after return
        if (cachedData && store) {
          store.delete(data.id);
        }
      }
    },
  ),
  defineEvent(
    "guildScheduledEventUpdate",
    "GUILD_SCHEDULED_EVENT_UPDATE",
    (client, data) => {
      const store = client.cache.scheduledEvents;
      const cachedData = store?.get(data.id);
      if (!cachedData) {
        return [null, new ScheduledEvent(client, data)];
      }

      return [
        new ScheduledEvent(client, cachedData),
        new ScheduledEvent(client, data),
      ];
    },
  ),
  defineEvent(
    "guildScheduledEventUserAdd",
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    (_, data) => [data],
  ),
  defineEvent(
    "guildScheduledEventUserRemove",
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    (_, data) => [data],
  ),
  defineEvent(
    "guildSoundboardSoundCreate",
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    (client, data) => [new SoundboardSound(client, data)],
  ),
  defineEvent(
    "guildSoundboardSoundDelete",
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    (client, data) => {
      const store = client.cache.soundboards;
      const cachedData = store?.get(data.sound_id);
      try {
        if (!cachedData) {
          return [new SoundboardSound(client, data as SoundboardSoundEntity)];
        }

        return [new SoundboardSound(client, cachedData)];
      } finally {
        // Ensure cache cleanup happens after return
        if (cachedData && store) {
          store.delete(data.sound_id);
        }
      }
    },
  ),
  defineEvent(
    "guildSoundboardSoundUpdate",
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    (client, data) => {
      const store = client.cache.soundboards;
      const cachedData = store?.get(data.sound_id);
      if (!cachedData) {
        return [null, new SoundboardSound(client, data)];
      }

      return [
        new SoundboardSound(client, cachedData),
        new SoundboardSound(client, data),
      ];
    },
  ),
  defineEvent(
    "guildSoundboardSoundsUpdate",
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
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
  defineEvent("soundboardSounds", "SOUNDBOARD_SOUNDS", (client, data) => {
    const soundboardSounds = data.soundboard_sounds.map(
      (sound) =>
        new SoundboardSound(client, {
          ...sound,
          guild_id: data.guild_id,
        }),
    );
    return [soundboardSounds];
  }),
  defineEvent("integrationCreate", "INTEGRATION_CREATE", (client, data) => [
    new Integration(client, data),
  ]),
  defineEvent("integrationDelete", "INTEGRATION_DELETE", (client, data) => {
    const store = client.cache.integrations;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [new Integration(client, data as GuildBased<IntegrationEntity>)];
      }

      return [new Integration(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("integrationUpdate", "INTEGRATION_UPDATE", (client, data) => {
    const store = client.cache.integrations;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new Integration(client, data)];
    }

    return [new Integration(client, cachedData), new Integration(client, data)];
  }),
  defineEvent("inviteCreate", "INVITE_CREATE", (client, data) => [
    new Invite(client, data as InviteEntity & InviteCreateEntity),
  ]),
  defineEvent("inviteDelete", "INVITE_DELETE", (client, data) => {
    const store = client.cache.invites;
    const cachedData = store?.get(data.code);
    try {
      if (!cachedData) {
        return [new Invite(client, data as InviteEntity & InviteCreateEntity)];
      }

      return [new Invite(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.code);
      }
    }
  }),
  defineEvent("messageCreate", "MESSAGE_CREATE", (client, data) => [
    new Message(client, data),
  ]),
  defineEvent("messageDelete", "MESSAGE_DELETE", (client, data) => {
    const store = client.cache.messages;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [new Message(client, data as MessageCreateEntity)];
      }

      return [new Message(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("messageUpdate", "MESSAGE_UPDATE", (client, data) => {
    const store = client.cache.messages;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new Message(client, data)];
    }

    return [new Message(client, cachedData), new Message(client, data)];
  }),
  defineEvent("messageDeleteBulk", "MESSAGE_DELETE_BULK", (client, data) => [
    data.ids.map((id) => {
      const store = client.cache.messages;
      const cachedData = store?.get(id);
      try {
        if (!cachedData) {
          return new Message(client, {
            id,
            channel_id: data.channel_id,
            guild_id: data.guild_id,
          } as MessageCreateEntity);
        }
        return new Message(client, cachedData);
      } finally {
        // Ensure cache cleanup happens after return
        if (cachedData && store) {
          store.delete(id);
        }
      }
    }) as Message[],
  ]),
  defineEvent("messageReactionAdd", "MESSAGE_REACTION_ADD", (client, data) => [
    new MessageReaction(client, data),
  ]),
  defineEvent(
    "messageReactionRemove",
    "MESSAGE_REACTION_REMOVE",
    (client, data) => [new MessageReaction(client, data)],
  ),
  defineEvent(
    "messageReactionRemoveAll",
    "MESSAGE_REACTION_REMOVE_ALL",
    (client, data) => [new MessageReactionRemoveAll(client, data)],
  ),
  defineEvent(
    "messageReactionRemoveEmoji",
    "MESSAGE_REACTION_REMOVE_EMOJI",
    (client, data) => [new MessageReactionRemoveEmoji(client, data)],
  ),
  defineEvent("messagePollVoteAdd", "MESSAGE_POLL_VOTE_ADD", (client, data) => [
    new MessagePollVote(client, data),
  ]),
  defineEvent(
    "messagePollVoteRemove",
    "MESSAGE_POLL_VOTE_REMOVE",
    (client, data) => [new MessagePollVote(client, data)],
  ),
  defineEvent(
    "stageInstanceCreate",
    "STAGE_INSTANCE_CREATE",
    (client, data) => [new StageInstance(client, data)],
  ),
  defineEvent(
    "stageInstanceDelete",
    "STAGE_INSTANCE_DELETE",
    (client, data) => {
      const store = client.cache.stageInstances;
      const cachedData = store?.get(data.id);
      try {
        if (!cachedData) {
          return [new StageInstance(client, data)];
        }

        return [new StageInstance(client, cachedData)];
      } finally {
        // Ensure cache cleanup happens after return
        if (cachedData && store) {
          store.delete(data.id);
        }
      }
    },
  ),
  defineEvent(
    "stageInstanceUpdate",
    "STAGE_INSTANCE_UPDATE",
    (client, data) => {
      const store = client.cache.stageInstances;
      const cachedData = store?.get(data.id);
      if (!cachedData) {
        return [null, new StageInstance(client, data)];
      }

      return [
        new StageInstance(client, cachedData),
        new StageInstance(client, data),
      ];
    },
  ),
  defineEvent("subscriptionCreate", "SUBSCRIPTION_CREATE", (client, data) => [
    new Subscription(client, data),
  ]),
  defineEvent("subscriptionDelete", "SUBSCRIPTION_DELETE", (client, data) => {
    const store = client.cache.subscriptions;
    const cachedData = store?.get(data.id);
    try {
      if (!cachedData) {
        return [new Subscription(client, data)];
      }

      return [new Subscription(client, cachedData)];
    } finally {
      // Ensure cache cleanup happens after return
      if (cachedData && store) {
        store.delete(data.id);
      }
    }
  }),
  defineEvent("subscriptionUpdate", "SUBSCRIPTION_UPDATE", (client, data) => {
    const store = client.cache.subscriptions;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new Subscription(client, data)];
    }

    return [
      new Subscription(client, cachedData),
      new Subscription(client, data),
    ];
  }),
  defineEvent("userUpdate", "USER_UPDATE", (client, data) => {
    const store = client.cache.users;
    const cachedData = store?.get(data.id);
    if (!cachedData) {
      return [null, new User(client, data)];
    }

    return [new User(client, cachedData), new User(client, data)];
  }),
  defineEvent(
    "voiceChannelEffectSend",
    "VOICE_CHANNEL_EFFECT_SEND",
    (client, data) => [new VoiceChannelEffect(client, data)],
  ),
  defineEvent("voiceStateUpdate", "VOICE_STATE_UPDATE", (client, data) => {
    const store = client.cache.voiceStates;
    const voiceStateId = data.user_id;
    const cachedData = store?.get(voiceStateId);
    if (!cachedData) {
      return [null, new VoiceState(client, data)];
    }

    return [new VoiceState(client, cachedData), new VoiceState(client, data)];
  }),
  defineEvent("voiceServerUpdate", "VOICE_SERVER_UPDATE", (_, data) => [data]),
  defineEvent("webhooksUpdate", "WEBHOOKS_UPDATE", (client, data) => {
    const store = client.cache.webhooks;
    const cachedData = store?.find(
      (wh) =>
        wh.guild_id === data.guild_id && wh.channel_id === data.channel_id,
    );
    if (!cachedData) {
      return [null, new Webhook(client, data as WebhookEntity)];
    }

    return [
      new Webhook(client, cachedData),
      new Webhook(client, data as WebhookEntity),
    ];
  }),
  defineEvent("ready", "READY", (client, data) => [new Ready(client, data)]),
  defineEvent("interactionCreate", "INTERACTION_CREATE", (client, data) => [
    interactionFactory(client, data),
  ]),
  defineEvent(
    "applicationCommandPermissionsUpdate",
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    (_, data) => [data],
  ),
  defineEvent("typingStart", "TYPING_START", (_, data) => [data]),
] as const;

/**
 * List of REST client event names to forward directly to the main client.
 *
 * These events are related to HTTP request management, rate limiting, and
 * retry logic. They are forwarded without transformation as they contain
 * low-level networking information that applications may want to monitor.
 *
 * @example
 * ```typescript
 * // Forward REST events to main client
 * for (const eventName of RestEventNames) {
 *   restClient.on(eventName, (...args) => {
 *     mainClient.emit(eventName, ...args);
 *   });
 * }
 * ```
 *
 * @see {@link RestEvents} - For the complete type definition of REST events
 * @see {@link GatewayEventNames} - For Gateway client events to forward
 *
 * @public
 */
export const RestEventNames = [
  "request",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "retry",
] as const satisfies readonly (keyof RestEvents)[];

/**
 * List of Gateway client event names to forward directly to the main client.
 *
 * These events are related to WebSocket connection management, heartbeats,
 * session handling, and low-level Gateway operations. They are forwarded
 * without transformation for applications that need to monitor connection health.
 *
 * @example
 * ```typescript
 * // Forward Gateway events to main client
 * for (const eventName of GatewayEventNames) {
 *   gatewayClient.on(eventName, (...args) => {
 *     mainClient.emit(eventName, ...args);
 *   });
 * }
 * ```
 *
 * @see {@link GatewayEvents} - For the complete type definition of Gateway events
 * @see {@link RestEventNames} - For REST client events to forward
 *
 * @public
 */
export const GatewayEventNames = [
  "heartbeatSent",
  "heartbeatAcknowledge",
  "heartbeatTimeout",
  "sessionStart",
  "sessionResume",
  "sessionInvalidate",
  "sequenceUpdate",
  "shardStatusChange",
  "wsClose",
  "wsError",
  "wsOpen",
  "wsMessage",
  "stateChange",
  "dispatch",
] as const satisfies readonly (keyof GatewayEvents)[];
