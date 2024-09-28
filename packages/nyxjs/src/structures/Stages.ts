import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";

export class StageInstance extends BaseStructure<StageInstanceStructure> {
    public channelId: Snowflake;

    /**
     * @deprecated No longer supported by Discord.
     */
    public discoverableDisabled?: boolean;

    public guildId: Snowflake;

    public guildScheduledEventId: Snowflake | null;

    public id: Snowflake;

    public privacyLevel: StagePrivacyLevel;

    public topic: string;

    public constructor(data: Partial<StageInstanceStructure> = {}) {
        super();
        this.channelId = data.channel_id!;
        this.discoverableDisabled = data.discoverable_disabled;
        this.guildId = data.guild_id!;
        this.guildScheduledEventId = data.guild_scheduled_event_id!;
        this.id = data.id!;
        this.privacyLevel = data.privacy_level!;
        this.topic = data.topic!;
    }

    public toJSON(): StageInstanceStructure {
        return {
            channel_id: this.channelId,
            discoverable_disabled: this.discoverableDisabled,
            guild_id: this.guildId,
            guild_scheduled_event_id: this.guildScheduledEventId,
            id: this.id,
            privacy_level: this.privacyLevel,
            topic: this.topic,
        };
    }
}
