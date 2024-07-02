import type { Snowflake, StageInstanceStructure, StagePrivacyLevel } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export type CreateStageInstanceJSON = {
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
	privacy_level?: StagePrivacyLevel;
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
export function createStageInstance(reason: string, json: CreateStageInstanceJSON): RestRequestOptions<StageInstanceStructure> {
	return {
		method: "POST",
		path: "/stage-instances",
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
 */
export function getStageInstance(channelId: Snowflake): RestRequestOptions<StageInstanceStructure> {
	return {
		method: "GET",
		path: `/stage-instances/${channelId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type ModifyStageInstanceJSON = {
	/**
	 * The privacy level of the Stage instance
	 */
	privacy_level?: StagePrivacyLevel;
	/**
	 * The topic of the Stage instance (1-120 characters)
	 */
	topic?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
 */
export function modifyStageInstance(channelId: Snowflake, reason: string, json: ModifyStageInstanceJSON): RestRequestOptions<StageInstanceStructure> {
	return {
		method: "PATCH",
		path: `/stage-instances/${channelId}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
 */
export function deleteStageInstance(channelId: Snowflake, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/stage-instances/${channelId}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}
