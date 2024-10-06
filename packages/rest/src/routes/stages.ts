import { Buffer } from "node:buffer";
import type { Snowflake, StageInstanceStructure } from "@nyxjs/core";
import type { RouteStructure } from "../types";
import { RestMethods } from "../types";

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

export class StageRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance|Delete Stage Instance}
     */
    public static deleteStageInstance(channelId: Snowflake, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/stage-instances/${channelId}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance|Modify Stage Instance}
     */
    public static modifyStageInstance(
        channelId: Snowflake,
        params: ModifyStageInstanceJsonParams,
        reason?: string
    ): RouteStructure<StageInstanceStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/stage-instances/${channelId}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance|Get Stage Instance}
     */
    public static getStageInstance(channelId: Snowflake): RouteStructure<StageInstanceStructure> {
        return {
            method: RestMethods.Get,
            path: `/stage-instances/${channelId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance|Create Stage Instance}
     */
    public static createStageInstance(
        params: CreateStageInstanceJsonParams,
        reason?: string
    ): RouteStructure<StageInstanceStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: "/stage-instances",
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    }
}
