import type { EmojiStructure, Snowflake } from "@nyxjs/core";
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

    public constructor(data: Readonly<Partial<EmojiStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmojiStructure>>): void {
        if ("animated" in data) {
            if (data.animated === null) {
                this.animated = undefined;
            } else if (data.animated !== undefined) {
                this.animated = data.animated;
            }
        }

        if ("available" in data) {
            if (data.available === null) {
                this.available = undefined;
            } else if (data.available !== undefined) {
                this.available = data.available;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("managed" in data) {
            if (data.managed === null) {
                this.managed = undefined;
            } else if (data.managed !== undefined) {
                this.managed = data.managed;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("require_colons" in data) {
            if (data.require_colons === null) {
                this.requireColons = undefined;
            } else if (data.require_colons !== undefined) {
                this.requireColons = data.require_colons;
            }
        }

        if ("roles" in data) {
            if (data.roles === null) {
                this.roles = undefined;
            } else if (data.roles !== undefined) {
                this.roles = data.roles;
            }
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = new User(data.user);
            }
        }
    }
}
