import type {
  AnyChannelEntity,
  BanEntity,
  InviteEntity,
  Snowflake,
} from "@nyxjs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  GuildMemberAddEntity,
  MessageCreateEntity,
  MessageDeleteBulkEntity,
} from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import {
  type AnyChannel,
  type AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  Entitlement,
  Guild,
  GuildAuditLogEntry,
  GuildBan,
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
  Subscription,
  TextChannel,
  ThreadListSync,
  ThreadMember,
  ThreadMembers,
  Typing,
  User,
  VoiceChannelEffectSend,
  VoiceState,
  Webhook,
} from "../classes/index.js";
import type { Client } from "../core/index.js";
import { ChannelFactory, InteractionFactory } from "../factories/index.js";
import type { GatewayEventMapping } from "../handlers/index.js";
import type { ClientEvents } from "../types/index.js";

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
 * defineEvent("GUILD_CREATE", "guildCreate", (client, data) => {
 *   const guild = Guild.from(client, data);
 *   client.cache.guilds.set(guild.id, guild);
 *   return [guild];
 * });
 * ```
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
  defineEvent("READY", "ready", (client, data) => {
    const ready = Ready.from(client, data);

    // Cache the user information
    if (client.cache.users?.set) {
      client.cache.users.set(ready.user.id, ready.user);
    }

    return [ready];
  }),

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
    (client, data) => {
      const autoModerationRule = AutoModerationRule.from(client, data);

      // Cache the auto moderation rule
      if (client.cache.autoModerationRules?.set) {
        client.cache.autoModerationRules.set(
          autoModerationRule.id,
          autoModerationRule,
        );
      }

      return [autoModerationRule];
    },
  ),

  /**
   * Auto moderation rule update event - emitted when an auto moderation rule is updated.
   * Updates the cached rule and provides both old and new versions.
   */
  defineEvent(
    "AUTO_MODERATION_RULE_UPDATE",
    "autoModerationRuleUpdate",
    (client, data) => {
      const newAutoModerationRule = AutoModerationRule.from(client, data);

      // Store the old version before updating
      let oldAutoModerationRule: AutoModerationRule | null = null;
      const cachedAutoModerationRule = client.cache.autoModerationRules?.get?.(
        newAutoModerationRule.id,
      );

      if (cachedAutoModerationRule) {
        oldAutoModerationRule =
          cachedAutoModerationRule.clone?.() || cachedAutoModerationRule;
      }

      // Update the cache with new version
      if (client.cache.autoModerationRules?.set) {
        client.cache.autoModerationRules.set(
          newAutoModerationRule.id,
          newAutoModerationRule,
        );
      }

      return [oldAutoModerationRule, newAutoModerationRule];
    },
  ),

  /**
   * Auto moderation rule delete event - emitted when an auto moderation rule is deleted.
   * Removes the rule from the cache.
   */
  defineEvent(
    "AUTO_MODERATION_RULE_DELETE",
    "autoModerationRuleDelete",
    (client, data) => {
      const deletedAutoModerationRule = AutoModerationRule.from(client, data);

      // Get the cached version before deleting
      const cachedAutoModerationRule = client.cache.autoModerationRules?.get?.(
        deletedAutoModerationRule.id,
      );

      // Remove from cache
      if (
        cachedAutoModerationRule &&
        client.cache.autoModerationRules?.delete
      ) {
        client.cache.autoModerationRules.delete(deletedAutoModerationRule.id);
      }

      return [deletedAutoModerationRule];
    },
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
  defineEvent("CHANNEL_CREATE", "channelCreate", (client, data) => {
    const channel = ChannelFactory.create(client, data);

    // Cache the new channel
    if (client.cache.channels?.set) {
      client.cache.channels.set(channel.id, channel);
    }

    return [channel];
  }),

  /**
   * Channel update event - emitted when a channel is updated.
   * Updates the channel in the cache and provides both old and new versions.
   */
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (client, data) => {
    const newChannel = ChannelFactory.create(client, data);

    // Store the old version before updating
    let oldChannel: AnyChannel | null = null;
    const cachedChannel = client.cache.channels?.get?.(newChannel.id);
    if (cachedChannel) {
      oldChannel = cachedChannel.clone?.() || cachedChannel;
    }

    // Update the cache with new version
    if (client.cache.channels?.set) {
      client.cache.channels.set(newChannel.id, newChannel);
    }

    return [oldChannel, newChannel];
  }),

  /**
   * Channel delete event - emitted when a channel is deleted.
   * Removes the channel from the cache.
   */
  defineEvent("CHANNEL_DELETE", "channelDelete", (client, data) => {
    const deletedChannel = ChannelFactory.create(client, data);

    // Get the cached version before deleting
    const cachedChannel = client.cache.channels?.get?.(deletedChannel.id);

    // Remove from cache
    if (cachedChannel && client.cache.channels?.delete) {
      client.cache.channels.delete(deletedChannel.id);
    }

    return [deletedChannel];
  }),

  /**
   * Channel pins update event - emitted when a message is pinned or unpinned.
   */
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (client, data) => {
    const channel = client.cache.channels.get(data.channel_id);
    if (!channel) {
      return [null];
    }

    const channelPins = TextChannel.from(client, channel.data);

    // Update the cache with the new pin information
    if (client.cache.channels?.set) {
      client.cache.channels.set(channelPins.channelId, channelPins);
    }

    return [channelPins];
  }),

  /**
   * Thread create event - emitted when a thread is created.
   * Adds the new thread to the cache.
   */
  defineEvent("THREAD_CREATE", "threadCreate", (client, data) => {
    const thread = ChannelFactory.create(client, data);

    // Cache the new thread
    if (client.cache.channels?.set) {
      client.cache.channels.set(thread.id, thread);
    }

    return [thread as AnyThreadChannel];
  }),

  /**
   * Thread update event - emitted when a thread is updated.
   * Updates the thread in the cache and provides both old and new versions.
   */
  defineEvent("THREAD_UPDATE", "threadUpdate", (client, data) => {
    const newThread = ChannelFactory.create(client, data);

    // Store the old version before updating
    let oldThread: AnyThreadChannel | null = null;
    const cachedThread = client.cache.channels?.get?.(
      newThread.id,
    ) as AnyThreadChannel;

    if (cachedThread) {
      oldThread = cachedThread.clone?.() || cachedThread;
    }

    // Update the cache with new version
    if (client.cache.channels?.set) {
      client.cache.channels.set(newThread.id, newThread);
    }

    return [oldThread, newThread as AnyThreadChannel];
  }),

  /**
   * Thread delete event - emitted when a thread is deleted.
   * Removes the thread from the cache.
   */
  defineEvent("THREAD_DELETE", "threadDelete", (client, data) => {
    const deletedThread = ChannelFactory.create(
      client,
      data as AnyChannelEntity,
    );

    // Get the cached version before deleting
    const cachedThread = client.cache.channels?.get?.(
      deletedThread.id,
    ) as AnyThreadChannel;

    // Remove from cache
    if (cachedThread && client.cache.channels?.delete) {
      client.cache.channels.delete(deletedThread.id);
    }

    return [deletedThread as AnyThreadChannel];
  }),

  /**
   * Thread list sync event - emitted when threads are synced.
   */
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (client, data) => {
    const threadListSync = ThreadListSync.from(client, data);

    // Update cache with all threads in the sync
    if (client.cache.channels?.set && threadListSync.threads) {
      for (const thread of threadListSync.threads) {
        client.cache.channels.set(thread.id, thread);
      }
    }

    return [threadListSync];
  }),

  /**
   * Thread member update event - emitted when a thread member is updated.
   */
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (client, data) => {
    const threadMember = ThreadMember.from(client, data);

    // Create a composite key for thread members
    const key = `${threadMember.guildId}-${threadMember.userId}-${threadMember.threadId}`;

    // Store the old version before updating
    let oldThreadMember = null;
    if (client.cache.threadMembers?.get) {
      const cachedThreadMember = client.cache.threadMembers.get(key);
      if (cachedThreadMember) {
        oldThreadMember = cachedThreadMember.clone?.() || cachedThreadMember;
      }
    }

    // Update cache
    if (client.cache.threadMembers?.set) {
      client.cache.threadMembers.set(key, threadMember);
    }

    return [oldThreadMember, threadMember];
  }),

  /**
   * Thread members update event - emitted when multiple thread members are updated.
   */
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (client, data) => {
      const threadMembers = ThreadMembers.from(client, data);

      // Update cache for added members
      if (client.cache.threadMembers?.set && threadMembers.addedMembers) {
        for (const member of threadMembers.addedMembers) {
          const key = `${threadMembers.guildId}-${member.userId}-${threadMembers.threadId}`;
          client.cache.threadMembers.set(key, member);
        }
      }

      // Remove members from cache
      if (
        client.cache.threadMembers?.delete &&
        threadMembers.removedMemberIds
      ) {
        for (const userId of threadMembers.removedMemberIds) {
          const key = `${threadMembers.guildId}-${userId}-${threadMembers.threadId}`;
          client.cache.threadMembers.delete(key);
        }
      }

      return [threadMembers];
    },
  ),

  /**
   * Entitlement create event - emitted when an entitlement is created.
   * Adds the new entitlement to the cache.
   */
  defineEvent("ENTITLEMENT_CREATE", "entitlementCreate", (client, data) => {
    const entitlement = Entitlement.from(client, data);

    // Cache the new entitlement
    if (client.cache.entitlements?.set) {
      client.cache.entitlements.set(entitlement.id, entitlement);
    }

    return [entitlement];
  }),

  /**
   * Entitlement update event - emitted when an entitlement is updated.
   * Updates the entitlement in the cache and provides both old and new versions.
   */
  defineEvent("ENTITLEMENT_UPDATE", "entitlementUpdate", (client, data) => {
    const newEntitlement = Entitlement.from(client, data);

    // Store the old version before updating
    let oldEntitlement: Entitlement | null = null;
    const cachedEntitlement = client.cache.entitlements?.get?.(
      newEntitlement.id,
    );

    if (cachedEntitlement) {
      oldEntitlement = cachedEntitlement.clone?.() || cachedEntitlement;
    }

    // Update the cache with new version
    if (client.cache.entitlements?.set) {
      client.cache.entitlements.set(newEntitlement.id, newEntitlement);
    }

    return [oldEntitlement, newEntitlement];
  }),

  /**
   * Entitlement delete event - emitted when an entitlement is deleted.
   * Removes the entitlement from the cache.
   */
  defineEvent("ENTITLEMENT_DELETE", "entitlementDelete", (client, data) => {
    const deletedEntitlement = Entitlement.from(client, data);

    // Get the cached version before deleting
    const cachedEntitlement = client.cache.entitlements?.get?.(
      deletedEntitlement.id,
    );

    // Remove from cache
    if (cachedEntitlement && client.cache.entitlements?.delete) {
      client.cache.entitlements.delete(deletedEntitlement.id);
    }

    return [deletedEntitlement];
  }),

  /**
   * Guild create event - emitted when a guild becomes available.
   * Adds the guild and its related entities to the cache.
   */
  defineEvent("GUILD_CREATE", "guildCreate", (client, data) => {
    const guild = Guild.from(client, data as GuildCreateEntity);

    // Cache the guild
    if (client.cache.guilds?.set) {
      client.cache.guilds.set(guild.id, guild);
    }

    // Cache all related entities like channels, members, roles
    if (guild.channels && client.cache.channels?.set) {
      for (const channel of guild.channels.values()) {
        client.cache.channels.set(channel.id, channel);
      }
    }

    if (guild.members && client.cache.members?.set) {
      for (const member of guild.members.values()) {
        client.cache.members.set(`${guild.id}-${member.user.id}`, member);

        // Also cache the user
        if (client.cache.users?.set) {
          client.cache.users.set(member.user.id, member.user);
        }
      }
    }

    if (guild.roles && client.cache.roles?.set) {
      for (const role of guild.roles.values()) {
        client.cache.roles.set(role.id, role);
      }
    }

    // Cache emojis
    if (guild.emojis && client.cache.emojis?.set) {
      for (const emoji of guild.emojis.values()) {
        client.cache.emojis.set(emoji.id, emoji);
      }
    }

    // Cache stickers
    if (guild.stickers && client.cache.stickers?.set) {
      for (const sticker of guild.stickers.values()) {
        client.cache.stickers.set(sticker.id, sticker);
      }
    }

    return [guild];
  }),

  /**
   * Guild update event - emitted when a guild is updated.
   * Updates the guild in the cache and provides both old and new versions.
   */
  defineEvent("GUILD_UPDATE", "guildUpdate", (client, data) => {
    const newGuild = Guild.from(client, data as GuildCreateEntity);

    // Store the old version before updating
    let oldGuild: Guild | null = null;
    const cachedGuild = client.cache.guilds?.get?.(newGuild.id);

    if (cachedGuild) {
      oldGuild = cachedGuild.clone?.() || cachedGuild;
    }

    // Update the cache with new version
    if (client.cache.guilds?.set) {
      client.cache.guilds.set(newGuild.id, newGuild);
    }

    return [oldGuild, newGuild];
  }),

  /**
   * Guild delete event - emitted when a guild becomes unavailable or the bot is removed.
   * Removes the guild and optionally its related entities from the cache.
   */
  defineEvent("GUILD_DELETE", "guildDelete", (client, data) => {
    const guild = Guild.from(client, data as GuildCreateEntity);

    // Get the cached guild before deleting
    const cachedGuild = client.cache.guilds?.get?.(guild.id);

    // Remove from cache
    if (client.cache.guilds?.delete) {
      client.cache.guilds.delete(guild.id);
    }

    // Clean up related caches
    if (cachedGuild) {
      // Clean channels for this guild
      if (client.cache.channels?.forEach && client.cache.channels?.delete) {
        client.cache.channels.forEach((channel, channelId) => {
          if (channel.guildId === guild.id) {
            client.cache.channels.delete(channelId);
          }
        });
      }

      // Clean members for this guild
      if (client.cache.members?.forEach && client.cache.members?.delete) {
        client.cache.members.forEach((_member, memberId) => {
          if (memberId.startsWith(`${guild.id}-`)) {
            client.cache.members.delete(memberId);
          }
        });
      }

      // Clean roles for this guild
      if (cachedGuild.roles && client.cache.roles?.delete) {
        for (const roleId of cachedGuild.roles.keys()) {
          client.cache.roles.delete(roleId);
        }
      }

      // Clean emojis for this guild
      if (cachedGuild.emojis && client.cache.emojis?.delete) {
        for (const emojiId of cachedGuild.emojis.keys()) {
          client.cache.emojis.delete(emojiId);
        }
      }

      // Clean stickers for this guild
      if (cachedGuild.stickers && client.cache.stickers?.delete) {
        for (const stickerId of cachedGuild.stickers.keys()) {
          client.cache.stickers.delete(stickerId);
        }
      }
    }

    return [guild];
  }),

  /**
   * Guild audit log entry create event - emitted when an audit log entry is created.
   */
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (client, data) => [GuildAuditLogEntry.from(client, data)],
  ),

  /**
   * Guild ban add event - emitted when a user is banned from a guild.
   */
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (client, data) => {
    const ban = GuildBan.from(
      client,
      data as BanEntity & { guild_id: Snowflake },
    );

    // Cache the ban with a composite key
    if (client.cache.bans?.set) {
      client.cache.bans.set(`${ban.guildId}-${ban.user.id}`, ban);
    }

    // Also cache the user
    if (client.cache.users?.set && ban.user) {
      client.cache.users.set(ban.user.id, ban.user);
    }

    return [ban];
  }),

  /**
   * Guild ban remove event - emitted when a user is unbanned from a guild.
   */
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (client, data) => {
    const ban = GuildBan.from(
      client,
      data as BanEntity & { guild_id: Snowflake },
    );

    // Remove from bans cache
    if (client.cache.bans?.delete) {
      client.cache.bans.delete(`${ban.guildId}-${ban.user.id}`);
    }

    return [ban];
  }),

  /**
   * Guild emojis update event - emitted when a guild's emojis are updated.
   * This event is special as it needs to trigger individual emoji events.
   */
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", (client, data) => {
    const newEmojis = new Map();
    const guildId = data.guild_id;

    // Process all emojis from the update
    for (const emojiData of data.emojis) {
      const emoji = Emoji.from(client, { ...emojiData, guild_id: guildId });
      newEmojis.set(emoji.id, emoji);
    }

    // Get old emojis from cache
    const oldEmojis = new Map();
    if (client.cache.emojis) {
      for (const emoji of client.cache.emojis.values()) {
        if (emoji.guildId === guildId) {
          oldEmojis.set(emoji.id, emoji);
        }
      }
    }

    // Find created, updated, and deleted emojis
    for (const [emojiId, newEmoji] of newEmojis.entries()) {
      const oldEmoji = oldEmojis.get(emojiId);

      if (!oldEmoji) {
        // Emoji created
        client.emit("emojiCreate", newEmoji);
      } else if (JSON.stringify(oldEmoji) !== JSON.stringify(newEmoji)) {
        // Emoji updated
        client.emit("emojiUpdate", oldEmoji, newEmoji);
      }

      // Update cache
      if (client.cache.emojis?.set) {
        client.cache.emojis.set(emojiId, newEmoji);
      }
    }

    // Find deleted emojis
    for (const [emojiId, oldEmoji] of oldEmojis.entries()) {
      if (!newEmojis.has(emojiId)) {
        // Emoji deleted
        client.emit("emojiDelete", oldEmoji);

        // Remove from cache
        if (client.cache.emojis?.delete) {
          client.cache.emojis.delete(emojiId);
        }
      }
    }

    // Return the new set of emojis for the main event
    return [{ guildId, emojis: Array.from(newEmojis.values()) }];
  }),

  /**
   * Guild stickers update event - emitted when a guild's stickers are updated.
   * Similar to emoji updates, this triggers individual sticker events.
   */
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (client, data) => {
      const newStickers = new Map();
      const guildId = data.guild_id;

      // Process all stickers from the update
      for (const stickerData of data.stickers) {
        const sticker = Sticker.from(client, {
          ...stickerData,
          guild_id: guildId,
        });
        newStickers.set(sticker.id, sticker);
      }

      // Get old stickers from cache
      const oldStickers = new Map();
      if (client.cache.stickers) {
        for (const sticker of client.cache.stickers.values()) {
          if (sticker.guildId === guildId) {
            oldStickers.set(sticker.id, sticker);
          }
        }
      }

      // Find created, updated, and deleted stickers
      for (const [stickerId, newSticker] of newStickers.entries()) {
        const oldSticker = oldStickers.get(stickerId);

        if (!oldSticker) {
          // Sticker created
          client.emit("stickerCreate", newSticker);
        } else if (JSON.stringify(oldSticker) !== JSON.stringify(newSticker)) {
          // Sticker updated
          client.emit("stickerUpdate", oldSticker, newSticker);
        }

        // Update cache
        if (client.cache.stickers?.set) {
          client.cache.stickers.set(stickerId, newSticker);
        }
      }

      // Find deleted stickers
      for (const [stickerId, oldSticker] of oldStickers.entries()) {
        if (!newStickers.has(stickerId)) {
          // Sticker deleted
          client.emit("stickerDelete", oldSticker);

          // Remove from cache
          if (client.cache.stickers?.delete) {
            client.cache.stickers.delete(stickerId);
          }
        }
      }

      // Return the new set of stickers for the main event
      return [{ guildId, stickers: Array.from(newStickers.values()) }];
    },
  ),

  /**
   * Guild integrations update event - emitted when a guild's integrations are updated.
   */
  defineEvent(
    "GUILD_INTEGRATIONS_UPDATE",
    "guildIntegrationsUpdate",
    (_client, data) => {
      // This event only contains guild_id, so we return a simple object with the guildId
      return [{ guildId: data.guild_id }];
    },
  ),

  /**
   * Guild member add event - emitted when a user joins a guild.
   * Adds the member to the cache.
   */
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (client, data) => {
    const member = GuildMember.from(client, data);

    // Cache the member using a composite key
    if (client.cache.members?.set) {
      client.cache.members.set(`${member.guildId}-${member.user.id}`, member);
    }

    // Also cache the user
    if (client.cache.users?.set && member.user) {
      client.cache.users.set(member.user.id, member.user);
    }

    return [member];
  }),

  /**
   * Guild member remove event - emitted when a user leaves a guild.
   * Removes the member from the cache.
   */
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (client, data) => {
    const member = GuildMember.from(client, data as GuildMemberAddEntity);

    // Get the cached member before removing
    const cachedMember = client.cache.members?.get?.(
      `${member.guildId}-${member.user.id}`,
    );

    // Remove the member from cache
    if (client.cache.members?.delete) {
      client.cache.members.delete(`${member.guildId}-${member.user.id}`);
    }

    // Return the cached member if available, otherwise the partial data
    return [cachedMember || member];
  }),

  /**
   * Guild member update event - emitted when a guild member is updated.
   * Updates the member in the cache.
   */
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (client, data) => {
    const newMember = GuildMember.from(client, data as GuildMemberAddEntity);

    // Store the old version before updating
    let oldMember: GuildMember | null = null;
    const cachedMember = client.cache.members?.get?.(
      `${newMember.guildId}-${newMember.user.id}`,
    );

    if (cachedMember) {
      oldMember = cachedMember.clone?.() || cachedMember;
    }

    // Update the cache with new version
    if (client.cache.members?.set) {
      client.cache.members.set(
        `${newMember.guildId}-${newMember.user.id}`,
        newMember,
      );
    }

    // Also update the user
    if (client.cache.users?.set && newMember.user) {
      client.cache.users.set(newMember.user.id, newMember.user);
    }

    return [oldMember, newMember];
  }),

  /**
   * Guild members chunk event - emitted in response to Guild Request Members.
   */
  defineEvent("GUILD_MEMBERS_CHUNK", "guildMembersChunk", (client, data) => {
    // Cache all members in the chunk
    if (client.cache.members?.set && data.members) {
      for (const memberData of data.members) {
        const member = GuildMember.from(client, {
          ...memberData,
          guild_id: data.guild_id,
        });

        client.cache.members.set(`${data.guild_id}-${member.user.id}`, member);

        // Also cache the user
        if (client.cache.users?.set && member.user) {
          client.cache.users.set(member.user.id, member.user);
        }
      }
    }

    // Cache presences if available
    if (client.cache.presences?.set && data.presences) {
      for (const presence of data.presences) {
        if (presence.user?.id) {
          client.cache.presences.set(presence.user.id, presence);
        }
      }
    }

    return [data];
  }),

  /**
   * Guild role create event - emitted when a guild role is created.
   * Adds the role to the cache.
   */
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => {
    const role = Role.from(client, {
      guild_id: data.guild_id,
      ...data.role,
    });

    // Cache the role
    if (client.cache.roles?.set) {
      client.cache.roles.set(role.id, role);
    }

    return [role];
  }),

  /**
   * Guild role update event - emitted when a guild role is updated.
   * Updates the role in the cache.
   */
  defineEvent("GUILD_ROLE_UPDATE", "guildRoleUpdate", (client, data) => {
    const newRole = Role.from(client, {
      guild_id: data.guild_id,
      ...data.role,
    });

    // Store the old version before updating
    let oldRole = null;
    if (client.cache.roles?.get) {
      const cachedRole = client.cache.roles.get(newRole.id);
      if (cachedRole) {
        oldRole = cachedRole.clone?.() || cachedRole;
      }
    }

    // Update the cache with new version
    if (client.cache.roles?.set) {
      client.cache.roles.set(newRole.id, newRole);
    }

    return [oldRole, newRole];
  }),

  /**
   * Guild role delete event - emitted when a guild role is deleted.
   * Removes the role from the cache.
   */
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) => {
    // Get the role from cache before deleting
    let deletedRole = null;
    if (client.cache.roles?.get) {
      deletedRole = client.cache.roles.get(data.role_id);
    }

    // If role not found in cache, create a minimal object
    if (!deletedRole) {
      deletedRole = {
        id: data.role_id,
        guildId: data.guild_id,
      };
    }

    // Remove the role from cache
    if (client.cache.roles?.delete) {
      client.cache.roles.delete(data.role_id);
    }

    return [deletedRole];
  }),

  /**
   * Guild scheduled event create event - emitted when a scheduled event is created.
   * Adds the event to the cache.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (client, data) => {
      const scheduledEvent = GuildScheduledEvent.from(client, data);

      // Cache the scheduled event
      if (client.cache.scheduledEvents?.set) {
        client.cache.scheduledEvents.set(scheduledEvent.id, scheduledEvent);
      }

      return [scheduledEvent];
    },
  ),

  /**
   * Guild scheduled event update event - emitted when a scheduled event is updated.
   * Updates the event in the cache and provides both old and new versions.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_UPDATE",
    "guildScheduledEventUpdate",
    (client, data) => {
      const newScheduledEvent = GuildScheduledEvent.from(client, data);

      // Store the old version before updating
      let oldScheduledEvent: GuildScheduledEvent | null = null;
      const cachedEvent = client.cache.scheduledEvents?.get?.(
        newScheduledEvent.id,
      );

      if (cachedEvent) {
        oldScheduledEvent = cachedEvent.clone?.() || cachedEvent;
      }

      // Update the cache with new version
      if (client.cache.scheduledEvents?.set) {
        client.cache.scheduledEvents.set(
          newScheduledEvent.id,
          newScheduledEvent,
        );
      }

      return [oldScheduledEvent, newScheduledEvent];
    },
  ),

  /**
   * Guild scheduled event delete event - emitted when a scheduled event is deleted.
   * Removes the event from the cache.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_DELETE",
    "guildScheduledEventDelete",
    (client, data) => {
      const deletedEvent = GuildScheduledEvent.from(client, data);

      // Get the cached event before deleting
      const cachedEvent = client.cache.scheduledEvents?.get?.(deletedEvent.id);

      // Remove from cache
      if (client.cache.scheduledEvents?.delete) {
        client.cache.scheduledEvents.delete(deletedEvent.id);
      }

      return [cachedEvent || deletedEvent];
    },
  ),

  /**
   * Guild scheduled event user add event - emitted when a user subscribes to an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (_client, data) => {
      return [
        {
          guildId: data.guild_id,
          scheduledEventId: data.guild_scheduled_event_id,
          userId: data.user_id,
        },
      ];
    },
  ),

  /**
   * Guild scheduled event user remove event - emitted when a user unsubscribes from an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (_client, data) => {
      return [
        {
          guildId: data.guild_id,
          scheduledEventId: data.guild_scheduled_event_id,
          userId: data.user_id,
        },
      ];
    },
  ),

  /**
   * Guild soundboard sound create event - emitted when a soundboard sound is created.
   * Adds the sound to the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_CREATE",
    "guildSoundboardSoundCreate",
    (client, data) => {
      const sound = SoundboardSound.from(client, data);

      // Cache the sound
      if (client.cache.soundboards?.set) {
        client.cache.soundboards.set(sound.id, sound);
      }

      return [sound];
    },
  ),

  /**
   * Guild soundboard sound update event - emitted when a soundboard sound is updated.
   * Updates the sound in the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (client, data) => {
      const newSound = SoundboardSound.from(client, data);

      // Store the old version before updating
      let oldSound = null;
      if (client.cache.soundboards?.get) {
        const cachedSound = client.cache.soundboards.get(newSound.id);
        if (cachedSound) {
          oldSound = cachedSound.clone?.() || cachedSound;
        }
      }

      // Update the cache with new version
      if (client.cache.soundboards?.set) {
        client.cache.soundboards.set(newSound.id, newSound);
      }

      return [oldSound, newSound];
    },
  ),

  /**
   * Guild soundboard sound delete event - emitted when a soundboard sound is deleted.
   * Removes the sound from the cache.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    "guildSoundboardSoundDelete",
    (client, data) => {
      // Get the sound from cache before deleting
      let deletedSound = null;
      if (client.cache.soundboards?.get) {
        deletedSound = client.cache.soundboards.get(data.sound_id);
      }

      // If sound not found in cache, create a minimal object
      if (!deletedSound) {
        deletedSound = {
          id: data.sound_id,
          guildId: data.guild_id,
        };
      }

      // Remove from cache
      if (client.cache.soundboards?.delete) {
        client.cache.soundboards.delete(data.sound_id);
      }

      return [deletedSound];
    },
  ),

  /**
   * Guild soundboard sounds update event - emitted when multiple sounds are updated.
   */
  defineEvent(
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    "guildSoundboardSoundsUpdate",
    (client, data) => {
      const sounds = data.soundboard_sounds.map((sound) =>
        SoundboardSound.from(client, { ...sound, guild_id: data.guild_id }),
      );

      // Update cache for all sounds
      if (client.cache.soundboards?.set) {
        for (const sound of sounds) {
          client.cache.soundboards.set(sound.id, sound);
        }
      }

      return [sounds];
    },
  ),

  /**
   * Soundboard sounds event - emitted for soundboard sounds.
   */
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (client, data) => {
    const sounds = data.soundboard_sounds.map((sound) =>
      SoundboardSound.from(client, { ...sound, guild_id: data.guild_id }),
    );

    // Update cache for all sounds
    if (client.cache.soundboards?.set) {
      for (const sound of sounds) {
        client.cache.soundboards.set(sound.id, sound);
      }
    }

    return [sounds];
  }),

  /**
   * Integration create event - emitted when an integration is created.
   * Adds the integration to the cache.
   */
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (client, data) => {
    const integration = Integration.from(client, data);

    // Cache the integration
    if (client.cache.integrations?.set) {
      client.cache.integrations.set(integration.id, integration);
    }

    return [integration];
  }),

  /**
   * Integration update event - emitted when an integration is updated.
   * Updates the integration in the cache.
   */
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (client, data) => {
    const newIntegration = Integration.from(client, data);

    // Store the old version before updating
    let oldIntegration = null;
    if (client.cache.integrations?.get) {
      const cachedIntegration = client.cache.integrations.get(
        newIntegration.id,
      );
      if (cachedIntegration) {
        oldIntegration = cachedIntegration.clone?.() || cachedIntegration;
      }
    }

    // Update the cache with new version
    if (client.cache.integrations?.set) {
      client.cache.integrations.set(newIntegration.id, newIntegration);
    }

    return [oldIntegration, newIntegration];
  }),

  /**
   * Integration delete event - emitted when an integration is deleted.
   * Removes the integration from the cache.
   */
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (client, data) => {
    // Get the integration from cache before deleting
    let deletedIntegration = null;
    if (client.cache.integrations?.get) {
      deletedIntegration = client.cache.integrations.get(data.id);
    }

    // If integration not found in cache, create a minimal object
    if (!deletedIntegration) {
      deletedIntegration = {
        id: data.id,
        guildId: data.guild_id,
        applicationId: data.application_id,
      };
    }

    // Remove from cache
    if (client.cache.integrations?.delete) {
      client.cache.integrations.delete(data.id);
    }

    return [deletedIntegration];
  }),

  /**
   * Invite create event - emitted when an invite is created.
   * Adds the invite to the cache.
   */
  defineEvent("INVITE_CREATE", "inviteCreate", (client, data) => {
    const invite = Invite.from(
      client,
      data as unknown as InviteEntity & { guild_id?: Snowflake },
    );

    // Cache the invite using the code as the key
    if (client.cache.invites?.set) {
      client.cache.invites.set(invite.code, invite);
    }

    return [invite];
  }),

  /**
   * Invite delete event - emitted when an invite is deleted.
   * Removes the invite from the cache.
   */
  defineEvent("INVITE_DELETE", "inviteDelete", (client, data) => {
    // Get the invite from cache before deleting
    let deletedInvite = null;
    if (client.cache.invites?.get) {
      deletedInvite = client.cache.invites.get(data.code);
    }

    // If invite not found in cache, create a minimal object
    if (!deletedInvite) {
      deletedInvite = {
        code: data.code,
        channelId: data.channel_id,
        guildId: data.guild_id,
      };
    }

    // Remove from cache
    if (client.cache.invites?.delete) {
      client.cache.invites.delete(data.code);
    }

    return [deletedInvite];
  }),

  /**
   * Message create event - emitted when a message is sent.
   * Adds the message to the cache.
   */
  defineEvent("MESSAGE_CREATE", "messageCreate", (client, data) => {
    const message = Message.from(client, data);

    // Cache the message
    if (client.cache.messages?.set) {
      client.cache.messages.set(message.id, message);
    }

    // Also cache the author if it's a user
    if (message.author && client.cache.users?.set) {
      client.cache.users.set(message.author.id, message.author);
    }

    // Cache member if present
    if (message.member && client.cache.members?.set && message.guild?.id) {
      client.cache.members.set(
        `${message.guild.id}-${message.author.id}`,
        message.member,
      );
    }

    return [message];
  }),

  /**
   * Message update event - emitted when a message is edited.
   * Updates the message in the cache and provides both old and new versions.
   */
  defineEvent("MESSAGE_UPDATE", "messageUpdate", (client, data) => {
    const newMessage = Message.from(client, data);

    // Store the old version before updating
    let oldMessage: Message | null = null;
    const cachedMessage = client.cache.messages?.get?.(newMessage.id);
    if (cachedMessage) {
      oldMessage = cachedMessage.clone?.() || cachedMessage;
    }

    // Update the cache with new version
    if (client.cache.messages?.set) {
      client.cache.messages.set(newMessage.id, newMessage);
    }

    return [oldMessage, newMessage];
  }),

  /**
   * Message delete event - emitted when a message is deleted.
   * Removes the message from the cache.
   */
  defineEvent("MESSAGE_DELETE", "messageDelete", (client, data) => {
    // Get the cached message before deleting
    const cachedMessage = client.cache.messages?.get?.(data.id);

    // Create a minimal message object if not in cache
    const deletedMessage =
      cachedMessage ||
      Message.from(client, {
        id: data.id,
        channel_id: data.channel_id,
        guild_id: data.guild_id,
      } as MessageCreateEntity);

    // Delete from cache
    if (cachedMessage && client.cache.messages?.delete) {
      client.cache.messages.delete(data.id);
    }

    return [deletedMessage];
  }),

  /**
   * Message delete bulk event - emitted when multiple messages are deleted at once.
   * Removes the messages from the cache.
   */
  defineEvent("MESSAGE_DELETE_BULK", "messageDeleteBulk", (client, data) => {
    const deletedMessages: Message[] = [];
    const ids = (data as MessageDeleteBulkEntity).ids;

    // Collect cached messages before deleting
    if (client.cache.messages?.get && client.cache.messages?.delete) {
      for (const id of ids) {
        const cachedMessage = client.cache.messages.get(id);
        if (cachedMessage) {
          deletedMessages.push(cachedMessage);
          client.cache.messages.delete(id);
        }
      }
    }

    // If no cached messages were found, create minimal objects
    if (deletedMessages.length === 0) {
      for (const id of ids) {
        deletedMessages.push(
          Message.from(client, {
            id,
            channel_id: data.channel_id,
            guild_id: data.guild_id,
          } as MessageCreateEntity),
        );
      }
    }

    return [deletedMessages];
  }),

  /**
   * Message reaction add event - emitted when a reaction is added to a message.
   */
  defineEvent("MESSAGE_REACTION_ADD", "messageReactionAdd", (client, data) => {
    const reaction = {
      userId: data.user_id,
      channelId: data.channel_id,
      messageId: data.message_id,
      guildId: data.guild_id,
      emoji: data.emoji,
      member: data.member
        ? GuildMember.from(client, {
            ...data.member,
            guild_id: data.guild_id,
            user: { id: data.user_id },
          })
        : undefined,
      burst: data.burst,
      burstColors: data.burst_colors,
      type: data.type,
    };

    // Update the cached message to include this reaction
    if (client.cache.messages?.get) {
      const message = client.cache.messages.get(data.message_id);
      if (message?.reactions) {
        // Find or create the reaction
        const emojiKey = data.emoji.id || data.emoji.name;
        if (message.reactions.has(emojiKey)) {
          const existingReaction = message.reactions.get(emojiKey);
          existingReaction.count++;
          existingReaction.me =
            existingReaction.me || client.user?.id === data.user_id;
          existingReaction.users.add(data.user_id);
        } else {
          message.reactions.set(emojiKey, {
            count: 1,
            emoji: data.emoji,
            me: client.user?.id === data.user_id,
            burst: data.burst,
            burstColors: data.burst_colors,
            users: new Set([data.user_id]),
          });
        }
      }
    }

    return [reaction];
  }),

  /**
   * Message reaction remove event - emitted when a reaction is removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE",
    "messageReactionRemove",
    (client, data) => {
      const reaction = {
        userId: data.user_id,
        channelId: data.channel_id,
        messageId: data.message_id,
        guildId: data.guild_id,
        emoji: data.emoji,
        burst: data.burst,
        type: data.type,
      };

      // Update the cached message to remove this reaction
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(data.message_id);
        if (message?.reactions) {
          const emojiKey = data.emoji.id || data.emoji.name;
          const existingReaction = message.reactions.get(emojiKey);

          if (existingReaction) {
            existingReaction.count--;
            existingReaction.me =
              existingReaction.me && client.user?.id !== data.user_id;
            existingReaction.users.delete(data.user_id);

            // Remove the reaction entirely if count is 0
            if (existingReaction.count <= 0) {
              message.reactions.delete(emojiKey);
            }
          }
        }
      }

      return [reaction];
    },
  ),

  /**
   * Message reaction remove all event - emitted when all reactions are removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_ALL",
    "messageReactionRemoveAll",
    (client, data) => {
      const removal = {
        messageId: data.message_id,
        channelId: data.channel_id,
        guildId: data.guild_id,
      };

      // Update the cached message to remove all reactions
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(data.message_id);
        if (message?.reactions) {
          message.reactions.clear();
        }
      }

      return [removal];
    },
  ),

  /**
   * Message reaction remove emoji event - emitted when all reactions of a specific emoji are removed.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_EMOJI",
    "messageReactionRemoveEmoji",
    (client, data) => {
      const removal = {
        messageId: data.message_id,
        channelId: data.channel_id,
        guildId: data.guild_id,
        emoji: data.emoji,
      };

      // Update the cached message to remove all reactions of this emoji
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(data.message_id);
        if (message?.reactions) {
          const emojiKey = data.emoji.id || data.emoji.name;
          message.reactions.delete(emojiKey);
        }
      }

      return [removal];
    },
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
  defineEvent("PRESENCE_UPDATE", "presenceUpdate", (client, data) => {
    // Store the old version before updating
    let oldPresence = null;
    if (client.cache.presences?.get && data.user?.id) {
      const cachedPresence = client.cache.presences.get(data.user.id);
      if (cachedPresence) {
        oldPresence = { ...cachedPresence };
      }
    }

    // Update the cache with new presence
    if (client.cache.presences?.set && data.user?.id) {
      client.cache.presences.set(data.user.id, data);

      // Also update the user in cache if available
      if (client.cache.users?.get && client.cache.users?.set) {
        const cachedUser = client.cache.users.get(data.user.id);
        if (cachedUser && data.user) {
          // Merge the partial user data from presence
          const updatedUser = { ...cachedUser };
          for (const [key, value] of Object.entries(data.user)) {
            if (value !== undefined) {
              updatedUser[key] = value;
            }
          }
          client.cache.users.set(data.user.id, updatedUser);
        }
      }
    }

    return [oldPresence, data];
  }),

  /**
   * Typing start event - emitted when a user starts typing.
   */
  defineEvent("TYPING_START", "typingStart", (client, data) => [
    Typing.from(client, data),
  ]),

  /**
   * User update event - emitted when properties about the current user change.
   * Updates the user in the cache and provides both old and new versions.
   */
  defineEvent("USER_UPDATE", "userUpdate", (client, data) => {
    const newUser = User.from(client, data);

    // Store the old version before updating
    let oldUser: User | null = null;
    const cachedUser = client.cache.users?.get?.(newUser.id);
    if (cachedUser) {
      oldUser = cachedUser.clone?.() || cachedUser;
    }

    // Update the cache with new version
    if (client.cache.users?.set) {
      client.cache.users.set(newUser.id, newUser);
    }

    return [oldUser, newUser];
  }),

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
  defineEvent("VOICE_STATE_UPDATE", "voiceStateUpdate", (client, data) => {
    const newState = VoiceState.from(client, data);
    const voiceStateKey = `${newState.guildId}-${newState.userId}`;

    // Store the old version before updating
    let oldState: VoiceState | null = null;
    const cachedState = client.cache.voiceStates?.get?.(voiceStateKey);

    if (cachedState) {
      oldState = cachedState.clone?.() || cachedState;
    }

    // Handle disconnect scenario
    if (newState.channelId) {
      // Update the cache with new version
      if (client.cache.voiceStates?.set) {
        client.cache.voiceStates.set(voiceStateKey, newState);
      }
    } else {
      // User disconnected from voice, remove from cache
      if (client.cache.voiceStates?.delete) {
        client.cache.voiceStates.delete(voiceStateKey);
      }
    }

    // Update the guild member's voiceState if available
    if (client.cache.members?.get && client.cache.members?.set) {
      const memberKey = `${newState.guildId}-${newState.userId}`;
      const member = client.cache.members.get(memberKey);

      if (member) {
        const updatedMember = member.clone?.() || { ...member };
        updatedMember.voiceState = newState.channelId ? newState : null;
        client.cache.members.set(memberKey, updatedMember);
      }
    }

    return [oldState, newState];
  }),

  /**
   * Voice server update event - emitted when a guild's voice server is updated.
   */
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (client, data) => {
    const server = {
      token: data.token,
      guildId: data.guild_id,
      endpoint: data.endpoint,
    };

    // Store the old server before updating
    let oldServer = null;
    if (client.cache.voiceServers?.get) {
      const cachedServer = client.cache.voiceServers.get(data.guild_id);
      if (cachedServer) {
        oldServer = { ...cachedServer };
      }
    }

    // Update cache
    if (client.cache.voiceServers?.set) {
      client.cache.voiceServers.set(data.guild_id, server);
    }

    return [oldServer, server];
  }),

  /**
   * Webhooks update event - emitted when a guild webhook is created, updated, or deleted.
   */
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (client, data) => [
    Webhook.from(client, data),
  ]),

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
    (client, data) => {
      const stageInstance = StageInstance.from(client, data);
      const key = `${stageInstance.guildId}-${stageInstance.channelId}`;

      // Cache the stage instance
      if (client.cache.stageInstances?.set) {
        client.cache.stageInstances.set(key, stageInstance);
      }

      return [stageInstance];
    },
  ),

  /**
   * Stage instance update event - emitted when a stage instance is updated.
   * Updates the stage instance in the cache and provides both old and new versions.
   */
  defineEvent(
    "STAGE_INSTANCE_UPDATE",
    "stageInstanceUpdate",
    (client, data) => {
      const newStageInstance = StageInstance.from(client, data);
      const key = `${newStageInstance.guildId}-${newStageInstance.channelId}`;

      // Store the old version before updating
      let oldStageInstance: StageInstance | null = null;
      const cachedStageInstance = client.cache.stageInstances?.get?.(key);

      if (cachedStageInstance) {
        oldStageInstance = cachedStageInstance.clone?.() || cachedStageInstance;
      }

      // Update the cache with new version
      if (client.cache.stageInstances?.set) {
        client.cache.stageInstances.set(key, newStageInstance);
      }

      return [oldStageInstance, newStageInstance];
    },
  ),

  /**
   * Stage instance delete event - emitted when a stage instance is deleted.
   * Removes the stage instance from the cache.
   */
  defineEvent(
    "STAGE_INSTANCE_DELETE",
    "stageInstanceDelete",
    (client, data) => {
      const deletedStageInstance = StageInstance.from(client, data);
      const key = `${deletedStageInstance.guildId}-${deletedStageInstance.channelId}`;

      // Get the cached stage instance before deleting
      const cachedStageInstance = client.cache.stageInstances?.get?.(key);

      // Remove from cache
      if (client.cache.stageInstances?.delete) {
        client.cache.stageInstances.delete(key);
      }

      return [cachedStageInstance || deletedStageInstance];
    },
  ),

  /**
   * Subscription create event - emitted when a subscription is created.
   * Adds the subscription to the cache.
   */
  defineEvent("SUBSCRIPTION_CREATE", "subscriptionCreate", (client, data) => {
    const subscription = Subscription.from(client, data);

    // Cache the subscription
    if (client.cache.subscriptions?.set) {
      client.cache.subscriptions.set(subscription.id, subscription);
    }

    return [subscription];
  }),

  /**
   * Subscription update event - emitted when a subscription is updated.
   * Updates the subscription in the cache and provides both old and new versions.
   */
  defineEvent("SUBSCRIPTION_UPDATE", "subscriptionUpdate", (client, data) => {
    const newSubscription = Subscription.from(client, data);

    // Store the old version before updating
    let oldSubscription: Subscription | null = null;
    const cachedSubscription = client.cache.subscriptions?.get?.(
      newSubscription.id,
    );

    if (cachedSubscription) {
      oldSubscription = cachedSubscription.clone?.() || cachedSubscription;
    }

    // Update the cache with new version
    if (client.cache.subscriptions?.set) {
      client.cache.subscriptions.set(newSubscription.id, newSubscription);
    }

    return [oldSubscription, newSubscription];
  }),

  /**
   * Subscription delete event - emitted when a subscription is deleted.
   * Removes the subscription from the cache.
   */
  defineEvent("SUBSCRIPTION_DELETE", "subscriptionDelete", (client, data) => {
    const deletedSubscription = Subscription.from(client, data);

    // Get the cached subscription before deleting
    const cachedSubscription = client.cache.subscriptions?.get?.(
      deletedSubscription.id,
    );

    // Remove from cache
    if (client.cache.subscriptions?.delete) {
      client.cache.subscriptions.delete(deletedSubscription.id);
    }

    return [cachedSubscription || deletedSubscription];
  }),
];

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
];

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
];
