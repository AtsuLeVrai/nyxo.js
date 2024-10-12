import type { Client } from "../core";

export class UserManager {
    readonly #client: Client;

    public constructor(client: Client) {
        this.#client = client;
    }
}
