import { AuditLogEvent, SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const GetGuildAuditLogQuerySchema = z
  .object({
    user_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    action_type: z.nativeEnum(AuditLogEvent).optional(),
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export type GetGuildAuditLogQueryEntity = z.infer<
  typeof GetGuildAuditLogQuerySchema
>;
