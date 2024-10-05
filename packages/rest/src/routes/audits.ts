import type { AuditLogEvents, AuditLogStructure, Snowflake } from "@nyxjs/core";
import type { QueryStringParams, RouteStructure } from "../types";
import { RestMethods } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params|Get Guild Audit Log Query String Params}
 */
export type GetGuildAuditLogQueryStringParams = Pick<QueryStringParams, "after" | "before" | "limit"> & {
    /**
     * The type of audit log event
     */
    action_type?: AuditLogEvents;
    /**
     * Filter the log for actions made by a user
     */
    user_id?: Snowflake;
};

export class AuditRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log|Get Guild Audit Log}
     */
    public static getGuildAuditLog(
        guildId: Snowflake,
        params: GetGuildAuditLogQueryStringParams
    ): RouteStructure<AuditLogStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/audit-logs`,
            query: params,
        };
    }
}
