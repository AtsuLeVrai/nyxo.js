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
import { Base } from "./base";

export class AutoModerationActionMetadata extends Base<AutoModerationActionMetadataStructure> {
	public channelId!: Snowflake;

	public customMessage?: string;

	public durationSeconds!: Integer;

	public constructor(data: Partial<AutoModerationActionMetadataStructure>) {
		super(data);
	}

	public toJSON(): AutoModerationActionMetadataStructure {
		return {
			channel_id: this.channelId,
			custom_message: this.customMessage,
			duration_seconds: this.durationSeconds,
		};
	}

	protected patch(data: Partial<AutoModerationActionMetadataStructure>): void {
		if (data.channel_id !== undefined) {
			this.channelId = data.channel_id;
		}

		if (data.custom_message !== undefined) {
			this.customMessage = data.custom_message;
		}

		if (data.duration_seconds !== undefined) {
			this.durationSeconds = data.duration_seconds;
		}
	}
}

export class AutoModerationAction extends Base<AutoModerationActionStructure> {
	public metadata?: AutoModerationActionMetadata;

	public type!: AutoModerationActionTypes;

	public constructor(data: Partial<AutoModerationActionStructure>) {
		super(data);
	}

	public toJSON(): AutoModerationActionStructure {
		return {
			metadata: this.metadata?.toJSON(),
			type: this.type,
		};
	}

	protected patch(data: Partial<AutoModerationActionStructure>): void {
		if (data.metadata !== undefined) {
			this.metadata = AutoModerationActionMetadata.from(data.metadata);
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

	public constructor(data: Partial<AutoModerationTriggerMetadataStructure>) {
		super(data);
	}

	public toJSON(): AutoModerationTriggerMetadataStructure {
		return {
			allow_list: this.allowList,
			keyword_filter: this.keywordFilter,
			mention_raid_protection_enabled: this.mentionRaidProtectionEnabled,
			mention_total_limit: this.mentionTotalLimit,
			presets: this.presets,
			regex_patterns: this.regexPatterns,
		};
	}

	protected patch(data: Partial<AutoModerationTriggerMetadataStructure>): void {
		if (data.allow_list !== undefined) {
			this.allowList = data.allow_list;
		}

		if (data.keyword_filter !== undefined) {
			this.keywordFilter = data.keyword_filter;
		}

		if (data.mention_raid_protection_enabled !== undefined) {
			this.mentionRaidProtectionEnabled = data.mention_raid_protection_enabled;
		}

		if (data.mention_total_limit !== undefined) {
			this.mentionTotalLimit = data.mention_total_limit;
		}

		if (data.presets !== undefined) {
			this.presets = data.presets;
		}

		if (data.regex_patterns !== undefined) {
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

	public triggerMetadata!: AutoModerationTriggerMetadataStructure;

	public triggerType!: AutoModerationTriggerTypes;

	public constructor(data: Partial<AutoModerationRuleStructure>) {
		super(data);
	}

	public toJSON(): AutoModerationRuleStructure {
		return {
			actions: this.actions.map((action) => action.toJSON()),
			creator_id: this.creatorId,
			enabled: this.enabled,
			event_type: this.eventType,
			exempt_channels: this.exemptChannels,
			exempt_roles: this.exemptRoles,
			guild_id: this.guildId,
			id: this.id,
			name: this.name,
			trigger_metadata: this.triggerMetadata,
			trigger_type: this.triggerType,
		};
	}

	protected patch(data: Partial<AutoModerationRuleStructure>): void {
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

		if (data.exempt_channels !== undefined) {
			this.exemptChannels = data.exempt_channels;
		}

		if (data.exempt_roles !== undefined) {
			this.exemptRoles = data.exempt_roles;
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
			this.triggerMetadata = data.trigger_metadata;
		}

		if (data.trigger_type !== undefined) {
			this.triggerType = data.trigger_type;
		}
	}
}

export {
	AutoModerationActionTypes,
	AutoModerationEventTypes,
	AutoModerationKeywordPresetTypes,
	AutoModerationTriggerTypes,
} from "@nyxjs/rest";
