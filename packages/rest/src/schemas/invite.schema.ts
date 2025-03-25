import type { Snowflake } from "@nyxjs/core";

/**
 * Interface for the query parameters when retrieving an invite.
 * Defines the optional parameters that can be provided when getting
 * invite details from Discord's API.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQuerySchema {
  /**
   * Whether the invite should contain approximate member counts.
   * When true, the response will include approximate_presence_count and approximate_member_count fields.
   *
   * @optional
   */
  with_counts?: boolean;

  /**
   * Whether the invite should contain the expiration date.
   * When true, the response will include the expires_at field.
   *
   * @optional
   */
  with_expiration?: boolean;

  /**
   * The guild scheduled event to include with the invite.
   * When provided and valid, the response will include guild_scheduled_event data.
   *
   * @optional
   */
  guild_scheduled_event_id?: Snowflake;
}
