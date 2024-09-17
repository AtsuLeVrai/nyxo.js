import type { Client } from "../client/Client";

export class StageManager {
    public constructor(private readonly client: Client) {}

    public static from(client: Client): StageManager {
        return new StageManager(client);
    }
}
