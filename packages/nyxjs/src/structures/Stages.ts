import type { StageInstanceStructure, StagePrivacyLevels } from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import { Base } from "./Base";

export class StageInstance extends Base<StageInstanceStructure> {
    public channelId!: Snowflake;

    public discoverableDisabled!: boolean;

    public guildId!: Snowflake;

    public guildScheduledEventId!: Snowflake | null;

    public id!: Snowflake;

    public privacyLevel!: StagePrivacyLevels;

    public topic!: string;

    public constructor(data: Partial<StageInstanceStructure>) {
        super(data);
    }

    protected patch(data: Partial<StageInstanceStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        this.discoverableDisabled = data.discoverable_disabled ?? this.discoverableDisabled;
        this.guildId = data.guild_id ?? this.guildId;
        this.guildScheduledEventId = data.guild_scheduled_event_id ?? this.guildScheduledEventId;
        this.id = data.id ?? this.id;
        this.privacyLevel = data.privacy_level ?? this.privacyLevel;
        this.topic = data.topic ?? this.topic;
    }
}

export { StagePrivacyLevels } from "@nyxjs/api-types";
