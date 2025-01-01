import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export const GetInviteQuerySchema = z
  .object({
    with_counts: z.boolean().optional(),
    with_expiration: z.boolean().optional(),
    guild_scheduled_event_id: SnowflakeSchema.optional(),
  })
  .strict();

export type GetInviteQueryEntity = z.infer<typeof GetInviteQuerySchema>;
