import type { Snowflake } from "@nyxjs/core";
import {
  Gateway,
  type GatewayEvents,
  GatewayOptions,
  type GatewayReceiveEvents,
  type UpdatePresenceEntity,
} from "@nyxjs/gateway";
import { Rest, type RestEvents, RestOptions } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "../modals/index.js";

export interface ClientEvents extends RestEvents, GatewayEvents {
  /** Emitted when a debug message is generated */
  debug: [message: string];
  /** Emitted when a warning occurs */
  warn: [message: string];
  /** Emitted when an error occurs */
  error: [error: Error];
  /** The client is ready to start working */
  ready: [ready: unknown];
  /** Response to Resume */
  resumed: [resumed: unknown];
  /** Application command permission was updated */
  applicationCommandPermissionsUpdate: [permissions: unknown];
  /** Auto Moderation rule was created */
  autoModerationRuleCreate: [rule: unknown];
  /** Auto Moderation rule was updated */
  autoModerationRuleUpdate: [oldRule: unknown, newRule: unknown];
  /** Auto Moderation rule was deleted */
  autoModerationRuleDelete: [rule: unknown];
  /** Auto Moderation rule was triggered and an action was executed */
  autoModerationActionExecution: [execution: unknown];
  /** New guild channel created */
  channelCreate: [channel: unknown];
  /** Channel was updated */
  channelUpdate: [oldChannel: unknown, newChannel: unknown];
  /** Channel was deleted */
  channelDelete: [channel: unknown];
  /** Message was pinned or unpinned */
  channelPinsUpdate: [pinUpdate: unknown];
  /** Thread created, also sent when being added to a private thread */
  threadCreate: [thread: unknown];
  /** Thread was updated */
  threadUpdate: [oldThread: unknown, newThread: unknown];
  /** Thread was deleted */
  threadDelete: [thread: unknown];
  /** Sent when gaining access to a channel, contains all active threads in that channel */
  threadListSync: [threads: unknown];
  /** Thread member for the current user was updated */
  threadMemberUpdate: [oldMember: unknown, newMember: unknown];
  /** Some user(s) were added to or removed from a thread */
  threadMembersUpdate: [update: unknown];
  /** Entitlement was created */
  entitlementCreate: [entitlement: unknown];
  /** Entitlement was updated */
  entitlementUpdate: [oldEntitlement: unknown, newEntitlement: unknown];
  /** Entitlement was deleted */
  entitlementDelete: [entitlement: unknown];
  /** Lazy-load for unavailable guild, guild became available, or user joined a new guild */
  guildCreate: [guild: unknown];
  /** Guild was updated */
  guildUpdate: [oldGuild: unknown, newGuild: unknown];
  /** Guild became unavailable, or user left/was removed from a guild */
  guildDelete: [guild: unknown];
  /** A guild audit log entry was created */
  guildAuditLogEntryCreate: [entry: unknown];
  /** User was banned from a guild */
  guildBanAdd: [ban: unknown];
  /** User was unbanned from a guild */
  guildBanRemove: [ban: unknown];
  /** Guild emojis were updated */
  guildEmojisUpdate: [oldEmojis: unknown, newEmojis: unknown];
  /** Guild stickers were updated */
  guildStickersUpdate: [oldStickers: unknown, newStickers: unknown];
  /** Guild integration was updated */
  guildIntegrationsUpdate: [integrations: unknown];
  /** New user joined a guild */
  guildMemberAdd: [member: unknown];
  /** User was removed from a guild */
  guildMemberRemove: [member: unknown];
  /** Guild member was updated */
  guildMemberUpdate: [oldMember: unknown, newMember: unknown];
  /** Response to Request Guild Members */
  guildMembersChunk: [members: unknown];
  /** Guild role was created */
  guildRoleCreate: [role: unknown];
  /** Guild role was updated */
  guildRoleUpdate: [oldRole: unknown, newRole: unknown];
  /** Guild role was deleted */
  guildRoleDelete: [role: unknown];
  /** Guild scheduled event was created */
  guildScheduledEventCreate: [event: unknown];
  /** Guild scheduled event was updated */
  guildScheduledEventUpdate: [oldEvent: unknown, newEvent: unknown];
  /** Guild scheduled event was deleted */
  guildScheduledEventDelete: [event: unknown];
  /** User subscribed to a guild scheduled event */
  guildScheduledEventUserAdd: [subscription: unknown];
  /** User unsubscribed from a guild scheduled event */
  guildScheduledEventUserRemove: [subscription: unknown];
  /** Guild soundboard sound was created */
  guildSoundboardSoundCreate: [sound: unknown];
  /** Guild soundboard sound was updated */
  guildSoundboardSoundUpdate: [oldSound: unknown, newSound: unknown];
  /** Guild soundboard sound was deleted */
  guildSoundboardSoundDelete: [sound: unknown];
  /** Guild soundboard sounds were updated */
  guildSoundboardSoundsUpdate: [sounds: unknown];
  /** Response to Request Soundboard Sounds */
  soundboardSounds: [sounds: unknown];
  /** Guild integration was created */
  integrationCreate: [integration: unknown];
  /** Guild integration was updated */
  integrationUpdate: [oldIntegration: unknown, newIntegration: unknown];
  /** Guild integration was deleted */
  integrationDelete: [integration: unknown];
  /** Invite to a channel was created */
  inviteCreate: [invite: unknown];
  /** Invite to a channel was deleted */
  inviteDelete: [invite: unknown];
  /** Message was created */
  messageCreate: [message: unknown];
  /** Message was edited */
  messageUpdate: [oldMessage: unknown, newMessage: unknown];
  /** Message was deleted */
  messageDelete: [message: unknown];
  /** Multiple messages were deleted at once */
  messageDeleteBulk: [messages: unknown];
  /** User reacted to a message */
  messageReactionAdd: [reaction: unknown];
  /** User removed a reaction from a message */
  messageReactionRemove: [reaction: unknown];
  /** All reactions were explicitly removed from a message */
  messageReactionRemoveAll: [removal: unknown];
  /** All reactions for a given emoji were explicitly removed from a message */
  messageReactionRemoveEmoji: [removal: unknown];
  /** User's presence or info was updated */
  presenceUpdate: [oldPresence: unknown, newPresence: unknown];
  /** User started typing in a channel */
  typingStart: [typing: unknown];
  /** Properties about the user changed */
  userUpdate: [oldUser: User, newUser: User];
  /** Someone sent an effect in a voice channel the current user is connected to */
  voiceChannelEffectSend: [effect: unknown];
  /** Someone joined, left, or moved a voice channel */
  voiceStateUpdate: [oldState: unknown, newState: unknown];
  /** Guild's voice server was updated */
  voiceServerUpdate: [server: unknown];
  /** Guild channel webhook was created, updated, or deleted */
  webhooksUpdate: [webhook: unknown];
  /** User used an interaction, such as an Application Command */
  interactionCreate: [interaction: unknown];
  /** Stage instance was created */
  stageInstanceCreate: [instance: unknown];
  /** Stage instance was updated */
  stageInstanceUpdate: [oldInstance: unknown, newInstance: unknown];
  /** Stage instance was deleted or closed */
  stageInstanceDelete: [instance: unknown];
  /** Premium App Subscription was created */
  subscriptionCreate: [subscription: unknown];
  /** Premium App Subscription was updated */
  subscriptionUpdate: [oldSubscription: unknown, newSubscription: unknown];
  /** Premium App Subscription was deleted */
  subscriptionDelete: [subscription: unknown];
  /** User voted on a poll */
  messagePollVoteAdd: [vote: unknown];
  /** User removed a vote on a poll */
  messagePollVoteRemove: [vote: unknown];
}

interface ClientEventMapping<
  T extends keyof GatewayReceiveEvents,
  S extends keyof ClientEvents,
> {
  gatewayEventName: T;
  clientEventName: S;
  process: (data: GatewayReceiveEvents[T]) => ClientEvents[S];
}

function defineEventMapping<
  T extends keyof GatewayReceiveEvents,
  S extends keyof ClientEvents,
>(
  gatewayEventName: T,
  clientEventName: S,
  process: (data: GatewayReceiveEvents[T]) => ClientEvents[S],
): ClientEventMapping<T, S> {
  return {
    gatewayEventName,
    clientEventName,
    process,
  };
}

export const CLIENT_EVENT_MAPPING = [
  defineEventMapping("READY", "ready", (data) => {
    return [data as unknown];
  }),
  defineEventMapping("MESSAGE_UPDATE", "messageUpdate", (data) => {
    return [data as unknown, data as unknown];
  }),
];

export const ClientCacheOptions = z
  .object({
    /**
     * Whether to enable caching
     * @default true
     */
    enabled: z.boolean().default(true),

    /**
     * Default time-to-live for cache entries in milliseconds
     * 0 = no expiration
     * @default 0
     */
    ttl: z.number().int().nonnegative().default(0),

    /**
     * Maximum number of users to cache
     * @default 10000
     */
    userLimit: z.number().int().positive().default(10000),
  })
  .readonly();

export const ClientOptions = z
  .object({
    ...RestOptions.shape,
    ...GatewayOptions.shape,
    cache: ClientCacheOptions.default({}),
  })
  .readonly();

export type ClientOptions = z.infer<typeof ClientOptions>;

export class Client extends EventEmitter<ClientEvents> {
  readonly #rest: Rest;

  readonly #gateway: Gateway;

  readonly #options: ClientOptions;

  readonly #users: Store<Snowflake, User>;

  constructor(options: ClientOptions) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#rest = new Rest(this.#options);
    this.#gateway = new Gateway(this.#rest, this.#options);

    this.#users = new Store<Snowflake, User>(null, {
      maxSize: this.#options.cache.userLimit,
      ttl: this.#options.cache.ttl,
    });
  }

  get rest(): Rest {
    return this.#rest;
  }

  get gateway(): Gateway {
    return this.#gateway;
  }

  get options(): ClientOptions {
    return this.#options;
  }

  get users(): Store<Snowflake, unknown> {
    return this.#users;
  }

  async connect(): Promise<void> {
    await this.#gateway.connect();
  }

  async destroy(): Promise<void> {
    this.#gateway.destroy();
    await this.#rest.destroy();
    this.removeAllListeners();
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    this.#gateway.updatePresence(presence);
  }

  async fetchUser(
    userId: Snowflake,
    options: { force?: boolean } = {},
  ): Promise<User> {
    if (!options.force) {
      const cachedUser = this.#users.get(userId);
      if (cachedUser) {
        return cachedUser;
      }
    }

    const data = await this.rest.users.getUser(userId);
    const user = new User(this, data);
    this.#users.set(userId, user);
    return user;
  }
}
