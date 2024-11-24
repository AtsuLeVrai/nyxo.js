import type {
  AuditLogEntity,
  AuditLogEvent,
  Integer,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

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

export class AuditLogRouter {
  static routes = {
    guildAuditLogs: (guildId: Snowflake): `/guilds/${Snowflake}/audit-logs` => {
      return `/guilds/${guildId}/audit-logs` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    options?: GetGuildAuditLogOptions,
  ): Promise<AuditLogEntity> {
    return this.#rest.get(AuditLogRouter.routes.guildAuditLogs(guildId), {
      query: options,
    });
  }
}
