import type { EmojiEntity, UnavailableGuildEntity } from "@nyxjs/core";
import type {
  GatewayEventHandlers,
  GatewayReceiveEvents,
  GuildCreateEntity,
  GuildEmojisUpdateEntity,
  GuildStickersUpdateEntity,
  PresenceEntity,
} from "@nyxjs/gateway";
import type { RestEventHandlers } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import { camelCase } from "change-case";
import type { Class } from "type-fest";
import {
  AutoModerationRule,
  Ban,
  Channel,
  ChannelPins,
  Emoji,
  Entitlement,
  Guild,
  GuildMember,
  GuildScheduledEvent,
  GuildScheduledEventUser,
  Integration,
  Interaction,
  Invite,
  Message,
  Ready,
  Role,
  SoundboardSound,
  StageInstance,
  Sticker,
  Subscription,
  ThreadListSync,
  ThreadMember,
  Typing,
  UnavailableGuild,
  User,
  VoiceServer,
  VoiceState,
} from "../class/index.js";
import type { Client } from "../core/index.js";
import type { ClientEventHandlers } from "../types/index.js";

interface EventDefinition {
  name: keyof GatewayReceiveEvents;
  handler?: Class<unknown, [client: Client, entity: never]>;
  transform?: (client: Client, entity: never) => unknown;
  validate?: (entity: never) => boolean;
}

const REST_EVENTS: readonly (keyof RestEventHandlers)[] = [
  "debug",
  "error",
  "requestFinish",
  "retryAttempt",
  "rateLimitExceeded",
  "bucketExpired",
  "bucketCreated",
  "bucketUpdated",
];

const GATEWAY_EVENTS: readonly (keyof GatewayEventHandlers)[] = [
  "sessionState",
  "sessionClose",
  "sessionInvalid",
  "healthStatus",
  "shardSpawn",
  "shardDestroy",
  "shardReady",
  "shardDisconnect",
  "shardReconnect",
  "shardResume",
  "shardRateLimit",
  "debug",
  "error",
  "dispatch",
];

const CLIENT_EVENTS: EventDefinition[] = [
  {
    name: "READY",
    handler: Ready,
    validate: (entity: Ready): boolean => Boolean(entity.user),
  },
  {
    name: "RESUMED",
    validate: (entity: boolean): boolean => typeof entity === "boolean",
  },
  {
    name: "AUTO_MODERATION_RULE_CREATE",
    handler: AutoModerationRule,
  },
  {
    name: "AUTO_MODERATION_RULE_UPDATE",
    handler: AutoModerationRule,
  },
  {
    name: "AUTO_MODERATION_RULE_DELETE",
    handler: AutoModerationRule,
  },
  {
    name: "CHANNEL_CREATE",
    handler: Channel,
  },
  {
    name: "CHANNEL_UPDATE",
    handler: Channel,
  },
  {
    name: "CHANNEL_DELETE",
    handler: Channel,
  },
  {
    name: "CHANNEL_PINS_UPDATE",
    handler: ChannelPins,
  },
  {
    name: "THREAD_CREATE",
    handler: Channel,
  },
  {
    name: "THREAD_UPDATE",
    handler: Channel,
  },
  {
    name: "THREAD_DELETE",
    handler: Channel,
  },
  {
    name: "THREAD_LIST_SYNC",
    handler: ThreadListSync,
  },
  {
    name: "THREAD_MEMBER_UPDATE",
    handler: ThreadMember,
  },
  {
    name: "ENTITLEMENT_CREATE",
    handler: Entitlement,
  },
  {
    name: "ENTITLEMENT_UPDATE",
    handler: Entitlement,
  },
  {
    name: "ENTITLEMENT_DELETE",
    handler: Entitlement,
  },
  {
    name: "GUILD_CREATE",
    handler: Guild,
    transform: (
      client,
      entity: GuildCreateEntity | UnavailableGuildEntity,
    ): Guild | UnavailableGuild => {
      if (entity.unavailable) {
        return new UnavailableGuild(client, entity as UnavailableGuildEntity);
      }

      return new Guild(client, entity);
    },
  },
  {
    name: "GUILD_UPDATE",
    handler: Guild,
  },
  {
    name: "GUILD_DELETE",
    handler: Guild,
  },
  {
    name: "GUILD_BAN_ADD",
    handler: Ban,
  },
  {
    name: "GUILD_BAN_REMOVE",
    handler: Ban,
  },
  {
    name: "GUILD_EMOJIS_UPDATE",
    handler: Emoji,
    transform: (client, entity: GuildEmojisUpdateEntity): Emoji[] => {
      const emojis = entity.emojis;
      return emojis.map((emoji) => new Emoji(client, emoji as EmojiEntity));
    },
  },
  {
    name: "GUILD_STICKERS_UPDATE",
    handler: Sticker,
    transform: (client, entity: GuildStickersUpdateEntity): Sticker[] => {
      const stickers = entity.stickers;
      return stickers.map((sticker) => new Sticker(client, sticker));
    },
  },
  {
    name: "GUILD_INTEGRATIONS_UPDATE",
    handler: Integration,
  },
  {
    name: "GUILD_MEMBER_ADD",
    handler: GuildMember,
  },
  {
    name: "GUILD_MEMBER_REMOVE",
    handler: GuildMember,
  },
  {
    name: "GUILD_MEMBER_UPDATE",
    handler: GuildMember,
  },
  {
    name: "GUILD_ROLE_CREATE",
    handler: Role,
  },
  {
    name: "GUILD_ROLE_UPDATE",
    handler: Role,
  },
  {
    name: "GUILD_ROLE_DELETE",
    handler: Role,
  },
  {
    name: "GUILD_SCHEDULED_EVENT_CREATE",
    handler: GuildScheduledEvent,
  },
  {
    name: "GUILD_SCHEDULED_EVENT_UPDATE",
    handler: GuildScheduledEvent,
  },
  {
    name: "GUILD_SCHEDULED_EVENT_DELETE",
    handler: GuildScheduledEvent,
  },
  {
    name: "GUILD_SCHEDULED_EVENT_USER_ADD",
    handler: GuildScheduledEventUser,
  },
  {
    name: "GUILD_SCHEDULED_EVENT_USER_REMOVE",
    handler: GuildScheduledEventUser,
  },
  {
    name: "GUILD_SOUNDBOARD_SOUND_CREATE",
    handler: SoundboardSound,
  },
  {
    name: "GUILD_SOUNDBOARD_SOUND_UPDATE",
    handler: SoundboardSound,
  },
  {
    name: "GUILD_SOUNDBOARD_SOUND_DELETE",
    handler: SoundboardSound,
  },
  {
    name: "INTEGRATION_CREATE",
    handler: Integration,
  },
  {
    name: "INTEGRATION_UPDATE",
    handler: Integration,
  },
  {
    name: "INTEGRATION_DELETE",
    handler: Integration,
  },
  {
    name: "INVITE_CREATE",
    handler: Invite,
  },
  {
    name: "INVITE_DELETE",
    handler: Invite,
  },
  {
    name: "MESSAGE_CREATE",
    handler: Message,
  },
  {
    name: "MESSAGE_UPDATE",
    handler: Message,
  },
  {
    name: "MESSAGE_DELETE",
    handler: Message,
  },
  {
    name: "PRESENCE_UPDATE",
    transform: (entity: unknown) => entity as PresenceEntity,
  },
  {
    name: "TYPING_START",
    handler: Typing,
  },
  {
    name: "USER_UPDATE",
    handler: User,
  },
  {
    name: "VOICE_STATE_UPDATE",
    handler: VoiceState,
  },
  {
    name: "VOICE_SERVER_UPDATE",
    handler: VoiceServer,
  },
  {
    name: "INTERACTION_CREATE",
    handler: Interaction,
  },
  {
    name: "STAGE_INSTANCE_CREATE",
    handler: StageInstance,
  },
  {
    name: "STAGE_INSTANCE_UPDATE",
    handler: StageInstance,
  },
  {
    name: "STAGE_INSTANCE_DELETE",
    handler: StageInstance,
  },
  {
    name: "SUBSCRIPTION_CREATE",
    handler: Subscription,
  },
  {
    name: "SUBSCRIPTION_UPDATE",
    handler: Subscription,
  },
  {
    name: "SUBSCRIPTION_DELETE",
    handler: Subscription,
  },
];

export class ClientEventManager {
  readonly #client: Client;
  readonly #cache = new Store<string, unknown[]>();
  readonly #cacheSize: number;

  constructor(client: Client, options = { cacheSize: 100 }) {
    this.#client = client;
    this.#cacheSize = options.cacheSize;
  }

  initialize(): void {
    this.#initializeRestEvents();
    this.#initializeGatewayEvents();
  }

  clearCache(): void {
    this.#cache.clear();
  }

  #initializeRestEvents(): void {
    const restHandler =
      (event: keyof RestEventHandlers) =>
      (...args: unknown[]): void => {
        this.#client.emit(event, ...(args as never));
      };

    for (const event of REST_EVENTS) {
      this.#client.rest.on(event, restHandler(event));
    }
  }

  #initializeGatewayEvents(): void {
    const gatewayHandler =
      (event: keyof GatewayEventHandlers) =>
      (...args: unknown[]): void => {
        this.#client.emit(event, ...(args as never));
      };

    for (const event of GATEWAY_EVENTS) {
      this.#client.gateway.on(event, gatewayHandler(event));
    }

    this.#client.gateway.on("dispatch", this.#handleDispatchEvent.bind(this));
  }

  #handleDispatchEvent(eventName: string, entity: unknown): void {
    try {
      const eventDefinition = CLIENT_EVENTS.find(
        (def) => def.name === eventName,
      );

      if (!eventDefinition) {
        const camelCaseEvent = camelCase(eventName);
        // @ts-expect-error
        this.#client.emit(camelCaseEvent as keyof ClientEventHandlers, data);
        return;
      }

      let transformedData: unknown;
      if (eventDefinition.transform) {
        transformedData = eventDefinition.transform(
          this.#client,
          entity as never,
        );
      } else if (eventDefinition.handler) {
        transformedData = new eventDefinition.handler(
          this.#client,
          entity as never,
        );
      } else {
        transformedData = entity;
      }

      if (
        eventDefinition.validate &&
        !eventDefinition.validate(transformedData as never)
      ) {
        throw new Error(`Invalid data for event ${eventName}`);
      }

      this.#updateCache(eventName, transformedData);

      const camelCaseEvent = camelCase(eventName) as keyof ClientEventHandlers;

      if (eventName.includes("UPDATE")) {
        const oldData = this.#getFromCache(eventName);
        // @ts-expect-error
        this.#client.emit(camelCaseEvent, oldData, transformedData);
      } else {
        // @ts-expect-error
        this.#client.emit(camelCaseEvent, transformedData);
      }
    } catch (error) {
      throw new Error(`Error handling event ${eventName}`, {
        cause: error,
      });
    }
  }

  #updateCache(eventName: string, entity: unknown): void {
    const cached = this.#cache.get(eventName) || [];
    cached.push(entity);

    if (cached.length > this.#cacheSize) {
      cached.shift();
    }

    this.#cache.set(eventName, cached);
  }

  #getFromCache(eventName: string): unknown {
    const cached = this.#cache.get(eventName);
    return cached ? cached.at(-1) : null;
  }
}
