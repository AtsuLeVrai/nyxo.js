import type { AuditLogEvents, GatewayCloseCodes } from "@nyxjs/core";
import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RateLimitInfo } from "@nyxjs/rest";
import type { Client } from "../core";
import type { User } from "../structures";
import { Ready } from "../structures";

type Class<T = unknown> = new (...args: unknown[]) => T;

type ReturnTypes = Class | bigint | boolean | number | object | string | symbol | undefined;

type ClientEventMappingStructure = {
    [client_event_name in keyof Omit<Partial<ClientEvents>, "close" | "debug" | "error" | "rateLimit" | "warn">]: {
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
            this.#setupRestListeners();
            this.#setupGatewayListeners();
        } catch (error) {
            throw new Error(`Error setting up listeners: ${error}`);
        }
    }

    #setupRestListeners(): void {
        const { rest } = this.#client;
        rest.on("DEBUG", (message) => this.#emitEvent("debug", message));
        rest.on("ERROR", (error) => this.#emitEvent("error", error));
        rest.on("RATE_LIMIT", (info) => this.#emitEvent("rateLimit", info));
        rest.on("WARN", (message) => this.#emitEvent("warn", message));
    }

    #setupGatewayListeners(): void {
        const { gateway } = this.#client;
        gateway.on("CLOSE", (code, reason) => this.#emitEvent("close", code, reason));
        gateway.on("DEBUG", (message) => this.#emitEvent("debug", message));
        gateway.on("ERROR", (error) => this.#emitEvent("error", error));
        gateway.on("WARN", (message) => this.#emitEvent("warn", message));
        gateway.on("DISPATCH", this.#handleDispatch.bind(this));
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
                const returnTypes = eventMapping.return;
                if (returnTypes && this.#isClass(returnTypes)) {
                    const validClasses = returnTypes.filter((item): item is Class<any> => item !== undefined);
                    const classInstance = new ClassInstance(validClasses, ...data);
                    this.#emitEvent(eventName, ...classInstance.instance);
                } else {
                    this.#emitEvent(eventName, ...data);
                }
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
        return event.toLowerCase().replaceAll(/_(?<temp1>[a-z])/g, (_, letter) => letter.toUpperCase());
    }

    #isClass<T>(values: (Class<T> | T)[]): values is Class<T>[] {
        return values.every(
            (value) => typeof value === "function" && value.prototype && value === value.prototype.constructor
        );
    }
}
