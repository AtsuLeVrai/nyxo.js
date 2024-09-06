import type { EntitlementStructure, EntitlementTypes } from "@nyxjs/api-types";
import type { IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";

export class Entitlement extends Base<EntitlementStructure> {
    public applicationId!: Snowflake;

    public consumed?: boolean;

    public deleted!: boolean;

    public endsAt?: IsoO8601Timestamp;

    public guildId?: Snowflake;

    public id!: Snowflake;

    public skuId!: Snowflake;

    public startsAt?: IsoO8601Timestamp;

    public type!: EntitlementTypes;

    public userId?: Snowflake;

    public constructor(data: Readonly<Partial<EntitlementStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EntitlementStructure>>): void {
        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if ("consumed" in data) {
            if (data.consumed === null) {
                this.consumed = undefined;
            } else if (data.consumed !== undefined) {
                this.consumed = data.consumed;
            }
        }

        if (data.deleted !== undefined) {
            this.deleted = data.deleted;
        }

        if ("ends_at" in data) {
            if (data.ends_at === null) {
                this.endsAt = undefined;
            } else if (data.ends_at !== undefined) {
                this.endsAt = data.ends_at;
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else {
                this.guildId = data.guild_id;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.sku_id !== undefined) {
            this.skuId = data.sku_id;
        }

        if ("starts_at" in data) {
            if (data.starts_at === null) {
                this.startsAt = undefined;
            } else if (data.starts_at !== undefined) {
                this.startsAt = data.starts_at;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("user_id" in data) {
            if (data.user_id === null) {
                this.userId = undefined;
            } else {
                this.userId = data.user_id;
            }
        }
    }
}

export { EntitlementTypes } from "@nyxjs/api-types";
