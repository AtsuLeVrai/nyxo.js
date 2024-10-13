import type { EmojiStructure, Snowflake } from "@nyxjs/core";
import { User } from "./Users";

export class Emoji {
    public animated?: boolean;

    public available?: boolean;

    public id!: Snowflake | null;

    public managed?: boolean;

    public name!: string | null;

    public requireColons?: boolean;

    public roles?: Snowflake[];

    public user?: User;

    public constructor(data: Partial<EmojiStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<EmojiStructure>): void {
        if (data.animated) this.animated = data.animated;
        if (data.available) this.available = data.available;
        if (data.id) this.id = data.id;
        if (data.managed) this.managed = data.managed;
        if (data.name) this.name = data.name;
        if (data.require_colons) this.requireColons = data.require_colons;
        if (data.roles) this.roles = data.roles;
        if (data.user) this.user = new User(data.user);
    }
}
