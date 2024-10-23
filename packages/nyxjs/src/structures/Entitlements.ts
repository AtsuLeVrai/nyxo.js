import type { EntitlementStructure, EntitlementTypes, Iso8601Timestamp, Snowflake } from "@nyxjs/core";

export class Entitlement {
    applicationId!: Snowflake;

    consumed?: boolean;

    deleted!: boolean;

    endsAt?: Iso8601Timestamp;

    guildId?: Snowflake;

    id!: Snowflake;

    skuId!: Snowflake;

    startsAt?: Iso8601Timestamp;

    type!: EntitlementTypes;

    userId?: Snowflake;

    constructor(data: Partial<EntitlementStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<EntitlementStructure>): void {
        if (data.application_id) {
            this.applicationId = data.application_id;
        }
        if (data.consumed) {
            this.consumed = data.consumed;
        }
        if (data.deleted) {
            this.deleted = data.deleted;
        }
        if (data.ends_at) {
            this.endsAt = data.ends_at;
        }
        if (data.guild_id) {
            this.guildId = data.guild_id;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.sku_id) {
            this.skuId = data.sku_id;
        }
        if (data.starts_at) {
            this.startsAt = data.starts_at;
        }
        if (data.type) {
            this.type = data.type;
        }
        if (data.user_id) {
            this.userId = data.user_id;
        }
    }
}
