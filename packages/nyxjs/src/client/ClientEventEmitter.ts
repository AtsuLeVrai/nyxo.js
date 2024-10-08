import { GatewayCloseCodes } from "@nyxjs/core";
import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RateLimitInfo } from "@nyxjs/rest";
import type { Client } from "./Client";

type Class<T = any> = new (...args: any[]) => T;

type ReturnTypes = Class | bigint | boolean | number | object | string | symbol | undefined;

type ClientEventMappingStructure = {
    [client_event_name in keyof Partial<ClientEvents>]: {
        audit_log_event_name?: string;
        gateway_event_name?: string;
        rest_event_name?: string;
        return?: ReturnTypes[];
    };
};

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
    ready: [];
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
    userUpdate: [];
    voiceChannelEffectSend: [];
    voiceServerUpdate: [];
    voiceStateUpdate: [];
    warn: [message: string];
    webhookCreate: [];
    webhookDelete: [];
    webhookUpdate: [];
    webhooksUpdate: [];
};

export class ClientEventEmitter {
    readonly #client: Client;

    public constructor(client: Client) {
        this.#client = client;
    }

    public setupListeners(): void {
        /**
         * Setup listeners for the REST client.
         */
        this.#client.rest.on("DEBUG", (message) => this.#client.emit("debug", message));
        this.#client.rest.on("ERROR", (error) => this.#client.emit("error", error));
        this.#client.rest.on("RATE_LIMIT", (info) => this.#client.emit("rateLimit", info));
        this.#client.rest.on("WARN", (message) => this.#client.emit("warn", message));

        /**
         * Setup listeners for the gateway client.
         */
        this.#client.gateway.on("CLOSE", (code, reason) => this.#client.emit("close", code, reason));
        this.#client.gateway.on("DEBUG", (message) => this.#client.emit("debug", message));
        this.#client.gateway.on("ERROR", (error) => this.#client.emit("error", error));
        this.#client.gateway.on("WARN", (message) => this.#client.emit("warn", message));
        this.#client.gateway.on("DISPATCH", this.#handleDispatch.bind(this));
    }

    #handleDispatch<K extends keyof GatewayReceiveEvents>(event: K, ...data: GatewayReceiveEvents[K]): void {
        throw new Error("Not implemented");
    }
}
