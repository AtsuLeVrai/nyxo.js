import type { Rest } from "../../core/index.js";
import type { AuditLogEntity, AuditLogEvent } from "./audit-log.entity.js";

export interface AuditLogFetchParams {
  user_id?: string;
  action_type?: AuditLogEvent;
  before?: string;
  after?: string;
  limit?: number;
}

export class AuditLogRouter {
  static readonly Routes = {
    guildAuditLogsEndpoint: (guildId: string) => `/guilds/${guildId}/audit-logs` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchGuildAuditLog(guildId: string, query?: AuditLogFetchParams): Promise<AuditLogEntity> {
    return this.#rest.get(AuditLogRouter.Routes.guildAuditLogsEndpoint(guildId), { query });
  }
}
