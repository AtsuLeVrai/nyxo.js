import type { GatewayEvents, GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { CamelCase } from "type-fest";
import type { Client } from "../core/index.js";

export interface ClientEvents extends RestEvents, GatewayEvents {
  ready: () => void;
  resumed: () => void;
  applicationCommandPermissionsUpdate: () => void;
  autoModerationRuleCreate: () => void;
  autoModerationRuleUpdate: () => void;
  autoModerationRuleDelete: () => void;
  autoModerationActionExecution: () => void;
  channelCreate: () => void;
  channelUpdate: () => void;
  channelDelete: () => void;
  channelPinsUpdate: () => void;
  threadCreate: () => void;
  threadUpdate: () => void;
  threadDelete: () => void;
  threadListSync: () => void;
  threadMemberUpdate: () => void;
  threadMembersUpdate: () => void;
  entitlementCreate: () => void;
  entitlementUpdate: () => void;
  entitlementDelete: () => void;
  guildCreate: () => void;
  guildUpdate: () => void;
  guildDelete: () => void;
  guildAuditLogEntryCreate: () => void;
  guildBanAdd: () => void;
  guildBanRemove: () => void;
  guildEmojisUpdate: () => void;
  guildStickersUpdate: () => void;
  guildIntegrationsUpdate: () => void;
  guildMemberAdd: () => void;
  guildMemberRemove: () => void;
  guildMemberUpdate: () => void;
  guildMembersChunk: () => void;
  guildRoleCreate: () => void;
  guildRoleUpdate: () => void;
  guildRoleDelete: () => void;
  guildScheduledEventCreate: () => void;
  guildScheduledEventUpdate: () => void;
  guildScheduledEventDelete: () => void;
  guildScheduledEventUserAdd: () => void;
  guildScheduledEventUserRemove: () => void;
  guildSoundboardSoundCreate: () => void;
  guildSoundboardSoundUpdate: () => void;
  guildSoundboardSoundDelete: () => void;
  guildSoundboardSoundsUpdate: () => void;
  soundboardSounds: () => void;
  integrationCreate: () => void;
  integrationUpdate: () => void;
  integrationDelete: () => void;
  inviteCreate: () => void;
  inviteDelete: () => void;
  messageCreate: () => void;
  messageUpdate: () => void;
  messageDelete: () => void;
  messageDeleteBulk: () => void;
  messageReactionAdd: () => void;
  messageReactionRemove: () => void;
  messageReactionRemoveAll: () => void;
  messageReactionRemoveEmoji: () => void;
  presenceUpdate: () => void;
  typingStart: () => void;
  userUpdate: () => void;
  voiceChannelEffectSend: () => void;
  voiceStateUpdate: () => void;
  voiceServerUpdate: () => void;
  webhooksUpdate: () => void;
  interactionCreate: () => void;
  stageInstanceCreate: () => void;
  stageInstanceUpdate: () => void;
  stageInstanceDelete: () => void;
  subscriptionCreate: () => void;
  subscriptionUpdate: () => void;
  subscriptionDelete: () => void;
  messagePollVoteAdd: () => void;
  messagePollVoteRemove: () => void;
}

const REST_EVENTS = ["debug", "error", "request", "rateLimited"] as Array<
  keyof RestEvents
>;

const GATEWAY_EVENTS = [
  "heartbeatUpdate",
  "sessionUpdate",
  "healthUpdate",
  "shardUpdate",
  "debug",
  "error",
  "dispatch",
] as Array<keyof GatewayEvents>;

const GATEWAY_DISPATCH_EVENTS: [
  keyof GatewayReceiveEvents,
  CamelCase<keyof GatewayReceiveEvents>,
][] = [
  ["READY", "ready"],
  ["RESUMED", "resumed"],
  [
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
  ],
  ["AUTO_MODERATION_RULE_CREATE", "autoModerationRuleCreate"],
  ["AUTO_MODERATION_RULE_UPDATE", "autoModerationRuleUpdate"],
  ["AUTO_MODERATION_RULE_DELETE", "autoModerationRuleDelete"],
  ["AUTO_MODERATION_ACTION_EXECUTION", "autoModerationActionExecution"],
  ["CHANNEL_CREATE", "channelCreate"],
  ["CHANNEL_UPDATE", "channelUpdate"],
  ["CHANNEL_DELETE", "channelDelete"],
  ["CHANNEL_PINS_UPDATE", "channelPinsUpdate"],
  ["THREAD_CREATE", "threadCreate"],
  ["THREAD_UPDATE", "threadUpdate"],
  ["THREAD_DELETE", "threadDelete"],
  ["THREAD_LIST_SYNC", "threadListSync"],
  ["THREAD_MEMBER_UPDATE", "threadMemberUpdate"],
  ["THREAD_MEMBERS_UPDATE", "threadMembersUpdate"],
  ["ENTITLEMENT_CREATE", "entitlementCreate"],
  ["ENTITLEMENT_UPDATE", "entitlementUpdate"],
  ["ENTITLEMENT_DELETE", "entitlementDelete"],
  ["GUILD_CREATE", "guildCreate"],
  ["GUILD_UPDATE", "guildUpdate"],
  ["GUILD_DELETE", "guildDelete"],
  ["GUILD_AUDIT_LOG_ENTRY_CREATE", "guildAuditLogEntryCreate"],
  ["GUILD_BAN_ADD", "guildBanAdd"],
  ["GUILD_BAN_REMOVE", "guildBanRemove"],
  ["GUILD_EMOJIS_UPDATE", "guildEmojisUpdate"],
  ["GUILD_STICKERS_UPDATE", "guildStickersUpdate"],
  ["GUILD_INTEGRATIONS_UPDATE", "guildIntegrationsUpdate"],
  ["GUILD_MEMBER_ADD", "guildMemberAdd"],
  ["GUILD_MEMBER_REMOVE", "guildMemberRemove"],
  ["GUILD_MEMBER_UPDATE", "guildMemberUpdate"],
  ["GUILD_MEMBERS_CHUNK", "guildMembersChunk"],
  ["GUILD_ROLE_CREATE", "guildRoleCreate"],
  ["GUILD_ROLE_UPDATE", "guildRoleUpdate"],
  ["GUILD_ROLE_DELETE", "guildRoleDelete"],
  ["GUILD_SCHEDULED_EVENT_CREATE", "guildScheduledEventCreate"],
  ["GUILD_SCHEDULED_EVENT_UPDATE", "guildScheduledEventUpdate"],
  ["GUILD_SCHEDULED_EVENT_DELETE", "guildScheduledEventDelete"],
  ["GUILD_SCHEDULED_EVENT_USER_ADD", "guildScheduledEventUserAdd"],
  ["GUILD_SCHEDULED_EVENT_USER_REMOVE", "guildScheduledEventUserRemove"],
  ["GUILD_SOUNDBOARD_SOUND_CREATE", "guildSoundboardSoundCreate"],
  ["GUILD_SOUNDBOARD_SOUND_UPDATE", "guildSoundboardSoundUpdate"],
  ["GUILD_SOUNDBOARD_SOUND_DELETE", "guildSoundboardSoundDelete"],
  ["GUILD_SOUNDBOARD_SOUNDS_UPDATE", "guildSoundboardSoundsUpdate"],
  ["SOUNDBOARD_SOUNDS", "soundboardSounds"],
  ["INTEGRATION_CREATE", "integrationCreate"],
  ["INTEGRATION_UPDATE", "integrationUpdate"],
  ["INTEGRATION_DELETE", "integrationDelete"],
  ["INVITE_CREATE", "inviteCreate"],
  ["INVITE_DELETE", "inviteDelete"],
  ["MESSAGE_CREATE", "messageCreate"],
  ["MESSAGE_UPDATE", "messageUpdate"],
  ["MESSAGE_DELETE", "messageDelete"],
  ["MESSAGE_DELETE_BULK", "messageDeleteBulk"],
  ["MESSAGE_REACTION_ADD", "messageReactionAdd"],
  ["MESSAGE_REACTION_REMOVE", "messageReactionRemove"],
  ["MESSAGE_REACTION_REMOVE_ALL", "messageReactionRemoveAll"],
  ["MESSAGE_REACTION_REMOVE_EMOJI", "messageReactionRemoveEmoji"],
  ["PRESENCE_UPDATE", "presenceUpdate"],
  ["TYPING_START", "typingStart"],
  ["USER_UPDATE", "userUpdate"],
  ["VOICE_CHANNEL_EFFECT_SEND", "voiceChannelEffectSend"],
  ["VOICE_STATE_UPDATE", "voiceStateUpdate"],
  ["VOICE_SERVER_UPDATE", "voiceServerUpdate"],
  ["WEBHOOKS_UPDATE", "webhooksUpdate"],
  ["INTERACTION_CREATE", "interactionCreate"],
  ["STAGE_INSTANCE_CREATE", "stageInstanceCreate"],
  ["STAGE_INSTANCE_UPDATE", "stageInstanceUpdate"],
  ["STAGE_INSTANCE_DELETE", "stageInstanceDelete"],
  ["SUBSCRIPTION_CREATE", "subscriptionCreate"],
  ["SUBSCRIPTION_UPDATE", "subscriptionUpdate"],
  ["SUBSCRIPTION_DELETE", "subscriptionDelete"],
  ["MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd"],
  ["MESSAGE_POLL_VOTE_REMOVE", "messagePollVoteRemove"],
] as const;

export class EventHandler {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  handleEvents(): void {
    this.#handleRestEvents();
    this.#handleGatewayEvents();
  }

  #handleRestEvents(): void {
    for (const event of REST_EVENTS) {
      this.#client.rest.on(event, (...args) => {
        this.#client.emit(event, ...args);
      });
    }
  }

  #handleGatewayEvents(): void {
    for (const event of GATEWAY_EVENTS) {
      this.#client.gateway.on(event, (...args) => {
        this.#client.emit(event, ...args);
      });
    }

    this.#client.gateway.on("dispatch", (event, data) => {
      const eventMapping = GATEWAY_DISPATCH_EVENTS.find(
        ([key]) => key === event,
      );
      if (!eventMapping) {
        return;
      }

      const [, eventName] = eventMapping;

      // @ts-ignore
      this.#client.emit(eventName, data as never);
    });
  }
}
