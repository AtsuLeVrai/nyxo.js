import type { EntitlementStructure, EntitlementTypes, Iso8601Timestamp, Snowflake } from "@nyxjs/core";

export class Entitlement {
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

    patch(data: Partial<EntitlementStructure>): void {
        if (!data) {
            return;
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#consumed = data.consumed ?? this.#consumed;
        this.#deleted = data.deleted ?? this.#deleted;
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

    toJSON(): Partial<EntitlementStructure> {
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
}
