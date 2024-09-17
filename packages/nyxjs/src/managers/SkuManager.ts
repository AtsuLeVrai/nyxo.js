import type { Client } from "../client/Client";

export class SkuManager {
    public constructor(private readonly client: Client) {}

    public static from(client: Client): SkuManager {
        return new SkuManager(client);
    }
}
