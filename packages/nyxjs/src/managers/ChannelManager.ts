import type { Client } from "../client/Client";

export class ChannelManager {
    public constructor(private readonly client: Client) {}

    public static from(client: Client): ChannelManager {
        return new ChannelManager(client);
    }
}
