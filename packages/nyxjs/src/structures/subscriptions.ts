import type { IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import type {
	ListSkuSubscriptionsQuery,
	SubscriptionStatus,
	SubscriptionStructure,
} from "@nyxjs/rest";
import { SubscriptionRoutes } from "@nyxjs/rest";
import { Base } from "./base";
import type { Client } from "./client";

export class Subscription extends Base<SubscriptionStructure> {
	public canceledAt!: IsoO8601Timestamp | null;

	public country?: string;

	public currentPeriodEnd!: IsoO8601Timestamp;

	public currentPeriodStart!: IsoO8601Timestamp;

	public entitlementIds!: Snowflake[];

	public id!: Snowflake;

	public skuIds!: Snowflake[];

	public status!: SubscriptionStatus;

	public userId!: Snowflake;

	public constructor(
		private readonly client: Client,
		data: Partial<SubscriptionStructure>,
	) {
		super(data);
	}

	public async get(
		skuId: Snowflake,
		subscriptionId: Snowflake,
	): Promise<Subscription> {
		const response = await this.client.rest.request(
			SubscriptionRoutes.getSkuSubscription(skuId, subscriptionId),
		);
		return new Subscription(this.client, response);
	}

	public async list(
		skuId: Snowflake,
		query?: ListSkuSubscriptionsQuery,
	): Promise<Subscription[]> {
		const response = await this.client.rest.request(
			SubscriptionRoutes.listSkuSubscriptions(skuId, query),
		);
		return response.map(
			(subscription) => new Subscription(this.client, subscription),
		);
	}

	public toJSON(): SubscriptionStructure {
		return {
			canceled_at: this.canceledAt,
			country: this.country,
			current_period_end: this.currentPeriodEnd,
			current_period_start: this.currentPeriodStart,
			entitlement_ids: this.entitlementIds,
			id: this.id,
			sku_ids: this.skuIds,
			status: this.status,
			user_id: this.userId,
		};
	}

	protected patch(data: Partial<SubscriptionStructure>): void {
		if (data.canceled_at !== undefined) {
			this.canceledAt = data.canceled_at;
		}

		if (data.country !== undefined) {
			this.country = data.country;
		}

		if (data.current_period_end !== undefined) {
			this.currentPeriodEnd = data.current_period_end;
		}

		if (data.current_period_start !== undefined) {
			this.currentPeriodStart = data.current_period_start;
		}

		if (data.entitlement_ids !== undefined) {
			this.entitlementIds = data.entitlement_ids;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.sku_ids !== undefined) {
			this.skuIds = data.sku_ids;
		}

		if (data.status !== undefined) {
			this.status = data.status;
		}

		if (data.user_id !== undefined) {
			this.userId = data.user_id;
		}
	}
}

export { SubscriptionStatus } from "@nyxjs/rest";
