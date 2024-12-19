import type { Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export interface ListEntitlementQueryEntity {
  user_id?: Snowflake;
  sku_ids?: string;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
  guild_id?: Snowflake;
  exclude_ended?: boolean;
  exclude_deleted?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export enum EntitlementOwner {
  Guild = 1,
  User = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export interface CreateTestEntitlementEntity {
  sku_id: string;
  owner_id: string;
  owner_type: EntitlementOwner;
}
