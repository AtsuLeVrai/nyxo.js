import type { Client } from "../core";

export class UserManager {
    readonly #client: Client;

    constructor(client: Client) {
        this.#client = client;
    }
}
