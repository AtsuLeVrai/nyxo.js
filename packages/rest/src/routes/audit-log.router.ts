import type { AuditLogEntity, AuditLogEvent, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

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
   */
  user_id?: Snowflake;

  /**
   * Filter entries by a specific audit log event type
   */
  action_type?: AuditLogEvent;

  /**
   * Return entries with ID less than this snowflake (newer than)
   */
  before?: Snowflake;

  /**
   * Return entries with ID greater than this snowflake (older than)
   */
  after?: Snowflake;

  /**
   * Maximum number of entries to return (1-100), defaults to 50
   */
  limit?: number;
}

/**
 * Router for Discord Audit Log-related API endpoints.
 * Provides methods to interact with a guild's audit logs.
 *
 * @remarks
 * Audit logs record administrative actions performed in a guild.
 * Viewing audit logs requires the VIEW_AUDIT_LOG permission.
 * All audit log entries are stored by Discord for 45 days.
 */
export class AuditLogRouter {
  /**
   * API route constants for audit log-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for fetching guild audit logs
     * @param guildId - ID of the guild
     * @returns The formatted route string
     */
    guildAuditLogs: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the audit log for a guild.
   *
   * @param guildId - ID of the guild to fetch audit logs from
   * @param query - Query parameters to filter audit log entries
   * @returns A promise that resolves to the guild's audit log
   * @throws Error if the provided options fail validation
   * @remarks Requires the VIEW_AUDIT_LOG permission.
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    query: GetGuildAuditLogQuerySchema = {},
  ): Promise<AuditLogEntity> {
    return this.#rest.get(AuditLogRouter.ROUTES.guildAuditLogs(guildId), {
      query,
    });
  }
}
