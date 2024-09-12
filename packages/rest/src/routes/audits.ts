import type { AuditLogEvents, AuditLogStructure, Integer, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export type GetGuildAuditLogQueryStringParams = {
    /**
     * Filter the log for an action type
     */
    action_type?: AuditLogEvents;
    /**
     * Get logs after this log ID
     */
    after?: Snowflake;
    /**
     * Get logs before this log ID
     */
    before?: Snowflake;
    /**
     * Max number of logs to return (1-100)
     */
    limit?: Integer;
    /**
     * Filter the log for a user
     */
    user_id?: Snowflake;
};

export class AuditRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
     */
    public static getGuildAuditLog(
        guildId: Snowflake,
        query?: GetGuildAuditLogQueryStringParams
    ): RestRequestOptions<AuditLogStructure> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/audit-logs`,
            query,
        };
    }
}
