import type { AuditLogEvents, GatewayCloseCodes } from "@nyxjs/core";
import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RateLimitInfo } from "@nyxjs/rest";
import type { Client } from "../core";
import {
    type Emoji,
    type Entitlement,
    Ready,
    type Role,
    type SoundboardSound,
    type StageInstance,
    type Sticker,
    type User,
} from "../structures";

type Constructor<T = unknown> = new (...args: any[]) => T;

type ReturnType = Constructor | bigint | boolean | number | object | string | symbol | undefined;

type ClientEventMappingStructure = {
    audit_log_event_type?: AuditLogEvents;
    client_event_name?: keyof Omit<ClientEvents, "close" | "debug" | "error" | "rateLimit" | "warn">;
    gateway_receive_event_name?: keyof GatewayReceiveEvents;
    serialize?(this: void, ...data: any): ReturnType | ReturnType[];
};

function createInstance<T>(constructors: Constructor<T> | Constructor<T>[], ...args: any[]): T[] {
    const constructorsArray = Array.isArray(constructors) ? constructors : [constructors];
    return constructorsArray.map((Constructor) => new Constructor(...args));
}

const CLIENT_EVENT_MAPPING: ClientEventMappingStructure[] = [
    {
        gateway_receive_event_name: "READY",
        client_event_name: "ready",
        serialize: (...data) => createInstance(Ready, ...data),
    },
];

export type ClientEvents = {
    applicationCommandPermissionUpdate: [];
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
    emojiCreate: [emoji: Emoji];
    emojiDelete: [emoji: Emoji];
    emojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
    entitlementCreate: [entitlement: Entitlement];
    entitlementDelete: [entitlement: Entitlement];
    entitlementUpdate: [oldEntitlement: Entitlement, newEntitlement: Entitlement];
    error: [error: Error];
    guildAuditLogEntryCreate: [];
    guildBanAdd: [];
    guildBanRemove: [];
    guildCreate: [];
    guildDelete: [];
    guildMemberAdd: [];
    guildMemberRemove: [];
    guildMemberUpdate: [];
    guildScheduledEventCreate: [];
    guildScheduledEventDelete: [];
    guildScheduledEventUpdate: [];
    guildScheduledEventUserAdd: [];
    guildScheduledEventUserRemove: [];
    guildSoundboardSoundCreate: [];
    guildSoundboardSoundDelete: [];
    guildSoundboardSoundUpdate: [];
    guildUpdate: [];
    homeSettingsCreate: [];
    homeSettingsUpdate: [];
    integrationCreate: [];
    integrationDelete: [];
    integrationUpdate: [];
    inviteCreate: [];
    inviteDelete: [];
    inviteUpdate: [];
    memberDisconnect: [];
    memberKick: [];
    memberMove: [];
    memberPrune: [];
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
    roleCreate: [role: Role];
    roleDelete: [role: Role];
    roleUpdate: [oldRole: Role, newRole: Role];
    soundboardSoundCreate: [soundboard: SoundboardSound];
    soundboardSoundDelete: [soundboard: SoundboardSound];
    soundboardSoundUpdate: [oldSoundboard: SoundboardSound, newSoundboard: SoundboardSound];
    stageInstanceCreate: [stage: StageInstance];
    stageInstanceDelete: [stage: StageInstance];
    stageInstanceUpdate: [oldStage: StageInstance, newStage: StageInstance];
    stickerCreate: [sticker: Sticker];
    stickerDelete: [sticker: Sticker];
    stickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
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
};

export class ClientEventManager {
    readonly #client: Client;

    constructor(client: Client) {
        this.#client = client;
    }

    setupListeners(): void {
        try {
            this.#setupRestListeners();
            this.#setupGatewayListeners();
        } catch (error) {
            this.#client.emit("error", new Error(`An error occurred while setting up listeners: ${error}`));
        }
    }

    #setupRestListeners(): void {
        const { rest } = this.#client;
        rest.on("DEBUG", (message) => this.#client.emit("debug", message));
        rest.on("ERROR", (error) => this.#client.emit("error", error));
        rest.on("RATE_LIMIT", (info) => this.#client.emit("rateLimit", info));
        rest.on("WARN", (message) => this.#client.emit("warn", message));
    }

    #setupGatewayListeners(): void {
        const { gateway } = this.#client;
        gateway.on("CLOSE", (code, reason) => this.#client.emit("close", code, reason));
        gateway.on("DEBUG", (message) => this.#client.emit("debug", message));
        gateway.on("ERROR", (error) => this.#client.emit("error", error));
        gateway.on("WARN", (message) => this.#client.emit("warn", message));
        gateway.on("DISPATCH", this.#handleDispatch.bind(this));
    }

    async #handleDispatch<K extends keyof GatewayReceiveEvents>(
        event: K,
        ...data: GatewayReceiveEvents[K]
    ): Promise<void> {
        const mapping = CLIENT_EVENT_MAPPING.find((mapping) => mapping.gateway_receive_event_name === event);

        if (!mapping) {
            this.#client.emit("warn", `No mapping found for event: ${event}`);
            return;
        }

        const { client_event_name, serialize } = mapping;

        if (client_event_name) {
            const event = client_event_name as keyof ClientEvents;
            const listeners = this.#client.listeners(event);

            if (listeners.length) {
                const serializedData = serialize?.(...data) ?? data;
                this.#client.emit(event, ...(serializedData as ClientEvents[keyof ClientEvents]));

                return;
            }

            this.#client.emit("warn", `No listeners found for event: ${event}`);

            return;
        }

        this.#client.emit("warn", `No client event found for event: ${event}`);
    }
}
