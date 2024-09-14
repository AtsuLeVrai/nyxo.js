import type {
    AutoModerationActionMetadataStructure,
    AutoModerationActionStructure,
    AutoModerationActionTypes,
    AutoModerationEventTypes,
    AutoModerationKeywordPresetTypes,
    AutoModerationRuleStructure,
    AutoModerationTriggerMetadataStructure,
    AutoModerationTriggerTypes,
    Integer,
    Snowflake,
} from "@nyxjs/core";
import { Base } from "./Base";

export class AutoModerationActionMetadata extends Base<AutoModerationActionMetadataStructure> {
    public channelId!: Snowflake;

    public customMessage?: string;

    public durationSeconds!: Integer;

    public constructor(data: Readonly<Partial<AutoModerationActionMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AutoModerationActionMetadataStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if ("custom_message" in data) {
            if (data.custom_message === null) {
                this.customMessage = undefined;
            } else if (data.custom_message !== undefined) {
                this.customMessage = data.custom_message;
            }
        }

        if (data.duration_seconds !== undefined) {
            this.durationSeconds = data.duration_seconds;
        }
    }
}

export class AutoModerationAction extends Base<AutoModerationActionStructure> {
    public metadata?: AutoModerationActionMetadata;

    public type!: AutoModerationActionTypes;

    public constructor(data: Readonly<Partial<AutoModerationActionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AutoModerationActionStructure>>): void {
        if ("metadata" in data) {
            if (data.metadata === null) {
                this.metadata = undefined;
            } else if (data.metadata !== undefined) {
                this.metadata = AutoModerationActionMetadata.from(data.metadata);
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class AutoModerationTriggerMetadata extends Base<AutoModerationTriggerMetadataStructure> {
    public allowList?: string[];

    public keywordFilter?: string[];

    public mentionRaidProtectionEnabled?: boolean;

    public mentionTotalLimit?: Integer;

    public presets?: AutoModerationKeywordPresetTypes[];

    public regexPatterns?: string[];

    public constructor(data: Readonly<Partial<AutoModerationTriggerMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AutoModerationTriggerMetadataStructure>>): void {
        if ("allow_list" in data) {
            if (data.allow_list === null) {
                this.allowList = undefined;
            } else if (data.allow_list !== undefined) {
                this.allowList = data.allow_list;
            }
        }

        if ("keyword_filter" in data) {
            if (data.keyword_filter === null) {
                this.keywordFilter = undefined;
            } else if (data.keyword_filter !== undefined) {
                this.keywordFilter = data.keyword_filter;
            }
        }

        if ("mention_raid_protection_enabled" in data) {
            if (data.mention_raid_protection_enabled === null) {
                this.mentionRaidProtectionEnabled = undefined;
            } else if (data.mention_raid_protection_enabled !== undefined) {
                this.mentionRaidProtectionEnabled = data.mention_raid_protection_enabled;
            }
        }

        if ("mention_total_limit" in data) {
            if (data.mention_total_limit === null) {
                this.mentionTotalLimit = undefined;
            } else if (data.mention_total_limit !== undefined) {
                this.mentionTotalLimit = data.mention_total_limit;
            }
        }

        if ("presets" in data) {
            if (data.presets === null) {
                this.presets = undefined;
            } else if (data.presets !== undefined) {
                this.presets = data.presets;
            }
        }

        if ("regex_patterns" in data) {
            if (data.regex_patterns === null) {
                this.regexPatterns = undefined;
            } else if (data.regex_patterns !== undefined) {
                this.regexPatterns = data.regex_patterns;
            }
        }
    }
}

export class AutoModerationRule extends Base<AutoModerationRuleStructure> {
    public actions!: AutoModerationAction[];

    public creatorId!: Snowflake;

    public enabled!: boolean;

    public eventType!: AutoModerationEventTypes;

    public exemptChannels?: Snowflake[];

    public exemptRoles?: Snowflake[];

    public guildId!: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public triggerMetadata!: AutoModerationTriggerMetadata;

    public triggerType!: AutoModerationTriggerTypes;

    public constructor(data: Readonly<Partial<AutoModerationRuleStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AutoModerationRuleStructure>>): void {
        if (data.actions !== undefined) {
            this.actions = data.actions.map((action) => AutoModerationAction.from(action));
        }

        if (data.creator_id !== undefined) {
            this.creatorId = data.creator_id;
        }

        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }

        if (data.event_type !== undefined) {
            this.eventType = data.event_type;
        }

        if ("exempt_channels" in data) {
            if (data.exempt_channels === null) {
                this.exemptChannels = undefined;
            } else if (data.exempt_channels !== undefined) {
                this.exemptChannels = data.exempt_channels;
            }
        }

        if ("exempt_roles" in data) {
            if (data.exempt_roles === null) {
                this.exemptRoles = undefined;
            } else if (data.exempt_roles !== undefined) {
                this.exemptRoles = data.exempt_roles;
            }
        }

        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.trigger_metadata !== undefined) {
            this.triggerMetadata = AutoModerationTriggerMetadata.from(data.trigger_metadata);
        }

        if (data.trigger_type !== undefined) {
            this.triggerType = data.trigger_type;
        }
    }
}
