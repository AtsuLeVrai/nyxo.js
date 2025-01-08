import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export const GetInviteQueryEntity = z
  .object({
    with_counts: z.boolean().optional(),
    with_expiration: z.boolean().optional(),
    guild_scheduled_event_id: Snowflake.optional(),
  })
  .strict();

export type GetInviteQueryEntity = z.infer<typeof GetInviteQueryEntity>;
