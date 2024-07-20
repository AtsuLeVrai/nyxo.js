import type { Snowflake } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#sku-object-sku-flags}
 */
export enum SkuFlags {
	/**
	 * SKU is available for purchase
	 */
	Available = 4,
	/**
	 * Recurring SKU that can be purchased by a user and applied to a single server. Grants access to every user in that server.
	 */
	GuildSubscription = 128,
	/**
	 * Recurring SKU purchased by a user for themselves. Grants access to the purchasing user in every server.
	 */
	UserSubscription = 256,
}

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#sku-object-sku-types}
 */
export enum SkuTypes {
	/**
	 * Durable one-time purchase
	 */
	Durable = 2,
	/**
	 * Consumable one-time purchase
	 */
	Consumable = 3,
	/**
	 * Represents a recurring subscription
	 */
	Subscription = 5,
	/**
	 * System-generated group for each SUBSCRIPTION SKU created
	 */
	SubscriptionGroup = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#sku-object-sku-structure}
 */
export type SkuStructure = {
	/**
	 * ID of the parent application
	 */
	application_id: Snowflake;
	/**
	 * SKU flags combined as a bitfield
	 */
	flags: SkuTypes;
	/**
	 * ID of SKU
	 */
	id: Snowflake;
	/**
	 * Customer-facing name of your premium offering
	 */
	name: string;
	/**
	 * System-generated URL slug based on the SKU's name
	 */
	slug: string;
	/**
	 * Type of SKU
	 */
	type: SkuTypes;
};
