/*
import type { Client } from "../client/Client";
import type { ClientEvents } from "../client/ClientEvents";

type EventHandler<K extends keyof ClientEvents> = (this: Client, ...args: ClientEvents[K]) => Promise<void> | void;

type ClassConstructor<T> = new (data: any) => T;

export const EVENT_CLASS_MAPPING: Partial<{
    [K in keyof ClientEvents]: ClassConstructor<ClientEvents[K]>;
}> = {
    warn: [String],
};

export function transformEventData<K extends keyof ClientEvents>(event: K, data: any): ClientEvents[K] {
    const ClassConstructor = EVENT_CLASS_MAPPING[event];
    if (ClassConstructor) {
        return new ClassConstructor(data);
    }

    return data;
}

export class ClientEventManager {
    readonly #client: Client;

    readonly #handlers: Map<string, EventHandler<any>>;

    public constructor(client: Client) {
        this.#client = client;
        this.#handlers = new Map();
    }

    public static from(client: Client): ClientEventManager {
        return new ClientEventManager(client);
    }

    public on<K extends keyof ClientEvents>(event: K, handler: EventHandler<K>): this {
        this.#handlers.set(event, handler);
        this.#client.on(event, async (...args: ClientEvents[K]) => {
            await handler.apply(this.#client, args);
        });

        return this;
    }

    public off<K extends keyof ClientEvents>(event: K): this {
        const handler = this.#handlers.get(event as string);
        if (handler) {
            this.#client.off(event, handler);
            this.#handlers.delete(event as string);
        }

        return this;
    }

    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean {
        return this.#client.emit(event, ...(args as never));
    }
}
*/
import type { Client } from "../client/Client";
import type { ClientEvents } from "../types/Client";

export const GATEWAY_EVENTS = [
    ["APPLICATION_COMMAND_PERMISSIONS_UPDATE", "applicationCommandPermissionsUpdate"],
    ["AUTO_MODERATION_ACTION_EXECUTION", "autoModerationActionExecution"],
    ["AUTO_MODERATION_RULE_CREATE", "autoModerationRuleCreate"],
    ["AUTO_MODERATION_RULE_DELETE", "autoModerationRuleDelete"],
    ["AUTO_MODERATION_RULE_UPDATE", "autoModerationRuleUpdate"],
    ["CHANNEL_CREATE", "channelCreate"],
    ["CHANNEL_DELETE", "channelDelete"],
    ["CHANNEL_PINS_UPDATE", "channelPinsUpdate"],
    ["CHANNEL_UPDATE", "channelUpdate"],
    ["ENTITLEMENT_CREATE", "entitlementCreate"],
    ["ENTITLEMENT_DELETE", "entitlementDelete"],
    ["ENTITLEMENT_UPDATE", "entitlementUpdate"],
    ["GUILD_AUDIT_LOG_ENTRY_CREATE", "guildAuditLogEntryCreate"],
    ["GUILD_BAN_ADD", "guildBanAdd"],
    ["GUILD_BAN_REMOVE", "guildBanRemove"],
    ["GUILD_CREATE", "guildCreate"],
    ["GUILD_DELETE", "guildDelete"],
    ["GUILD_EMOJIS_UPDATE", "guildEmojisUpdate"],
    ["GUILD_INTEGRATIONS_UPDATE", "guildIntegrationsUpdate"],
    ["GUILD_MEMBERS_CHUNK", "guildMembersChunk"],
    ["GUILD_MEMBER_ADD", "guildMemberAdd"],
    ["GUILD_MEMBER_REMOVE", "guildMemberRemove"],
    ["GUILD_MEMBER_UPDATE", "guildMemberUpdate"],
    ["GUILD_ROLE_CREATE", "guildRoleCreate"],
    ["GUILD_ROLE_DELETE", "guildRoleDelete"],
    ["GUILD_ROLE_UPDATE", "guildRoleUpdate"],
    ["GUILD_SCHEDULED_EVENT_CREATE", "guildScheduledEventCreate"],
    ["GUILD_SCHEDULED_EVENT_DELETE", "guildScheduledEventDelete"],
    ["GUILD_SCHEDULED_EVENT_UPDATE", "guildScheduledEventUpdate"],
    ["GUILD_SCHEDULED_EVENT_USER_ADD", "guildScheduledEventUserAdd"],
    ["GUILD_SCHEDULED_EVENT_USER_REMOVE", "guildScheduledEventUserRemove"],
    ["GUILD_STICKERS_UPDATE", "guildStickersUpdate"],
    ["GUILD_UPDATE", "guildUpdate"],
    ["INTEGRATION_CREATE", "integrationCreate"],
    ["INTEGRATION_DELETE", "integrationDelete"],
    ["INTEGRATION_UPDATE", "integrationUpdate"],
    ["INTERACTION_CREATE", "interactionCreate"],
    ["INVITE_CREATE", "inviteCreate"],
    ["INVITE_DELETE", "inviteDelete"],
    ["MESSAGE_CREATE", "messageCreate"],
    ["MESSAGE_DELETE", "messageDelete"],
    ["MESSAGE_DELETE_BULK", "messageDeleteBulk"],
    ["MESSAGE_POLL_VOTE_ADD", "messagePollVoteAdd"],
    ["MESSAGE_POLL_VOTE_REMOVE", "messagePollVoteRemove"],
    ["MESSAGE_REACTION_ADD", "messageReactionAdd"],
    ["MESSAGE_REACTION_REMOVE", "messageReactionRemove"],
    ["MESSAGE_REACTION_REMOVE_ALL", "messageReactionRemoveAll"],
    ["MESSAGE_REACTION_REMOVE_EMOJI", "messageReactionRemoveEmoji"],
    ["MESSAGE_UPDATE", "messageUpdate"],
    ["PRESENCE_UPDATE", "presenceUpdate"],
    ["READY", "ready"],
    ["STAGE_INSTANCE_CREATE", "stageInstanceCreate"],
    ["STAGE_INSTANCE_DELETE", "stageInstanceDelete"],
    ["STAGE_INSTANCE_UPDATE", "stageInstanceUpdate"],
    ["SUBSCRIPTION_CREATE", "subscriptionCreate"],
    ["SUBSCRIPTION_DELETE", "subscriptionDelete"],
    ["SUBSCRIPTION_UPDATE", "subscriptionUpdate"],
    ["THREAD_CREATE", "threadCreate"],
    ["THREAD_DELETE", "threadDelete"],
    ["THREAD_LIST_SYNC", "threadListSync"],
    ["THREAD_MEMBERS_UPDATE", "threadMembersUpdate"],
    ["THREAD_MEMBER_UPDATE", "threadMemberUpdate"],
    ["TYPING_START", "typingStart"],
    ["USER_UPDATE", "userUpdate"],
    ["VOICE_CHANNEL_EFFECT_SEND", "voiceChannelEffectSend"],
    ["VOICE_SERVER_UPDATE", "voiceServerUpdate"],
    ["VOICE_STATE_UPDATE", "voiceStateUpdate"],
    ["WEBHOOKS_UPDATE", "webhooksUpdate"],
];

export class ClientEventManager {
    readonly #client: Client;

    public constructor(client: Client) {
        this.#client = client;
    }

    public setupListeners(): void {
        this.#client.ws.on("dispatch", (eventName, ...args) => {
            for (const [gatewayEvent, clientEvent] of GATEWAY_EVENTS) {
                if (eventName === gatewayEvent) {
                    this.#client.emit(clientEvent as keyof ClientEvents, ...(args as ClientEvents[keyof ClientEvents]));
                }
            }
        });

        this.#client.ws.on("debug", (message) => this.#client.emit("debug", message));
        this.#client.ws.on("error", (error) => this.#client.emit("error", error));
        this.#client.ws.on("warn", (message) => this.#client.emit("warn", message));
        this.#client.ws.on("close", (code, reason) => this.#client.emit("close", code, reason));
    }
}
