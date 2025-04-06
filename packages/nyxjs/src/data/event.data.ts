import type {
  AnyChannelEntity,
  BanEntity,
  IntegrationEntity,
  InviteEntity,
  Snowflake,
} from "@nyxjs/core";
import type {
  GatewayEvents,
  GatewayReceiveEvents,
  GuildCreateEntity,
  GuildMemberAddEntity,
  GuildScheduledEventUserAddEntity,
  GuildScheduledEventUserRemoveEntity,
  MessageCreateEntity,
  MessageDeleteBulkEntity,
  MessageReactionAddEntity,
  MessageReactionRemoveAllEntity,
  MessageReactionRemoveEmojiEntity,
  MessageReactionRemoveEntity,
  VoiceServerUpdateEntity,
} from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import {
  type AnyChannel,
  type AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  ChannelPins,
  Entitlement,
  Guild,
  GuildAuditLogEntry,
  GuildBan,
  GuildEmojisUpdate,
  GuildMember,
  GuildMembersChunk,
  GuildRoleDelete,
  GuildRoleUpdate,
  GuildScheduledEvent,
  GuildSoundboardSoundDelete,
  GuildStickersUpdate,
  Integration,
  Invite,
  Message,
  MessagePollVote,
  Ready,
  Role,
  SoundboardSound,
  SoundboardSounds,
  StageInstance,
  Subscription,
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
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (client, data) => [
    ChannelPins.from(client, data),
  ]),

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
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (client, data) => [
    ThreadListSync.from(client, data),
  ]),

  /**
   * Thread member update event - emitted when a thread member is updated.
   * First parameter is always null since we don't have the previous state.
   */
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (client, data) => {
    const threadMember = ThreadMember.from(client, data);

    // Composite key for thread members could be implemented here
    // Example: client.cache.threadMembers?.set(`${threadMember.threadId}-${threadMember.userId}`, threadMember);

    return [null, threadMember];
  }),

  /**
   * Thread members update event - emitted when multiple thread members are updated.
   */
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (client, data) => [ThreadMembers.from(client, data)],
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

    // Optional: Cache all related entities like channels, members, roles
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

    // Remove from cache
    if (client.cache.guilds?.delete) {
      client.cache.guilds.delete(guild.id);
    }

    // Optional: Remove all related entities
    // This would require maintaining relationships or performing cache sweeps

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

    // Optional: Cache bans
    // if (client.cache.bans?.set) {
    //   client.cache.bans.set(`${ban.guildId}-${ban.user.id}`, ban);
    // }

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

    // Optional: Remove from bans cache
    // if (client.cache.bans?.delete) {
    //   client.cache.bans.delete(`${ban.guildId}-${ban.user.id}`);
    // }

    return [ban];
  }),

  /**
   * Guild emojis update event - emitted when a guild's emojis are updated.
   * First parameter is always null since we don't have the previous state.
   */
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", (client, data) => {
    const emojisUpdate = GuildEmojisUpdate.from(client, data);

    // Cache all emojis
    if (client.cache.emojis?.set && emojisUpdate.emojis) {
      for (const emoji of emojisUpdate.emojis) {
        client.cache.emojis.set(emoji.id, emoji);
      }
    }

    return [null, emojisUpdate];
  }),

  /**
   * Guild stickers update event - emitted when a guild's stickers are updated.
   * First parameter is always null since we don't have the previous state.
   */
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (client, data) => {
      const stickersUpdate = GuildStickersUpdate.from(client, data);

      // Cache all stickers
      if (client.cache.stickers?.set && stickersUpdate.stickers) {
        for (const sticker of stickersUpdate.stickers) {
          client.cache.stickers.set(sticker.id, sticker);
        }
      }

      return [null, stickersUpdate];
    },
  ),

  /**
   * Guild integrations update event - emitted when a guild's integrations are updated.
   */
  defineEvent(
    "GUILD_INTEGRATIONS_UPDATE",
    "guildIntegrationsUpdate",
    (client, data) => {
      const integration = Integration.from(
        client,
        data as IntegrationEntity & { guild_id: Snowflake },
      );

      return [integration];
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

    // Remove the member from cache
    if (client.cache.members?.delete) {
      client.cache.members.delete(`${member.guildId}-${member.user.id}`);
    }

    return [member];
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
    const membersChunk = GuildMembersChunk.from(client, data);

    // Cache all members in the chunk
    if (client.cache.members?.set && membersChunk.members) {
      for (const member of membersChunk.members) {
        client.cache.members.set(
          `${membersChunk.guildId}-${member.user.id}`,
          member,
        );

        // Also cache the user
        if (client.cache.users?.set && member.user) {
          client.cache.users.set(member.user.id, member.user);
        }
      }
    }

    return [membersChunk];
  }),

  /**
   * Guild role create event - emitted when a guild role is created.
   * Adds the role to the cache.
   */
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => {
    const roleCreate = Role.from(client, {
      guild_id: data.guild_id,
      ...data.role,
    });

    // Cache the role
    if (client.cache.roles?.set && roleCreate) {
      client.cache.roles.set(roleCreate.id, roleCreate);
    }

    return [roleCreate];
  }),

  /**
   * Guild role update event - emitted when a guild role is updated.
   * Updates the role in the cache.
   */
  defineEvent("GUILD_ROLE_UPDATE", "guildRoleUpdate", (client, data) => {
    const roleUpdate = GuildRoleUpdate.from(client, data);

    // Store the old version before updating
    let oldRole = null;
    if (roleUpdate.role && client.cache.roles?.get) {
      const cachedRole = client.cache.roles.get(roleUpdate.role.id);
      if (cachedRole) {
        oldRole = cachedRole.clone?.() || cachedRole;
      }
    }

    // Update the cache with new version
    if (client.cache.roles?.set && roleUpdate.role) {
      client.cache.roles.set(roleUpdate.role.id, roleUpdate.role);
    }

    return [oldRole, roleUpdate];
  }),

  /**
   * Guild role delete event - emitted when a guild role is deleted.
   * Removes the role from the cache.
   */
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) => {
    const roleDelete = GuildRoleDelete.from(client, data);

    // Remove the role from cache
    if (client.cache.roles?.delete && roleDelete.roleId) {
      client.cache.roles.delete(roleDelete.roleId);
    }

    return [roleDelete];
  }),

  /**
   * Guild scheduled event create event - emitted when a scheduled event is created.
   * Adds the event to the cache.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (client, data) => {
      const scheduledEvent = GuildScheduledEvent.from(
        client,
        data as GuildScheduledEventCreateEntity,
      );

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
      const newScheduledEvent = GuildScheduledEvent.from(
        client,
        data as GuildScheduledEventUpdateEntity,
      );

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
      const deletedEvent = GuildScheduledEvent.from(
        client,
        data as GuildScheduledEventDeleteEntity,
      );

      // Remove from cache
      if (client.cache.scheduledEvents?.delete) {
        client.cache.scheduledEvents.delete(deletedEvent.id);
      }

      return [deletedEvent];
    },
  ),

  /**
   * Guild scheduled event user add event - emitted when a user subscribes to an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_ADD",
    "guildScheduledEventUserAdd",
    (client, data) => {
      // Optional: Could track user subscriptions in a specialized cache
      return [data as GuildScheduledEventUserAddEntity];
    },
  ),

  /**
   * Guild scheduled event user remove event - emitted when a user unsubscribes from an event.
   */
  defineEvent(
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    (client, data) => {
      // Optional: Could remove user from subscription cache
      return [data as GuildScheduledEventUserRemoveEntity];
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
      if (client.cache.sounds?.set) {
        client.cache.sounds.set(sound.id, sound);
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
      if (client.cache.sounds?.get) {
        const cachedSound = client.cache.sounds.get(newSound.id);
        if (cachedSound) {
          oldSound = cachedSound.clone?.() || cachedSound;
        }
      }

      // Update the cache with new version
      if (client.cache.sounds?.set) {
        client.cache.sounds.set(newSound.id, newSound);
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
      const deletedSound = GuildSoundboardSoundDelete.from(client, data);

      // Remove from cache
      if (client.cache.sounds?.delete) {
        client.cache.sounds.delete(deletedSound.soundId);
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
    (client, data) => [SoundboardSounds.from(client, data)],
  ),

  /**
   * Soundboard sounds event - emitted for soundboard sounds.
   */
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (client, data) => [
    SoundboardSounds.from(client, data),
  ]),

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
    const integration = Integration.from(
      client,
      data as IntegrationEntity & { guild_id: Snowflake },
    );

    // Remove from cache
    if (client.cache.integrations?.delete) {
      client.cache.integrations.delete(integration.id);
    }

    return [integration];
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
    const invite = Invite.from(
      client,
      data as unknown as InviteEntity & { guild_id?: Snowflake },
    );

    // Remove from cache
    if (client.cache.invites?.delete) {
      client.cache.invites.delete(invite.code);
    }

    return [invite];
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

    // Optional: Also cache the author if it's a user
    if (message.author && client.cache.users?.set) {
      client.cache.users.set(message.author.id, message.author);
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
    const deletedMessage = Message.from(client, data as MessageCreateEntity);

    // Get the cached message before deleting
    const cachedMessage = client.cache.messages?.get?.(deletedMessage.id);

    // Delete from cache
    if (cachedMessage && client.cache.messages?.delete) {
      client.cache.messages.delete(deletedMessage.id);
    }

    // Return the cached message if available, otherwise the partial delete data
    return [cachedMessage || deletedMessage];
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

    return [
      {
        ids,
        messages: deletedMessages,
        channelId: (data as MessageDeleteBulkEntity).channel_id,
      },
    ];
  }),

  /**
   * Message reaction add event - emitted when a reaction is added to a message.
   */
  defineEvent("MESSAGE_REACTION_ADD", "messageReactionAdd", (client, data) => {
    const reactionData = data as MessageReactionAddEntity;

    // Optional: Update the cached message to include this reaction
    if (client.cache.messages?.get) {
      const message = client.cache.messages.get(reactionData.message_id);
      if (message?.addReaction) {
        message.addReaction(reactionData.emoji, reactionData.user_id);
      }
    }

    return [reactionData];
  }),

  /**
   * Message reaction remove event - emitted when a reaction is removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE",
    "messageReactionRemove",
    (client, data) => {
      const reactionData = data as MessageReactionRemoveEntity;

      // Optional: Update the cached message to remove this reaction
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(reactionData.message_id);
        if (message?.removeReaction) {
          message.removeReaction(reactionData.emoji, reactionData.user_id);
        }
      }

      return [reactionData];
    },
  ),

  /**
   * Message reaction remove all event - emitted when all reactions are removed from a message.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_ALL",
    "messageReactionRemoveAll",
    (client, data) => {
      const removeAllData = data as MessageReactionRemoveAllEntity;

      // Optional: Update the cached message to remove all reactions
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(removeAllData.message_id);
        if (message?.clearReactions) {
          message.clearReactions();
        }
      }

      return [removeAllData];
    },
  ),

  /**
   * Message reaction remove emoji event - emitted when all reactions of a specific emoji are removed.
   */
  defineEvent(
    "MESSAGE_REACTION_REMOVE_EMOJI",
    "messageReactionRemoveEmoji",
    (client, data) => {
      const removeEmojiData = data as MessageReactionRemoveEmojiEntity;

      // Optional: Update the cached message to remove all reactions of this emoji
      if (client.cache.messages?.get) {
        const message = client.cache.messages.get(removeEmojiData.message_id);
        if (message?.clearReactionsForEmoji) {
          message.clearReactionsForEmoji(removeEmojiData.emoji);
        }
      }

      return [removeEmojiData];
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
    const newPresence = Presence.from(client, data as PresenceUpdateEntity);

    // Store the old version before updating
    let oldPresence = null;
    if (client.cache.presences?.get && newPresence.user) {
      const cachedPresence = client.cache.presences.get(newPresence.user.id);
      if (cachedPresence) {
        oldPresence = cachedPresence.clone?.() || cachedPresence;
      }
    }

    // Update the cache with new version
    if (client.cache.presences?.set && newPresence.user) {
      client.cache.presences.set(newPresence.user.id, newPresence);

      // Also update the user in cache if available
      if (client.cache.users?.get && client.cache.users?.set) {
        const cachedUser = client.cache.users.get(newPresence.user.id);
        if (cachedUser && newPresence.user) {
          // Only update partial user data from presence
          const updatedUser = cachedUser.clone();
          updatedUser.update(newPresence.user);
          client.cache.users.set(updatedUser.id, updatedUser);
        }
      }
    }

    return [oldPresence, newPresence];
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

    // Store the old version before updating
    let oldState: VoiceState | null = null;
    const cachedState = client.cache.voiceStates?.get?.(
      `${newState.guildId}-${newState.userId}`,
    );

    if (cachedState) {
      oldState = cachedState.clone?.() || cachedState;
    }

    // Handle disconnect scenario
    if (newState.channelId) {
      // Update the cache with new version
      if (client.cache.voiceStates?.set) {
        client.cache.voiceStates.set(
          `${newState.guildId}-${newState.userId}`,
          newState,
        );
      }
    } else {
      // User disconnected from voice, remove from cache
      if (client.cache.voiceStates?.delete) {
        client.cache.voiceStates.delete(
          `${newState.guildId}-${newState.userId}`,
        );
      }
    }

    return [oldState, newState];
  }),

  /**
   * Voice server update event - emitted when a guild's voice server is updated.
   */
  defineEvent("VOICE_SERVER_UPDATE", "voiceServerUpdate", (client, data) => [
    VoiceServerUpdate.from(client, data as VoiceServerUpdateEntity),
  ]),

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

      // Cache the stage instance
      if (client.cache.stageInstances?.set) {
        client.cache.stageInstances.set(
          `${stageInstance.guildId}-${stageInstance.channelId}`,
          stageInstance,
        );
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

      // Store the old version before updating
      let oldStageInstance: StageInstance | null = null;
      const cachedStageInstance = client.cache.stageInstances?.get?.(
        `${newStageInstance.guildId}-${newStageInstance.channelId}`,
      );

      if (cachedStageInstance) {
        oldStageInstance = cachedStageInstance.clone?.() || cachedStageInstance;
      }

      // Update the cache with new version
      if (client.cache.stageInstances?.set) {
        client.cache.stageInstances.set(
          `${newStageInstance.guildId}-${newStageInstance.channelId}`,
          newStageInstance,
        );
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

      // Remove from cache
      if (client.cache.stageInstances?.delete) {
        client.cache.stageInstances.delete(
          `${deletedStageInstance.guildId}-${deletedStageInstance.channelId}`,
        );
      }

      return [deletedStageInstance];
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

    // Remove from cache
    if (client.cache.subscriptions?.delete) {
      client.cache.subscriptions.delete(deletedSubscription.id);
    }

    return [deletedSubscription];
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
