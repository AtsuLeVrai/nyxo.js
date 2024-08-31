import type { Boolean, Snowflake } from "@nyxjs/core";
import type { InviteStructure } from "../structures/invites";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export type GetInviteQueryStringParams = {
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

export const InviteRoutes = {
	/**
	 * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
	 */
	deleteInvite: (code: string, reason?: string): RestRequestOptions<InviteStructure> => ({
		method: "DELETE",
		path: `/invites/${code}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
	 */
	getInvite: (code: string, query?: GetInviteQueryStringParams): RestRequestOptions<InviteStructure> => ({
		method: "GET",
		path: `/invites/${code}`,
		query,
	}),
};
