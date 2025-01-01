import { AuditLogEvent, SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-params}
 */
export const GetGuildAuditLogQuerySchema = z
  .object({
    user_id: SnowflakeSchema.optional(),
    action_type: z.nativeEnum(AuditLogEvent).optional(),
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  })
  .strict();

export type GetGuildAuditLogQueryEntity = z.infer<
  typeof GetGuildAuditLogQuerySchema
>;
