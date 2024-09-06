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

    public constructor(data: Readonly<Partial<StageInstanceStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<StageInstanceStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if (data.discoverable_disabled !== undefined) {
            this.discoverableDisabled = data.discoverable_disabled;
        }

        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.guild_scheduled_event_id !== undefined) {
            this.guildScheduledEventId = data.guild_scheduled_event_id;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }

        if (data.topic !== undefined) {
            this.topic = data.topic;
        }
    }
}

export { StagePrivacyLevels } from "@nyxjs/api-types";
