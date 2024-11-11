import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@nyxjs/core";
import { Base } from "./Base.js";

export interface StageInstanceSchema {
    readonly channelId: Snowflake | null;
    /**
     * @deprecated No longer supported by Discord.
     */
    readonly discoverableDisabled: boolean | null;
    readonly guildId: Snowflake | null;
    readonly guildScheduledEventId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly privacyLevel: StagePrivacyLevel | null;
    readonly topic: string | null;
}

export class StageInstance extends Base<StageInstanceStructure, StageInstanceSchema> implements StageInstanceSchema {
    #channelId: Snowflake | null = null;
    /**
     * @deprecated No longer supported by Discord.
     */
    #discoverableDisabled: boolean | null = null;
    #guildId: Snowflake | null = null;
    #guildScheduledEventId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #privacyLevel: StagePrivacyLevel | null = null;
    #topic: string | null = null;

    constructor(data: Partial<StageInstanceStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get discoverableDisabled(): boolean | null {
        return this.#discoverableDisabled;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get guildScheduledEventId(): Snowflake | null {
        return this.#guildScheduledEventId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get privacyLevel(): StagePrivacyLevel | null {
        return this.#privacyLevel;
    }

    get topic(): string | null {
        return this.#topic;
    }

    static from(data: Partial<StageInstanceStructure>): StageInstance {
        return new StageInstance(data);
    }

    patch(data: Partial<StageInstanceStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#discoverableDisabled = Boolean(data.discoverable_disabled ?? this.#discoverableDisabled);
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#guildScheduledEventId = data.guild_scheduled_event_id ?? this.#guildScheduledEventId;
        this.#id = data.id ?? this.#id;
        this.#privacyLevel = data.privacy_level ?? this.#privacyLevel;
        this.#topic = data.topic ?? this.#topic;
    }

    toJson(): Partial<StageInstanceStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            discoverable_disabled: this.#discoverableDisabled ?? undefined,
            guild_id: this.#guildId ?? undefined,
            guild_scheduled_event_id: this.#guildScheduledEventId ?? undefined,
            id: this.#id ?? undefined,
            privacy_level: this.#privacyLevel ?? undefined,
            topic: this.#topic ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): StageInstanceSchema {
        return {
            channelId: this.#channelId,
            discoverableDisabled: this.#discoverableDisabled,
            guildId: this.#guildId,
            guildScheduledEventId: this.#guildScheduledEventId,
            id: this.#id,
            privacyLevel: this.#privacyLevel,
            topic: this.#topic,
        };
    }

    clone(): StageInstance {
        return new StageInstance(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#discoverableDisabled = null;
        this.#guildId = null;
        this.#guildScheduledEventId = null;
        this.#id = null;
        this.#privacyLevel = null;
        this.#topic = null;
    }

    equals(other: Partial<StageInstance>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#discoverableDisabled === other.discoverableDisabled &&
                this.#guildId === other.guildId &&
                this.#guildScheduledEventId === other.guildScheduledEventId &&
                this.#id === other.id &&
                this.#privacyLevel === other.privacyLevel &&
                this.#topic === other.topic,
        );
    }
}
