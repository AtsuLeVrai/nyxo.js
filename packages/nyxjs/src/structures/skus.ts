import type { Snowflake } from "@nyxjs/core";
import type { SkuFlags, SkuStructure, SkuTypes } from "@nyxjs/rest";
import { SkuRoutes } from "@nyxjs/rest";
import type { Client } from "./client";

export class Sku {
	public readonly applicationId: Snowflake;

	public readonly id: Snowflake;

	public readonly name: string;

	public readonly slug: string;

	public readonly type: SkuTypes;

	public readonly flags: SkuFlags;

	public constructor(private readonly client: Client, data: SkuStructure) {
		this.applicationId = data.application_id;
		this.id = data.id;
		this.name = data.name;
		this.slug = data.slug;
		this.type = data.type;
		this.flags = data.flags;
		Object.freeze(this);
	}

	public async list(): Promise<readonly Sku[]> {
		const skus = await this.client.rest.request(SkuRoutes.listSkus(this.applicationId));
		return Object.freeze(skus.map((sku) => new Sku(this.client, sku)));
	}
}

export { type SkuTypes, type SkuFlags } from "@nyxjs/rest";
