import type { BitfieldResolvable, SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";

export class Sku {
    #applicationId: Snowflake | null = null;
    #flags: BitfieldResolvable<SkuFlags> = 0n;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #slug: string | null = null;
    #type: SkuTypes | null = null;

    constructor(data: Partial<SkuStructure>) {
        this.patch(data);
    }

    get applicationId() {
        return this.#applicationId;
    }

    get flags() {
        return this.#flags;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get slug() {
        return this.#slug;
    }

    get type() {
        return this.#type;
    }

    patch(data: Partial<SkuStructure>): void {
        if (!data) {
            return;
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#flags = data.flags ?? this.#flags;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#slug = data.slug ?? this.#slug;
        this.#type = data.type ?? this.#type;
    }

    toJSON(): Partial<SkuStructure> {
        return {
            application_id: this.#applicationId ?? undefined,
            flags: this.#flags,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            slug: this.#slug ?? undefined,
            type: this.#type ?? undefined,
        };
    }
}
