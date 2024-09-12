import type { ChannelStructure, RestHttpResponseCodes, Snowflake, StageInstanceStructure } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type ModifyStageInstanceJSONParams = Pick<StageInstanceStructure, "privacy_level" | "topic">;

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export type CreateStageInstanceJSONParams = Pick<
    StageInstanceStructure,
    "channel_id" | "guild_scheduled_event_id" | "privacy_level" | "topic"
> & {
    /**
     * Notify @everyone that a Stage instance has started
     */
    send_start_notification?: boolean;
};

export class StageRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
     */
    public static deleteStageInstance(
        stageId: Snowflake,
        reason?: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/stage-instances/${stageId}`,
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
     */
    public static modifyStageInstance(
        stageId: Snowflake,
        json: ModifyStageInstanceJSONParams,
        reason?: string
    ): RestRequestOptions<StageInstanceStructure> {
        return {
            method: "PATCH",
            path: `/stage-instances/${stageId}`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
     */
    public static getStageInstance(
        stageId: Snowflake
    ): RestRequestOptions<Partial<ChannelStructure> & StageInstanceStructure> {
        return {
            method: "GET",
            path: `/stage-instances/${stageId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
     */
    public static createStageInstance(
        json: CreateStageInstanceJSONParams,
        reason?: string
    ): RestRequestOptions<StageInstanceStructure> {
        return {
            method: "POST",
            path: "/stage-instances",
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }
}
