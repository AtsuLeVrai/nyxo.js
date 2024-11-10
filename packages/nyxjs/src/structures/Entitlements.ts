import type { EntitlementStructure, EntitlementTypes, Iso8601Timestamp, Snowflake } from "@nyxjs/core";
import { Base } from "./Base.js";

export interface EntitlementSchema {
    readonly applicationId: Snowflake | null;
    readonly consumed: boolean;
    readonly deleted: boolean;
    readonly endsAt: Iso8601Timestamp | null;
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly skuId: Snowflake | null;
    readonly startsAt: Iso8601Timestamp | null;
    readonly type: EntitlementTypes | null;
    readonly userId: Snowflake | null;
}

export class Entitlement extends Base<EntitlementStructure, EntitlementSchema> {
    #applicationId: Snowflake | null = null;
    #deleted = false;
    #endsAt: Iso8601Timestamp | null = null;
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #skuId: Snowflake | null = null;
    #startsAt: Iso8601Timestamp | null = null;
    #type: EntitlementTypes | null = null;
    #userId: Snowflake | null = null;
    #consumed = false;

    constructor(data: Partial<EntitlementStructure>) {
        super();
        this.patch(data);
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get consumed(): boolean {
        return this.#consumed;
    }

    get deleted(): boolean {
        return this.#deleted;
    }

    get endsAt(): Iso8601Timestamp | null {
        return this.#endsAt;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get skuId(): Snowflake | null {
        return this.#skuId;
    }

    get startsAt(): Iso8601Timestamp | null {
        return this.#startsAt;
    }

    get type(): EntitlementTypes | null {
        return this.#type;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    get isActive(): boolean {
        if (this.#deleted || this.#consumed) {
            return false;
        }

        const now = new Date().toISOString();
        const hasStarted = !this.#startsAt || this.#startsAt <= now;
        const hasNotEnded = !this.#endsAt || this.#endsAt > now;

        return hasStarted && hasNotEnded;
    }

    get isExpired(): boolean {
        if (!this.#endsAt) {
            return false;
        }
        return new Date(this.#endsAt).getTime() < Date.now();
    }

    get remainingTime(): number | null {
        if (!this.#endsAt) {
            return null;
        }
        return new Date(this.#endsAt).getTime() - Date.now();
    }

    static from(data: Partial<EntitlementStructure>): Entitlement {
        return new Entitlement(data);
    }

    patch(data: Partial<EntitlementStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#consumed = Boolean(data.consumed ?? this.#consumed);
        this.#deleted = Boolean(data.deleted ?? this.#deleted);
        this.#endsAt = data.ends_at ?? this.#endsAt;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#skuId = data.sku_id ?? this.#skuId;
        this.#startsAt = data.starts_at ?? this.#startsAt;
        this.#type = data.type ?? this.#type;
        this.#userId = data.user_id ?? this.#userId;
    }

    isValidFor(userId: Snowflake): boolean {
        return this.isActive && this.#userId === userId;
    }

    isGuildEntitlement(): boolean {
        return this.#guildId !== null;
    }

    isUserEntitlement(): boolean {
        return this.#userId !== null;
    }

    toJson(): Partial<EntitlementStructure> {
        return {
            application_id: this.#applicationId ?? undefined,
            consumed: this.#consumed,
            deleted: this.#deleted,
            ends_at: this.#endsAt ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            sku_id: this.#skuId ?? undefined,
            starts_at: this.#startsAt ?? undefined,
            type: this.#type ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): EntitlementSchema {
        return {
            applicationId: this.#applicationId,
            consumed: this.#consumed,
            deleted: this.#deleted,
            endsAt: this.#endsAt,
            guildId: this.#guildId,
            id: this.#id,
            skuId: this.#skuId,
            startsAt: this.#startsAt,
            type: this.#type,
            userId: this.#userId,
        };
    }

    clone(): Entitlement {
        return new Entitlement(this.toJson());
    }

    reset(): void {
        this.#applicationId = null;
        this.#consumed = false;
        this.#deleted = false;
        this.#endsAt = null;
        this.#guildId = null;
        this.#id = null;
        this.#skuId = null;
        this.#startsAt = null;
        this.#type = null;
        this.#userId = null;
    }

    equals(other: Partial<Entitlement>): boolean {
        return Boolean(
            this.#applicationId === other.applicationId &&
                this.#consumed === other.consumed &&
                this.#deleted === other.deleted &&
                this.#endsAt === other.endsAt &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#skuId === other.skuId &&
                this.#startsAt === other.startsAt &&
                this.#type === other.type &&
                this.#userId === other.userId,
        );
    }
}
