import type { EmojiStructure, Snowflake, UserStructure } from "@nyxjs/core";
import { User } from "./Users.js";

export class Emoji {
    #animated = false;
    #available = true;
    #id: Snowflake | null = null;
    #managed = false;
    #name: string | null = null;
    #requireColons = false;
    #roles: Snowflake[] = [];
    #user?: User;

    constructor(data: Partial<EmojiStructure>) {
        this.patch(data);
    }

    get animated() {
        return this.#animated;
    }

    get available() {
        return this.#available;
    }

    get id() {
        return this.#id;
    }

    get managed() {
        return this.#managed;
    }

    get name() {
        return this.#name;
    }

    get requireColons() {
        return this.#requireColons;
    }

    get roles() {
        return [...this.#roles];
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<EmojiStructure>): void {
        if (!data) {
            return;
        }

        this.#animated = data.animated ?? this.#animated;
        this.#available = data.available ?? this.#available;
        this.#id = data.id ?? this.#id;
        this.#managed = data.managed ?? this.#managed;
        this.#name = data.name ?? this.#name;
        this.#requireColons = data.require_colons ?? this.#requireColons;

        if (Array.isArray(data.roles)) {
            this.#roles = [...data.roles];
        }

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<EmojiStructure> {
        return {
            animated: this.#animated,
            available: this.#available,
            id: this.#id,
            managed: this.#managed,
            name: this.#name,
            require_colons: this.#requireColons,
            roles: [...this.#roles],
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}
