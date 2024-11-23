import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface GetGuildAuditLogOptions {
  user_id?: Snowflake;
  action_type?: number;
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
}

export class AuditLogRoutes {
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
    return this.#rest.get(AuditLogRoutes.routes.guildAuditLogs(guildId), {
      query: options,
    });
  }
}
