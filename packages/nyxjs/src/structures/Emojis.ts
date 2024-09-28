import type { Snowflake, EmojiStructure } from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class Emoji extends Base<EmojiStructure> {
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
}
