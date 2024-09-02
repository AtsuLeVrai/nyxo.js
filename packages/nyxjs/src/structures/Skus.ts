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
		data: Partial<SkuStructure>,
	) {
		super(data);
	}

	public async list(): Promise<readonly Sku[]> {
		const skus = await this.client.rest.request(
			SkuRoutes.listSkus(this.applicationId),
		);
		return skus.map((sku) => new Sku(this.client, sku));
	}
}

export { type SkuTypes, type SkuFlags } from "@nyxjs/rest";
