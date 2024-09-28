import type { BitfieldResolvable, SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";

export class Sku extends BaseStructure<SkuStructure> {
    public applicationId: Snowflake;

    public flags: BitfieldResolvable<SkuFlags>;

    public id: Snowflake;

    public name: string;

    public slug: string;

    public type: SkuTypes;

    public constructor(data: Partial<SkuStructure> = {}) {
        super();
        this.applicationId = data.application_id!;
        this.flags = data.flags!;
        this.id = data.id!;
        this.name = data.name!;
        this.slug = data.slug!;
        this.type = data.type!;
    }

    public toJSON(): SkuStructure {
        return {
            application_id: this.applicationId,
            flags: this.flags,
            id: this.id,
            name: this.name,
            slug: this.slug,
            type: this.type,
        };
    }
}
