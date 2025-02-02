import type { GatewayEvents, GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type { CamelCase, Class } from "type-fest";
import { z } from "zod";
import { User } from "../classes/index.js";
import type { Client } from "../core/index.js";
import { CacheManager, CacheOptions } from "../managers/index.js";

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
  (
    | Class<unknown, [client: Client, data: never]>
    | Class<unknown, [client: Client, data: never]>[]
    | undefined
  ),
][] = [
  ["READY", "ready", undefined],
  ["RESUMED", "resumed", undefined],
  [
    "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
    "applicationCommandPermissionsUpdate",
    undefined,
  ],
  ["AUTO_MODERATION_RULE_CREATE", "autoModerationRuleCreate", undefined],
  ["AUTO_MODERATION_RULE_UPDATE", "autoModerationRuleUpdate", undefined],
  ["AUTO_MODERATION_RULE_DELETE", "autoModerationRuleDelete", undefined],
  [
    "AUTO_MODERATION_ACTION_EXECUTION",
    "autoModerationActionExecution",
    undefined,
  ],
  ["CHANNEL_CREATE", "channelCreate", undefined],
  ["CHANNEL_UPDATE", "channelUpdate", undefined],
  ["CHANNEL_DELETE", "channelDelete", undefined],
  ["CHANNEL_PINS_UPDATE", "channelPinsUpdate", undefined],
  ["THREAD_CREATE", "threadCreate", undefined],
  ["THREAD_UPDATE", "threadUpdate", undefined],
  ["THREAD_DELETE", "threadDelete", undefined],
  ["THREAD_LIST_SYNC", "threadListSync", undefined],
  ["THREAD_MEMBER_UPDATE", "threadMemberUpdate", undefined],
  ["THREAD_MEMBERS_UPDATE", "threadMembersUpdate", undefined],
  ["ENTITLEMENT_CREATE", "entitlementCreate", undefined],
  ["ENTITLEMENT_UPDATE", "entitlementUpdate", undefined],
  ["ENTITLEMENT_DELETE", "entitlementDelete", undefined],
  ["GUILD_CREATE", "guildCreate", undefined],
  ["GUILD_UPDATE", "guildUpdate", undefined],
  ["GUILD_DELETE", "guildDelete", undefined],
  ["GUILD_AUDIT_LOG_ENTRY_CREATE", "guildAuditLogEntryCreate", undefined],
  ["GUILD_BAN_ADD", "guildBanAdd", undefined],
  ["GUILD_BAN_REMOVE", "guildBanRemove", undefined],
  ["GUILD_EMOJIS_UPDATE", "guildEmojisUpdate", undefined],
  ["GUILD_STICKERS_UPDATE", "guildStickersUpdate", undefined],
  ["GUILD_INTEGRATIONS_UPDATE", "guildIntegrationsUpdate", undefined],
  ["GUILD_MEMBER_ADD", "guildMemberAdd", undefined],
  ["GUILD_MEMBER_REMOVE", "guildMemberRemove", undefined],
  ["GUILD_MEMBER_UPDATE", "guildMemberUpdate", undefined],
  ["GUILD_MEMBERS_CHUNK", "guildMembersChunk", undefined],
  ["GUILD_ROLE_CREATE", "guildRoleCreate", undefined],
  ["GUILD_ROLE_UPDATE", "guildRoleUpdate", undefined],
  ["GUILD_ROLE_DELETE", "guildRoleDelete", undefined],
  ["GUILD_SCHEDULED_EVENT_CREATE", "guildScheduledEventCreate", undefined],
  ["GUILD_SCHEDULED_EVENT_UPDATE", "guildScheduledEventUpdate", undefined],
  ["GUILD_SCHEDULED_EVENT_DELETE", "guildScheduledEventDelete", undefined],
  ["GUILD_SCHEDULED_EVENT_USER_ADD", "guildScheduledEventUserAdd", undefined],
  [
    "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    "guildScheduledEventUserRemove",
    undefined,
  ],
  ["GUILD_SOUNDBOARD_SOUND_CREATE", "guildSoundboardSoundCreate", undefined],
  ["GUILD_SOUNDBOARD_SOUND_UPDATE", "guildSoundboardSoundUpdate", undefined],
  ["GUILD_SOUNDBOARD_SOUND_DELETE", "guildSoundboardSoundDelete", undefined],
  ["GUILD_SOUNDBOARD_SOUNDS_UPDATE", "guildSoundboardSoundsUpdate", undefined],
  ["SOUNDBOARD_SOUNDS", "soundboardSounds", undefined],
  ["INTEGRATION_CREATE", "integrationCreate", undefined],
  ["INTEGRATION_UPDATE", "integrationUpdate", undefined],
  ["INTEGRATION_DELETE", "integrationDelete", undefined],
  ["INVITE_CREATE", "inviteCreate", undefined],
  ["INVITE_DELETE", "inviteDelete", undefined],
  ["MESSAGE_CREATE", "messageCreate", undefined],
  ["MESSAGE_UPDATE", "messageUpdate", undefined],
  ["MESSAGE_DELETE", "messageDelete", undefined],
  ["MESSAGE_DELETE_BULK", "messageDeleteBulk", undefined],
  ["MESSAGE_REACTION_ADD", "messageReactionAdd", undefined],
  ["MESSAGE_REACTION_REMOVE", "messageReactionRemove", undefined],
  ["MESSAGE_REACTION_REMOVE_ALL", "messageReactionRemoveAll", undefined],
  ["MESSAGE_REACTION_REMOVE_EMOJI", "messageReactionRemoveEmoji", undefined],
  ["PRESENCE_UPDATE", "presenceUpdate", undefined],
  ["TYPING_START", "typingStart", undefined],
  ["USER_UPDATE", "userUpdate", User],
  ["VOICE_CHANNEL_EFFECT_SEND", "voiceChannelEffectSend", undefined],
  ["VOICE_STATE_UPDATE", "voiceStateUpdate", undefined],
  ["VOICE_SERVER_UPDATE", "voiceServerUpdate", undefined],
  ["WEBHOOKS_UPDATE", "webhooksUpdate", undefined],
  ["INTERACTION_CREATE", "interactionCreate", undefined],
  ["STAGE_INSTANCE_CREATE", "stageInstanceCreate", undefined],
  ["STAGE_INSTANCE_UPDATE", "stageInstanceUpdate", undefined],
  ["STAGE_INSTANCE_DELETE", "stageInstanceDelete", undefined],
  ["SUBSCRIPTION_CREATE", "subscriptionCreate", undefined],
  ["SUBSCRIPTION_UPDATE", "subscriptionUpdate", undefined],
  ["SUBSCRIPTION_DELETE", "subscriptionDelete", undefined],
  ["MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd", undefined],
  ["MESSAGE_POLL_VOTE_REMOVE", "messagePollVoteRemove", undefined],
] as const;

export const EventOptions = z
  .object({
    once: z.boolean().default(false),
    maxListeners: z.number().positive().default(10),
    ...CacheOptions.shape,
  })
  .strict();

type EventOptions = z.infer<typeof EventOptions>;

function isClass<T>(value: unknown): value is Class<T> {
  if (typeof value !== "function") {
    return false;
  }
  if (!value.prototype?.constructor) {
    return false;
  }
  if (Function.prototype.toString.call(value).startsWith("class ")) {
    return true;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype !== Function.prototype;
}

export class EventHandler {
  readonly #client: Client;
  readonly #options: EventOptions;
  readonly #caches = new Map<string, CacheManager<string, unknown>>();

  constructor(client: Client, options: Partial<EventOptions> = {}) {
    this.#client = client;

    try {
      this.#options = EventOptions.parse(options);
    } catch (error) {
      throw new Error(`Invalid event handler options: ${error}`);
    }
  }

  initializeEvents(): void {
    for (const event of REST_EVENTS) {
      this.#setupRestEvent(event);
    }

    for (const event of GATEWAY_EVENTS) {
      this.#setupGatewayEvent(event);
    }

    for (const [, clientEvent, DataClass] of GATEWAY_DISPATCH_EVENTS) {
      if (DataClass) {
        this.#caches.set(
          clientEvent,
          new CacheManager({
            expiresIn: this.#options.expiresIn,
            maxSize: this.#options.maxSize,
          }),
        );
      }
    }
  }

  #setupRestEvent(event: keyof RestEvents): void {
    this.#client.rest.on(event, (...args) => {
      this.#client.emit(event, ...args);
    });
  }

  #setupGatewayEvent(event: keyof GatewayEvents): void {
    this.#client.gateway.on(event, (...args) => {
      this.#client.emit(event, ...args);
    });

    if (event === "dispatch") {
      this.#client.gateway.on(event, (dispatch, data) => {
        this.#handleDispatchEvent(dispatch, data);
      });
    }
  }

  #handleDispatchEvent<T extends keyof GatewayReceiveEvents>(
    event: T,
    data: GatewayReceiveEvents[T],
  ): void {
    const eventMapping = GATEWAY_DISPATCH_EVENTS.find(([key]) => key === event);
    if (!eventMapping) {
      return;
    }

    const [, clientEvent, DataClass] = eventMapping;
    let processedData = data as object;

    if (DataClass) {
      if (Array.isArray(DataClass)) {
        for (const ClassType of DataClass) {
          processedData = new ClassType(this.#client, data as never) as object;
          break;
        }
      } else if (isClass(DataClass)) {
        processedData = new DataClass(this.#client, data as never) as object;
      }

      if ("id" in processedData) {
        const cache = this.#caches.get(clientEvent);
        if (cache) {
          cache.add(processedData.id as string, processedData);
        }
      }
    }

    // @ts-expect-error
    this.#client.emit(clientEvent, processedData as never);
  }
}
