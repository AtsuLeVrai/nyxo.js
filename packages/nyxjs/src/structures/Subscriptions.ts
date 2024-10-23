import type { Iso8601Timestamp, Snowflake, SubscriptionStatus, SubscriptionStructure } from "@nyxjs/core";

export class Subscription {
    canceledAt!: Iso8601Timestamp | null;

    country?: string;

    currentPeriodEnd!: Iso8601Timestamp;

    currentPeriodStart!: Iso8601Timestamp;

    entitlementIds!: Snowflake[];

    id!: Snowflake;

    skuIds!: Snowflake[];

    status!: SubscriptionStatus;

    userId!: Snowflake;

    constructor(data: Partial<SubscriptionStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<SubscriptionStructure>): void {
        if (data.canceled_at) {
            this.canceledAt = data.canceled_at;
        }
        if (data.country) {
            this.country = data.country;
        }
        if (data.current_period_end) {
            this.currentPeriodEnd = data.current_period_end;
        }
        if (data.current_period_start) {
            this.currentPeriodStart = data.current_period_start;
        }
        if (data.entitlement_ids) {
            this.entitlementIds = data.entitlement_ids;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.sku_ids) {
            this.skuIds = data.sku_ids;
        }
        if (data.status) {
            this.status = data.status;
        }
        if (data.user_id) {
            this.userId = data.user_id;
        }
    }
}
