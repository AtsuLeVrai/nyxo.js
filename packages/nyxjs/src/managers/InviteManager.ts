import type { GetInviteQueryStringParams } from "@nyxjs/rest";
import { InviteRoutes } from "@nyxjs/rest";
import type { Client } from "../client/Client";
import { Invite } from "../structures/Invites";

export class InviteManager {
    public constructor(private readonly client: Client) {}

    public async fetch(code: string, query?: GetInviteQueryStringParams): Promise<Invite> {
        const response = await this.client.rest.request(InviteRoutes.getInvite(code, query));
        return Invite.from(response);
    }

    public async delete(code: string, reason?: string): Promise<Invite> {
        const response = await this.client.rest.request(InviteRoutes.deleteInvite(code, reason));
        return Invite.from(response);
    }
}
