import type { Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQueryEntity {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: Snowflake;
}
