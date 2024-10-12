import type { AuditLogEvents } from "@nyxjs/core";
import { GatewayCloseCodes } from "@nyxjs/core";
import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RateLimitInfo } from "@nyxjs/rest";
import type { Client } from "../core";
import type { User } from "../structures";
import { Ready } from "../structures";

type Class<T = unknown> = new (...args: unknown[]) => T;

type ReturnTypes = Class | bigint | boolean | number | object | string | symbol | undefined;

type ClientEventMappingStructure = {
    [client_event_name in keyof Partial<ClientEvents>]: {
        audit_log_event_type?: AuditLogEvents;
        gateway_event_name?: string;
        rest_event_name?: string;
        return?: ReturnTypes[];
    };
};

class ClassInstance<T> {
    public readonly class: Class<T>[];

    public readonly instance: T[];

    public constructor(classes: Class<T>[], ...args: unknown[]) {
        if (!Array.isArray(classes) || classes.some((cls) => typeof cls !== "function")) {
            throw new Error("Invalid class array provided.");
        }

        this.class = classes;
        this.instance = this.#createInstance(...args);
    }

    #createInstance(...args: unknown[]): T[] {
        return this.class.map((Class) => new Class(...args));
    }
}

const ClientEventMapping: ClientEventMappingStructure = {
    close: {
        gateway_event_name: "CLOSE",
        rest_event_name: "CLOSE",
        return: [GatewayCloseCodes, String],
    },
    debug: {
        gateway_event_name: "DEBUG",
        rest_event_name: "DEBUG",
        return: [String],
    },
    error: {
        gateway_event_name: "ERROR",
        rest_event_name: "ERROR",
        return: [Error],
    },
    warn: {
        gateway_event_name: "WARN",
        rest_event_name: "WARN",
        return: [String],
    },
    rateLimit: {
        rest_event_name: "RATE_LIMIT",
        return: [Object],
    },
    ready: {
        gateway_event_name: "READY",
        return: [Ready],
    },
};

export type ClientEvents = {
    applicationCommandPermissionUpdate: [];
    applicationCommandPermissionsUpdate: [];
    autoModerationActionExecute: [];
    autoModerationBlockMessage: [];
    autoModerationFlagToChannel: [];
    autoModerationRuleCreate: [];
    autoModerationRuleDelete: [];
    autoModerationRuleUpdate: [];
    autoModerationUserCommunicationDisabled: [];
    botAdd: [];
    channelCreate: [];
    channelDelete: [];
    channelOverwriteCreate: [];
    channelOverwriteDelete: [];
    channelOverwriteUpdate: [];
    channelPinsUpdate: [];
    channelUpdate: [];
    close: [code: GatewayCloseCodes, reason: string];
    creatorMonetizationRequestCreated: [];
    creatorMonetizationTermsAccepted: [];
    debug: [message: string];
    emojiCreate: [];
    emojiDelete: [];
    emojiUpdate: [];
    entitlementCreate: [];
    entitlementDelete: [];
    entitlementUpdate: [];
    error: [error: Error];
    guildAuditLogEntryCreate: [];
    guildBanAdd: [];
    guildBanRemove: [];
    guildCreate: [];
    guildDelete: [];
    guildEmojisUpdate: [];
    guildIntegrationsUpdate: [];
    guildMemberAdd: [];
    guildMemberRemove: [];
    guildMemberUpdate: [];
    guildRoleCreate: [];
    guildRoleDelete: [];
    guildRoleUpdate: [];
    guildScheduledEventCreate: [];
    guildScheduledEventDelete: [];
    guildScheduledEventUpdate: [];
    guildScheduledEventUserAdd: [];
    guildScheduledEventUserRemove: [];
    guildSoundboardSoundCreate: [];
    guildSoundboardSoundDelete: [];
    guildSoundboardSoundUpdate: [];
    guildSoundboardSoundsUpdate: [];
    guildStickersUpdate: [];
    guildUpdate: [];
    homeSettingsCreate: [];
    homeSettingsUpdate: [];
    integrationCreate: [];
    integrationDelete: [];
    integrationUpdate: [];
    inviteCreate: [];
    inviteDelete: [];
    inviteUpdate: [];
    memberBanAdd: [];
    memberBanRemove: [];
    memberDisconnect: [];
    memberKick: [];
    memberMove: [];
    memberPrune: [];
    memberRoleUpdate: [];
    memberUpdate: [];
    messageBulkDelete: [];
    messageCreate: [];
    messageDelete: [];
    messageDeleteBulk: [];
    messagePin: [];
    messagePollVoteAdd: [];
    messagePollVoteRemove: [];
    messageReactionAdd: [];
    messageReactionRemove: [];
    messageReactionRemoveAll: [];
    messageReactionRemoveEmoji: [];
    messageUnpin: [];
    messageUpdate: [];
    onboardingCreate: [];
    onboardingPromptCreate: [];
    onboardingPromptDelete: [];
    onboardingPromptUpdate: [];
    onboardingUpdate: [];
    presenceUpdate: [];
    rateLimit: [rateLimitInfo: RateLimitInfo];
    ready: [ready: Ready];
    roleCreate: [];
    roleDelete: [];
    roleUpdate: [];
    soundboardSoundCreate: [];
    soundboardSoundDelete: [];
    soundboardSoundUpdate: [];
    stageInstanceCreate: [];
    stageInstanceDelete: [];
    stageInstanceUpdate: [];
    stickerCreate: [];
    stickerDelete: [];
    stickerUpdate: [];
    subscriptionCreate: [];
    subscriptionDelete: [];
    subscriptionUpdate: [];
    threadCreate: [];
    threadDelete: [];
    threadListSync: [];
    threadMemberUpdate: [];
    threadMembersUpdate: [];
    threadUpdate: [];
    typingStart: [];
    userUpdate: [oldUser: User, newUser: User];
    voiceChannelEffectSend: [];
    voiceServerUpdate: [];
    voiceStateUpdate: [];
    warn: [message: string];
    webhookCreate: [];
    webhookDelete: [];
    webhookUpdate: [];
    webhooksUpdate: [];
};

export class ClientEventManager {
    readonly #client: Client;

    public constructor(client: Client) {
        this.#client = client;
    }

    public setupListeners(): void {
        try {
            // Setup listeners for the REST client.
            this.#client.rest.on("DEBUG", (message) => this.#emitEvent("debug", message));
            this.#client.rest.on("ERROR", (error) => this.#emitEvent("error", error));
            this.#client.rest.on("RATE_LIMIT", (info) => this.#emitEvent("rateLimit", info));
            this.#client.rest.on("WARN", (message) => this.#emitEvent("warn", message));

            // Setup listeners for the gateway client.
            this.#client.gateway.on("CLOSE", (code, reason) => this.#emitEvent("close", code, reason));
            this.#client.gateway.on("DEBUG", (message) => this.#emitEvent("debug", message));
            this.#client.gateway.on("ERROR", (error) => this.#emitEvent("error", error));
            this.#client.gateway.on("WARN", (message) => this.#emitEvent("warn", message));
            this.#client.gateway.on("DISPATCH", this.#handleDispatch.bind(this));
        } catch (error) {
            console.error("Error setting up listeners:", error);
        }
    }

    #handleDispatch<K extends keyof GatewayReceiveEvents>(event: K, ...data: GatewayReceiveEvents[K]): void {
        try {
            const eventName = this.#transformEventName(event) as keyof ClientEventMappingStructure;
            const eventMapping = ClientEventMapping[eventName];

            if (!eventMapping) {
                console.warn(`No mapping found for event: ${event}`);
                return;
            }

            if (eventMapping.gateway_event_name) {
                if (eventMapping.return && this.#isClass(eventMapping.return)) {
                    const validClasses = eventMapping.return.filter((item): item is Class<any> => item !== undefined);
                    const classInstance = new ClassInstance(validClasses, ...data);
                    this.#emitEvent(eventName, ...classInstance.instance);
                    return;
                }

                this.#emitEvent(eventName, ...data);
            }
        } catch (error) {
            console.error(`Error handling dispatch for event: ${event}`, error);
        }
    }

    #emitEvent(eventName: keyof ClientEvents, ...args: any[]): void {
        try {
            this.#client.emit(eventName, ...(args as never));
        } catch (error) {
            console.error(`Error emitting event: ${eventName}`, error);
        }
    }

    #transformEventName(event: string): string {
        return event.toLowerCase().replaceAll(/_(?<temp1>[a-z])/g, (substring) => substring[1].toUpperCase());
    }

    #isClass<T>(values: (Class<T> | T)[]): values is Class<T>[] {
        return values.every(
            (value) => typeof value === "function" && value.prototype && value === value.prototype.constructor
        );
    }
}
