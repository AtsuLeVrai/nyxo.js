import type { Boolean, InviteStructure, Snowflake } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export type GetInviteQuery = {
	/**
	 * The guild scheduled event to include with the invite
	 */
	guild_scheduled_event_id?: Snowflake;
	/**
	 * Whether the invite should contain approximate member counts
	 */
	with_counts?: Boolean;
	/**
	 * Whether the invite should contain the expiration date
	 */
	with_expiration?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
 */
export function getInvite(code: string, query?: GetInviteQuery): RestRequestOptions<InviteStructure> {
	return {
		method: "GET",
		path: `/invites/${code}`,
		query,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
 */
export function deleteInvite(code: string, reason: string): RestRequestOptions<InviteStructure> {
	return {
		method: "DELETE",
		path: `/invites/${code}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}
