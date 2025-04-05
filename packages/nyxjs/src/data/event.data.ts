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
  MessageCreateEntity,
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
  GuildRoleCreate,
  GuildRoleDelete,
  GuildRoleUpdate,
  GuildSoundboardSoundDelete,
  GuildStickersUpdate,
  Integration,
  Invite,
  Message,
  MessagePollVote,
  Ready,
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
  defineEvent(
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    (_client, data) => [data],
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_CREATE",
    "autoModerationRuleCreate",
    (client, data) => {
      const autoModerationRule = AutoModerationRule.from(client, data);
      if (client.autoModerationRules?.set) {
        client.autoModerationRules.set(
          autoModerationRule.guildId,
          autoModerationRule,
        );
      }

      return [autoModerationRule];
    },
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_UPDATE",
    "autoModerationRuleUpdate",
    (client, data) => {
      const newAutoModerationRule = AutoModerationRule.from(client, data);

      let oldAutoModerationRule: AutoModerationRule | null = null;
      const cachedAutoModerationRule = client.autoModerationRules?.get?.(
        newAutoModerationRule.guildId,
      );
      if (cachedAutoModerationRule) {
        oldAutoModerationRule =
          cachedAutoModerationRule.clone?.() || cachedAutoModerationRule;
      }

      if (client.autoModerationRules?.set) {
        client.autoModerationRules.set(
          newAutoModerationRule.guildId,
          newAutoModerationRule,
        );
      }

      return [oldAutoModerationRule, newAutoModerationRule];
    },
  ),
  defineEvent(
    "AUTO_MODERATION_RULE_DELETE",
    "autoModerationRuleDelete",
    (client, data) => {
      const deletedAutoModerationRule = AutoModerationRule.from(client, data);

      const cachedAutoModerationRule = client.autoModerationRules?.get?.(
        deletedAutoModerationRule.guildId,
      );
      if (cachedAutoModerationRule && client.autoModerationRules?.delete) {
        client.autoModerationRules.delete(deletedAutoModerationRule.guildId);
      }

      return [deletedAutoModerationRule];
    },
  ),
  defineEvent(
    "AUTO_MODERATION_ACTION_EXECUTION",
    "autoModerationActionExecution",
    (client, data) => [AutoModerationActionExecution.from(client, data)],
  ),
  defineEvent("CHANNEL_CREATE", "channelCreate", (client, data) => {
    const channel = ChannelFactory.create(client, data);
    if (client.channels?.set) {
      client.channels.set(channel.id, channel);
    }

    return [channel];
  }),
  defineEvent("CHANNEL_UPDATE", "channelUpdate", (client, data) => {
    const newChannel = ChannelFactory.create(client, data);

    let oldChannel: AnyChannel | null = null;
    const cachedChannel = client.channels?.get?.(newChannel.id);
    if (cachedChannel) {
      oldChannel = cachedChannel.clone?.() || cachedChannel;
    }

    if (client.channels?.set) {
      client.channels.set(newChannel.id, newChannel);
    }

    return [oldChannel, newChannel];
  }),
  defineEvent("CHANNEL_DELETE", "channelDelete", (client, data) => {
    const deletedChannel = ChannelFactory.create(client, data);

    const cachedChannel = client.channels?.get?.(deletedChannel.id);
    if (cachedChannel && client.channels?.delete) {
      client.channels.delete(deletedChannel.id);
    }

    return [deletedChannel];
  }),
  defineEvent("CHANNEL_PINS_UPDATE", "channelPinsUpdate", (client, data) => [
    ChannelPins.from(client, data),
  ]),
  defineEvent("THREAD_CREATE", "threadCreate", (client, data) => {
    const thread = ChannelFactory.create(client, data);
    if (client.channels?.set) {
      client.channels.set(thread.id, thread);
    }

    return [thread as AnyThreadChannel];
  }),
  defineEvent("THREAD_UPDATE", "threadUpdate", (client, data) => {
    const newThread = ChannelFactory.create(client, data);

    let oldThread: AnyThreadChannel | null = null;
    const cachedThread = client.channels?.get?.(
      newThread.id,
    ) as AnyThreadChannel;
    if (cachedThread) {
      oldThread = cachedThread.clone?.() || cachedThread;
    }

    if (client.channels?.set) {
      client.channels.set(newThread.id, newThread);
    }

    return [oldThread, newThread as AnyThreadChannel];
  }),
  defineEvent("THREAD_DELETE", "threadDelete", (client, data) => {
    const deletedThread = ChannelFactory.create(
      client,
      data as AnyChannelEntity,
    );

    const cachedThread = client.channels?.get?.(
      deletedThread.id,
    ) as AnyThreadChannel;
    if (cachedThread && client.channels?.delete) {
      client.channels.delete(deletedThread.id);
    }

    return [deletedThread as AnyThreadChannel];
  }),
  defineEvent("THREAD_LIST_SYNC", "threadListSync", (client, data) => [
    ThreadListSync.from(client, data),
  ]),
  defineEvent("THREAD_MEMBER_UPDATE", "threadMemberUpdate", (client, data) => [
    null,
    ThreadMember.from(client, data),
  ]),
  defineEvent(
    "THREAD_MEMBERS_UPDATE",
    "threadMembersUpdate",
    (client, data) => [ThreadMembers.from(client, data)],
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
  defineEvent("GUILD_DELETE", "guildDelete", (client, data) => {
    const guild = Guild.from(client, data as GuildCreateEntity);
    if (client.guilds?.delete) {
      client.guilds.delete(guild.id);
    }
    return [guild];
  }),
  defineEvent(
    "GUILD_AUDIT_LOG_ENTRY_CREATE",
    "guildAuditLogEntryCreate",
    (client, data) => [GuildAuditLogEntry.from(client, data)],
  ),
  defineEvent("GUILD_BAN_ADD", "guildBanAdd", (client, data) => [
    GuildBan.from(client, data as BanEntity & { guild_id: Snowflake }),
  ]),
  defineEvent("GUILD_BAN_REMOVE", "guildBanRemove", (client, data) => [
    GuildBan.from(client, data as BanEntity & { guild_id: Snowflake }),
  ]),
  defineEvent("GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", (client, data) => [
    null,
    GuildEmojisUpdate.from(client, data),
  ]),
  defineEvent(
    "GUILD_STICKERS_UPDATE",
    "guildStickersUpdate",
    (client, data) => [null, GuildStickersUpdate.from(client, data)],
  ),
  defineEvent(
    "GUILD_INTEGRATIONS_UPDATE",
    "guildIntegrationsUpdate",
    (client, data) => [
      Integration.from(
        client,
        data as IntegrationEntity & { guild_id: Snowflake },
      ),
    ],
  ),
  defineEvent("GUILD_MEMBER_ADD", "guildMemberAdd", (client, data) => [
    GuildMember.from(client, data),
  ]),
  defineEvent("GUILD_MEMBER_REMOVE", "guildMemberRemove", (client, data) => [
    GuildMember.from(client, data as GuildMemberAddEntity),
  ]),
  defineEvent("GUILD_MEMBER_UPDATE", "guildMemberUpdate", (client, data) => [
    null,
    GuildMember.from(client, data as GuildMemberAddEntity),
  ]),
  defineEvent("GUILD_MEMBERS_CHUNK", "guildMembersChunk", (client, data) => [
    GuildMembersChunk.from(client, data),
  ]),
  defineEvent("GUILD_ROLE_CREATE", "guildRoleCreate", (client, data) => [
    GuildRoleCreate.from(client, data),
  ]),
  defineEvent("GUILD_ROLE_UPDATE", "guildRoleUpdate", (client, data) => [
    null,
    GuildRoleUpdate.from(client, data),
  ]),
  defineEvent("GUILD_ROLE_DELETE", "guildRoleDelete", (client, data) => [
    GuildRoleDelete.from(client, data),
  ]),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_CREATE",
    "guildScheduledEventCreate",
    (_client, data) => [data],
  ),
  defineEvent(
    "GUILD_SCHEDULED_EVENT_UPDATE",
    "guildScheduledEventUpdate",
    (_client, data) => [null, data],
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
    (client, data) => [SoundboardSound.from(client, data)],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_UPDATE",
    "guildSoundboardSoundUpdate",
    (client, data) => [null, SoundboardSound.from(client, data)],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUND_DELETE",
    "guildSoundboardSoundDelete",
    (client, data) => [GuildSoundboardSoundDelete.from(client, data)],
  ),
  defineEvent(
    "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
    "guildSoundboardSoundsUpdate",
    (client, data) => [SoundboardSounds.from(client, data)],
  ),
  defineEvent("SOUNDBOARD_SOUNDS", "soundboardSounds", (client, data) => [
    SoundboardSounds.from(client, data),
  ]),
  defineEvent("INTEGRATION_CREATE", "integrationCreate", (client, data) => [
    Integration.from(client, data),
  ]),
  defineEvent("INTEGRATION_UPDATE", "integrationUpdate", (client, data) => [
    null,
    Integration.from(client, data),
  ]),
  defineEvent("INTEGRATION_DELETE", "integrationDelete", (client, data) => [
    Integration.from(
      client,
      data as IntegrationEntity & { guild_id: Snowflake },
    ),
  ]),
  defineEvent("INVITE_CREATE", "inviteCreate", (client, data) => [
    Invite.from(
      client,
      data as unknown as InviteEntity & { guild_id?: Snowflake },
    ),
  ]),
  defineEvent("INVITE_DELETE", "inviteDelete", (client, data) => [
    Invite.from(
      client,
      data as unknown as InviteEntity & { guild_id?: Snowflake },
    ),
  ]),
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
  defineEvent("MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd", (client, data) => [
    MessagePollVote.from(client, data),
  ]),
  defineEvent(
    "MESSAGE_POLL_VOTE_REMOVE",
    "messagePollVoteRemove",
    (client, data) => [MessagePollVote.from(client, data)],
  ),
  defineEvent("PRESENCE_UPDATE", "presenceUpdate", (_client, data) => {
    return [null, data];
  }),
  defineEvent("TYPING_START", "typingStart", (client, data) => [
    Typing.from(client, data),
  ]),
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
    (client, data) => [VoiceChannelEffectSend.from(client, data)],
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
  defineEvent("WEBHOOKS_UPDATE", "webhooksUpdate", (client, data) => [
    Webhook.from(client, data),
  ]),
  defineEvent("INTERACTION_CREATE", "interactionCreate", (client, data) => [
    InteractionFactory.create(client, data),
  ]),
  defineEvent(
    "STAGE_INSTANCE_CREATE",
    "stageInstanceCreate",
    (client, data) => {
      const stageInstance = StageInstance.from(client, data);
      if (client.stageInstances?.set) {
        client.stageInstances.set(stageInstance.guildId, stageInstance);
      }

      return [stageInstance];
    },
  ),
  defineEvent(
    "STAGE_INSTANCE_UPDATE",
    "stageInstanceUpdate",
    (client, data) => {
      const newStageInstance = StageInstance.from(client, data);

      let oldStageInstance: StageInstance | null = null;
      const cachedStageInstance = client.stageInstances?.get?.(
        newStageInstance.guildId,
      );
      if (cachedStageInstance) {
        oldStageInstance = cachedStageInstance.clone?.() || cachedStageInstance;
      }

      if (client.stageInstances?.set) {
        client.stageInstances.set(newStageInstance.guildId, newStageInstance);
      }

      return [oldStageInstance, newStageInstance];
    },
  ),
  defineEvent(
    "STAGE_INSTANCE_DELETE",
    "stageInstanceDelete",
    (client, data) => {
      const deletedStageInstance = StageInstance.from(client, data);

      const cachedStageInstance = client.stageInstances?.get?.(
        deletedStageInstance.guildId,
      );
      if (cachedStageInstance && client.stageInstances?.delete) {
        client.stageInstances.delete(deletedStageInstance.guildId);
      }

      return [deletedStageInstance];
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
