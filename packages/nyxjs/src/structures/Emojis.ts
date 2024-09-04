import type { Snowflake } from "@nyxjs/core";
import type { EmojiStructure } from "@nyxjs/rest";
import { Base } from "./Base";
import { User } from "./Users";

export class Emoji extends Base<EmojiStructure> {
    public animated?: boolean;

    public available?: boolean;

    public id!: Snowflake | null;

    public managed?: boolean;

    public name!: string | null;

    public requireColons?: boolean;

    public roles?: Snowflake[];

    public user?: User;

    public constructor(data: Partial<EmojiStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmojiStructure>): void {
        if ("animated" in data) {
            this.animated = data.animated;
        }

        if ("available" in data) {
            this.available = data.available;
        }

        this.id = data.id ?? this.id;
        if ("managed" in data) {
            this.managed = data.managed;
        }

        this.name = data.name ?? this.name;
        if ("require_colons" in data) {
            this.requireColons = data.require_colons;
        }

        if ("roles" in data) {
            this.roles = data.roles;
        }

        if ("user" in data && data.user) {
            this.user = User.from(data.user);
        }
    }
}
