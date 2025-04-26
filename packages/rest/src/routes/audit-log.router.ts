import type { AuditLogEntity, AuditLogEvent, Snowflake } from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";

/**
 * Interface for query parameters used when fetching guild audit logs.
 * Allows filtering and pagination of audit log entries.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export interface AuditLogFetchParams {
  /**
   * Filter entries by the user who performed the action.
   * Returns only audit log entries created by this user.
   */
  user_id?: Snowflake;

  /**
   * Filter entries by a specific audit log event type.
   * Returns only entries of this action type.
   */
  action_type?: AuditLogEvent;

  /**
   * Return entries with ID less than this snowflake.
   * Returns entries newer than this ID in descending order.
   */
  before?: Snowflake;

  /**
   * Return entries with ID greater than this snowflake.
   * Returns entries older than this ID in ascending order.
   */
  after?: Snowflake;

  /**
   * Maximum number of entries to return (1-100), defaults to 50.
   * Controls the pagination size for audit log retrieval.
   */
  limit?: number;
}

/**
 * Router for Discord Audit Log-related API endpoints.
 * Provides access to guild action records for moderation and security purposes.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log}
 */
export class AuditLogRouter extends BaseRouter {
  /**
   * API route constants for audit log-related endpoints.
   */
  static readonly AUDIT_ROUTES = {
    /**
     * Route for fetching guild audit logs.
     * @param guildId - ID of the guild
     */
    guildAuditLogsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  /**
   * Fetches the audit log for a guild with optional filtering.
   * Provides access to records of administrative actions in the guild.
   *
   * @param guildId - ID of the guild to fetch audit logs from
   * @param query - Query parameters to filter audit log entries
   * @returns A promise that resolves to the guild's audit log
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  fetchGuildAuditLog(
    guildId: Snowflake,
    query?: AuditLogFetchParams,
  ): Promise<AuditLogEntity> {
    return this.get(
      AuditLogRouter.AUDIT_ROUTES.guildAuditLogsEndpoint(guildId),
      { query },
    );
  }
}
