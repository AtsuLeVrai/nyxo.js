import { AuditLogEvent, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for query parameters used when fetching guild audit logs.
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
export const GetGuildAuditLogQuerySchema = z.object({
  /** Filter entries by the user who performed the action */
  user_id: Snowflake.optional(),

  /** Filter entries by a specific audit log event type */
  action_type: z.nativeEnum(AuditLogEvent).optional(),

  /** Return entries with ID less than this snowflake (newer than) */
  before: Snowflake.optional(),

  /** Return entries with ID greater than this snowflake (older than) */
  after: Snowflake.optional(),

  /** Maximum number of entries to return (1-100), defaults to 50 */
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetGuildAuditLogQuerySchema = z.input<
  typeof GetGuildAuditLogQuerySchema
>;
