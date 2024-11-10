import type { BitfieldResolvable, SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";
import { Base } from "./Base.js";

export interface SkuSchema {
    readonly applicationId: Snowflake | null;
    readonly flags: BitfieldResolvable<SkuFlags>;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly slug: string | null;
    readonly type: SkuTypes | null;
}

export class Sku extends Base<SkuStructure, SkuSchema> {
    #applicationId: Snowflake | null = null;
    #flags: BitfieldResolvable<SkuFlags> = 0n;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #slug: string | null = null;
    #type: SkuTypes | null = null;

    constructor(data: Partial<SkuStructure>) {
        super();
        this.patch(data);
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get flags(): BitfieldResolvable<SkuFlags> {
        return this.#flags;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get slug(): string | null {
        return this.#slug;
    }

    get type(): SkuTypes | null {
        return this.#type;
    }

    static from(data: Partial<SkuStructure>): Sku {
        return new Sku(data);
    }

    patch(data: Partial<SkuStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#flags = data.flags ?? this.#flags;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#slug = data.slug ?? this.#slug;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<SkuStructure> {
        return {
            application_id: this.#applicationId ?? undefined,
            flags: this.#flags,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            slug: this.#slug ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): SkuSchema {
        return {
            applicationId: this.#applicationId,
            flags: this.#flags,
            id: this.#id,
            name: this.#name,
            slug: this.#slug,
            type: this.#type,
        };
    }

    clone(): Sku {
        return new Sku(this.toJson());
    }

    reset(): void {
        this.#applicationId = null;
        this.#flags = 0n;
        this.#id = null;
        this.#name = null;
        this.#slug = null;
        this.#type = null;
    }

    equals(other: Partial<Sku>): boolean {
        return Boolean(
            this.#applicationId === other.applicationId &&
                this.#flags === other.flags &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#slug === other.slug &&
                this.#type === other.type,
        );
    }
}
