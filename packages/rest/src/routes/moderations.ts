import type { RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type {
	AutoModerationActionStructure,
	AutoModerationEventTypes,
	AutoModerationRuleStructure,
	AutoModerationTriggerMetadataStructure,
	AutoModerationTriggerTypes,
} from "../structures/moderations";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
 */
function deleteAutoModerationRule(guildId: Snowflake, autoModerationRuleId: Snowflake, reason?: string): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleJSONParams = {
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
	event_type?: AutoModerationEventTypes;
	/**
	 * The channel IDs that should not be affected by the rule (Maximum of 50)
	 */
	exempt_channels?: Snowflake[];
	/**
	 * The role IDs that should not be affected by the rule (Maximum of 20)
	 */
	exempt_roles?: Snowflake[];
	/**
	 * The name of the rule
	 */
	name?: string;
	/**
	 * The trigger metadata
	 */
	trigger_metadata?: AutoModerationTriggerMetadataStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
 */
function modifyAutoModerationRule(guildId: Snowflake, autoModerationRuleId: Snowflake, json: ModifyAutoModerationRuleJSONParams, reason?: string): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleJSONParams = {
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
	event_type: AutoModerationEventTypes;
	/**
	 * The channel IDs that should not be affected by the rule (Maximum of 50)
	 */
	exempt_channels?: Snowflake[];
	/**
	 * The role IDs that should not be affected by the rule (Maximum of 20)
	 */
	exempt_roles?: Snowflake[];
	/**
	 * The name of the rule
	 */
	name: string;
	/**
	 * The trigger metadata
	 */
	trigger_metadata?: AutoModerationTriggerMetadataStructure;
	/**
	 * The trigger type
	 */
	trigger_type: AutoModerationTriggerTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
 */
function createAutoModerationRule(guildId: Snowflake, json: CreateAutoModerationRuleJSONParams, reason?: string): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "POST",
		path: `/guilds/${guildId}/auto-moderation/rules`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
 */
function getAutoModerationRule(guildId: Snowflake, autoModerationRuleId: Snowflake): RestRequestOptions<AutoModerationRuleStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/auto-moderation/rules/${autoModerationRuleId}`,
	};
}

export const ModerationRoutes = {
	deleteAutoModerationRule,
	modifyAutoModerationRule,
	createAutoModerationRule,
	getAutoModerationRule,
};
