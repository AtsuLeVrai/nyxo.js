import type { Client } from "../client/Client";

export class ApplicationManager {
    public constructor(private readonly client: Client) {}

    public static from(client: Client): ApplicationManager {
        return new ApplicationManager(client);
    }
}
