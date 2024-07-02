import type {
	AutoModerationActionStructure,
	AutoModerationRuleEventTypes,
	AutoModerationRuleStructure,
	AutoModerationRuleTriggerMetadata,
	AutoModerationRuleTriggerTypes,
	Snowflake,
} from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
 */
export function listAutoModerationRules(guildId: Snowflake): RestRequestOptions<AutoModerationRuleStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/auto-moderation/rules`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
 */
export function getAutoModerationRule(guildId: Snowflake, ruleId: Snowflake): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleJSON = {
	/**
	 * The actions which will execute when the rule is triggered
	 */
	actions: AutoModerationActionStructure[];
	/**
	 * Whether the rule is enabled
	 */
	enabled?: boolean;
	/**
	 * The event type
	 */
	event_type: AutoModerationRuleEventTypes;
	/**
	 * The channel ids that should not be affected by the rule
	 */
	exempt_channels?: Snowflake[];
	/**
	 * The role ids that should not be affected by the rule
	 */
	exempt_roles?: Snowflake[];
	/**
	 * The rule name
	 */
	name: string;
	/**
	 * The trigger metadata
	 */
	trigger_metadata?: AutoModerationRuleTriggerMetadata;
	/**
	 * The trigger type
	 */
	trigger_type: AutoModerationRuleTriggerTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
 */
export function createAutoModerationRule(guildId: Snowflake, reason: string, json: CreateAutoModerationRuleJSON): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "POST",
		path: `/guilds/${guildId}/auto-moderation/rules`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleJSON = {
	/**
	 * The actions which will execute when the rule is triggered
	 */
	actions?: AutoModerationActionStructure[];
	/**
	 * Whether the rule is enabled
	 */
	enabled?: boolean;
	/**
	 * The event type
	 */
	event_type?: AutoModerationRuleEventTypes;
	/**
	 * The channel ids that should not be affected by the rule
	 */
	exempt_channels?: Snowflake[];
	/**
	 * The role ids that should not be affected by the rule
	 */
	exempt_roles?: Snowflake[];
	/**
	 * The rule name
	 */
	name?: string;
	/**
	 * The trigger metadata
	 */
	trigger_metadata?: AutoModerationRuleTriggerMetadata;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
 */
export function modifyAutoModerationRule(guildId: Snowflake, ruleId: Snowflake, reason: string, json: ModifyAutoModerationRuleJSON): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
 */
export function deleteAutoModerationRule(guildId: Snowflake, ruleId: Snowflake, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}
