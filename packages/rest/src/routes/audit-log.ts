import type {
  AuditLogEntity,
  AuditLogEvent,
  Integer,
  Snowflake,
} from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export interface GetGuildAuditLogOptions {
  user_id?: Snowflake;
  action_type?: AuditLogEvent;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
}

export class AuditLogRouter extends Router {
  static routes = {
    guildAuditLogs: (guildId: Snowflake): `/guilds/${Snowflake}/audit-logs` => {
      return `/guilds/${guildId}/audit-logs` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    options?: GetGuildAuditLogOptions,
  ): Promise<AuditLogEntity> {
    return this.get(AuditLogRouter.routes.guildAuditLogs(guildId), {
      query: options,
    });
  }
}
