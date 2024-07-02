import type { AuditLogEvents, AuditLogStructure, Integer, Snowflake } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export type GetGuildAuditLogQueryString = {
	/**
	 * Entries for a specific audit log event
	 */
	action_type?: AuditLogEvents;
	/**
	 * Entries with ID greater than a specific audit log entry ID
	 */
	after?: Snowflake;
	/**
	 * Entries with ID less than a specific audit log entry ID
	 */
	before?: Snowflake;
	/**
	 * Maximum number of entries (between 1-100) to return, defaults to 50
	 */
	limit?: Integer;
	/**
	 * Entries from a specific user ID
	 */
	user_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
 */
export function getGuildAuditLog(guildId: Snowflake, query?: GetGuildAuditLogQueryString): RestRequestOptions<AuditLogStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/audit-logs`,
		query,
	};
}
