import type { Integer, Snowflake } from "@nyxjs/core";
import type {
    AutoModerationActionMetadataStructure,
    AutoModerationActionStructure,
    AutoModerationActionTypes,
    AutoModerationEventTypes,
    AutoModerationKeywordPresetTypes,
    AutoModerationRuleStructure,
    AutoModerationTriggerMetadataStructure,
    AutoModerationTriggerTypes,
} from "@nyxjs/rest";
import { Base } from "./Base";

export class AutoModerationActionMetadata extends Base<AutoModerationActionMetadataStructure> {
    public channelId!: Snowflake;

    public customMessage?: string;

    public durationSeconds!: Integer;

    public constructor(data: Partial<AutoModerationActionMetadataStructure>) {
        super(data);
    }

    public patch(data: Partial<AutoModerationActionMetadataStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        if ("custom_message" in data) {
            this.customMessage = data.custom_message;
        }

        this.durationSeconds = data.duration_seconds ?? this.durationSeconds;
    }
}

export class AutoModerationAction extends Base<AutoModerationActionStructure> {
    public metadata?: AutoModerationActionMetadata;

    public type!: AutoModerationActionTypes;

    public constructor(data: Partial<AutoModerationActionStructure>) {
        super(data);
    }

    public patch(data: Partial<AutoModerationActionStructure>): void {
        if ("metadata" in data && data.metadata) {
            this.metadata = AutoModerationActionMetadata.from(data.metadata);
        }

        this.type = data.type ?? this.type;
    }
}

export class AutoModerationTriggerMetadata extends Base<AutoModerationTriggerMetadataStructure> {
    public allowList?: string[];

    public keywordFilter?: string[];

    public mentionRaidProtectionEnabled?: boolean;

    public mentionTotalLimit?: Integer;

    public presets?: AutoModerationKeywordPresetTypes[];

    public regexPatterns?: string[];

    public constructor(data: Partial<AutoModerationTriggerMetadataStructure>) {
        super(data);
    }

    public patch(data: Partial<AutoModerationTriggerMetadataStructure>): void {
        if ("allow_list" in data) {
            this.allowList = data.allow_list;
        }

        if ("keyword_filter" in data) {
            this.keywordFilter = data.keyword_filter;
        }

        if ("mention_raid_protection_enabled" in data) {
            this.mentionRaidProtectionEnabled = data.mention_raid_protection_enabled;
        }

        if ("mention_total_limit" in data) {
            this.mentionTotalLimit = data.mention_total_limit;
        }

        if ("presets" in data) {
            this.presets = data.presets;
        }

        if ("regex_patterns" in data) {
            this.regexPatterns = data.regex_patterns;
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

    public constructor(data: Partial<AutoModerationRuleStructure>) {
        super(data);
    }

    public patch(data: Partial<AutoModerationRuleStructure>): void {
        this.actions = data.actions ? data.actions.map((action) => AutoModerationAction.from(action)) : this.actions;
        this.creatorId = data.creator_id ?? this.creatorId;
        this.enabled = data.enabled ?? this.enabled;
        this.eventType = data.event_type ?? this.eventType;
        if ("exempt_channels" in data) {
            this.exemptChannels = data.exempt_channels;
        }

        if ("exempt_roles" in data) {
            this.exemptRoles = data.exempt_roles;
        }

        this.guildId = data.guild_id ?? this.guildId;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.triggerMetadata = data.trigger_metadata
            ? AutoModerationTriggerMetadata.from(data.trigger_metadata)
            : this.triggerMetadata;
        this.triggerType = data.trigger_type ?? this.triggerType;
    }
}
