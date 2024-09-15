import type { Client } from "../client/Client";

export class WebhookManager {
    public constructor(private readonly client: Client) {}
}
