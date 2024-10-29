import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@nyxjs/core";

export class StageInstance {
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
        this.patch(data);
    }

    get channelId() {
        return this.#channelId;
    }

    get discoverableDisabled() {
        return this.#discoverableDisabled;
    }

    get guildId() {
        return this.#guildId;
    }

    get guildScheduledEventId() {
        return this.#guildScheduledEventId;
    }

    get id() {
        return this.#id;
    }

    get privacyLevel() {
        return this.#privacyLevel;
    }

    get topic() {
        return this.#topic;
    }

    patch(data: Partial<StageInstanceStructure>): void {
        if (!data) {
            return;
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#discoverableDisabled = data.discoverable_disabled ?? this.#discoverableDisabled;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#guildScheduledEventId = data.guild_scheduled_event_id ?? this.#guildScheduledEventId;
        this.#id = data.id ?? this.#id;
        this.#privacyLevel = data.privacy_level ?? this.#privacyLevel;
        this.#topic = data.topic ?? this.#topic;
    }

    toJSON(): Partial<StageInstanceStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            discoverable_disabled: this.#discoverableDisabled ?? undefined,
            guild_id: this.#guildId ?? undefined,
            guild_scheduled_event_id: this.#guildScheduledEventId,
            id: this.#id ?? undefined,
            privacy_level: this.#privacyLevel ?? undefined,
            topic: this.#topic ?? undefined,
        };
    }
}
