import type { Snowflake, StageInstanceStructure } from "@nyxjs/core";
import type { RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params|Modify Stage Instance JSON Params}
 */
export type ModifyStageInstanceJsonParams = Partial<Pick<StageInstanceStructure, "privacy_level" | "topic">>;

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params|Create Stage Instance JSON Params}
 */
export type CreateStageInstanceJsonParams = Pick<
    StageInstanceStructure,
    "channel_id" | "guild_scheduled_event_id" | "privacy_level" | "topic"
> & {
    /**
     * Notify @everyone that a Stage instance has started
     */
    send_start_notification?: boolean;
};

export class StageRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance|Delete Stage Instance}
     */
    public static deleteStageInstance(channelId: Snowflake, reason?: string): RestRequestOptions<void> {
        return this.delete(`/stage-instances/${channelId}`, {
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance|Modify Stage Instance}
     */
    public static modifyStageInstance(
        channelId: Snowflake,
        params: ModifyStageInstanceJsonParams,
        reason?: string
    ): RestRequestOptions<StageInstanceStructure> {
        return this.patch(`/stage-instances/${channelId}`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance|Get Stage Instance}
     */
    public static getStageInstance(channelId: Snowflake): RestRequestOptions<StageInstanceStructure> {
        return this.get(`/stage-instances/${channelId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance|Create Stage Instance}
     */
    public static createStageInstance(
        params: CreateStageInstanceJsonParams,
        reason?: string
    ): RestRequestOptions<StageInstanceStructure> {
        return this.post("/stage-instances", {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }
}
