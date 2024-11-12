import type { Snowflake } from "@nyxjs/core";
import { UserRoutes } from "@nyxjs/rest";
import type { Client } from "../Client.js";
import type { Guild } from "../structures/index.js";

export class GuildManager {
    readonly #client: Client;
    readonly #cache: Map<Snowflake, Guild> = new Map();

    constructor(client: Client) {
        this.#client = client;
    }

    get cache(): Map<Snowflake, Guild> {
        return this.#cache;
    }

    leave(guildId: Snowflake): Promise<void> {
        return this.#client.rest.request(UserRoutes.leaveGuild(guildId));
    }
}
