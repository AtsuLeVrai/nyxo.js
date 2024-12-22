import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const SubscriptionQuerySchema = z
  .object({
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
    user_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export type SubscriptionQueryEntity = z.infer<typeof SubscriptionQuerySchema>;
