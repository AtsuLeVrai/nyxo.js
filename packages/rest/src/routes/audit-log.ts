import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import type { GetGuildAuditLogOptionsEntity } from "../types/index.js";
import { BaseRouter } from "./base.js";

export class AuditLogRouter extends BaseRouter {
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
    options?: GetGuildAuditLogOptionsEntity,
  ): Promise<AuditLogEntity> {
    return this.get(AuditLogRouter.routes.guildAuditLogs(guildId), {
      query: options,
    });
  }
}
