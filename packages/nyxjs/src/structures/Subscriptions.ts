import type { Iso8601Timestamp, Snowflake, SubscriptionStatus, SubscriptionStructure } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";

export class Subscription extends BaseStructure<SubscriptionStructure> {
    public canceledAt: Iso8601Timestamp | null;

    public country?: string;

    public currentPeriodEnd: Iso8601Timestamp;

    public currentPeriodStart: Iso8601Timestamp;

    public entitlementIds: Snowflake[];

    public id: Snowflake;

    public skuIds: Snowflake[];

    public status: SubscriptionStatus;

    public userId: Snowflake;

    public constructor(data: Partial<SubscriptionStructure> = {}) {
        super();
        this.canceledAt = data.canceled_at!;
        this.country = data.country;
        this.currentPeriodEnd = data.current_period_end!;
        this.currentPeriodStart = data.current_period_start!;
        this.entitlementIds = data.entitlement_ids!;
        this.id = data.id!;
        this.skuIds = data.sku_ids!;
        this.status = data.status!;
        this.userId = data.user_id!;
    }

    public toJSON(): SubscriptionStructure {
        return {
            canceled_at: this.canceledAt,
            country: this.country,
            current_period_end: this.currentPeriodEnd,
            current_period_start: this.currentPeriodStart,
            entitlement_ids: this.entitlementIds,
            id: this.id,
            sku_ids: this.skuIds,
            status: this.status,
            user_id: this.userId,
        };
    }
}
