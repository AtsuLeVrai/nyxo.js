import type { EmojiStructure, Snowflake } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";
import { User } from "./Users";

export class Emoji extends BaseStructure<EmojiStructure> {
    public animated?: boolean;

    public available?: boolean;

    public id: Snowflake | null;

    public managed?: boolean;

    public name: string | null;

    public requireColons?: boolean;

    public roles?: Snowflake[];

    public user?: User;

    public constructor(data: Partial<EmojiStructure> = {}) {
        super();
        this.animated = data.animated;
        this.available = data.available;
        this.id = data.id!;
        this.managed = data.managed;
        this.name = data.name!;
        this.requireColons = data.require_colons;
        this.roles = data.roles;
        this.user = User.from(data.user);
    }

    public toJSON(): EmojiStructure {
        return {
            animated: this.animated,
            available: this.available,
            id: this.id,
            managed: this.managed,
            name: this.name,
            require_colons: this.requireColons,
            roles: this.roles,
            user: this.user?.toJSON(),
        };
    }
}
