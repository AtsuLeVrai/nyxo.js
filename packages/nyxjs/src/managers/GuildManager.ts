import type { Client } from "../client/Client";

export class GuildManager {
    public constructor(private readonly client: Client) {}

    public static from(client: Client): GuildManager {
        return new GuildManager(client);
    }
}
