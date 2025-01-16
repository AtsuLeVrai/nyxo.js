import type { AuditLogEntity, Snowflake } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import { GetGuildAuditLogQueryEntity } from "../schemas/index.js";

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
    options: z.input<typeof GetGuildAuditLogQueryEntity> = {},
  ): Promise<AuditLogEntity> {
    const result = GetGuildAuditLogQueryEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(AuditLogRouter.ROUTES.guildAuditLogs(guildId), {
      query: result.data,
    });
  }
}
