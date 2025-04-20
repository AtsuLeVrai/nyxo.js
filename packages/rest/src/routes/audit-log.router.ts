import type { AuditLogEntity, AuditLogEvent, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters used when fetching guild audit logs.
 *
 * These parameters allow filtering and pagination of audit log entries based on
 * various criteria such as user, action type, and timestamp ranges. Understanding
 * how these filters work together is important for efficient audit log retrieval.
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
   * Filter entries by the user who performed the action.
   *
   * When specified, only audit log entries created by this user will be returned.
   * This is useful for tracking actions performed by specific administrators or moderators.
   */
  user_id?: Snowflake;

  /**
   * Filter entries by a specific audit log event type.
   *
   * When specified, only entries of this action type will be returned.
   * This allows focusing on specific types of administrative actions
   * like bans, channel creations, role updates, etc.
   *
   * @see AuditLogEvent enum for possible values
   */
  action_type?: AuditLogEvent;

  /**
   * Return entries with ID less than this snowflake (newer than).
   *
   * This establishes an upper bound for the entries to retrieve,
   * returning only entries that are newer than the specified ID.
   * When used, entries are returned in descending order (newest first).
   */
  before?: Snowflake;

  /**
   * Return entries with ID greater than this snowflake (older than).
   *
   * This establishes a lower bound for the entries to retrieve,
   * returning only entries that are older than the specified ID.
   * When used, entries are returned in ascending order (oldest first).
   */
  after?: Snowflake;

  /**
   * Maximum number of entries to return (1-100), defaults to 50.
   *
   * Controls the pagination size for audit log retrieval.
   * Higher values retrieve more entries in a single request but may
   * increase response time and payload size.
   */
  limit?: number;
}

/**
 * Router for Discord Audit Log-related API endpoints.
 *
 * Audit logs are a critical administrative and security feature that record all
 * significant actions taken within a guild. This router provides methods to
 * access and filter these logs for moderation, compliance, and security purposes.
 *
 * @remarks
 * Audit logs record administrative actions performed in a guild, such as:
 * - Member management (kicks, bans, role assignments)
 * - Channel operations (creation, deletion, permission updates)
 * - Role modifications (creation, deletion, permission changes)
 * - Server setting changes (name, region, moderation settings)
 * - Message deletions (including bulk deletions)
 * - Integration management
 *
 * All audit log entries are retained by Discord for 45 days, after which they
 * are automatically purged. For long-term record keeping, consider implementing
 * a system to periodically archive important audit events.
 */
export class AuditLogRouter {
  /**
   * API route constants for audit log-related endpoints.
   */
  static readonly AUDIT_ROUTES = {
    /**
     * Route for fetching guild audit logs.
     *
     * @param guildId - ID of the guild
     * @returns The formatted API route string
     */
    guildAuditLogsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Audit Log Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the audit log for a guild with optional filtering.
   *
   * This method provides access to the guild's audit logs, which record all
   * administrative actions taken in the guild. The returned data includes
   * detailed information about each action, who performed it, when it occurred,
   * and what changes were made.
   *
   * @param guildId - ID of the guild to fetch audit logs from
   * @param query - Query parameters to filter audit log entries
   * @returns A promise that resolves to the guild's audit log
   * @throws {Error} Error if the user lacks permission or the guild doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   *
   * @remarks
   * Requires the VIEW_AUDIT_LOG permission.
   * Discord stores audit logs for 45 days.
   */
  fetchGuildAuditLog(
    guildId: Snowflake,
    query?: GetGuildAuditLogQuerySchema,
  ): Promise<AuditLogEntity> {
    return this.#rest.get(
      AuditLogRouter.AUDIT_ROUTES.guildAuditLogsEndpoint(guildId),
      {
        query,
      },
    );
  }
}
