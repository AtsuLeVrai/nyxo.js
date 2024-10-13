import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@nyxjs/core";

export class StageInstance {
    public channelId!: Snowflake;

    /**
     * @deprecated No longer supported by Discord.
     */
    public discoverableDisabled?: boolean;

    public guildId!: Snowflake;

    public guildScheduledEventId!: Snowflake | null;

    public id!: Snowflake;

    public privacyLevel!: StagePrivacyLevel;

    public topic!: string;

    public constructor(data: Partial<StageInstanceStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<StageInstanceStructure>): void {
        if (data.channel_id) this.channelId = data.channel_id;
        if (data.discoverable_disabled) this.discoverableDisabled = data.discoverable_disabled;
        if (data.guild_id) this.guildId = data.guild_id;
        if (data.guild_scheduled_event_id) this.guildScheduledEventId = data.guild_scheduled_event_id;
        if (data.id) this.id = data.id;
        if (data.privacy_level) this.privacyLevel = data.privacy_level;
        if (data.topic) this.topic = data.topic;
    }
}
