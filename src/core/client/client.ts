import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { Gateway, type GatewayEvents, GatewayOptions, gatewayEventKeys } from "../gateway/index.js";
import { Rest, RestOptions } from "../rest/index.js";
import { CacheManager, CacheOptions } from "./cache.manager.js";
import { GatewayEventHandlers } from "./gateway.handler.js";

export const ClientOptions = z.object({
  cache: CacheOptions.prefault({}),
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export interface ClientEvents extends GatewayEvents {
  ready: [ready: unknown];
  resumed: [resumed: unknown];
  applicationCommandPermissionsUpdate: [
    oldApplicationCommandPermissions: unknown,
    newApplicationCommandPermissions: unknown,
  ];
  autoModerationRuleCreate: [autoModerationRule: unknown];
  autoModerationRuleUpdate: [oldAutoModerationRule: unknown, newAutoModerationRule: unknown];
  autoModerationRuleDelete: [autoModerationRule: unknown];
  autoModerationActionExecution: [autoModerationActionExecution: unknown];
  channelCreate: [channel: unknown];
  channelUpdate: [oldChannel: unknown, newChannel: unknown];
  channelDelete: [channel: unknown];
  channelPinsUpdate: [channelPinsUpdate: unknown];
  threadCreate: [thread: unknown];
  threadUpdate: [oldThread: unknown, newThread: unknown];
  threadDelete: [thread: unknown];
  threadListSync: [threadListSync: unknown];
  threadMemberUpdate: [oldThreadMember: unknown, newThreadMember: unknown];
  threadMembersUpdate: [threadMembersUpdate: unknown];
  entitlementCreate: [entitlement: unknown];
  entitlementUpdate: [oldEntitlement: unknown, newEntitlement: unknown];
  entitlementDelete: [entitlement: unknown];
  guildCreate: [guild: unknown];
  guildUpdate: [oldGuild: unknown, newGuild: unknown];
  guildDelete: [guild: unknown];
  guildAuditLogEntryCreate: [guildAuditLogEntry: unknown];
  guildBanAdd: [guildBan: unknown];
  guildBanRemove: [guildBan: unknown];
  guildEmojisUpdate: [oldGuildEmojis: unknown, newGuildEmojis: unknown];
  guildStickersUpdate: [oldGuildStickers: unknown, newGuildStickers: unknown];
  guildIntegrationsUpdate: [guildIntegrationsUpdate: unknown];
  guildMemberAdd: [guildMember: unknown];
  guildMemberRemove: [guildMember: unknown];
  guildMemberUpdate: [oldGuildMember: unknown, newGuildMember: unknown];
  guildMembersChunk: [guildMembersChunk: unknown];
  guildRoleCreate: [guildRole: unknown];
  guildRoleUpdate: [oldGuildRole: unknown, newGuildRole: unknown];
  guildRoleDelete: [guildRole: unknown];
  guildScheduledEventCreate: [guildScheduledEvent: unknown];
  guildScheduledEventUpdate: [oldGuildScheduledEvent: unknown, newGuildScheduledEvent: unknown];
  guildScheduledEventDelete: [guildScheduledEvent: unknown];
  guildScheduledEventUserAdd: [guildScheduledEventUser: unknown];
  guildScheduledEventUserRemove: [guildScheduledEventUser: unknown];
  guildSoundboardSoundCreate: [soundboardSound: unknown];
  guildSoundboardSoundUpdate: [oldSoundboardSound: unknown, newSoundboardSound: unknown];
  guildSoundboardSoundDelete: [soundboardSound: unknown];
  guildSoundboardSoundsUpdate: [oldSoundboardSounds: unknown, newSoundboardSounds: unknown];
  soundboardSounds: [soundboardSounds: unknown];
  integrationCreate: [integration: unknown];
  integrationUpdate: [oldIntegration: unknown, newIntegration: unknown];
  integrationDelete: [integration: unknown];
  inviteCreate: [invite: unknown];
  inviteDelete: [invite: unknown];
  messageCreate: [message: unknown];
  messageUpdate: [oldMessage: unknown, newMessage: unknown];
  messageDelete: [message: unknown];
  messageDeleteBulk: [messageDeleteBulk: unknown];
  messageReactionAdd: [messageReaction: unknown];
  messageReactionRemove: [messageReaction: unknown];
  messageReactionRemoveAll: [messageReactionRemoveAll: unknown];
  messageReactionRemoveEmoji: [messageReactionRemoveEmoji: unknown];
  presenceUpdate: [oldPresence: unknown, newPresence: unknown];
  typingStart: [typingStart: unknown];
  userUpdate: [oldUser: unknown, newUser: unknown];
  voiceChannelEffectSend: [voiceChannelEffect: unknown];
  voiceStateUpdate: [oldVoiceState: unknown, newVoiceState: unknown];
  voiceServerUpdate: [voiceServerUpdate: unknown];
  webhooksUpdate: [webhooksUpdate: unknown];
  interactionCreate: [interaction: unknown];
  stageInstanceCreate: [stageInstance: unknown];
  stageInstanceUpdate: [oldStageInstance: unknown, newStageInstance: unknown];
  stageInstanceDelete: [stageInstance: unknown];
  subscriptionCreate: [subscription: unknown];
  subscriptionUpdate: [oldSubscription: unknown, newSubscription: unknown];
  subscriptionDelete: [subscription: unknown];
  messagePollVoteAdd: [messagePollVote: unknown];
  messagePollVoteRemove: [messagePollVote: unknown];
}

export class Client extends EventEmitter<ClientEvents> {
  readonly rest: Rest;
  readonly gateway: Gateway;
  readonly cache: CacheManager;

  readonly #options: z.infer<typeof ClientOptions>;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }

    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);
    this.cache = new CacheManager(this.rest, this.#options.cache);

    for (const events of gatewayEventKeys) {
      this.gateway.on(events, (...args) => this.emit(events, ...args));
    }

    this.gateway.on("dispatch", (event, data) => {
      const mapping = GatewayEventHandlers.find((m) => m.gatewayEvent === event);
      if (!mapping) {
        return;
      }

      const transformedData = mapping.transform(this, data);
      this.emit(mapping.clientEvent, ...transformedData);
    });
  }

  // biome-ignore lint/suspicious/noConfusingVoidType: The Promise.all returns a tuple of voids, which is intentional here to signal that both the gateway and cache have completed their connection/initialization processes.
  connect(): Promise<[void, void]> {
    return Promise.all([this.gateway.connect(), this.cache.initialize()]);
  }

  async destroy(): Promise<void> {
    this.gateway.destroy();
    await this.rest.destroy();
    this.removeAllListeners();
  }
}
