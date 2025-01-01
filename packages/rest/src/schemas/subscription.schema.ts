import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export const SubscriptionQuerySchema = z
  .object({
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
    user_id: SnowflakeSchema.optional(),
  })
  .strict();

export type SubscriptionQueryEntity = z.infer<typeof SubscriptionQuerySchema>;
