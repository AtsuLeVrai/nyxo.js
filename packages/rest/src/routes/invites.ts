import type { InviteStructure, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

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

export class InviteRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite|Delete Invite}
     */
    public static deleteInvite(code: string, reason?: string): RestRequestOptions<InviteStructure> {
        return this.delete(`/invites/${code}`, {
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/invite#get-invite|Get Invite}
     */
    public static getInvite(code: string, params?: GetInviteQueryStringParams): RestRequestOptions<InviteStructure> {
        return this.get(`/invites/${code}`, {
            query: params,
        });
    }
}
