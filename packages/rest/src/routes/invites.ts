import type { InviteStructure, Snowflake } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params|Get Invite Query String Params}
 */
export type GetInviteQueryStringParams = {
    /**
     * The guild scheduled event to include with the invite
     */
    guild_scheduled_event_id?: Snowflake;
    /**
     * Whether the invite should contain approximate member counts
     */
    with_counts?: boolean;
    /**
     * Whether the invite should contain the expiration date
     */
    with_expiration?: boolean;
};

export class InviteRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite|Delete Invite}
     */
    static deleteInvite(code: string, reason?: string): RouteStructure<InviteStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/invites/${code}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#get-invite|Get Invite}
     */
    static getInvite(code: string, params?: GetInviteQueryStringParams): RouteStructure<InviteStructure> {
        return {
            method: RestMethods.Get,
            path: `/invites/${code}`,
            query: params,
        };
    }
}
