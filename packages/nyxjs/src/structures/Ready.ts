import type { ApiVersions, ApplicationStructure, Integer, UnavailableGuildStructure } from "@nyxjs/core";
import type { ReadyEventFields } from "@nyxjs/gateway";
import { User } from "./Users";

export class Ready {
    public application!: Pick<ApplicationStructure, "flags" | "id">;

    public guilds!: UnavailableGuildStructure[];

    public resumeGatewayUrl!: string;

    public sessionId!: string;

    public shard?: [shard_id: Integer, num_shards: Integer];

    public user: User;

    public version!: ApiVersions;

    public constructor(data: ReadyEventFields) {
        this.application = data.application;
        this.guilds = data.guilds;
        this.resumeGatewayUrl = data.resume_gateway_url;
        this.sessionId = data.session_id;
        this.shard = data.shard;
        this.user = new User(data.user);
        this.version = data.v;
    }
}
