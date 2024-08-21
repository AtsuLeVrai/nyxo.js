import type { Integer, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../globals/rest";
import type { ChannelStructure } from "../structures/channels";
import type { StageInstanceStructure, StagePrivacyLevels } from "../structures/stages";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
 */
export function deleteStageInstance(stageId: Snowflake, reason?: string): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/stage-instances/${stageId}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type ModifyStageInstanceJSONParams = {
	/**
	 * The privacy level of the Stage instance
	 */
	privacy_level?: Integer;
	/**
	 * The topic of the Stage instance (1-120 characters)
	 */
	topic?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
 */
export function modifyStageInstance(stageId: Snowflake, json: ModifyStageInstanceJSONParams, reason?: string): RestRequestOptions<StageInstanceStructure> {
	return {
		method: "PATCH",
		path: `/stage-instances/${stageId}`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
 */

export function getStageInstance(stageId: Snowflake): RestRequestOptions<Partial<ChannelStructure> & StageInstanceStructure> {
	return {
		method: "GET",
		path: `/stage-instances/${stageId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export type CreateStageInstanceJSONParams = {
	/**
	 * The id of the Stage channel
	 */
	channel_id: Snowflake;
	/**
	 * The guild scheduled event associated with this Stage instance
	 */
	guild_scheduled_event_id?: Snowflake;
	/**
	 * The privacy level of the Stage instance (default GUILD_ONLY)
	 */
	privacy_level?: StagePrivacyLevels;
	/**
	 * Notify @everyone that a Stage instance has started
	 */
	send_start_notification?: boolean;
	/**
	 * The topic of the Stage instance (1-120 characters)
	 */
	topic: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
 */
export function createStageInstance(json: CreateStageInstanceJSONParams, reason?: string): RestRequestOptions<StageInstanceStructure> {
	return {
		method: "POST",
		path: "/stage-instances",
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}
