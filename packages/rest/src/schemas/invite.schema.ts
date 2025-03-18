import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for the query parameters when retrieving an invite
 * Defines the optional parameters that can be provided when getting
 * invite details from Discord's API
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export const GetInviteQuerySchema = z.object({
  /**
   * Whether the invite should contain approximate member counts
   * When true, the response will include approximate_presence_count and approximate_member_count fields
   */
  with_counts: z.boolean().optional(),

  /**
   * Whether the invite should contain the expiration date
   * When true, the response will include the expires_at field
   */
  with_expiration: z.boolean().optional(),

  /**
   * The guild scheduled event to include with the invite
   * When provided and valid, the response will include guild_scheduled_event data
   */
  guild_scheduled_event_id: Snowflake.optional(),
});

export type GetInviteQuerySchema = z.input<typeof GetInviteQuerySchema>;
