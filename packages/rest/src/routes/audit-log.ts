import type { Integer } from "@nyxjs/core";
import {
  type AuditLogEntity,
  AuditLogEvent,
  type Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "./base.js";

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

export interface AuditLogRoutes {
  readonly guildAuditLogs: (
    guildId: Snowflake,
  ) => `/guilds/${Snowflake}/audit-logs`;
}

export class AuditLogRouter extends BaseRouter {
  static readonly MIN_AUDIT_LOG_ENTRIES = 1;
  static readonly MAX_AUDIT_LOG_ENTRIES = 100;
  static readonly DEFAULT_AUDIT_LOG_ENTRIES = 5;
  static readonly MIN_REASON_LENGTH = 1;
  static readonly MAX_REASON_LENGTH = 512;

  static readonly ROUTES: AuditLogRoutes = {
    guildAuditLogs: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    options?: GetGuildAuditLogOptionsEntity,
  ): Promise<AuditLogEntity> {
    if (options) {
      this.#validateAuditLogOptions(options);
    }

    return this.get(AuditLogRouter.ROUTES.guildAuditLogs(guildId), {
      query: options,
    });
  }

  validateAuditLogReason(reason: string): void {
    if (
      reason.length < AuditLogRouter.MIN_REASON_LENGTH ||
      reason.length > AuditLogRouter.MAX_REASON_LENGTH
    ) {
      throw new Error(
        `Audit log reason must be between ${AuditLogRouter.MIN_REASON_LENGTH} and ${AuditLogRouter.MAX_REASON_LENGTH} characters`,
      );
    }
  }

  #validateAuditLogOptions(options: GetGuildAuditLogOptionsEntity): void {
    if (
      options.limit !== undefined &&
      (options.limit < AuditLogRouter.MIN_AUDIT_LOG_ENTRIES ||
        options.limit > AuditLogRouter.MAX_AUDIT_LOG_ENTRIES)
    ) {
      throw new Error(
        `Limit must be between ${AuditLogRouter.MIN_AUDIT_LOG_ENTRIES} and ${AuditLogRouter.MAX_AUDIT_LOG_ENTRIES}`,
      );
    }

    if (
      options.action_type !== undefined &&
      !Object.values(AuditLogEvent).includes(options.action_type)
    ) {
      throw new Error("Invalid action_type. Must be a valid AuditLogEvent");
    }

    if (options.before && options.after) {
      throw new Error("Cannot use before and after parameters simultaneously");
    }
  }
}
