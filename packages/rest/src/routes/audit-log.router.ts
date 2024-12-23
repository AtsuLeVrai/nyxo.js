import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type GetGuildAuditLogQueryEntity,
  GetGuildAuditLogQuerySchema,
} from "../schemas/index.js";

export class AuditLogRouter extends BaseRouter {
  static readonly ROUTES = {
    guildAuditLogs: (guildId: Snowflake) =>
      `/guilds/${guildId}/audit-logs` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getGuildAuditLog(
    guildId: Snowflake,
    options: GetGuildAuditLogQueryEntity = {},
  ): Promise<AuditLogEntity> {
    const result = GetGuildAuditLogQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(AuditLogRouter.ROUTES.guildAuditLogs(guildId), {
      query: result.data,
    });
  }
}
