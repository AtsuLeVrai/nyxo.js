import type { AuditLogEvent, Snowflake } from "@nyxjs/core";

/**
 * Interface for query parameters used when fetching guild audit logs.
 * These parameters allow filtering the audit log entries by various criteria.
 *
 * @remarks
 * The returned list of audit log entries is ordered based on whether you use `before` or `after`:
 * - When using `before`, entries are ordered by ID descending (newer entries first)
 * - When using `after`, entries are ordered by ID ascending (older entries first)
 * - Omitting both defaults to `before` the current timestamp (most recent entries)
 * - Using `after=0` will show the oldest entries first
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export interface GetGuildAuditLogQuerySchema {
  /**
   * Filter entries by the user who performed the action
   *
   * @optional
   */
  user_id?: Snowflake;

  /**
   * Filter entries by a specific audit log event type
   *
   * @optional
   */
  action_type?: AuditLogEvent;

  /**
   * Return entries with ID less than this snowflake (newer than)
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * Return entries with ID greater than this snowflake (older than)
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Maximum number of entries to return (1-100), defaults to 50
   *
   * @minimum 1
   * @maximum 100
   * @default 50
   * @integer
   */
  limit?: number;
}
