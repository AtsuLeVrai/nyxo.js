import type { BitfieldResolvable, SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";

export class Sku {
    applicationId!: Snowflake;

    flags!: BitfieldResolvable<SkuFlags>;

    id!: Snowflake;

    name!: string;

    slug!: string;

    type!: SkuTypes;

    constructor(data: Partial<SkuStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<SkuStructure>): void {
        if (data.application_id) {
            this.applicationId = data.application_id;
        }
        if (data.flags) {
            this.flags = data.flags;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.slug) {
            this.slug = data.slug;
        }
        if (data.type) {
            this.type = data.type;
        }
    }
}
