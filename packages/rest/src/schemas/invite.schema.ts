import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const GetInviteQuerySchema = z
  .object({
    with_counts: z.boolean().optional(),
    with_expiration: z.boolean().optional(),
    guild_scheduled_event_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export type GetInviteQueryEntity = z.infer<typeof GetInviteQuerySchema>;
