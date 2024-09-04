import type { Snowflake } from "@nyxjs/core";
import type { SkuFlags, SkuStructure, SkuTypes } from "@nyxjs/rest";
import { SkuRoutes } from "@nyxjs/rest";
import { Base } from "./Base";
import type { Client } from "./Client";

export class Sku extends Base<SkuStructure> {
    public applicationId!: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public slug!: string;

    public type!: SkuTypes;

    public flags!: SkuFlags;

    public constructor(
        private readonly client: Client,
        data: Partial<SkuStructure>
    ) {
        super(data);
    }

    public async list(): Promise<readonly Sku[]> {
        const skus = await this.client.rest.request(SkuRoutes.listSkus(this.applicationId));
        return skus.map((sku) => new Sku(this.client, sku));
    }

    protected patch(data: Partial<SkuStructure>): void {
        this.applicationId = data.application_id ?? this.applicationId;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.slug = data.slug ?? this.slug;
        this.type = data.type ?? this.type;
        this.flags = data.flags ?? this.flags;
    }
}
