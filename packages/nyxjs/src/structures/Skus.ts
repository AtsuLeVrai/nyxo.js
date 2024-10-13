import type { BitfieldResolvable, SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";

export class Sku {
    public applicationId!: Snowflake;

    public flags!: BitfieldResolvable<SkuFlags>;

    public id!: Snowflake;

    public name!: string;

    public slug!: string;

    public type!: SkuTypes;

    public constructor(data: Partial<SkuStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<SkuStructure>): void {
        if (data.application_id) this.applicationId = data.application_id;
        if (data.flags) this.flags = data.flags;
        if (data.id) this.id = data.id;
        if (data.name) this.name = data.name;
        if (data.slug) this.slug = data.slug;
        if (data.type) this.type = data.type;
    }
}
