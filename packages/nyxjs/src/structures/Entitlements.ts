import type { EntitlementStructure, EntitlementTypes, Iso8601Timestamp, Snowflake } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";

export class Entitlement extends BaseStructure<EntitlementStructure> {
    public applicationId: Snowflake;

    public consumed?: boolean;

    public deleted: boolean;

    public endsAt?: Iso8601Timestamp;

    public guildId?: Snowflake;

    public id: Snowflake;

    public skuId: Snowflake;

    public startsAt?: Iso8601Timestamp;

    public type: EntitlementTypes;

    public userId?: Snowflake;

    public constructor(data: Partial<EntitlementStructure> = {}) {
        super();
        this.applicationId = data.application_id!;
        this.consumed = data.consumed;
        this.deleted = data.deleted!;
        this.endsAt = data.ends_at;
        this.guildId = data.guild_id;
        this.id = data.id!;
        this.skuId = data.sku_id!;
        this.startsAt = data.starts_at;
        this.type = data.type!;
        this.userId = data.user_id;
    }

    public toJSON(): EntitlementStructure {
        return {
            application_id: this.applicationId,
            consumed: this.consumed,
            deleted: this.deleted,
            ends_at: this.endsAt,
            guild_id: this.guildId,
            id: this.id,
            sku_id: this.skuId,
            starts_at: this.startsAt,
            type: this.type,
            user_id: this.userId,
        };
    }
}
