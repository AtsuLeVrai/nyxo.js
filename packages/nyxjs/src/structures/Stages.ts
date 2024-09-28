import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@nyxjs/core";
import { Base } from "./Base";

export class StageInstance extends Base<StageInstanceStructure> {
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
}
