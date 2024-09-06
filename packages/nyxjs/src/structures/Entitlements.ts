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

    public constructor(data: Partial<EntitlementStructure>) {
        super(data);
    }

    protected patch(data: Partial<EntitlementStructure>): void {
        this.applicationId = data.application_id ?? this.applicationId;

        if ("consumed" in data) {
            this.consumed = data.consumed;
        }

        this.deleted = data.deleted ?? this.deleted;

        if ("ends_at" in data) {
            this.endsAt = data.ends_at;
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        this.id = data.id ?? this.id;
        this.skuId = data.sku_id ?? this.skuId;

        if ("starts_at" in data) {
            this.startsAt = data.starts_at;
        }

        this.type = data.type ?? this.type;

        if ("user_id" in data) {
            this.userId = data.user_id;
        }
    }
}

export { EntitlementTypes } from "@nyxjs/api-types";
