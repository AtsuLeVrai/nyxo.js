import type { Snowflake } from "@nyxjs/core";
import { UserRoutes } from "@nyxjs/rest";
import type { Client } from "../Client.js";

export class GuildManager {
    #client: Client;

    constructor(client: Client) {
        this.#client = client;
    }

    async leave(guildId: Snowflake): Promise<void> {
        return this.#client.rest.request(UserRoutes.leaveGuild(guildId));
    }
}
