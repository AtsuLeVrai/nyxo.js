import type { ApiVersions, ApplicationStructure, Integer, UnavailableGuildStructure } from "@nyxjs/core";
import type { ReadyEventFields } from "@nyxjs/gateway";
import { User } from "./Users";

export class Ready {
    public application!: Pick<ApplicationStructure, "flags" | "id">;

    public guilds!: UnavailableGuildStructure[];

    public resumeGatewayUrl!: string;

    public sessionId!: string;

    public shard?: [shardId: Integer, numShards: Integer];

    public user!: User;

    public v!: ApiVersions;

    public constructor(data: Partial<ReadyEventFields>) {
        this.#patch(data);
    }

    #patch(data: Partial<ReadyEventFields>): void {
        if (data.application) this.application = { flags: data.application.flags, id: data.application.id };
        if (data.guilds) this.guilds = data.guilds;
        if (data.resume_gateway_url) this.resumeGatewayUrl = data.resume_gateway_url;
        if (data.session_id) this.sessionId = data.session_id;
        if (data.shard) this.shard = data.shard;
        if (data.user) this.user = new User(data.user);
        if (data.v) this.v = data.v;
    }
}
