import type { SkuFlags, SkuStructure, SkuTypes, Snowflake } from "@nyxjs/core";
import { SkuRoutes } from "@nyxjs/rest";
import type { BaseClient } from "../client/BaseClient";
import { Base } from "./Base";

export class Sku extends Base<SkuStructure> {
    public applicationId!: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public slug!: string;

    public type!: SkuTypes;

    public flags!: SkuFlags;

    public constructor(
        private readonly client: BaseClient,
        data: Readonly<Partial<SkuStructure>> = {}
    ) {
        super(data);
    }

    public async list(): Promise<readonly Sku[]> {
        const skus = await this.client.rest.request(SkuRoutes.listSkus(this.applicationId));
        return skus.map((sku) => new Sku(this.client, sku));
    }

    protected patch(data: Readonly<Partial<SkuStructure>>): void {
        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if (data.flags !== undefined) {
            this.flags = data.flags;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.slug !== undefined) {
            this.slug = data.slug;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}
