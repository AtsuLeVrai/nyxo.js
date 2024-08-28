import type { Snowflake } from "@nyxjs/core";
import type { SkuFlags, SkuStructure, SkuTypes } from "@nyxjs/rest";
import { SkuRoutes } from "@nyxjs/rest";
import type { Client } from "./client";

export class Sku {
	public applicationId!: Snowflake;

	public id!: Snowflake;

	public name!: string;

	public slug!: string;

	public type!: SkuTypes;

	public flags!: SkuFlags;

	public constructor(private readonly client: Client, data: SkuStructure) {
		this.patch(data);
	}

	public static from(client: Client, data: SkuStructure): Sku {
		return new Sku(client, data);
	}

	public toJSON(): SkuStructure {
		return {
			application_id: this.applicationId,
			id: this.id,
			name: this.name,
			slug: this.slug,
			type: this.type,
			flags: this.flags,
		};
	}

	public async list(): Promise<readonly Sku[]> {
		const skus = await this.client.rest.request(SkuRoutes.listSkus(this.applicationId));
		return skus.map((sku) => new Sku(this.client, sku));
	}

	private patch(data: SkuStructure): void {
		if (data.application_id !== undefined) {
			this.applicationId = data.application_id;
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

		if (data.flags !== undefined) {
			this.flags = data.flags;
		}
	}
}

export { type SkuTypes, type SkuFlags } from "@nyxjs/rest";
