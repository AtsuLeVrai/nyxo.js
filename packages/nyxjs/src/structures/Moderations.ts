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
}

export class AutoModerationAction extends Base<AutoModerationActionStructure> {
	public metadata?: AutoModerationActionMetadata;

	public type!: AutoModerationActionTypes;

	public constructor(data: Partial<AutoModerationActionStructure>) {
		super(data);
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

	public triggerMetadata!: AutoModerationTriggerMetadataStructure;

	public triggerType!: AutoModerationTriggerTypes;

	public constructor(data: Partial<AutoModerationRuleStructure>) {
		super(data);
	}
}

export {
	AutoModerationActionTypes,
	AutoModerationEventTypes,
	AutoModerationKeywordPresetTypes,
	AutoModerationTriggerTypes,
} from "@nyxjs/rest";
