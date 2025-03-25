import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { GetGuildAuditLogQuerySchema } from "../schemas/index.js";

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

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new AuditLogRouter instance.
   * @param rest - The REST client to use for making API requests
   */
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
