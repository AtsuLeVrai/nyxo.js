import type { AuditLogEvent, Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export interface GetGuildAuditLogOptionsEntity {
  user_id?: Snowflake;
  action_type?: AuditLogEvent;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
}
