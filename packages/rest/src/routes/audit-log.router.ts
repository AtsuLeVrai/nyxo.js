import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import {
  type GetGuildAuditLogQueryEntity,
  GetGuildAuditLogQuerySchema,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class AuditLogRouter {
  static readonly ROUTES = {
    guildAuditLogs: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    options: GetGuildAuditLogQueryEntity = {},
  ): Promise<HttpResponse<AuditLogEntity>> {
    const result = GetGuildAuditLogQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(AuditLogRouter.ROUTES.guildAuditLogs(guildId), {
      query: result.data,
    });
  }
}
