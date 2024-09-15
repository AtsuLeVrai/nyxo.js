import type { Boolean, InviteStructure, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/rest";

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

export class InviteRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
     */
    public static deleteInvite(code: string, reason?: string): RestRequestOptions<InviteStructure> {
        return {
            method: "DELETE",
            path: `/invites/${code}`,
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
     */
    public static getInvite(code: string, query?: GetInviteQueryStringParams): RestRequestOptions<InviteStructure> {
        return {
            method: "GET",
            path: `/invites/${code}`,
            query,
        };
    }
}
