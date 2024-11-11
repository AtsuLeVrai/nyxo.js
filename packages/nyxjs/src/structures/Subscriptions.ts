import type { Iso8601Timestamp, Snowflake, SubscriptionStatus, SubscriptionStructure } from "@nyxjs/core";
import { Base } from "./Base.js";

export interface SubscriptionSchema {
    readonly canceledAt: Iso8601Timestamp | null;
    readonly country: string | null;
    readonly currentPeriodEnd: Iso8601Timestamp | null;
    readonly currentPeriodStart: Iso8601Timestamp | null;
    readonly entitlementIds: Snowflake[];
    readonly id: Snowflake | null;
    readonly skuIds: Snowflake[];
    readonly status: SubscriptionStatus | null;
    readonly userId: Snowflake | null;
}

export class Subscription extends Base<SubscriptionStructure, SubscriptionSchema> implements SubscriptionSchema {
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
        super();
        this.patch(data);
    }

    get canceledAt(): Iso8601Timestamp | null {
        return this.#canceledAt;
    }

    get country(): string | null {
        return this.#country;
    }

    get currentPeriodEnd(): Iso8601Timestamp | null {
        return this.#currentPeriodEnd;
    }

    get currentPeriodStart(): Iso8601Timestamp | null {
        return this.#currentPeriodStart;
    }

    get entitlementIds(): Snowflake[] {
        return [...this.#entitlementIds];
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get skuIds(): Snowflake[] {
        return [...this.#skuIds];
    }

    get status(): SubscriptionStatus | null {
        return this.#status;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    static from(data: Partial<SubscriptionStructure>): Subscription {
        return new Subscription(data);
    }

    patch(data: Partial<SubscriptionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#canceledAt = data.canceled_at ?? this.#canceledAt;
        this.#country = data.country ?? this.#country;
        this.#currentPeriodEnd = data.current_period_end ?? this.#currentPeriodEnd;
        this.#currentPeriodStart = data.current_period_start ?? this.#currentPeriodStart;

        if (Array.isArray(data.entitlement_ids)) {
            this.#entitlementIds = [...data.entitlement_ids];
        }

        this.#id = data.id ?? this.#id;

        if (Array.isArray(data.sku_ids)) {
            this.#skuIds = [...data.sku_ids];
        }

        this.#status = data.status ?? this.#status;
        this.#userId = data.user_id ?? this.#userId;
    }

    toJson(): Partial<SubscriptionStructure> {
        return {
            canceled_at: this.#canceledAt ?? undefined,
            country: this.#country ?? undefined,
            current_period_end: this.#currentPeriodEnd ?? undefined,
            current_period_start: this.#currentPeriodStart ?? undefined,
            entitlement_ids: [...this.#entitlementIds],
            id: this.#id ?? undefined,
            sku_ids: [...this.#skuIds],
            status: this.#status ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): SubscriptionSchema {
        return {
            canceledAt: this.#canceledAt,
            country: this.#country,
            currentPeriodEnd: this.#currentPeriodEnd,
            currentPeriodStart: this.#currentPeriodStart,
            entitlementIds: [...this.#entitlementIds],
            id: this.#id,
            skuIds: [...this.#skuIds],
            status: this.#status,
            userId: this.#userId,
        };
    }

    clone(): Subscription {
        return new Subscription(this.toJson());
    }

    reset(): void {
        this.#canceledAt = null;
        this.#country = null;
        this.#currentPeriodEnd = null;
        this.#currentPeriodStart = null;
        this.#entitlementIds = [];
        this.#id = null;
        this.#skuIds = [];
        this.#status = null;
        this.#userId = null;
    }

    equals(other: Partial<Subscription>): boolean {
        return Boolean(
            this.#canceledAt === other.canceledAt &&
                this.#country === other.country &&
                this.#currentPeriodEnd === other.currentPeriodEnd &&
                this.#currentPeriodStart === other.currentPeriodStart &&
                JSON.stringify(this.#entitlementIds) === JSON.stringify(other.entitlementIds) &&
                this.#id === other.id &&
                JSON.stringify(this.#skuIds) === JSON.stringify(other.skuIds) &&
                this.#status === other.status &&
                this.#userId === other.userId,
        );
    }
}
