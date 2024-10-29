import type { Iso8601Timestamp, Snowflake, SubscriptionStatus, SubscriptionStructure } from "@nyxjs/core";

export class Subscription {
    #canceledAt: Iso8601Timestamp | null = null;
    #country: string | null = null;
    #currentPeriodEnd: Iso8601Timestamp | null = null;
    #currentPeriodStart: Iso8601Timestamp | null = null;
    #entitlementIds: Snowflake[] = [];
    #id: Snowflake | null = null;
    #skuIds: Snowflake[] = [];
    #status: SubscriptionStatus | null = null;
    #userId: Snowflake | null = null;

    constructor(data: Partial<SubscriptionStructure>) {
        this.patch(data);
    }

    get canceledAt() {
        return this.#canceledAt;
    }

    get country() {
        return this.#country;
    }

    get currentPeriodEnd() {
        return this.#currentPeriodEnd;
    }

    get currentPeriodStart() {
        return this.#currentPeriodStart;
    }

    get entitlementIds() {
        return [...this.#entitlementIds];
    }

    get id() {
        return this.#id;
    }

    get skuIds() {
        return [...this.#skuIds];
    }

    get status() {
        return this.#status;
    }

    get userId() {
        return this.#userId;
    }

    patch(data: Partial<SubscriptionStructure>): void {
        if (!data) {
            return;
        }

        this.#canceledAt = data.canceled_at ?? this.#canceledAt;
        this.#country = data.country ?? this.#country;
        this.#currentPeriodEnd = data.current_period_end ?? this.#currentPeriodEnd;
        this.#currentPeriodStart = data.current_period_start ?? this.#currentPeriodStart;

        if (Array.isArray(data.entitlement_ids)) {
            this.#entitlementIds = data.entitlement_ids ?? this.#entitlementIds;
        }

        this.#id = data.id ?? this.#id;

        if (Array.isArray(data.sku_ids)) {
            this.#skuIds = data.sku_ids ?? this.#skuIds;
        }

        this.#status = data.status ?? this.#status;
        this.#userId = data.user_id ?? this.#userId;
    }

    toJSON(): Partial<SubscriptionStructure> {
        return {
            canceled_at: this.#canceledAt,
            country: this.#country ?? undefined,
            current_period_end: this.#currentPeriodEnd ?? undefined,
            current_period_start: this.#currentPeriodStart ?? undefined,
            entitlement_ids: this.#entitlementIds,
            id: this.#id ?? undefined,
            sku_ids: this.#skuIds,
            status: this.#status ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }
}
